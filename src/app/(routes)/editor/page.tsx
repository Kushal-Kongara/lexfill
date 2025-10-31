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

  return (
    <div className="card">
      <h2>Editor (Fields)</h2>
      <p>Review & edit detected fields (label, type, required).</p>
      <ul className="list">
        {fields.length === 0 && <li>No fields yet. Go to Upload.</li>}
        {fields.map((f) => (
          <li key={f.key}>
            <strong>{f.label}</strong> — <em>{f.type}</em> [{f.key}] {f.required ? " *" : ""}
          </li>
        ))}
      </ul>
      <p className="mono" style={{ marginTop: 12 }}>API: POST /api/fields/ai-suggest (next)</p>
    </div>
  );
}
