"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="card">
      <h2>Upload Document (.docx)</h2>
      <p>Select a .docx to parse and detect placeholders.</p>
      <div className="row" style={{ marginTop: 12 }}>
        <input
          type="file"
          accept=".docx"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button className="button" disabled={!file}>Parse</button>
      </div>
      <p style={{ marginTop: 12 }} className="mono">API: POST /api/parse</p>
    </div>
  );
}
