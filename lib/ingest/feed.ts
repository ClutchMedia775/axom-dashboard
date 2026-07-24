/*
 * Minimal XML readers for the Atom (arXiv) and RSS 2.0 (agency news) feeds.
 *
 * Deliberately not a general XML parser. These are two well-defined, stable
 * feed formats and the alternative is a dependency for the sake of a few
 * fields, which is not how the rest of lib/ingest is written. The trade is
 * explicit: this handles the shapes those feeds actually emit — repeated
 * elements, self-closing attribute-only elements, CDATA — and nothing more.
 * If a third format with real nesting ever lands here, reach for a parser.
 */

/** Inner text of every `<tag>…</tag>` occurrence, in document order. */
export function extractBlocks(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) out.push(m[1]);
  return out;
}

/** Inner text of the first `<tag>`, with CDATA unwrapped. "" when absent. */
export function tagText(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? stripCdata(m[1]) : "";
}

/** Values of `attr` across every `<tag …>` — for self-closing elements
 *  like `<category term="cs.AI"/>` that carry no inner text. */
export function attrValues(block: string, tag: string, attr: string): string[] {
  const re = new RegExp(`<${tag}[^>]*?\\s${attr}="([^"]*)"`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(block)) !== null) out.push(m[1]);
  return out;
}

function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}

/** Atom timestamps and RFC-822 RSS pubDates both to "YYYY-MM-DD". */
export function toIsoDate(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}
