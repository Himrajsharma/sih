import { ShieldAlert, Activity, Layers, AlertTriangle, Waves, Radio } from 'lucide-react';

export default function Header({ villages = [], mode = 'landslide', onModeChange }) {
  const criticalCount = villages.filter(v => v.score >= 70).length;
  const criticalInundation = villages.filter(v => (v.riverLevel || 1.4) >= (v.warningMark || 3.0)).length;

  return (
    <header className="dashboard-header">
      <div className="logo-area">
        <div className="logo-icon" style={{ backgroundColor: mode === 'flash_flood' ? 'rgba(56, 189, 248, 0.15)' : undefined }}>
          {mode === 'flash_flood' ? (
            <Waves size={22} style={{ color: '#38bdf8' }} />
          ) : (
            <ShieldAlert size={22} />
          )}
        </div>
        <div className="logo-text">
          <h1>BhoomiRakshak</h1>
          <span className="subtitle">
            {mode === 'flash_flood' ? 'Hyper-Local Flash Flood Early Warning System' : 'Hyper-Local Landslide Early Warning System'}
          </span>
        </div>
      </div>

      <div className="header-stats">
        <div className="stat-chip">
          <Layers size={14} style={{ color: 'var(--accent-blue)' }} />
          <span>Monitored Wards:</span>
          <span className="val">{villages.length}</span>
        </div>

        {mode === 'flash_flood' ? (
          <div className={`stat-chip ${criticalInundation > 0 ? 'critical' : ''}`}>
            <Waves size={14} style={{ color: criticalInundation > 0 ? '#ef4444' : '#38bdf8' }} />
            <span>Flood Warning Wards:</span>
            <span className="val">{criticalInundation}</span>
          </div>
        ) : (
          <div className={`stat-chip ${criticalCount > 0 ? 'critical' : ''}`}>
            <AlertTriangle size={14} />
            <span>Critical Landslide Wards:</span>
            <span className="val">{criticalCount}</span>
          </div>
        )}

        <div className="stat-chip">
          <Radio size={14} style={{ color: 'var(--risk-low)' }} />
          <span>IoT Mesh Telemetry:</span>
          <span className="val" style={{ color: 'var(--risk-low)' }}>Online (32 Nodes)</span>
        </div>
      </div>

      <div className="header-controls">
        <div className="mode-switcher">
          <button 
            className={`mode-btn ${mode === 'landslide' ? 'active' : ''}`}
            onClick={() => onModeChange && onModeChange('landslide')}
          >
            <Activity size={14} />
            <span>Landslide Risk</span>
          </button>
          
          <button 
            className={`mode-btn ${mode === 'flash_flood' ? 'active' : ''}`}
            onClick={() => onModeChange && onModeChange('flash_flood')}
            style={mode === 'flash_flood' ? { background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.3), rgba(2, 132, 199, 0.4))', borderColor: '#38bdf8' } : {}}
          >
            <Waves size={14} style={{ color: mode === 'flash_flood' ? '#38bdf8' : undefined }} />
            <span>Flash Flood System</span>
          </button>
        </div>

        <div className="live-indicator">
          <div className="live-dot"></div>
          <span>LIVE</span>
        </div>
      </div>
    </header>
  );
}

