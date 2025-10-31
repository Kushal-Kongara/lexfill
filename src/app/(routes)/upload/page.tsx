"use client";

import { useState } from "react";

type Field = {
  key: string;
  label: string;
  type: "text" | "email" | "date" | "number" | "currency" | "choice";
  required?: boolean;
  options?: string[];
};

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<Field[] | null>(null);
  const [htmlPreview, setHtmlPreview] = useState<string>("");

  const onParse = async () => {
    if (!file) return;
    setLoading(true);
    setFields(null);
    setHtmlPreview("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/parse", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to parse");
      setFields(data.fields || []);
      setHtmlPreview(data.htmlPreview || "");
      // Persist for next steps (simple demo state)
      sessionStorage.setItem("lexfill_fields", JSON.stringify(data.fields || []));
      sessionStorage.setItem("lexfill_html", data.htmlPreview || "");
      sessionStorage.setItem("lexfill_templateId", data.templateId || "");
    } catch (e: any) {
      alert(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

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
        <button className="button" disabled={!file || loading} onClick={onParse}>
          {loading ? "Parsing…" : "Parse"}
        </button>
      </div>

      {fields && (
        <>
          <h3 style={{ marginTop: 20 }}>Detected Fields</h3>
          <ul className="list">
            {fields.map((f) => (
              <li key={f.key}>
                <span className="mono">{f.key}</span> — {f.label} <em>({f.type})</em>
                {f.required ? " *" : ""}
              </li>
            ))}
          </ul>
          <div className="row" style={{ marginTop: 12 }}>
            <a className="button" href="/editor">Continue to Editor</a>
            <a className="button ghost" href="/preview">Skip to Preview</a>
          </div>
        </>
      )}

      {htmlPreview && (
        <>
          <h3 style={{ marginTop: 20 }}>HTML Preview (raw from .docx)</h3>
          <div
            style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: 12, background: "#fff" }}
            dangerouslySetInnerHTML={{ __html: htmlPreview }}
          />
        </>
      )}
    </div>
  );
}
