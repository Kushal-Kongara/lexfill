import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    fields: [
      { key: "company_name", label: "Company Name", type: "text", required: true },
      { key: "state", label: "Incorporation State", type: "text" },
    ]
  });
}
