export default function Header() {
  return (
    <header className="dashboard-header">
      <div className="logo-area">
        <h1>⛰️ BhoomiRakshak</h1>
        <span className="subtitle">Hyper-Local Landslide Early Warning System (Demo)</span>
      </div>
      <div className="header-controls">
        <button className="mode-btn active">Landslide Risk</button>
        <button className="mode-btn disabled" title="Future Scope">
          Flash Flood Risk <span>(Coming Soon)</span>
        </button>
        <span className="live-indicator">🔴 LIVE</span>
      </div>
    </header>
  );
}
