"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { validateByType } from "@/lib/validate";

type Field = {
  key: string;
  label: string;
  type: "text" | "email" | "date" | "number" | "currency" | "choice";
  required?: boolean;
  options?: string[];
};

type Msg = { role: "system" | "assistant" | "user"; text: string };

export default function ChatPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [i, setI] = useState(0);                 // index of current field
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const viewRef = useRef<HTMLDivElement>(null);

  // Load fields + any saved values from session
  useEffect(() => {
    const f = sessionStorage.getItem("lexfill_fields");
    const v = sessionStorage.getItem("lexfill_values");
    if (f) setFields(JSON.parse(f));
    if (v) setValues(JSON.parse(v));
  }, []);

  // If some values already exist, skip answered fields
  useEffect(() => {
    if (fields.length === 0) return;
    let idx = 0;
    while (idx < fields.length && values[fields[idx].key]) idx++;
    setI(idx);
    setDone(idx >= fields.length);
  }, [fields]); // initial pass based on stored values

  // Messages derived from state (deterministic)
  const messages: Msg[] = useMemo(() => {
    const m: Msg[] = [{ role: "assistant", text: "Hi! I’ll guide you through filling the document. Answer a few questions below." }];
    // Add previously answered Q/A
    fields.forEach((f, idx) => {
      const v = values[f.key];
      if (v) {
        m.push({ role: "assistant", text: questionFor(f) });
        m.push({ role: "user", text: v });
      }
    });
    // Add current question if not done
    if (!done && fields[i]) {
      m.push({ role: "assistant", text: questionFor(fields[i]) });
    }
    // Completion message
    if (done) m.push({ role: "assistant", text: "All set! You can go to Preview to generate and download your document." });
    return m;
  }, [fields, values, i, done]);

  // Auto-scroll on new messages
  useEffect(() => {
    viewRef.current?.scrollTo({ top: viewRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const onSend = () => {
    if (done || !fields[i]) return;
    const f = fields[i];
    const v = input.trim();
    const err = f.required !== false ? validateByType(f.type, v) : null;
    if (err) return setError(err);

    // Save value
    const updated = { ...values, [f.key]: v };
    setValues(updated);
    sessionStorage.setItem("lexfill_values", JSON.stringify(updated));
    setInput("");
    setError(null);

    // Advance to next unanswered field
    let next = i + 1;
    while (next < fields.length && updated[fields[next].key]) next++;
    if (next >= fields.length) setDone(true);
    setI(next);
  };

  const onSkip = () => {
    if (done || !fields[i]) return;
    const next = i + 1;
    if (next >= fields.length) setDone(true);
    setI(next);
    setInput("");
    setError(null);
  };

  const progress = fields.length ? Math.min(Object.keys(values).length, fields.length) : 0;
  const pct = fields.length ? Math.round((progress / fields.length) * 100) : 0;

  return (
    <div className="card">
      <h2>Chat</h2>
      <p style={{ marginTop: 4 }}>{progress}/{fields.length} fields answered — {pct}%</p>

      <div
        ref={viewRef}
        style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: 12, minHeight: 220, maxHeight: 360, overflowY: "auto", background: "#fff", marginTop: 8 }}
      >
        {messages.map((m, idx) => (
          <p key={idx} style={{ whiteSpace: "pre-wrap" }}>
            <strong>{m.role === "assistant" ? "LexFill: " : "You: "}</strong>{m.text}
          </p>
        ))}
      </div>

      {!done && fields[i] && (
        <>
          <div style={{ marginTop: 10 }}>
            <label className="label" htmlFor="chat-input">
              {fields[i].label} {fields[i].required ? "*" : ""}
            </label>
            <input
              id="chat-input"
              className="input"
              type={fields[i].type === "date" ? "date" : fields[i].type === "email" ? "email" : "text"}
              placeholder={placeholderFor(fields[i])}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onSend(); }}
            />
            {error && <p style={{ color: "crimson", marginTop: 6 }}>{error}</p>}
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <button className="button" onClick={onSend}>Send</button>
            <button className="button ghost" onClick={onSkip}>Skip</button>
          </div>
        </>
      )}

      {done && (
        <div className="row" style={{ marginTop: 12 }}>
          <a className="button" href="/preview">Go to Preview</a>
          <a className="button ghost" href="/editor">Adjust Fields</a>
        </div>
      )}
    </div>
  );
}

function questionFor(f: Field): string {
  switch (f.type) {
    case "email": return `What's the ${f.label}? (email)`;
    case "date": return `What's the ${f.label}? (date)`;
    case "number": return `What's the ${f.label}? (number)`;
    case "currency": return `What's the ${f.label}? (amount in USD)`;
    case "choice": return `Choose a ${f.label}${f.options?.length ? ` (${f.options.join(", ")})` : ""}.`;
    default: return `What's the ${f.label}?`;
  }
}
function placeholderFor(f: Field): string {
  switch (f.type) {
    case "email": return "e.g., founder@company.com";
    case "date": return "YYYY-MM-DD";
    case "number": return "e.g., 1000000";
    case "currency": return "e.g., 250000";
    default: return f.label;
  }
}
