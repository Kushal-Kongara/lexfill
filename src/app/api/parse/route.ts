import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    templateId: "demo-template",
    fields: [
      { key: "company_name", label: "Company Name", type: "text", required: true },
      { key: "valuation_cap", label: "Valuation Cap (USD)", type: "currency", required: true },
      { key: "purchase_amount", label: "Purchase Amount (USD)", type: "currency", required: true },
      { key: "effective_date", label: "Effective Date", type: "date", required: true },
    ],
    htmlPreview: "<p>Demo preview…</p>"
  });
}
