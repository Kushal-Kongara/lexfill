export default function EditorPage() {
    return (
      <div className="card">
        <h2>Editor (Fields)</h2>
        <p>Review & edit detected fields (label, type, required).</p>
        <ul className="list">
          <li>company_name — text</li>
          <li>valuation_cap — currency</li>
          <li>purchase_amount — currency</li>
          <li>effective_date — date</li>
        </ul>
        <p className="mono" style={{ marginTop: 12 }}>API: POST /api/fields/ai-suggest</p>
      </div>
    );
  }  