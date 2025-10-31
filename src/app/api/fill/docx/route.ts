export async function POST() {
    // Placeholder: return a simple text file as download stand-in
    const content = new TextEncoder().encode("This will be a .docx in the next step.");
    return new Response(content, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": 'attachment; filename="lexfill-demo.txt"'
      }
    });
  }
  