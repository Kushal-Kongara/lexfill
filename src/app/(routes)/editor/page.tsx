"use client";

import { useEffect, useState } from "react";

type Field = {
  key: string;
  label: string;
  type: "text" | "email" | "date" | "number" | "currency" | "choice";
  required?: boolean;
  options?: string[];
};

export default function EditorPage() {
  const [fields, setFields] = useState<Field[]>([]);

  useEffect(() => {
    const raw = sessionStorage.getItem("lexfill_fields");
    if (raw) setFields(JSON.parse(raw));
  }, []);

  const updateField = (index: number, key: keyof Field, value: any) => {
    const updated = fields.map((f, i) => (i === index ? { ...f, [key]: value } : f));
    setFields(updated);
    sessionStorage.setItem("lexfill_fields", JSON.stringify(updated));
  };

  return (
    <div className="card">
      <h2>Editor – Adjust Fields</h2>
      <p style={{ marginBottom: 16 }}>You can rename labels, change types, and mark required fields.</p>

      {fields.length === 0 && <p>No fields loaded. Go to Upload first.</p>}

      {fields.map((f, i) => (
        <div key={f.key} style={{ borderBottom: "1px solid #ddd", paddingBottom: 12, marginBottom: 12 }}>
          <label className="label">Label</label>
          <input
            className="input"
            value={f.label}
            onChange={(e) => updateField(i, "label", e.target.value)}
          />

          <label className="label" style={{ marginTop: 8 }}>Type</label>
          <select
            className="input"
            value={f.type}
            onChange={(e) => updateField(i, "type", e.target.value as Field["type"])}
          >
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="date">Date</option>
            <option value="number">Number</option>
            <option value="currency">Currency</option>
            <option value="choice">Choice</option>
          </select>

          <label className="label" style={{ marginTop: 8 }}>
            <input
              type="checkbox"
              checked={f.required ?? true}
              onChange={(e) => updateField(i, "required", e.target.checked)}
              style={{ marginRight: 6 }}
            />
            Required
          </label>
        </div>
      ))}

      {fields.length > 0 && (
        <div className="row" style={{ marginTop: 12 }}>
          <a className="button" href="/chat">Start Chat Fill</a>
          <a className="button ghost" href="/preview">Skip to Preview</a>
        </div>
      )}
    </div>
  );
}
