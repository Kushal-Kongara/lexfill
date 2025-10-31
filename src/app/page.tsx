import Link from "next/link";

export default function Home() {
  return (
    <div className="card">
      <h1>Welcome to LexFill</h1>
      <p>Upload a .docx legal draft to begin.</p>
      <Link className="button" href="/upload">Go to Upload</Link>
    </div>
  );
}
