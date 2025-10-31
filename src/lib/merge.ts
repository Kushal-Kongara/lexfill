import type { Field } from "./types";
import { formatByType } from "./formatters";

/**
 * fillHtml:
 * - Replaces common placeholder patterns with user values:
 *   • {{key}} / {{ Label }}
 *   • [[key]] / [[ Label ]]
 *   • [LABEL]  (uppercase label hints often in legal docs)
 *   • "Label: ________" (underline blanks after a label)
 */
export function fillHtml(
  html: string,
  fields: Field[],
  values: Record<string, string>
): string {
  let out = html;

  // For each field, build a small set of patterns
  for (const f of fields) {
    const rawVal = values?.[f.key] ?? "";
    const val = formatByType(f.type, rawVal);

    if (!val) continue;

    const key = f.key;
    const label = f.label;
    const labelUpper = f.label.toUpperCase();

    // Patterns: {{key}}  / {{ label }}
    out = replaceAllCaseInsensitive(out, new RegExp(`\\{\\{\\s*${escapeRegex(key)}\\s*\\}\\}`, "g"), val);
    out = replaceAllCaseInsensitive(out, new RegExp(`\\{\\{\\s*${escapeRegex(label)}\\s*\\}\\}`, "g"), val);

    // Patterns: [[key]] / [[ label ]]
    out = replaceAllCaseInsensitive(out, new RegExp(`\\[\\[\\s*${escapeRegex(key)}\\s*\\]\\]`, "g"), val);
    out = replaceAllCaseInsensitive(out, new RegExp(`\\[\\[\\s*${escapeRegex(label)}\\s*\\]\\]`, "g"), val);

    // Pattern: [LABEL] (uppercase prompt blocks)
    out = out.replace(new RegExp(`\\[\\s*${escapeRegex(labelUpper)}\\s*\\]`, "g"), val);

    // Pattern: "Label: _______" or "Label — _______"
    const lblPrefix = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`(${lblPrefix}\\s*[:\\-–]?\\s*)(_{3,})`, "gi"), `$1${val}`);
  }

  return out;
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function replaceAllCaseInsensitive(input: string, rx: RegExp, value: string) {
  return input.replace(rx, value);
}
