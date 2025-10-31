export function Header() {
    return (
      <header className="header">
        <div className="container header-inner">
          <div className="brand">LexFill</div>
          <nav className="nav">
            <a href="/upload">Upload</a>
            <a href="/editor">Editor</a>
            <a href="/chat">Chat</a>
            <a href="/preview">Preview</a>
          </nav>
        </div>
      </header>
    );
  }
  