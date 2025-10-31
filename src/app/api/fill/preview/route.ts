import { NextResponse } from "next/server";
import { fillHtml } from "@/lib/merge";
import type { Field } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const html: string = body?.html || "";
    const fields: Field[] = body?.fields || [];
    const values: Record<string, string> = body?.values || {};
    if (!html || !Array.isArray(fields)) {
      return NextResponse.json({ error: "html and fields are required" }, { status: 400 });
    }
    const filledHtml = fillHtml(html, fields, values);
    return NextResponse.json({ filledHtml });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
