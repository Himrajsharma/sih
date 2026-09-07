export default function RiskList({ villages, selectedId, onSelect }) {
  // Sort descending
  const sortedVillages = [...villages].sort((a, b) => b.score - a.score);

  return (
    <div className="panel risk-list-panel">
      <h2>Real-Time Risk Rankings</h2>
      <div className="risk-list-header">
        <span>Village / Ward</span>
        <span>Risk Score</span>
      </div>
      <ul className="village-list">
        {sortedVillages.map(v => (
          <li 
            key={v.id}
            className={`village-item ${selectedId === v.id ? 'selected' : ''}`}
            style={{ borderLeftColor: v.cat.hex }}
            onClick={() => onSelect(v.id)}
          >
            <span className="village-name">{v.name}</span>
            <span className="risk-badge" style={{ backgroundColor: v.cat.hex }}>
              {v.score}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
