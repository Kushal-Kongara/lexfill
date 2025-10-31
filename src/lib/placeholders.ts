import { nanoid } from "nanoid";
import type { Field } from "./types";

/**
 * Heuristics for placeholders commonly seen in legal docs:
 * - {{variable}}, [[variable]]
 * - ALL_CAPS multi-word phrases that look like fill-ins
 * - Bracketed prompts like [COMPANY NAME], [ADDRESS]
 * - Long underline blanks: _________ or ____ ____ ____
 */
export function detectPlaceholders(text: string): Field[] {
  const found = new Map<string, Field>();

  const addField = (key: string, label: string, type: Field["type"] = "text") => {
    if (!found.has(key)) {
      found.set(key, { key, label, type, required: true });
    }
  };

  // 1) {{var}} or [[var]]
  const curly = [...text.matchAll(/\{\{\s*([A-Za-z0-9_. -]{2,60})\s*\}\}/g)];
  const bracket = [...text.matchAll(/\[\[\s*([A-Za-z0-9_. -]{2,60})\s*\]\]/g)];
  [...curly, ...bracket].forEach(m => {
    const raw = m[1].trim();
    const key = toKey(raw);
    addField(key, toLabel(raw));
  });

  // 2) [COMPANY NAME], [ADDRESS], [STATE OF INCORPORATION]
  const squarePrompts = [...text.matchAll(/\[([A-Z][A-Z0-9 _\-]{2,60})\]/g)];
  squarePrompts.forEach(m => {
    const raw = m[1].trim();
    const key = toKey(raw);
    addField(key, toLabel(raw));
  });

  // 3) Underline blanks ________ possibly with prompt near it
  const lines = text.split(/\r?\n/);
  lines.forEach(line => {
    if (/(^| )_{3,}( |$)/.test(line)) {
      // Try to extract preceding hint words (e.g., "Company Name: _______")
      const hint = line.replace(/_{3,}/g, "").replace(/[:\-–]+/g, "").trim();
      const label = hint && hint.length <= 60 ? hint : "Fill Field";
      addField(toKey(label || nanoid(6)), toLabel(label || "Fill Field"));
    }
  });

  // 4) ALL CAPS multi-word candidates (guardrails to reduce noise)
  const caps = [...text.matchAll(/\b([A-Z][A-Z]+(?: [A-Z][A-Z]+){0,5})\b/g)];
  caps.forEach(m => {
    const raw = m[1];
    // Skip obvious legal boilerplate tokens
    if (STOPWORDS.has(raw)) return;
    if (raw.length < 6 || raw.length > 60) return;
    // Prefer phrases that look like entities/variables
    if (/\b(AMENDMENT|SECTION|EXHIBIT|SCHEDULE|AGREEMENT|SAFE|COMPANY|INVESTOR|PARTY|LAW|STATE|COUNTY)\b/.test(raw)) {
      // Keep only likely variable-like ones
      if (!/\b(COMPANY NAME|INVESTOR NAME|ADDRESS|STATE|DATE|SIGNATURE|TITLE|EMAIL|VALUATION CAP|PURCHASE AMOUNT)\b/.test(raw)) {
        return;
      }
    }
    const key = toKey(raw);
    addField(key, toLabel(raw));
  });

  // Type hinting based on labels
  for (const f of found.values()) {
    const L = f.label.toLowerCase();
    if (/\b(email|e-mail)\b/.test(L)) f.type = "email";
    else if (/\b(date|effective date|closing date)\b/.test(L)) f.type = "date";
    else if (/\b(cap|amount|price|purchase|usd|dollar|consideration|payment)\b/.test(L)) f.type = "currency";
    else if (/\b(number|shares|quantity)\b/.test(L)) f.type = "number";
  }

  return [...found.values()];
}

function toKey(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64) || `field_${nanoid(6)}`;
}

function toLabel(s: string): string {
  const t = s.replace(/[_\[\]\{\}]/g, " ").replace(/\s+/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

const STOPWORDS = new Set([
  "THIS AGREEMENT", "THE COMPANY", "THE INVESTOR", "GOVERNING LAW", "ENTIRE AGREEMENT",
  "LIMITATION OF LIABILITY", "CONFIDENTIAL INFORMATION"
]);
