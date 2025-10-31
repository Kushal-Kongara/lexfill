# LexFill — AI-Assisted Legal Document Filler (SAFE Template Demo)

LexFill is a lightweight web app designed to **upload a legal agreement (.docx)**, detect **template placeholders**, allow the user to **fill those values conversationally**, and then **generate a completed final document** that can be downloaded.

This project is built as the **test assignment for the Software Engineer role at Lexsy**.

---

## 🚀 Live Demo
**URL:** https://lexfill.vercel.app  
(No login required)

---

## 🎯 What the App Does

| Step | Action |
|-----|--------|
| 1 | User uploads a **SAFE document (.docx)** |
| 2 | System automatically **extracts placeholders** — including: Purchase Amount, Valuation Cap, Company Name, Investor Name, Address, Email, etc. |
| 3 | User **fills values** using a simple UI **or via conversational prompts** |
| 4 | The filled values are **merged into the original document** |
| 5 | The user **previews and downloads** a completed `.docx` agreement |

This works **even when placeholders are not uniform**, e.g.:

- `[COMPANY]`
- `[name]`
- `Address: __________`
- `$[____]`
- `QQQ (the “Investor”)`

---

## 🧠 Key Implementation Points

- Document parsing uses **Mammoth** to convert .docx → HTML
- Custom parsing logic handles:
  - Bracketed fields: `[COMPANY]`, `[name]`
  - Underscore blanks near labels: `Purchase Amount`, `Valuation Cap`
  - `$QQQ` → automatically treated as currency placeholders
  - Signature blocks at the end (Company & Investor)
- Values are stored in `sessionStorage` so navigation does not lose progress
- Final filled document is generated via **html-to-docx** and downloaded

---

## 🏗️ Tech Stack

| Area | Technology |
|------|------------|
| Framework | Next.js (App Router) |
| UI | Vanilla HTML/CSS (no Tailwind for simplicity) |
| Parsing | Mammoth (.docx → HTML) |
| Merge & Fill | Custom placeholder extraction + replace engine |
| Export | html-to-docx |
| Deployment | Vercel |

---

## 📂 Project Structure

src/
└ app/
├ (routes)/
│ ├ upload/
│ ├ editor/
│ ├ chat/
│ └ preview/
└ api/
├ parse/
├ fill/
└ docx/
lib/
components/


Pages:
- `/upload` — Upload SAFE document
- `/editor` — Inspect/adjust detected fields
- `/chat` — Fill fields conversationally
- `/preview` — Generate & download final document

---

## 🧪 Running Locally

```bash
git clone https://github.com/Kushal-Kongara/lexfill.git
cd lexfill
npm install
npm run dev

http://localhost:3000

📦 Deployment

This project is deployed on Vercel and is configured to auto-deploy on every main branch push.

🗂 Sample Document

The SAFE template used in testing is included in the assignment brief and can be uploaded directly on the /upload page.

🎥 Loom Video (Provided in Application Email)

Covers:

Personal Intro

AI Tools in Workflow

Why Lexsy + Fit with this role

💬 Notes

The goal of this implementation is clarity, maintainability, and correctness — not UI polish.
The project is intentionally written so that:

A founder can walk through it end-to-end in < 2 minutes

A lawyer can verify the filled document is structurally unchanged

The core logic can be reused in Lexsy’s existing workflow engines

🤝 Thank You

Excited about the opportunity to contribute to Lexsy’s mission of rethinking legal workflows for startups.

If you'd like a walkthrough, I can demo the system live.