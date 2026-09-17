import { useState, useEffect, useRef } from 'react';
import { Waves, LineChart, Bell } from 'lucide-react';
import Header from './components/Header';
import MapPanel from './components/MapPanel';
import RiskList from './components/RiskList';
import AlertsLog from './components/AlertsLog';
import TrendChart from './components/TrendChart';
import ControlsPanel from './components/ControlsPanel';
import FlashFloodPanel from './components/FlashFloodPanel';
import Toast from './components/Toast';

const INITIAL_VILLAGES = [
  { 
    id: 'v1', name: 'Joshimath Ward 1', lat: 30.5506, lng: 79.5660, 
    rain: 8, moisture: 25, slope: 85,
    riverLevel: 1.6, warningMark: 3.2, dangerMark: 4.2, riverRiseRate: 1.5, discharge: 52,
    shelter: { name: 'Joshimath Govt Secondary School & Relief Camp', dist: '1.1 km', elevation: '+120m', capacity: 450, occupancy: '80 Beds Occupied', route: 'Take North Ridge Route 1B (Avoid Alaknanda Riverbed)' },
    historicalData: { flood10yr: 3.5, flood50yr: 4.9, flood100yr: 6.2, maxHistorical2013: 5.6, maxHistorical2021: 4.8 }
  },
  { 
    id: 'v2', name: 'Tapovan', lat: 30.4900, lng: 79.6200, 
    rain: 5, moisture: 18, slope: 90,
    riverLevel: 2.1, warningMark: 3.5, dangerMark: 4.5, riverRiseRate: 3.0, discharge: 78,
    shelter: { name: 'Tapovan Tunnel Ridge Community Shelter', dist: '0.8 km', elevation: '+160m', capacity: 300, occupancy: '45 Beds Occupied', route: 'Ascend Eastern Mountain Bypass Trail' },
    historicalData: { flood10yr: 3.8, flood50yr: 5.2, flood100yr: 6.6, maxHistorical2013: 5.9, maxHistorical2021: 5.1 }
  },
  { 
    id: 'v3', name: 'Reni Village', lat: 30.4850, lng: 79.6900, 
    rain: 12, moisture: 30, slope: 75,
    riverLevel: 2.8, warningMark: 3.4, dangerMark: 4.2, riverRiseRate: 4.5, discharge: 110,
    shelter: { name: 'Reni Hilltop Primary School Relief Center', dist: '1.4 km', elevation: '+210m', capacity: 350, occupancy: '110 Beds Occupied', route: 'Take Upper Reni Forest Pathway' },
    historicalData: { flood10yr: 3.6, flood50yr: 5.0, flood100yr: 6.4, maxHistorical2013: 5.8, maxHistorical2021: 5.3 }
  },
  { 
    id: 'v4', name: 'Gopeshwar', lat: 30.4100, lng: 79.3200, 
    rain: 2, moisture: 12, slope: 95,
    riverLevel: 1.1, warningMark: 3.0, dangerMark: 4.0, riverRiseRate: 0.5, discharge: 32,
    shelter: { name: 'Gopeshwar Municipal Stadium Shelter', dist: '0.5 km', elevation: '+90m', capacity: 800, occupancy: '60 Beds Occupied', route: 'District Hospital Main Road' },
    historicalData: { flood10yr: 3.2, flood50yr: 4.5, flood100yr: 5.8, maxHistorical2013: 5.1, maxHistorical2021: 4.2 }
  },
  { 
    id: 'v5', name: 'Pipalkoti', lat: 30.4300, lng: 79.4300, 
    rain: 6, moisture: 24, slope: 80,
    riverLevel: 1.5, warningMark: 3.3, dangerMark: 4.3, riverRiseRate: 1.2, discharge: 45,
    shelter: { name: 'Pipalkoti College Relief Camp', dist: '0.9 km', elevation: '+110m', capacity: 500, occupancy: '75 Beds Occupied', route: 'High Highway Bypass 7' },
    historicalData: { flood10yr: 3.4, flood50yr: 4.7, flood100yr: 6.0, maxHistorical2013: 5.3, maxHistorical2021: 4.5 }
  },
  { 
    id: 'v6', name: 'Helang', lat: 30.5100, lng: 79.5100, 
    rain: 3, moisture: 16, slope: 88,
    riverLevel: 1.4, warningMark: 3.1, dangerMark: 4.1, riverRiseRate: 0.8, discharge: 38,
    shelter: { name: 'Helang Upper Ridge Shelter', dist: '1.0 km', elevation: '+130m', capacity: 250, occupancy: '30 Beds Occupied', route: 'Western Ridge Track' },
    historicalData: { flood10yr: 3.3, flood50yr: 4.6, flood100yr: 5.9, maxHistorical2013: 5.2, maxHistorical2021: 4.4 }
  },
  { 
    id: 'v7', name: 'Urgam Valley', lat: 30.5400, lng: 79.4700, 
    rain: 15, moisture: 38, slope: 70,
    riverLevel: 2.4, warningMark: 3.2, dangerMark: 4.0, riverRiseRate: 3.8, discharge: 92,
    shelter: { name: 'Urgam Valley High Altitude Shrine Complex', dist: '1.6 km', elevation: '+250m', capacity: 600, occupancy: '140 Beds Occupied', route: 'Kalpeshwar Ridge Route' },
    historicalData: { flood10yr: 3.5, flood50yr: 4.8, flood100yr: 6.1, maxHistorical2013: 5.5, maxHistorical2021: 4.7 }
  },
  { 
    id: 'v8', name: 'Karnaprayag', lat: 30.2600, lng: 79.2100, 
    rain: 1, moisture: 14, slope: 92,
    riverLevel: 1.3, warningMark: 3.5, dangerMark: 4.6, riverRiseRate: 0.4, discharge: 40,
    shelter: { name: 'Karnaprayag Confluence View Camp', dist: '0.7 km', elevation: '+80m', capacity: 700, occupancy: '90 Beds Occupied', route: 'Pindari Glacier Link Road' },
    historicalData: { flood10yr: 3.7, flood50yr: 5.1, flood100yr: 6.5, maxHistorical2013: 5.7, maxHistorical2021: 4.8 }
  },
];

