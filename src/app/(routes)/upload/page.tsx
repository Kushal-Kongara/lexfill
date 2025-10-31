"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string>("");

  const onParse = async () => {
    if (!file) return alert("Choose a .docx file first.");
    setLoading(true);
    setLog("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/parse", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Parse failed");

      // Persist for other pages
      sessionStorage.setItem("lexfill_html", data.html || "");
      sessionStorage.setItem("lexfill_fields", JSON.stringify(data.fields || []));
      sessionStorage.removeItem("lexfill_values");

      setLog(
        `Parsed: ${Array.isArray(data.fields) ? data.fields.length : 0} fields detected.`
      );

      // Move to Editor so you can verify/edit fields, then proceed to Chat/Preview
      window.location.href = "/editor";
    } catch (e: any) {
      alert(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Upload Document (.docx)</h2>
      <p>Select the sample SAFE or your own .docx, then click Parse.</p>

      <div className="row" style={{ marginTop: 12, gap: 8 }}>
        <input
          type="file"
          accept=".docx"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button className="button" disabled={!file || loading} onClick={onParse}>
          {loading ? "Parsing…" : "Parse"}
        </button>
      </div>

      {log && <p style={{ marginTop: 12, color: "#444" }}>{log}</p>}

      <div style={{ marginTop: 16 }}>
        <a className="button ghost" href="/editor" style={{ marginRight: 8 }}>
          Go to Editor
        </a>
        <a className="button ghost" href="/chat" style={{ marginRight: 8 }}>
          Go to Chat
        </a>
        <a className="button ghost" href="/preview">
          Go to Preview
        </a>
      </div>
    </div>
  );
}
