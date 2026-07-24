import type { Opportunity, ProgramManager } from "@/lib/types";

/*
 * Program managers derived from solicitation contacts.
 *
 * There is no public API for federal program managers, so rather than invent
 * one this builds an index from a primary source we already ingest: the
 * contact each open solicitation publishes. That yields who is running what,
 * how to reach them, and — via the opportunities' taxonomy keywords — what
 * they fund.
 *
 * The contact field is messy in two specific ways, both handled below:
 *
 * 1. Many entries are organizational mailboxes, not people ("U.S. Mission to
 *    Algeria", "U.S. National Science Foundation"). Those are dropped; a
 *    directory of shared inboxes is not a directory of program managers.
 * 2. Person entries often carry a role on a second line ("Riad N Yazbeck\n
 *    Grantor"), so the name and role are split apart.
 *
 * What this deliberately does NOT do is populate bio, scholar, linkedin,
 * talks, pubs, or pastPrograms. No public source carries them, and guessing
 * a profile URL from a person's name would fabricate a record about a real
 * individual that could point at the wrong person entirely. Those fields stay
 * empty and the UI renders only what is actually known.
 */

/**
 * Words that mark a contact entry as an organization rather than a person.
 * The trailing `s?` matters: "National Institutes of Health" is an org, and
 * a bare `\binstitute\b` misses it because the plural blocks the boundary.
 */
const ORG_PATTERN =
  /\b(u\.?s\.?|national|federal|mission|foundation|department|dept|office|bureau|institute|administration|agency|team|division|center|centre|command|laborator\w*|service|corps|grant|program|branch|group|committee|council|headquarters|hq|inc|llc|university|college)s?\b/i;

function normalizeSpace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/**
 * A contact entry is treated as a person when it is not organizational and
 * reads like a name — two to five tokens.
 */
function looksLikePerson(name: string): boolean {
  if (!name || ORG_PATTERN.test(name)) return false;
  const tokens = name.split(" ").filter(Boolean);
  return tokens.length >= 2 && tokens.length <= 5;
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Contact {
  name: string;
  role: string;
}

/** "Riad N Yazbeck\nGrantor" → { name: "Riad N Yazbeck", role: "Grantor" } */
function parseContact(raw: string): Contact | null {
  const lines = raw.split(/[\r\n]+/).map(normalizeSpace).filter(Boolean);
  if (lines.length === 0) return null;
  const name = lines[0];
  if (!looksLikePerson(name)) return null;
  return { name, role: lines.slice(1).join(", ") };
}

interface Bucket {
  contact: Contact;
  agency: string;
  office: string;
  opps: Opportunity[];
  email: string;
}

/**
 * Build program-manager records from the opportunities already ingested.
 * Grouped by person *and* agency — the same name under two agencies is more
 * likely two people than one, and merging them would be a fabrication.
 */
export function deriveProgramManagers(opportunities: Opportunity[]): ProgramManager[] {
  const buckets = new Map<string, Bucket>();

  for (const o of opportunities) {
    const contact = parseContact(o.pm ?? "");
    if (!contact) continue;

    const key = `${contact.name.toLowerCase()}|${o.agency.toLowerCase()}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.opps.push(o);
      if (!existing.email && o.pmEmail) existing.email = o.pmEmail;
      if (!existing.contact.role && contact.role) existing.contact.role = contact.role;
    } else {
      buckets.set(key, {
        contact,
        agency: o.agency,
        office: o.office,
        opps: [o],
        email: o.pmEmail ?? "",
      });
    }
  }

  return [...buckets.values()]
    .map((b): ProgramManager => {
      // Interests come from the taxonomy keywords of what they actually fund,
      // most frequent first, so they mean the same thing as opportunity chips.
      const counts = new Map<string, number>();
      for (const o of b.opps) {
        for (const k of o.keywords) counts.set(k, (counts.get(k) ?? 0) + 1);
      }
      const interests = [...counts.entries()]
        .sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))
        .slice(0, 6)
        .map(([k]) => titleCase(k));

      const n = b.opps.length;
      return {
        id: `pm-${slug(b.contact.name)}-${slug(b.agency)}`,
        name: b.contact.name,
        agency: b.agency,
        office: b.office,
        role: b.contact.role || "Point of Contact",
        // A derived statement of fact, not a biography.
        bio: `Listed contact on ${n} open ${n === 1 ? "solicitation" : "solicitations"} from ${b.agency}.`,
        interests,
        currentPrograms: b.opps.map((o) => o.program),
        openOpps: b.opps.map((o) => o.id),
        email: b.email,
        // Unsourceable from public solicitation data — left empty rather than
        // guessed. See the note at the top of this file.
        pastPrograms: [],
        scholar: "",
        linkedin: "",
        talks: [],
        pubs: [],
        notes: "",
        relationship: "",
      };
    })
    .sort((a, b) => b.openOpps.length - a.openOpps.length || a.name.localeCompare(b.name));
}
