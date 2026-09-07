import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import MapPanel from './components/MapPanel';
import RiskList from './components/RiskList';
import AlertsLog from './components/AlertsLog';
import TrendChart from './components/TrendChart';
import ControlsPanel from './components/ControlsPanel';
import Toast from './components/Toast';

const INITIAL_VILLAGES = [
  { id: 'v1', name: 'Joshimath Ward 1', lat: 30.5506, lng: 79.5660, rain: 5, moisture: 20, slope: 85 },
  { id: 'v2', name: 'Tapovan', lat: 30.4900, lng: 79.6200, rain: 2, moisture: 15, slope: 90 },
  { id: 'v3', name: 'Reni Village', lat: 30.4850, lng: 79.6900, rain: 8, moisture: 25, slope: 75 },
  { id: 'v4', name: 'Gopeshwar', lat: 30.4100, lng: 79.3200, rain: 0, moisture: 10, slope: 95 },
  { id: 'v5', name: 'Pipalkoti', lat: 30.4300, lng: 79.4300, rain: 4, moisture: 22, slope: 80 },
  { id: 'v6', name: 'Helang', lat: 30.5100, lng: 79.5100, rain: 1, moisture: 18, slope: 88 },
  { id: 'v7', name: 'Urgam Valley', lat: 30.5400, lng: 79.4700, rain: 12, moisture: 35, slope: 70 },
  { id: 'v8', name: 'Karnaprayag', lat: 30.2600, lng: 79.2100, rain: 0, moisture: 12, slope: 92 },
];

const BASELINES = JSON.parse(JSON.stringify(INITIAL_VILLAGES));

function calculateRisk(rain, moisture, slope) {
  const normRain = Math.min(rain / 100, 1);
  const normMoisture = Math.min(moisture / 100, 1);
  const normSlopeRisk = Math.max(0, (100 - slope) / 100);
  const score = (normRain * 0.4) + (normMoisture * 0.35) + (normSlopeRisk * 0.25);
  return Math.round(score * 100);
}

function getRiskCategory(score) {
  if (score < 40) return { label: 'LOW', color: 'var(--risk-low)', hex: '#10b981' };
  if (score < 70) return { label: 'MEDIUM', color: 'var(--risk-medium)', hex: '#f59e0b' };
  return { label: 'HIGH', color: 'var(--risk-high)', hex: '#ef4444' };
}

