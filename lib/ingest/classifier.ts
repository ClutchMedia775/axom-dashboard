import Anthropic from "@anthropic-ai/sdk";
import { DEFAULT_WEIGHTS } from "@/lib/scoring";
import type { Opportunity } from "@/lib/types";

/*
 * Model-based opportunity classification.
 *
 * The deterministic tagger (./tagger) only fires on exact taxonomy phrases, so
 * a solicitation that describes relevant work in different wording — e.g. "AI to
 * accelerate scientific discovery" instead of the literal "scientific research"
 * — scores zero. This module reads the title + summary and maps each
 * opportunity onto the SAME canonical taxonomy keys the scoring engine uses
 * (DEFAULT_WEIGHTS keys), so semantic matches score like literal ones.
 *
 * It AUGMENTS rather than replaces: classifier keys are unioned with the
 * deterministic keywords. When ANTHROPIC_API_KEY is unset, or the call fails,
 * opportunities keep their deterministic keywords unchanged — the app never
 * depends on the model being reachable.
 */

const MODEL = "claude-haiku-4-5-20251001";
const BATCH_SIZE = 40;

/** Canonical taxonomy keys the classifier is allowed to emit. */
const VALID_KEYS = new Set(DEFAULT_WEIGHTS.map((w) => w.key));

/** key → highest weight, for choosing the primary techArea label. */
const KEY_TO_WEIGHT = new Map(DEFAULT_WEIGHTS.map((w) => [w.key, w]));

function taxonomyGuide(): string {
  return DEFAULT_WEIGHTS.map((w) => {
    const aliases = w.aliases.length ? ` (includes: ${w.aliases.join(", ")})` : "";
    return `- "${w.key}" — ${w.label}${aliases}`;
  }).join("\n");
}

const SYSTEM = `You classify U.S. federal funding opportunities for Axom, an American-owned company building an AI operating system for scientific research: agentic and multi-agent AI, autonomous laboratories, biotech and drug discovery, secure/sovereign on-prem AI, scientific computing/HPC, enterprise AI, and government modernization.

For each opportunity, return the subset of the fixed category keys below that GENUINELY apply to the substance of the funded work — reason about what the program actually funds, not just surface keyword overlap. Return only keys that clearly fit; return an empty list when nothing does. Use ONLY these exact keys:

${taxonomyGuide()}`;

const TOOL: Anthropic.Tool = {
  name: "record_classifications",
  description: "Record the applicable taxonomy keys for each opportunity.",
  input_schema: {
    type: "object",
    properties: {
      classifications: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "The opportunity id, copied exactly." },
            keys: {
              type: "array",
              items: { type: "string" },
              description: "Canonical taxonomy keys that apply. May be empty.",
            },
          },
          required: ["id", "keys"],
        },
      },
    },
    required: ["classifications"],
  },
};

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

async function classifyBatch(
  client: Anthropic,
  batch: Opportunity[],
): Promise<Map<string, string[]>> {
  const payload = batch.map((o) => ({
    id: o.id,
    title: o.program,
    summary: o.summary.slice(0, 600),
  }));

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: SYSTEM,
    tools: [TOOL],
    tool_choice: { type: "tool", name: TOOL.name },
    messages: [
      {
        role: "user",
        content: `Classify these ${batch.length} opportunities:\n\n${JSON.stringify(payload)}`,
      },
    ],
  });

  const block = res.content.find((b) => b.type === "tool_use");
  const out = new Map<string, string[]>();
  if (block && block.type === "tool_use") {
    const input = block.input as { classifications?: { id: string; keys: string[] }[] };
    for (const c of input.classifications ?? []) {
      const keys = (c.keys ?? []).filter((k) => VALID_KEYS.has(k));
      out.set(c.id, keys);
    }
  }
  return out;
}

/**
 * Enrich opportunities with model-inferred taxonomy keys. Returns a new array;
 * on any failure (no key, API error) returns the input unchanged so the caller
 * always gets usable data.
 */
export async function classifyOpportunities(
  opportunities: Opportunity[],
): Promise<Opportunity[]> {
  if (!process.env.ANTHROPIC_API_KEY || opportunities.length === 0) {
    return opportunities;
  }

  try {
    const client = getClient();
    const batches: Opportunity[][] = [];
    for (let i = 0; i < opportunities.length; i += BATCH_SIZE) {
      batches.push(opportunities.slice(i, i + BATCH_SIZE));
    }

    const results = await Promise.all(batches.map((b) => classifyBatch(client, b)));
    const keyMap = new Map<string, string[]>();
    for (const r of results) for (const [id, keys] of r) keyMap.set(id, keys);

    return opportunities.map((o) => {
      const inferred = keyMap.get(o.id);
      if (!inferred || inferred.length === 0) return o;

      // Union the deterministic keywords with the inferred taxonomy keys.
      const keywords = [...new Set([...o.keywords, ...inferred])];

      // Upgrade a generic techArea to the highest-weight matched category so
      // the UI reflects the semantic match, not just the first literal hit.
      let techArea = o.techArea;
      const isGeneric = /^federal (grant|contract)$/i.test(techArea);
      if (isGeneric) {
        const top = inferred
          .map((k) => KEY_TO_WEIGHT.get(k))
          .filter((w): w is NonNullable<typeof w> => Boolean(w))
          .sort((a, b) => b.weight - a.weight)[0];
        if (top) techArea = top.label;
      }

      return { ...o, keywords, techArea };
    });
  } catch {
    return opportunities;
  }
}
