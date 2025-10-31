"use client";

import { useEffect, useState } from "react";

type Field = {
  key: string;
  label: string;
  type: "text" | "email" | "date" | "number" | "currency" | "choice";
  required?: boolean;
  options?: string[];
};

export default function PreviewPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [html, setHtml] = useState<string>("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [filledHtml, setFilledHtml] = useState<string>("");

  // Load fields, html, and saved values
  useEffect(() => {
    const rawFields = sessionStorage.getItem("lexfill_fields");
    const rawHtml = sessionStorage.getItem("lexfill_html");
    const rawVals = sessionStorage.getItem("lexfill_values");
    if (rawFields) setFields(JSON.parse(rawFields));
    if (rawHtml) setHtml(rawHtml);
    if (rawVals) setValues(JSON.parse(rawVals));
  }, []);

  const setValue = (k: string, v: string) => {
    const next = { ...values, [k]: v };
    setValues(next);
    sessionStorage.setItem("lexfill_values", JSON.stringify(next));
  };

  const onPreview = async () => {
    if (!html) return alert("No HTML in session. Go to Upload first.");
    const res = await fetch("/api/fill/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html, fields, values })
    });
    const data = await res.json();
    if (!res.ok) return alert(data?.error || "Preview failed");
    setFilledHtml(data.filledHtml || "");
  };

  const onDownloadDocx = async () => {
    if (!filledHtml) return alert("Generate preview first.");
    const res = await fetch("/api/fill/docx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html: filledHtml, filename: "lexfill-filled.docx" })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return alert(data?.error || "Download failed");
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lexfill-filled.docx";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <h2>Preview & Download</h2>
      {fields.length === 0 && <p>No fields loaded. Go to Upload first.</p>}

      {fields.length > 0 && (
        <>
          <h3 style={{ marginTop: 12 }}>Fill Values</h3>
          <div>
            {fields.map((f) => (
              <div key={f.key} style={{ marginBottom: 10 }}>
                <label className="label" htmlFor={f.key}>{f.label}{f.required ? " *" : ""}</label>
                <input
                  id={f.key}
                  className="input"
                  type={f.type === "date" ? "date" : f.type === "email" ? "email" : "text"}
                  placeholder={f.label}
                  defaultValue={values[f.key] ?? ""}
                  onChange={(e) => setValue(f.key, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="button" onClick={onPreview}>Generate Preview</button>
            <button className="button ghost" onClick={() => window.print()}>Print / Save as PDF</button>
          </div>
        </>
      )}

      {filledHtml && (
        <>
          <h3 style={{ marginTop: 20 }}>Completed Document</h3>
          <div
            style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: 12, background: "#fff" }}
            dangerouslySetInnerHTML={{ __html: filledHtml }}
          />
          <div className="row" style={{ marginTop: 12 }}>
            <button className="button" onClick={onDownloadDocx}>Download .docx</button>
          </div>
        </>
      )}
    </div>
  );
}
