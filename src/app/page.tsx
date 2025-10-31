import Link from "next/link";

export default function Home() {
  return (
    <div style={{ 
      textAlign: 'center', 
      paddingTop: '80px', 
      paddingBottom: '80px',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      <h1 style={{ 
        fontSize: '3.5rem', 
        fontWeight: '400',
        lineHeight: '1.2',
        marginBottom: '32px',
        letterSpacing: '-0.5px'
      }}>
        Tailored legal solutions for Startups and Venture Funds
      </h1>
      <p style={{ 
        fontSize: '1.25rem', 
        lineHeight: '1.8',
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: '48px',
        maxWidth: '700px',
        margin: '0 auto 48px'
      }}>
        At LexFill, we don't just provide legal services—we partner with startups and founders to help them thrive. Our experienced legal team offers bespoke, hourly-billed services designed specifically for fast-growing companies.
      </p>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link className="button" href="/upload">
          Get Started
        </Link>
        <Link className="button ghost" href="/chat">
          Explore Features
        </Link>
      </div>
    </div>
  );
}
