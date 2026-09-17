import { useState } from 'react';
import { 
  Waves, 
  Clock, 
  Radio, 
  Compass, 
  Building2, 
  CheckSquare, 
  History, 
  AlertOctagon, 
  Activity, 
  BellRing
} from 'lucide-react';

export default function FlashFloodPanel({ village }) {
  const [activeTab, setActiveTab] = useState('leadtime'); // 'leadtime' | 'iot' | 'shelter' | 'history' | 'checklist'
  const [checklist, setChecklist] = useState({
    chk1: true,
    chk2: true,
    chk3: false,
    chk4: false,
    chk5: false
  });

  const toggleCheck = (id) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!village) {
    return (
      <div className="panel flash-flood-panel">
        <div className="panel-title">
          <div className="panel-title-left">
            <Waves size={16} style={{ color: 'var(--accent-cyan)' }} />
            <span>Flash Flood Intelligence & Early Warning</span>
          </div>
        </div>
        <div className="empty-panel-notice">
          Select a Village or Ward from the Map or Rankings list to inspect hyper-local IoT sensors, lead time to evacuation, shelters, and historical return periods.
        </div>
      </div>
    );
  }

  // Calculate Lead Time & Risk Metrics for the selected village
  const riverLevel = village.riverLevel || 1.4;
  const dangerMark = village.dangerMark || 4.0;
  const warningMark = village.warningMark || 3.0;
  const riverRiseRate = village.riverRiseRate || 2.0; // cm/min
  const leadTimeMins = village.leadTimeMins || 45;
  const discharge = village.discharge || 48; // m³/s

  // Determine Warning Tier
  let alertLevel = { tier: 'NORMAL', color: '#10b981', label: 'MONITORING NOMINAL' };
  if (riverLevel >= dangerMark || village.score >= 85) {
    alertLevel = { tier: 'EVACUATE NOW', color: '#ef4444', label: 'IMMINENT FLASH FLOOD INUNDATION' };
  } else if (riverLevel >= warningMark || village.score >= 70) {
    alertLevel = { tier: 'WARNING', color: '#f97316', label: 'RAPID RIVER LEVEL SURGE' };
  } else if (village.score >= 40) {
    alertLevel = { tier: 'ADVISORY', color: '#f59e0b', label: 'ELEVATED CATCHMENT RUNOFF' };
  }

  const iotSensors = village.iotSensors || [
    { type: 'Ultrasonic Stage Gauge', model: 'OTT RLS 24GHz', battery: '98%', status: 'ONLINE', val: `${riverLevel.toFixed(2)} m`, trend: `+${Math.round(riverRiseRate)} cm/min` },
    { type: 'Automated Rain Gauge (ARG)', model: 'OTT Pluvio2', battery: '95%', status: 'ONLINE', val: `${Math.round(village.rain)} mm/h`, trend: village.rain > 30 ? 'SURGING' : 'MODERATE' },
    { type: 'TDR Soil Moisture Probe', model: 'Campbell CS655', battery: '91%', status: 'ONLINE', val: `${Math.round(village.moisture)}% Sat`, trend: village.moisture > 80 ? 'CRITICAL' : 'STABLE' },
    { type: 'Hydrodynamic Discharge Sensor', model: 'Sommer RG-30', battery: '100%', status: 'ONLINE', val: `${discharge} m³/s`, trend: `+${Math.round(riverRiseRate * 2)} m³/s` }
  ];

  const shelter = village.shelter || {
    name: `${village.name} High Altitude Community Camp`,
    dist: '1.2 km',
    elevation: '+140 m relative to riverbed',
    capacity: 500,
    occupancy: '120 Beds Occupied',
    route: 'Eastern Ridge Pathway (Route 2B) - Avoid River Bank Track'
  };

  const historical = village.historicalData || {
    flood10yr: 3.4,
    flood50yr: 4.8,
    flood100yr: 6.2,
    maxHistorical2013: 5.6,
    maxHistorical2021: 4.9
  };

  return (
    <div className="panel flash-flood-panel">
      {/* Panel Title & Navigation Tabs */}
      <div className="panel-header-with-tabs">
        <div className="panel-title">
          <div className="panel-title-left">
            <Waves size={16} style={{ color: alertLevel.color }} />
            <span>Hyper-Local Flash Flood Early Warning</span>
          </div>
          <span className="ward-badge-pill" style={{ borderColor: alertLevel.color, color: alertLevel.color }}>
            {village.name}
          </span>
        </div>

        {/* Tab Switcher Bar */}
        <div className="ff-tabs">
          <button 
            className={`ff-tab ${activeTab === 'leadtime' ? 'active' : ''}`}
            onClick={() => setActiveTab('leadtime')}
          >
            <Clock size={12} /> Lead Time
          </button>
          <button 
            className={`ff-tab ${activeTab === 'iot' ? 'active' : ''}`}
            onClick={() => setActiveTab('iot')}
          >
            <Radio size={12} /> IoT Sensors
          </button>
          <button 
            className={`ff-tab ${activeTab === 'shelter' ? 'active' : ''}`}
            onClick={() => setActiveTab('shelter')}
          >
            <Building2 size={12} /> Shelters & Evac
          </button>
          <button 
            className={`ff-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={12} /> Disaster History
          </button>
          <button 
            className={`ff-tab ${activeTab === 'checklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('checklist')}
          >
            <CheckSquare size={12} /> Preparedness
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="ff-tab-content">
        {/* 1. Actionable Lead Time & Alert Tier */}
        {activeTab === 'leadtime' && (
          <div className="ff-section">
            <div className="alert-tier-banner" style={{ backgroundColor: `${alertLevel.color}15`, borderColor: alertLevel.color }}>
              <div className="alert-tier-left">
                <AlertOctagon size={24} style={{ color: alertLevel.color }} />
                <div>
                  <span className="tier-name" style={{ color: alertLevel.color }}>
                    TIER: {alertLevel.tier}
                  </span>
                  <div className="tier-subtext">{alertLevel.label}</div>
                </div>
              </div>
              <div className="alert-tier-right">
                <BellRing size={16} className={alertLevel.tier === 'EVACUATE NOW' ? 'pulse-icon' : ''} />
                <span>{alertLevel.tier === 'EVACUATE NOW' ? 'Siren Active' : 'Siren Standby'}</span>
              </div>
            </div>

            <div className="leadtime-card">
              <div className="leadtime-header">
                <Clock size={18} style={{ color: 'var(--accent-cyan)' }} />
                <span>Estimated Actionable Evacuation Lead Time</span>
              </div>

              <div className="leadtime-main">
                <div className="leadtime-timer">
                  <span className="leadtime-num" style={{ color: leadTimeMins < 30 ? '#ef4444' : '#f59e0b' }}>
                    {leadTimeMins < 99 ? leadTimeMins : '120+'}
                  </span>
                  <span className="leadtime-unit">Minutes Lead Time</span>
                </div>
                
                <div className="leadtime-stats">
                  <div className="stat-row">
                    <span>River Stage Height:</span>
                    <strong style={{ color: riverLevel >= dangerMark ? '#ef4444' : '#38bdf8' }}>
                      {riverLevel.toFixed(2)} m (Danger: {dangerMark.toFixed(1)} m)
                    </strong>
                  </div>
                  <div className="stat-row">
                    <span>Stage Rise Rate:</span>
                    <strong>+{riverRiseRate.toFixed(1)} cm/min</strong>
                  </div>
                  <div className="stat-row">
                    <span>Est. Time to Crest:</span>
                    <strong>{Math.round(leadTimeMins * 1.2)} mins</strong>
                  </div>
                </div>
              </div>

              <div className="leadtime-bar-wrapper">
                <div className="leadtime-bar-label">
                  <span>Evacuation Window Progress</span>
                  <span>{leadTimeMins < 30 ? 'CRITICAL EVACUATION WINDOW' : 'SAFE PREPARATION WINDOW'}</span>
                </div>
                <div className="leadtime-progress-bar">
                  <div 
                    className="leadtime-progress-fill" 
                    style={{ 
                      width: `${Math.min(100, Math.max(10, 100 - (leadTimeMins / 90 * 100)))}%`,
                      backgroundColor: leadTimeMins < 30 ? '#ef4444' : '#f59e0b'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Hyper-Local Warning Dispatch Box */}
            <div className="broadcast-sim-card">
              <div className="broadcast-title">
                <Radio size={14} style={{ color: 'var(--accent-blue)' }} />
                <span>Ward Automated Early Warning System</span>
              </div>
              <div className="broadcast-grid">
                <div className="broadcast-item">
                  <span>Hyper-Local Ward SMS Alert:</span>
                  <span className="status-pill green">Sent to 1,420 Residents</span>
                </div>
                <div className="broadcast-item">
                  <span>Automated Voice Call (IVR):</span>
                  <span className="status-pill green">Dispatched</span>
                </div>
                <div className="broadcast-item">
                  <span>High-Decibel Siren:</span>
                  <span className={alertLevel.tier === 'EVACUATE NOW' ? 'status-pill red' : 'status-pill yellow'}>
                    {alertLevel.tier === 'EVACUATE NOW' ? 'SIREN ACTIVE (110dB)' : 'STANDBY MODE'}
                  </span>
                </div>
                <div className="broadcast-item">
                  <span>Disaster Radio Channel:</span>
                  <span className="status-pill green">FM 102.4 Broadcast</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Real-Time IoT Telemetry Sensors */}
        {activeTab === 'iot' && (
          <div className="ff-section">
            <div className="iot-header-info">
              <span>IoT Mesh Telemetry Status: <strong>4 / 4 Nodes Online</strong></span>
              <span className="iot-live-pulse">
                <span className="pulse-dot"></span> LIVE 5s Telemetry Feed
              </span>
            </div>

            <div className="iot-sensors-grid">
              {iotSensors.map((sensor, idx) => (
                <div key={idx} className="iot-sensor-card">
                  <div className="iot-sensor-top">
                    <div className="iot-sensor-name">
                      <Activity size={14} style={{ color: 'var(--accent-blue)' }} />
                      <span>{sensor.type}</span>
                    </div>
                    <span className="iot-badge-online">{sensor.status}</span>
                  </div>
                  <div className="iot-sensor-model">{sensor.model}</div>

                  <div className="iot-sensor-value">
                    <span className="sensor-num">{sensor.val}</span>
                    <span className="sensor-trend">{sensor.trend}</span>
                  </div>

                  <div className="iot-sensor-footer">
                    <span>Battery: {sensor.battery}</span>
                    <span>Signal: -82 dBm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Emergency Shelters & Evacuation Logistics */}
        {activeTab === 'shelter' && (
          <div className="ff-section">
            <div className="shelter-card">
              <div className="shelter-header">
                <Building2 size={18} style={{ color: 'var(--risk-low)' }} />
                <div>
                  <div className="shelter-name">{shelter.name}</div>
                  <div className="shelter-sub">{shelter.elevation}</div>
                </div>
              </div>

              <div className="shelter-details-grid">
                <div className="shelter-detail-item">
                  <span className="detail-lbl">Distance from Ward Center</span>
                  <span className="detail-val">{shelter.dist}</span>
                </div>
                <div className="shelter-detail-item">
                  <span className="detail-lbl">Shelter Total Capacity</span>
                  <span className="detail-val">{shelter.capacity} Persons</span>
                </div>
                <div className="shelter-detail-item">
                  <span className="detail-lbl">Occupancy Status</span>
                  <span className="detail-val" style={{ color: 'var(--risk-low)' }}>{shelter.occupancy}</span>
                </div>
                <div className="shelter-detail-item">
                  <span className="detail-lbl">Medical & Food Relief</span>
                  <span className="detail-val">SDRF Field Medical Unit Ready</span>
                </div>
              </div>

              <div className="evac-route-box">
                <div className="route-header">
                  <Compass size={15} style={{ color: 'var(--accent-blue)' }} />
                  <span>Recommended Ward Evacuation Route</span>
                </div>
                <div className="route-desc">{shelter.route}</div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Historical Disaster Comparison & Return Periods */}
        {activeTab === 'history' && (
          <div className="ff-section">
            <div className="history-summary-box">
              <History size={16} style={{ color: 'var(--accent-cyan)' }} />
              <span>
                Historical Return Periods & Disaster Benchmarks for <strong>{village.name}</strong>
              </span>
            </div>

            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Event / Return Period</th>
                    <th>Water Stage Benchmark</th>
                    <th>Current Comparison</th>
                    <th>Hazard Category</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>10-Year Return Flood</td>
                    <td>{historical.flood10yr.toFixed(1)} m</td>
                    <td>{riverLevel > historical.flood10yr ? 'EXCEEDED' : 'BELOW'}</td>
                    <td><span className="hist-badge yellow">Moderate Inundation</span></td>
                  </tr>
                  <tr>
                    <td>2021 Chamoli Flood Surge</td>
                    <td>{historical.maxHistorical2021.toFixed(1)} m</td>
                    <td>{riverLevel > historical.maxHistorical2021 ? 'EXCEEDED' : 'BELOW'}</td>
                    <td><span className="hist-badge orange">Severe Debris Surge</span></td>
                  </tr>
                  <tr>
                    <td>50-Year Return Flood</td>
                    <td>{historical.flood50yr.toFixed(1)} m</td>
                    <td>{riverLevel > historical.flood50yr ? 'EXCEEDED' : 'BELOW'}</td>
                    <td><span className="hist-badge orange">Severe Outburst</span></td>
                  </tr>
                  <tr>
                    <td>2013 Kedarnath Peak Level</td>
                    <td>{historical.maxHistorical2013.toFixed(1)} m</td>
                    <td>{riverLevel > historical.maxHistorical2013 ? 'EXCEEDED' : 'BELOW'}</td>
                    <td><span className="hist-badge red">Catastrophic Cloudburst</span></td>
                  </tr>
                  <tr>
                    <td>100-Year Return Flood</td>
                    <td>{historical.flood100yr.toFixed(1)} m</td>
                    <td>{riverLevel > historical.flood100yr ? 'EXCEEDED' : 'BELOW'}</td>
                    <td><span className="hist-badge red">Extreme Extreme Disaster</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Preparedness Checklist */}
        {activeTab === 'checklist' && (
          <div className="ff-section">
            <div className="checklist-card">
              <div className="checklist-title">
                <CheckSquare size={16} style={{ color: 'var(--risk-low)' }} />
                <span>Ward Disaster Committee Preparedness Action Plan</span>
              </div>

              <div className="checklist-items">
                <label className="checklist-item">
                  <input 
                    type="checkbox" 
                    checked={checklist.chk1} 
                    onChange={() => toggleCheck('chk1')} 
                  />
                  <div>
                    <strong>NDRF / SDRF Emergency Quick Response Alert Dispatched</strong>
                    <span className="check-sub">Task force positioned at river basin access point.</span>
                  </div>
                </label>

                <label className="checklist-item">
                  <input 
                    type="checkbox" 
                    checked={checklist.chk2} 
                    onChange={() => toggleCheck('chk2')} 
                  />
                  <div>
                    <strong>Ward Automated Warning Siren System Armed</strong>
                    <span className="check-sub">High-decibel dual siren ready for auto-activation upon threshold breach.</span>
                  </div>
                </label>

                <label className="checklist-item">
                  <input 
                    type="checkbox" 
                    checked={checklist.chk3} 
                    onChange={() => toggleCheck('chk3')} 
                  />
                  <div>
                    <strong>Heavy Excavator & Debris Removal Gear Deployed</strong>
                    <span className="check-sub">JCBs deployed to prevent nallah blockage and culvert clogging.</span>
                  </div>
                </label>

                <label className="checklist-item">
                  <input 
                    type="checkbox" 
                    checked={checklist.chk4} 
                    onChange={() => toggleCheck('chk4')} 
                  />
                  <div>
                    <strong>Public Address & Ward Mobile SMS Warning Broadcast</strong>
                    <span className="check-sub">Hyper-local alert message broadcasted to all active cellular handsets in ward.</span>
                  </div>
                </label>

                <label className="checklist-item">
                  <input 
                    type="checkbox" 
                    checked={checklist.chk5} 
                    onChange={() => toggleCheck('chk5')} 
                  />
                  <div>
                    <strong>Vulnerable Population & Livestock Evacuation Protocol</strong>
                    <span className="check-sub">Special transport assigned for elderly, disabled, and livestock to higher ground.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
