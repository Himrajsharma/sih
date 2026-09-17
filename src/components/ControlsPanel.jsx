import { useState } from 'react';
import { Play, Square, RotateCcw, Sliders, CloudLightning, Zap, CloudRain, Droplets, Mountain, Waves, Flame, Check, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';

export default function ControlsPanel({ 
  village, 
  simulationActive, 
  simulationTarget, 
  onSimulate, 
  onReset,
  onOverride,
  onApplyPreset,
  mode = 'landslide'
}) {
  const [activePreset, setActivePreset] = useState(null);
  const [simScenario, setSimScenario] = useState('cloudburst'); // 'cloudburst' | 'glof' | 'landslide' | 'monsoon'

  const simulationTypes = [
    { 
      id: 'cloudburst', 
      label: 'Torrential Cloudburst', 
      icon: CloudRain, 
      desc: 'Simulates extreme rainfall intensity (>90 mm/h) with rapid surface deluge',
      color: '#0284c7',
      rain: 95, moisture: 85, slope: 75, riverLevel: 4.2, riverRiseRate: 12
    },
    { 
      id: 'glof', 
      label: 'Glacial Outburst (GLOF)', 
      icon: Flame, 
      desc: 'Simulates sudden glacial lake collapse & river water stage surge (+5.2m)',
      color: '#dc2626',
      rain: 70, moisture: 90, slope: 70, riverLevel: 5.4, riverRiseRate: 25
    },
    { 
      id: 'landslide', 
      label: 'Slope Shear Collapse', 
      icon: Mountain, 
      desc: 'Simulates severe terrain failure & slope destabilization (Slope Index 35)',
      color: '#d97706',
      rain: 65, moisture: 85, slope: 35, riverLevel: 3.6, riverRiseRate: 8
    },
    { 
      id: 'monsoon', 
      label: 'Sustained Saturation', 
      icon: Droplets, 
      desc: 'Simulates continuous monsoon soaking leading to 98% soil saturation',
      color: '#16a34a',
      rain: 50, moisture: 98, slope: 65, riverLevel: 3.2, riverRiseRate: 5
    }
  ];

  const handleSelectScenario = (type) => {
    setSimScenario(type.id);
    setActivePreset(type.label);
    if (onApplyPreset) {
      onApplyPreset(type.rain, type.moisture, type.slope, type.riverLevel, type.riverRiseRate);
    }
  };

  const handleResetClick = () => {
    setActivePreset(null);
    if (onReset) {
      onReset();
    }
  };

  const activeTypeObj = simulationTypes.find(t => t.id === simScenario) || simulationTypes[0];

  return (
    <div className="panel controls-panel">
      {/* Simulation Command Center */}
      <div className="control-card">
        <div className="panel-title">
          <div className="panel-title-left">
            <CloudLightning size={16} style={{ color: simulationActive ? '#dc2626' : 'var(--accent-blue)' }} />
            <span>Interactive Stress-Test Simulation Hub</span>
          </div>
          <span className="sim-mode-tag" style={{ background: simulationActive ? '#fef2f2' : '#f0f9ff', color: simulationActive ? '#dc2626' : '#0284c7' }}>
            {simulationActive ? '🔴 RUNNING DISASTER STRESS-TEST' : '🟢 READY FOR DEPLOYMENT'}
          </span>
        </div>

        {/* Scenario Selection Grid */}
        <div className="scenario-selector-title">
          <span>Select Emergency Scenario to Simulate:</span>
        </div>
        <div className="scenario-grid">
          {simulationTypes.map(type => {
            const Icon = type.icon;
            const isSelected = simScenario === type.id;
            return (
              <button
                key={type.id}
                className={`scenario-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectScenario(type)}
                style={isSelected ? { borderColor: type.color, background: `${type.color}0d` } : {}}
              >
                <div className="scenario-top">
                  <Icon size={14} style={{ color: type.color }} />
                  <span className="scenario-label">{type.label}</span>
                </div>
                <div className="scenario-desc">{type.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Main Action Trigger Buttons */}
        <div className="action-buttons">
          <button 
            className={`btn primary ${simulationActive ? 'sim-active' : ''}`}
            onClick={onSimulate}
            style={simulationActive 
              ? { background: 'linear-gradient(135deg, #dc2626, #b91c1c)', boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)' } 
              : { background: `linear-gradient(135deg, ${activeTypeObj.color}, #0369a1)` }}
          >
            {simulationActive ? <Square size={16} /> : <Play size={16} />}
            <span>
              {simulationActive 
                ? `Stop Active Simulation (${simulationTarget ? simulationTarget.name : 'Target'})` 
                : `Start ${activeTypeObj.label} Simulation`
              }
            </span>
          </button>

          <button className="btn secondary" onClick={handleResetClick}>
            <RotateCcw size={15} />
            <span>Reset Baseline</span>
          </button>
        </div>

        {/* Dynamic Simulation Live HUD Ticker */}
        <div className={`active-sim-banner ${simulationActive ? 'active' : ''}`}>
          <Activity size={16} className={simulationActive ? 'pulse-icon' : ''} style={{ color: simulationActive ? '#dc2626' : 'var(--text-muted)' }} />
          {simulationActive && simulationTarget ? (
            <div className="sim-hud-details">
              <div>
                <strong>SIMULATING SURGE:</strong> Escalating {activeTypeObj.label} over <span className="target-name">{simulationTarget.name}</span>.
              </div>
              <div className="sim-hud-deltas">
                <span>Rainfall: <strong>+{Math.round(simulationTarget.rain - 5)} mm/h</strong></span>
                {mode === 'flash_flood' ? (
                  <span>Water Stage: <strong>+{(simulationTarget.riverLevel - 1.2).toFixed(1)} m</strong></span>
                ) : (
                  <span>Slope Stability: <strong>{Math.round(simulationTarget.slope)} Index</strong></span>
                )}
                <span>Evacuation Lead Window: <strong style={{ color: '#dc2626' }}>{simulationTarget.leadTimeMins} Mins</strong></span>
              </div>
            </div>
          ) : (
            <span>Simulation inactive. Select a scenario above and click Start to trigger real-time hazard response testing.</span>
          )}
        </div>
      </div>
      
      {/* Telemetry Overrides & Scenario Sliders */}
      <div className="control-card">
        <div className="panel-title">
          <div className="panel-title-left">
            <Sliders size={16} />
            <span>
              Fine-Tune Telemetry Parameters 
              <span className="override-target-name"> {village ? `(${village.name})` : '(Global Selected Ward)'}</span>
            </span>
          </div>
          <span className="ward-badge-pill" style={{ borderColor: village ? village.cat.hex : '#0284c7', color: village ? village.cat.hex : '#0284c7' }}>
            {village ? `${village.score}/100 ${village.cat.label}` : 'SELECT WARD'}
          </span>
        </div>

        {/* Quick Parameter Preset Chips */}
        <div className="presets-container" style={{ marginBottom: '4px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
            <Zap size={11} style={{ color: 'var(--accent-blue)' }} /> Quick Presets:
          </span>
          <button className="preset-btn" onClick={() => onApplyPreset(85, village ? village.moisture : 60, village ? village.slope : 80, village ? village.riverLevel : 2.5, village ? village.riverRiseRate : 5)}>
            <CloudRain size={11} /> 85mm Rain
          </button>
          <button className="preset-btn" onClick={() => onApplyPreset(village ? village.rain : 40, village ? village.moisture : 60, village ? village.slope : 80, 4.2, 12)}>
            <Waves size={11} /> 4.2m Surge
          </button>
          <button className="preset-btn" onClick={() => onApplyPreset(village ? village.rain : 40, 95, village ? village.slope : 80, village ? village.riverLevel : 2.5, village ? village.riverRiseRate : 5)}>
            <Droplets size={11} /> 95% Saturation
          </button>
        </div>

        <div className="sliders-grid">
          <div className="slider-row">
            <label>
              <CloudRain size={13} style={{ color: 'var(--accent-blue)' }} />
              Rainfall (mm/h)
            </label>
            <div className="slider-track-wrap">
              <input 
                type="range" 
                min="0" max="100" 
                value={village ? village.rain : 10} 
                onChange={(e) => onOverride('rain', parseFloat(e.target.value))}
              />
            </div>
            <span className="slider-val-badge">
              {village ? Math.round(village.rain) : 10}
            </span>
          </div>
          
          {mode === 'flash_flood' ? (
            <>
              <div className="slider-row">
                <label>
                  <Waves size={13} style={{ color: '#38bdf8' }} />
                  River Stage Level (m)
                </label>
                <div className="slider-track-wrap">
                  <input 
                    type="range" 
                    min="0" max="6.5" step="0.1"
                    value={village ? (village.riverLevel || 1.4) : 1.4} 
                    onChange={(e) => onOverride('riverLevel', parseFloat(e.target.value))}
                  />
                </div>
                <span className="slider-val-badge" style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', borderColor: 'rgba(56, 189, 248, 0.2)' }}>
                  {village ? (village.riverLevel || 1.4).toFixed(1) : 1.4} m
                </span>
              </div>

              <div className="slider-row">
                <label>
                  <Droplets size={13} style={{ color: 'var(--risk-low)' }} />
                  Soil Saturation (%)
                </label>
                <div className="slider-track-wrap">
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={village ? village.moisture : 30} 
                    onChange={(e) => onOverride('moisture', parseFloat(e.target.value))}
                  />
                </div>
                <span className="slider-val-badge" style={{ color: 'var(--risk-low)', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                  {village ? Math.round(village.moisture) : 30}%
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="slider-row">
                <label>
                  <Droplets size={13} style={{ color: 'var(--risk-low)' }} />
                  Soil Moisture (%)
                </label>
                <div className="slider-track-wrap">
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={village ? village.moisture : 30} 
                    onChange={(e) => onOverride('moisture', parseFloat(e.target.value))}
                  />
                </div>
                <span className="slider-val-badge" style={{ color: 'var(--risk-low)', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                  {village ? Math.round(village.moisture) : 30}%
                </span>
              </div>
              
              <div className="slider-row">
                <label>
                  <Mountain size={13} style={{ color: 'var(--risk-medium)' }} />
                  Slope Stability Index
                </label>
                <div className="slider-track-wrap">
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={village ? village.slope : 95} 
                    onChange={(e) => onOverride('slope', parseFloat(e.target.value))}
                  />
                </div>
                <span className="slider-val-badge" style={{ color: 'var(--risk-medium)', background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                  {village ? Math.round(village.slope) : 95}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Live Telemetry Override Footer Status */}
        <div className="active-sim-banner" style={{ marginTop: '4px' }}>
          <Activity size={14} style={{ color: 'var(--accent-blue)' }} />
          <span>
            Telemetry Target: <strong>{village ? village.name : 'Target Ward'}</strong> | Danger Level: <strong>{(village?.dangerMark || 4.0).toFixed(1)}m</strong> | Evacuation Window: <strong style={{ color: (village?.leadTimeMins || 45) < 30 ? '#dc2626' : '#f59e0b' }}>{village?.leadTimeMins || 45} mins</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

