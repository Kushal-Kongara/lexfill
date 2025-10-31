"use client";

import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<string[]>([
    "Hi! Let's fill your document. What's the Company Name?"
  ]);

  return (
    <div className="card">
      <h2>Chat</h2>
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: 12, minHeight: 160 }}>
        {messages.map((m, i) => <p key={i}>{m}</p>)}
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <input className="input" placeholder="Type your answer…" />
        <button className="button">Send</button>
      </div>
      <p className="mono" style={{ marginTop: 12 }}>Later: LLM-driven questions & validation</p>
    </div>
  );
}
