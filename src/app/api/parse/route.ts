import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { detectPlaceholders } from "@/lib/placeholders";
import type { Field, Template } from "@/lib/types";
import { nanoid } from "nanoid";

export const runtime = "nodejs"; // required for mammoth

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "No file uploaded (expect .docx in 'file')." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert to HTML + extract raw text for heuristics
    const result = await mammoth.convertToHtml({ buffer });
    const html = result.value || "";
    const messages = result.messages || [];

    // Also get plain text for better regex coverage
    const textResult = await mammoth.extractRawText({ buffer });
    const text = textResult.value || "";

    // Heuristic placeholder detection
    let fields: Field[] = detectPlaceholders(text);

    // Provide a sane starter set if none detected
    if (fields.length === 0) {
      fields = [
        { key: "company_name", label: "Company Name", type: "text", required: true },
        { key: "valuation_cap", label: "Valuation Cap (USD)", type: "currency", required: true },
        { key: "purchase_amount", label: "Purchase Amount (USD)", type: "currency", required: true },
        { key: "effective_date", label: "Effective Date", type: "date", required: true },
        { key: "signatory_name", label: "Signatory Name", type: "text", required: false },
      ];
    }

    const template: Template = {
      id: `tpl_${nanoid(8)}`,
      html,
      text,
      fields
    };

    return NextResponse.json({
      templateId: template.id,
      fields: template.fields,
      htmlPreview: template.html,
      messages
    });
  } catch (err: any) {
    console.error("parse error:", err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