const BASELINES = JSON.parse(JSON.stringify(INITIAL_VILLAGES));

function calculateRisk(v, mode = 'flash_flood') {
  const rain = v.rain || 0;
  const moisture = v.moisture || 0;
  const slope = v.slope || 80;
  const riverLevel = v.riverLevel || 1.4;
  const dangerMark = v.dangerMark || 4.0;
  const riverRiseRate = v.riverRiseRate || 1.0;

  if (mode === 'flash_flood') {
    const normRain = Math.min(rain / 100, 1);
    const normRiver = Math.min(riverLevel / dangerMark, 1);
    const normRise = Math.min(riverRiseRate / 12, 1);
    const normMoisture = Math.min(moisture / 100, 1);

    const score = (normRiver * 0.40) + (normRain * 0.25) + (normRise * 0.20) + (normMoisture * 0.15);
    return Math.round(score * 100);
  } else {
    const normRain = Math.min(rain / 100, 1);
    const normMoisture = Math.min(moisture / 100, 1);
    const normSlopeRisk = Math.max(0, (100 - slope) / 100);
    const score = (normRain * 0.4) + (normMoisture * 0.35) + (normSlopeRisk * 0.25);
    return Math.round(score * 100);
  }
}

function calculateLeadTime(v) {
  const riverLevel = v.riverLevel || 1.4;
  const dangerMark = v.dangerMark || 4.0;
  const riverRiseRate = v.riverRiseRate || 1.0;
  const rain = v.rain || 0;

  const ratio = riverLevel / dangerMark;
  if (ratio < 0.5 && rain < 20) return 120; // Nominal / 2 Hours+
  
  const lead = 110 - (ratio * 55) - (riverRiseRate * 2.5) - (rain * 0.3);
  return Math.max(8, Math.round(lead));
}

