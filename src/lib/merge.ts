import type { Field } from "./types";
import { formatByType } from "./formatters";

function esc(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Shared signature fields:
 *   Name, Title, Address, Email, Company (for [COMPANY])
 * Apply values wherever they appear (Company or Investor side).
 *
 * Also replaces:
 *   - {{key}} / {{ Label }} / [[key]] / [[ Label ]]
 *   - [Label] and [LABEL]
 *   - "Label: ________"
 *   - $[_____ ] / [_____ ] within ~120 chars before a label mention (e.g., “Purchase Amount”)
 *   - QQQ and $QQQ when used with a nearby “(the “Label”)” caption
 */
export function fillHtml(
  html: string,
  fields: Field[],
  values: Record<string, string>
): string {
  let out = html;

  for (const f of fields) {
    const raw = values?.[f.key];
    if (!raw) continue;

    const val = formatByType(f.type, raw);
    const label = f.label;
    const key = f.key;

    // 1) Mustache + double-bracket
    out = out.replace(new RegExp(`\\{\\{\\s*${esc(key)}\\s*\\}\\}`, "gi"), val);
    out = out.replace(new RegExp(`\\{\\{\\s*${esc(label)}\\s*\\}\\}`, "gi"), val);
    out = out.replace(new RegExp(`\\[\\[\\s*${esc(key)}\\s*\\]\\]`, "gi"), val);
    out = out.replace(new RegExp(`\\[\\[\\s*${esc(label)}\\s*\\]\\]`, "gi"), val);

    // 2) [LABEL] and [Label] (covers [COMPANY], [name], [title])
    out = out.replace(new RegExp(`\\[\\s*${esc(label.toUpperCase())}\\s*\\]`, "g"), val);
    out = out.replace(new RegExp(`\\[\\s*${esc(label)}\\s*\\]`, "gi"), val);

    // 3) "Label: ________" underline style (e.g., Address:, Email:, Name:, Title:)
    out = out.replace(new RegExp(`(${esc(label)}\\s*[:\\-–]?\\s*)(_{3,})`, "gi"), `$1${val}`);

    // 4) Currency/non-currency blanks near a label mention
    if (f.type === "currency") {
      out = out.replace(
        new RegExp(`\\$\\s*\\[_{3,}\\](?=[\\s\\S]{0,120}(?:the\\s+)?[“"']?${esc(label)}[”"']?\\)?)`, "gi"),
        () => val
      );
    } else {
      out = out.replace(
        new RegExp(`\\[_{3,}\\](?=[\\s\\S]{0,120}(?:the\\s+)?[“"']?${esc(label)}[”"']?\\)?)`, "gi"),
        () => val
      );
    }

    // 5) QQQ / $QQQ with captioned label nearby
    out = out.replace(
      new RegExp(`\\$\\s*QQQ(?=[\\s\\S]{0,120}(?:the\\s+)?[“"']?${esc(label)}[”"']?\\)?)`, "gi"),
      () => val
    );
    out = out.replace(
      new RegExp(`\\bQQQ\\b(?=[\\s\\S]{0,120}(?:the\\s+)?[“"']?${esc(label)}[”"']?\\)?)`, "gi"),
      () => val
    );
  }

  // Special: shared signature fields — ensure these apply everywhere even if labels differ in case/spacing
  const signatureMap: Record<string, string> = {};
  for (const f of fields) {
    const v = values?.[f.key];
    if (!v) continue;
    switch (f.label.toLowerCase()) {
      case "company":
      case "[company]":
        signatureMap["company"] = v;
        break;
      case "name":
      case "[name]":
        signatureMap["name"] = v;
        break;
      case "title":
      case "[title]":
        signatureMap["title"] = v;
        break;
      case "address":
        signatureMap["address"] = v;
        break;
      case "email":
        signatureMap["email"] = v;
        break;
    }
  }

  // Apply shared signature values to generic lines if still present
  if (signatureMap["company"]) {
    out = out.replace(/\[\s*COMPANY\s*\]/gi, signatureMap["company"]);
  }
  if (signatureMap["name"]) {
    out = out.replace(/\[\s*name\s*\]/gi, signatureMap["name"]);
    out = out.replace(/(Name\s*[:：]\s*)(?:_{3,}|\s*)/gi, `$1${signatureMap["name"]}`);
  }
  if (signatureMap["title"]) {
    out = out.replace(/\[\s*title\s*\]/gi, signatureMap["title"]);
    out = out.replace(/(Title\s*[:：]\s*)(?:_{3,}|\s*)/gi, `$1${signatureMap["title"]}`);
  }
  if (signatureMap["address"]) {
    out = out.replace(/(Address\s*[:：]\s*)(?:_{3,}|\s*)/gi, `$1${signatureMap["address"]}`);
  }
  if (signatureMap["email"]) {
    out = out.replace(/(Email\s*[:：]\s*)(?:_{3,}|\s*)/gi, `$1${signatureMap["email"]}`);
  }

  return out;
}
