import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    filledHtml: `<p><strong>Preview:</strong> ${JSON.stringify(body.values ?? {}, null, 2)}</p>`
  });
}
