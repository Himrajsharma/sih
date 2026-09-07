export default function ControlsPanel({ 
  village, 
  simulationActive, 
  simulationTarget, 
  onSimulate, 
  onReset,
  onOverride
}) {
  return (
    <div className="panel controls-panel">
      <div className="control-group">
        <h3>Simulation Controls</h3>
        <div className="action-buttons">
          <button 
            className="btn primary" 
            onClick={onSimulate}
            disabled={simulationActive}
          >
            ⚠️ Simulate Storm Event
          </button>
          <button className="btn secondary" onClick={onReset}>
            🔄 Reset Baseline
          </button>
        </div>
        <div className="active-sim-info">
          {simulationActive && simulationTarget ? (
            <span style={{ color: 'var(--risk-high)' }}>
              ⛈️ Storm Cell tracking directly over <strong>{simulationTarget.name}</strong>. Escalation imminent.
            </span>
          ) : (
            "Simulation inactive. Ready."
          )}
        </div>
      </div>
      
      <div className="control-group sliders-group">
        <h3>
          Manual Overrides 
          <span id="override-village-name"> {village ? `(${village.name})` : '(Global)'}</span>
        </h3>
        
        <div className="slider-row">
          <label>Rainfall (mm/hr)</label>
          <input 
            type="range" 
            min="0" max="100" 
            value={village ? village.rain : 10} 
            onChange={(e) => onOverride('rain', parseFloat(e.target.value))}
          />
          <span className="slider-val">{village ? Math.round(village.rain) : 10}</span>
        </div>
        
        <div className="slider-row">
          <label>Soil Moisture (%)</label>
          <input 
            type="range" 
            min="0" max="100" 
            value={village ? village.moisture : 30} 
            onChange={(e) => onOverride('moisture', parseFloat(e.target.value))}
          />
          <span className="slider-val">{village ? Math.round(village.moisture) : 30}%</span>
        </div>
        
        <div className="slider-row">
          <label>Slope Stability Index</label>
          <input 
            type="range" 
            min="0" max="100" 
            value={village ? village.slope : 95} 
            onChange={(e) => onOverride('slope', parseFloat(e.target.value))}
          />
          <span className="slider-val">{village ? Math.round(village.slope) : 95}</span>
        </div>
        
        <small className="help-text">Select a village on the map to override its specific sensors.</small>
      </div>
    </div>
  );
}
