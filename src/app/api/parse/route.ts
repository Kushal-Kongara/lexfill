export const runtime = "nodejs";

import { NextResponse } from "next/server";
import mammoth from "mammoth";

type FType = "text" | "email" | "date" | "number" | "currency" | "choice";
type Field = { key: string; label: string; type: FType; required?: boolean };

// ---- helpers ---------------------------------------------------------------
function inferType(label: string): FType {
  const L = label.toLowerCase();
  if (/\bemail\b/.test(L)) return "email";
  if (/\bdate\b/.test(L)) return "date";
  if (/\bamount|price|cap|valuation|purchase|cash|usd|\$\b/.test(L)) return "currency";
  if (/\bnumber|percent|qty|quantity|count\b/.test(L)) return "number";
  return "text";
}
function toKey(label: string) {
  return label
    .trim()
    .replace(/[\u201C\u201D"’']/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
// [Company Name], [COMPANY], [name], [title] anywhere in text
function findBracketed(text: string): string[] {
  const rx = /\[([A-Za-z][^\]\n]{0,60})\]/g;
  const seen = new Set<string>();
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = rx.exec(text))) {
    const label = m[1].trim().replace(/\s+/g, " ");
    if (!/[A-Za-z]/.test(label)) continue;
    if (!seen.has(label.toLowerCase())) {
      seen.add(label.toLowerCase());
      out.push(label);
    }
  }
  return out;
}
// $[____] or [____] within ~120 chars before a quoted label (e.g., “Purchase Amount”)
function findUnderscoreBlanksNearLabels(text: string): Array<{ label: string; type: FType }> {
  const out: Array<{ label: string; type: FType }> = [];
  const seen = new Set<string>();
  const r1 = /\$\s*\[_{3,}\](?=[\s\S]{0,120}?(?:the\s+)?[“"']?([A-Za-z][A-Za-z0-9\s\-]+?)[”"']?\)?)/g;
  const r2 = /\[_{3,}\](?=[\s\S]{0,120}?(?:the\s+)?[“"']?([A-Za-z][A-Za-z0-9\s\-]+?)[”"']?\)?)/g;
  let m: RegExpExecArray | null;
  while ((m = r1.exec(text))) {
    const label = (m[1] || "").trim();
    if (label && !seen.has("cur:" + label.toLowerCase())) {
      seen.add("cur:" + label.toLowerCase());
      out.push({ label, type: "currency" });
    }
  }
  while ((m = r2.exec(text))) {
    const label = (m[1] || "").trim();
    if (label && !seen.has("num:" + label.toLowerCase())) {
      seen.add("num:" + label.toLowerCase());
      out.push({ label, type: inferType(label) });
    }
  }
  return out;
}
// Literal QQQ and $QQQ with captioned label (… (the “Label”))
function findQQQWithLabels(text: string): Array<{ label: string; type: FType }> {
  const out: Array<{ label: string; type: FType }> = [];
  const seen = new Set<string>();
  let m: RegExpExecArray | null;

  const byQQQ = /\bby\s+QQQ\s*\(the\s*[“"']?([A-Za-z][^"’”]+)[”"']?\)/gi;
  while ((m = byQQQ.exec(text))) {
    const label = m[1].trim();
    const key = "qqq:" + label.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ label, type: inferType(label) });
    }
  }
  const curQQQ = /\$\s*QQQ(?=[\s\S]{0,120}?(?:the\s+)?[“"']?([A-Za-z][^"’”]+)[”"']?\)?)/gi;
  while ((m = curQQQ.exec(text))) {
    const label = m[1].trim();
    const key = "qqq$:" + label.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ label, type: "currency" });
    }
  }
  return out;
}
// Signature placeholders must be detected from HTML (Mammoth splits runs)
function findSignatureFieldsFromHTML(html: string): Array<{ label: string; type: FType }> {
  const fields: Array<{ label: string; type: FType }> = [];
  const seen = new Set<string>();

  // 1) Bracketed signature tokens: [COMPANY], [name], [title]
  const bracketSigRx = /\[([A-Za-z][A-Za-z0-9 \-]{1,50})\]/g;
  let m: RegExpExecArray | null;
  while ((m = bracketSigRx.exec(html))) {
    const raw = m[1].trim().replace(/\s+/g, " ");
    const norm = raw.toLowerCase();
    // only add signature-relevant placeholders
    if (!/(company|name|title)/i.test(raw)) continue;
    if (!seen.has(norm)) {
      seen.add(norm);
      fields.push({ label: raw, type: inferType(raw) });
    }
  }

  // 2) Signature line labels: Address:, Email:, Name:, Title:
  const sigLabels = ["Address", "Email", "Name", "Title"];
  for (const lbl of sigLabels) {
    const rx = new RegExp(`${lbl}\\s*[:：]\\s*`, "i");
    if (rx.test(html)) {
      const norm = lbl.toLowerCase();
      if (!seen.has(norm)) {
        seen.add(norm);
        fields.push({ label: lbl, type: inferType(lbl) });
      }
    }
  }
  return fields;
}
// ---- end helpers -----------------------------------------------------------

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });

    const ab = await file.arrayBuffer();
    const buffer = Buffer.from(ab);

    const { value: html } = await mammoth.convertToHtml({ buffer });

    // Clean visible text for body detection
    const text = html
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/\u00A0/g, " ")
      .replace(/[ \t]+/g, " ")
      .trim();

    const fieldMap = new Map<string, Field>();

    // 1) General bracketed placeholders
    for (const L of findBracketed(text)) {
      const key = toKey(L);
      if (!fieldMap.has(key)) fieldMap.set(key, { key, label: L, type: inferType(L), required: true });
    }
    // 2) Underscore blanks near labels (e.g., Purchase Amount, Valuation Cap)
    for (const { label, type } of findUnderscoreBlanksNearLabels(text)) {
      const key = toKey(label);
      if (!fieldMap.has(key)) fieldMap.set(key, { key, label, type, required: true });
    }
    // 3) QQQ / $QQQ captioned
    for (const { label, type } of findQQQWithLabels(text)) {
      const key = toKey(label);
      if (!fieldMap.has(key)) fieldMap.set(key, { key, label, type, required: true });
    }
    // 4) Signature block (from HTML)
    for (const { label, type } of findSignatureFieldsFromHTML(html)) {
      const key = toKey(label);
      if (!fieldMap.has(key)) fieldMap.set(key, { key, label, type, required: false });
    }
    // 5) Hints (ensure these exist if mentioned)
    const ensure = (L: string, type?: FType, req = true) => {
      const key = toKey(L);
      if (!fieldMap.has(key) && text.toLowerCase().includes(L.toLowerCase())) {
        fieldMap.set(key, { key, label: L, type: type || inferType(L), required: req });
      }
    };
    ensure("Post-Money Valuation Cap", "currency", true);
    ensure("Purchase Amount", "currency", true);
    ensure("Date of Safe", "date", true);
    ensure("State of Incorporation", "text", false);
    ensure("Governing Law Jurisdiction", "text", false);

    const fields = Array.from(fieldMap.values());

    return NextResponse.json({ html, fields });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
