export default function PreviewPage() {
    return (
      <div className="card">
        <h2>Preview</h2>
        <p>Rendered document will appear here (HTML preview).</p>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: 12, minHeight: 160, background: "#fff" }}>
          <p><strong>Company Name</strong> goes here…</p>
          <p>Other placeholders fill in across the document…</p>
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="button">Download .docx</button>
          <button className="button ghost" onClick={() => window.print()}>Print / Save as PDF</button>
        </div>
        <p className="mono" style={{ marginTop: 12 }}>API: POST /api/fill/preview, POST /api/fill/docx</p>
      </div>
    );
  }
  