function getRiskCategory(score) {
  if (score < 40) return { label: 'LOW', color: 'var(--risk-low)', hex: '#10b981' };
  if (score < 70) return { label: 'MEDIUM', color: 'var(--risk-medium)', hex: '#f59e0b' };
  return { label: 'HIGH', color: 'var(--risk-high)', hex: '#ef4444' };
}

function generateMonthlyHistory(village) {
  const dates = [];
  const rain = [];
  const moisture = [];
  const risk = [];
  
  const today = new Date();
  const seed = (village.name.charCodeAt(0) + village.slope) % 10 + 1;
  let currentMoisture = 20 + (seed * 3);
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dates.push(dateStr);
    
    let dailyRain = 0;
    if (i >= 12 && i <= 18) {
      dailyRain = Math.round(40 + Math.sin(i * 0.8) * 30 + (seed * 5) % 25);
    } else if (i % 4 === 0) {
      dailyRain = Math.round(12 + (seed * 4) % 20);
    } else {
      dailyRain = Math.round(Math.max(0, (seed * 2) % 6));
    }
    
    if (dailyRain > 25) {
      currentMoisture = Math.min(98, currentMoisture + dailyRain * 0.45);
    } else {
      currentMoisture = Math.max(12, currentMoisture - 2.8);
    }
    
    const dayRisk = calculateRisk({ ...village, rain: dailyRain, moisture: currentMoisture }, 'landslide');
    
    rain.push(dailyRain);
    moisture.push(Math.round(currentMoisture));
    risk.push(dayRisk);
  }
  
  return { dates, rain, moisture, risk };
}

