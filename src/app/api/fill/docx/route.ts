export const runtime = "nodejs";

import htmlToDocx from "html-to-docx";

export async function POST(req: Request) {
  try {
    const { html, filename } = await req.json();
    if (!html) {
      return new Response(JSON.stringify({ error: "Missing html" }), { status: 400 });
    }

    const file = await htmlToDocx(html, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });

    // Normalize to Uint8Array → Buffer to satisfy TypeScript + Node
    const uint8 =
      file instanceof ArrayBuffer ? new Uint8Array(file) : (file as Uint8Array);
    const buf = Buffer.from(uint8);

    const name = (filename && String(filename)) || "lexfill.docx";
    return new Response(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${name.replace(/[^a-zA-Z0-9._-]/g, "_")}"`,
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 });
  }
}