export default function App() {
  const [villages, setVillages] = useState(() => 
    INITIAL_VILLAGES.map(v => {
      const score = calculateRisk(v.rain, v.moisture, v.slope);
      return { ...v, score, cat: getRiskCategory(score) };
    })
  );
  
  const [selectedVillageId, setSelectedVillageId] = useState(null);
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulationTargetId, setSimulationTargetId] = useState(null);
  const [alerts, setAlerts] = useState([
    { time: new Date().toLocaleTimeString(), message: 'Monitoring active. All sensors nominal.', critical: false }
  ]);
  const [toasts, setToasts] = useState([]);
  
  // History state for charts
  const [history, setHistory] = useState(() => {
    const init = {};
    INITIAL_VILLAGES.forEach(v => {
      init[v.id] = { labels: [], rain: [], moisture: [] };
    });
    return init;
  });

  const alertedRef = useRef(new Set());
  const audioRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');
  }, []);

  const triggerAlert = (v) => {
    alertedRef.current.add(v.id);
    const time = new Date().toLocaleTimeString();
    const estPop = Math.floor(Math.random() * 2000) + 500;
    
    // Add Log
    setAlerts(prev => [{
      time,
      critical: true,
      message: `<strong>CRITICAL:</strong> Threshold breached at ${v.name}. Automated SMS broadcast sent to ${estPop} registered mobile devices in the ward. Evacuation siren triggered.`
    }, ...prev]);

    // Add Toast
    const toastId = Date.now();
    setToasts(prev => [...prev, { id: toastId, villageName: v.name, score: v.score }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 10000);

    // Play Audio
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log(e));
      }
    } catch(e) {}
  };

  // Main Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const timeLabel = new Date().toLocaleTimeString();

      setVillages(prevVillages => {
        return prevVillages.map((v, index) => {
          let newRain = v.rain;
          let newMoisture = v.moisture;
          let newSlope = v.slope;

          if (simulationActive && v.id === simulationTargetId) {
            newRain = Math.min(100, newRain + (Math.random() * 3 + 1));
            newMoisture = Math.min(100, newMoisture + (Math.random() * 2 + 1));
            newSlope = Math.max(0, newSlope - (Math.random() * 0.8 + 0.2));
          } else {
            const baseline = BASELINES[index];
            let rainDrift = (Math.random() - 0.5) * 0.5 + (baseline.rain - newRain) * 0.05;
            let moistureDrift = (Math.random() - 0.5) * 0.5 + (baseline.moisture - newMoisture) * 0.05;
            let slopeDrift = (Math.random() - 0.5) * 0.2 + (baseline.slope - newSlope) * 0.05;

            newRain = Math.max(0, Math.min(100, newRain + rainDrift));
            newMoisture = Math.max(0, Math.min(100, newMoisture + moistureDrift));
            newSlope = Math.max(0, Math.min(100, newSlope + slopeDrift));
          }

          const score = calculateRisk(newRain, newMoisture, newSlope);
          const cat = getRiskCategory(score);
          const updatedV = { ...v, rain: newRain, moisture: newMoisture, slope: newSlope, score, cat };

          // Alert Logic
          if (score >= 70 && !alertedRef.current.has(v.id)) {
            triggerAlert(updatedV);
          } else if (score < 70 && alertedRef.current.has(v.id)) {
            alertedRef.current.delete(v.id);
          }

          return updatedV;
        });
      });

      // Update History
      setVillages(currentVillages => {
        setHistory(prev => {
          const newHist = { ...prev };
          currentVillages.forEach(v => {
            const h = { ...newHist[v.id] };
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
        return currentVillages; // No-op for setVillages, just reading it
      });

    }, 1000);

    return () => clearInterval(interval);
  }, [simulationActive, simulationTargetId]);

  const handleSimulate = () => {
    if (simulationActive) return;
    const target = selectedVillageId || 'v3';
    const v = villages.find(x => x.id === target);
    
    setSimulationTargetId(target);
    setSimulationActive(true);
    setSelectedVillageId(target);
    
    setAlerts(prev => [{
      time: new Date().toLocaleTimeString(),
      critical: false,
      message: `Meteorological anomaly detected. Sudden cloudburst approaching ${v.name}.`
    }, ...prev]);
  };

  const handleReset = () => {
    setSimulationActive(false);
    setSimulationTargetId(null);
    alertedRef.current.clear();
    setToasts([]);
    
    setVillages(INITIAL_VILLAGES.map(v => {
      const score = calculateRisk(v.rain, v.moisture, v.slope);
      return { ...v, score, cat: getRiskCategory(score) };
    }));
  };

  const handleOverride = (prop, val) => {
    setVillages(prev => prev.map(v => {
      if (selectedVillageId && v.id !== selectedVillageId) return v;
      
      const newV = { ...v, [prop]: val };
      const score = calculateRisk(newV.rain, newV.moisture, newV.slope);
      newV.score = score;
      newV.cat = getRiskCategory(score);
      
      if (score >= 70 && !alertedRef.current.has(v.id)) {
        triggerAlert(newV);
      }
      return newV;
    }));
  };

  const selectedVillage = villages.find(v => v.id === selectedVillageId);
  const targetVillage = villages.find(v => v.id === simulationTargetId);

  return (
    <>
      <Toast toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      <Header />
      
      <div className="dashboard-layout">
        <MapPanel 
          villages={villages} 
          selectedId={selectedVillageId} 
          onSelect={setSelectedVillageId} 
        />
        
        <div className="right-panel-container">
          <RiskList 
            villages={villages} 
            selectedId={selectedVillageId} 
            onSelect={setSelectedVillageId} 
          />
          <AlertsLog alerts={alerts} />
          <TrendChart 
            village={selectedVillage} 
            history={selectedVillage ? history[selectedVillageId] : null} 
          />
        </div>
      </div>

      <ControlsPanel 
        village={selectedVillage}
        simulationActive={simulationActive}
        simulationTarget={targetVillage}
        onSimulate={handleSimulate}
        onReset={handleReset}
        onOverride={handleOverride}
      />
    </>
  );
}