export default function App() {
  const [activeMode, setActiveMode] = useState('flash_flood'); // 'flash_flood' | 'landslide'
  const [rightTab, setRightTab] = useState('warning'); // 'warning' | 'trend' | 'logs'
  
  const [villages, setVillages] = useState(() => 
    INITIAL_VILLAGES.map(v => {
      const score = calculateRisk(v, 'flash_flood');
      const leadTimeMins = calculateLeadTime(v);
      return { ...v, score, leadTimeMins, cat: getRiskCategory(score) };
    })
  );
  
  const [selectedVillageId, setSelectedVillageId] = useState('v1');
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulationTargetId, setSimulationTargetId] = useState(null);
  const [alerts, setAlerts] = useState([
    { time: new Date().toLocaleTimeString(), message: 'Hydro-Meteorological IoT Telemetry active. River stage sensors nominal.', critical: false }
  ]);
  const [toasts, setToasts] = useState([]);
  
  const [history, setHistory] = useState(() => {
    const init = {};
    INITIAL_VILLAGES.forEach(v => {
      init[v.id] = { labels: [], rain: [], moisture: [] };
    });
    return init;
  });

  const [monthlyHistory] = useState(() => {
    const init = {};
    INITIAL_VILLAGES.forEach(v => {
      init[v.id] = generateMonthlyHistory(v);
    });
    return init;
  });

  const alertedRef = useRef(new Set());
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');
  }, []);

  // Update village risk scores when mode switches
  useEffect(() => {
    setVillages(prev => prev.map(v => {
      const score = calculateRisk(v, activeMode);
      const leadTimeMins = calculateLeadTime(v);
      return { ...v, score, leadTimeMins, cat: getRiskCategory(score) };
    }));
    if (activeMode === 'landslide') {
      setRightTab('trend');
    } else {
      setRightTab('warning');
    }
  }, [activeMode]);

  const triggerAlert = (v) => {
    alertedRef.current.add(v.id);
    const time = new Date().toLocaleTimeString();
    const estPop = Math.floor(Math.random() * 2000) + 500;
    
    const alertMsg = activeMode === 'flash_flood' 
      ? `<strong>FLASH FLOOD EVACUATION WARNING:</strong> River stage threshold breached at ${v.name} (${v.riverLevel.toFixed(1)}m). Actionable lead time: ${v.leadTimeMins} mins. Automated SMS dispatched to ${estPop} ward residents. Siren activated.`
      : `<strong>CRITICAL LANDSLIDE ALERT:</strong> Threshold breached at ${v.name}. Automated SMS alert dispatched to ${estPop} ward residents. Evacuation siren activated.`;

    setAlerts(prev => [{
      time,
      critical: true,
      message: alertMsg
    }, ...prev]);

    const toastId = Date.now();
    setToasts(prev => [...prev, { id: toastId, villageName: v.name, score: v.score }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 10000);

    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => console.log('Audio play warning:', err));
      }
    } catch(err) {
      console.log('Audio error:', err);
    }
  };

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const timeLabel = new Date().toLocaleTimeString();
      let newlyAlerted = [];

      setVillages(prevVillages => {
        const nextVillages = prevVillages.map((v, index) => {
          let newRain = v.rain;
          let newMoisture = v.moisture;
          let newSlope = v.slope;
          let newRiverLevel = v.riverLevel || 1.4;
          let newRiverRiseRate = v.riverRiseRate || 1.0;
          let newDischarge = v.discharge || 45;

          if (simulationActive && v.id === simulationTargetId) {
            newRain = Math.min(100, newRain + (Math.random() * 3.5 + 1.5));
            newMoisture = Math.min(100, newMoisture + (Math.random() * 2.5 + 1.0));
            newSlope = Math.max(0, newSlope - (Math.random() * 0.8 + 0.2));
            newRiverLevel = Math.min(6.5, newRiverLevel + (Math.random() * 0.15 + 0.08));
            newRiverRiseRate = Math.min(30, newRiverRiseRate + (Math.random() * 1.5 + 0.5));
            newDischarge = Math.round(newDischarge + (Math.random() * 12 + 4));
          } else {
            const baseline = BASELINES[index];
            let rainDrift = (Math.random() - 0.5) * 0.5 + (baseline.rain - newRain) * 0.05;
            let moistureDrift = (Math.random() - 0.5) * 0.5 + (baseline.moisture - newMoisture) * 0.05;
            let slopeDrift = (Math.random() - 0.5) * 0.2 + (baseline.slope - newSlope) * 0.05;
            let riverDrift = (Math.random() - 0.5) * 0.03 + (baseline.riverLevel - newRiverLevel) * 0.05;

            newRain = Math.max(0, Math.min(100, newRain + rainDrift));
            newMoisture = Math.max(0, Math.min(100, newMoisture + moistureDrift));
            newSlope = Math.max(0, Math.min(100, newSlope + slopeDrift));
            newRiverLevel = Math.max(0.8, Math.min(6.5, newRiverLevel + riverDrift));
            newRiverRiseRate = Math.max(0, Math.min(25, newRiverRiseRate + (Math.random() - 0.5) * 0.3));
          }

          const score = calculateRisk({ 
            ...v, 
            rain: newRain, 
            moisture: newMoisture, 
            slope: newSlope, 
            riverLevel: newRiverLevel, 
            riverRiseRate: newRiverRiseRate 
          }, activeMode);

          const leadTimeMins = calculateLeadTime({ 
            ...v, 
            rain: newRain, 
            riverLevel: newRiverLevel, 
            riverRiseRate: newRiverRiseRate 
          });

          const cat = getRiskCategory(score);
          const updatedV = { 
            ...v, 
            rain: newRain, 
            moisture: newMoisture, 
            slope: newSlope, 
            riverLevel: newRiverLevel, 
            riverRiseRate: newRiverRiseRate,
            discharge: newDischarge,
            leadTimeMins, 
            score, 
            cat 
          };

          if (score >= 70 && !alertedRef.current.has(v.id)) {
            newlyAlerted.push(updatedV);
          } else if (score < 70 && alertedRef.current.has(v.id)) {
            alertedRef.current.delete(v.id);
          }

          return updatedV;
        });

        setHistory(prevHist => {
          const newHist = { ...prevHist };
          nextVillages.forEach(v => {
            const h = newHist[v.id] ? { ...newHist[v.id] } : { labels: [], rain: [], moisture: [] };
            h.labels = [...h.labels, timeLabel];
            h.rain = [...h.rain, v.rain];
            h.moisture = [...h.moisture, v.moisture];
            if (h.labels.length > 30) {
              h.labels.shift();
              h.rain.shift();
              h.moisture.shift();
            }
            newHist[v.id] = h;
          });
          return newHist;
        });

        return nextVillages;
      });

      if (newlyAlerted.length > 0) {
        setTimeout(() => {
          newlyAlerted.forEach(v => triggerAlert(v));
        }, 0);
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [simulationActive, simulationTargetId, activeMode]);

  const handleSimulate = () => {
    if (simulationActive) {
      handleReset();
      return;
    }
    const target = selectedVillageId || 'v3';
    const v = villages.find(x => x.id === target);
    
    setSimulationTargetId(target);
    setSimulationActive(true);
    setSelectedVillageId(target);
    
    setAlerts(prev => [{
      time: new Date().toLocaleTimeString(),
      critical: false,
      message: activeMode === 'flash_flood'
        ? `Severe cloudburst & river catchment surge detected near <strong>${v ? v.name : 'Target Ward'}</strong>. Water stage escalating rapidly...`
        : `Meteorological radar anomaly detected. Severe cloudburst approaching <strong>${v ? v.name : 'Target Ward'}</strong>.`
    }, ...prev]);
  };

  const handleReset = () => {
    setSimulationActive(false);
    setSimulationTargetId(null);
    alertedRef.current.clear();
    setToasts([]);
    
    setVillages(INITIAL_VILLAGES.map(v => {
      const score = calculateRisk(v, activeMode);
      const leadTimeMins = calculateLeadTime(v);
      return { ...v, score, leadTimeMins, cat: getRiskCategory(score) };
    }));
  };

  const handleOverride = (prop, val) => {
    let newlyAlerted = [];
    setVillages(prev => prev.map(v => {
      if (selectedVillageId && v.id !== selectedVillageId) return v;
      
      const newV = { ...v, [prop]: val };
      const score = calculateRisk(newV, activeMode);
      const leadTimeMins = calculateLeadTime(newV);
      newV.score = score;
      newV.leadTimeMins = leadTimeMins;
      newV.cat = getRiskCategory(score);
      
      if (score >= 70 && !alertedRef.current.has(v.id)) {
        newlyAlerted.push(newV);
      }
      return newV;
    }));

    if (newlyAlerted.length > 0) {
      setTimeout(() => {
        newlyAlerted.forEach(v => triggerAlert(v));
      }, 0);
    }
  };

  const handleApplyPreset = (rain, moisture, slope, riverLevel, riverRiseRate) => {
    let newlyAlerted = [];
    setVillages(prev => prev.map(v => {
      if (selectedVillageId && v.id !== selectedVillageId) return v;
      
      const newV = { ...v, rain, moisture, slope, riverLevel: riverLevel || v.riverLevel, riverRiseRate: riverRiseRate || v.riverRiseRate };
      const score = calculateRisk(newV, activeMode);
      const leadTimeMins = calculateLeadTime(newV);
      newV.score = score;
      newV.leadTimeMins = leadTimeMins;
      newV.cat = getRiskCategory(score);
      
      if (score >= 70 && !alertedRef.current.has(v.id)) {
        newlyAlerted.push(newV);
      }
      return newV;
    }));

    if (newlyAlerted.length > 0) {
      setTimeout(() => {
        newlyAlerted.forEach(v => triggerAlert(v));
      }, 0);
    }
  };

  const handleClearAlerts = () => {
    setAlerts([
      { time: new Date().toLocaleTimeString(), message: 'Telemetry log reset. Monitoring active.', critical: false }
    ]);
  };

  const selectedVillage = villages.find(v => v.id === selectedVillageId);
  const targetVillage = villages.find(v => v.id === simulationTargetId);

  return (
    <div className="app-viewport-container">
      <Toast toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      
      <Header 
        villages={villages} 
        alerts={alerts} 
        mode={activeMode} 
        onModeChange={setActiveMode} 
      />

      {simulationActive && targetVillage && (
        <div className="sim-live-ticker-banner">
          <div className="ticker-badge">
            <span className="ticker-pulse-dot"></span>
            <span>⚡ LIVE SIMULATION ACTIVE</span>
          </div>
          <div className="ticker-info">
            <span>Target Ward: <strong>{targetVillage.name}</strong></span>
            <span>Rainfall Rate: <strong>{Math.round(targetVillage.rain)} mm/h ↑</strong></span>
            {activeMode === 'flash_flood' ? (
              <>
                <span>River Level: <strong>{(targetVillage.riverLevel || 1.4).toFixed(2)} m ↑</strong></span>
                <span>Evacuation Window: <strong className="text-red">{targetVillage.leadTimeMins} mins ⏱️</strong></span>
              </>
            ) : (
              <span>Soil Moisture: <strong>{Math.round(targetVillage.moisture)}% ↑</strong></span>
            )}
            <span>Risk Score: <strong style={{ color: targetVillage.cat.hex }}>{targetVillage.score} / 100 ({targetVillage.cat.label})</strong></span>
          </div>
          <button className="ticker-stop-btn" onClick={handleReset}>
            Stop & Reset
          </button>
        </div>
      )}
      
      <div className="dashboard-layout">
        <MapPanel 
          villages={villages} 
          selectedId={selectedVillageId} 
          onSelect={setSelectedVillageId} 
          mode={activeMode}
          simulationActive={simulationActive}
          simulationTargetId={simulationTargetId}
        />
        
        <div className="right-panel-container">
          <RiskList 
            villages={villages} 
            selectedId={selectedVillageId} 
            onSelect={setSelectedVillageId} 
            mode={activeMode}
          />

          <div className="right-intelligence-hub">
            <div className="hub-tabs-header">
              <button 
                className={`hub-tab-btn ${rightTab === 'warning' ? 'active' : ''}`}
                onClick={() => setRightTab('warning')}
              >
                <Waves size={13} /> Early Warning Hub
              </button>
              <button 
                className={`hub-tab-btn ${rightTab === 'trend' ? 'active' : ''}`}
                onClick={() => setRightTab('trend')}
              >
                <LineChart size={13} /> Sensor Telemetry
              </button>
              <button 
                className={`hub-tab-btn ${rightTab === 'logs' ? 'active' : ''}`}
                onClick={() => setRightTab('logs')}
              >
                <Bell size={13} /> Emergency Logs
              </button>
            </div>

            <div className="hub-content-area">
              {rightTab === 'warning' && (
                <FlashFloodPanel 
                  village={selectedVillage} 
                  mode={activeMode} 
                />
              )}

              {rightTab === 'trend' && (
                <TrendChart 
                  village={selectedVillage} 
                  history={selectedVillage ? history[selectedVillageId] : null} 
                  monthlyHistory={selectedVillage ? monthlyHistory[selectedVillageId] : null}
                  mode={activeMode}
                />
              )}

              {rightTab === 'logs' && (
                <AlertsLog alerts={alerts} onClearAlerts={handleClearAlerts} />
              )}
            </div>
          </div>
        </div>
      </div>

      <ControlsPanel 
        village={selectedVillage}
        simulationActive={simulationActive}
        simulationTarget={targetVillage}
        onSimulate={handleSimulate}
        onReset={handleReset}
        onOverride={handleOverride}
        onApplyPreset={handleApplyPreset}
        mode={activeMode}
      />
    </div>
  );
}

