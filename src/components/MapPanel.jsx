import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useEffect, useRef, useState } from 'react';
import { MapPin, Check, CloudRain, Droplets, Mountain, ShieldAlert, Layers, Compass, Waves, Clock } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

function MapController({ selectedId, villages }) {
  const map = useMap();
  const villagesRef = useRef(villages);

  useEffect(() => {
    villagesRef.current = villages;
  }, [villages]);

  useEffect(() => {
    if (selectedId && map) {
      const v = villagesRef.current.find(v => v.id === selectedId);
      if (v) {
        map.flyTo([v.lat, v.lng], 13, { duration: 1 });
      }
    }
  }, [selectedId, map]);

  return null;
}

const MAP_STYLES = {
  light: {
    label: 'Light Canvas',
    icon: Layers,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    hasOverlay: true,
    overlayUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
  },
  topo: {
    label: 'Street / Topo',
    icon: MapPin,
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    hasOverlay: false
  },
  satellite: {
    label: 'Satellite',
    icon: Compass,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS',
    hasOverlay: true,
    overlayUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
  }
};

export default function MapPanel({ villages, selectedId, onSelect, mode = 'landslide', simulationActive = false, simulationTargetId = null }) {
  const [currentStyle, setCurrentStyle] = useState('light');

  const activeStyleConfig = MAP_STYLES[currentStyle];
  const simulationTarget = villages.find(v => v.id === simulationTargetId);

  return (
    <div className="panel map-panel">
      {/* Map Overlay Badge & Style Switcher */}
      <div className="map-overlay-header">
        <div className="map-overlay-pill">
          <MapPin size={14} style={{ color: mode === 'flash_flood' ? '#0284c7' : 'var(--accent-blue)' }} />
          <span>Spatial Ward {mode === 'flash_flood' ? 'Flash Flood & IoT' : 'Landslide'} Map</span>
        </div>

        {/* Map Style Selector Pill Group */}
        <div className="map-style-switcher">
          {Object.entries(MAP_STYLES).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const isActive = currentStyle === key;
            return (
              <button
                key={key}
                className={`map-style-btn ${isActive ? 'active' : ''}`}
                onClick={() => setCurrentStyle(key)}
                title={`Switch to ${cfg.label} view`}
              >
                <Icon size={12} />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {simulationActive && simulationTarget && (
        <div className="map-sim-active-badge">
          <div className="sim-badge-dot"></div>
          <span>STRESS-TEST SIMULATION ACTIVE: <strong>{simulationTarget.name}</strong></span>
        </div>
      )}

      <div className="map-legend-overlay">
        <div className="legend-item">
          <div className="legend-dot low"></div>
          <span>Low (&lt;40)</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot medium"></div>
          <span>Medium (40-69)</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot high"></div>
          <span>{mode === 'flash_flood' ? 'Flood Evac (70+)' : 'High Risk (70+)'}</span>
        </div>
      </div>

      <MapContainer 
        center={[30.45, 79.45]} 
        zoom={11} 
        style={{ width: '100%', height: '100%', background: '#f1f5f9', borderRadius: '14px' }}
      >

        <MapController selectedId={selectedId} villages={villages} />
        
        {/* Base Map Layer */}
        <TileLayer
          key={currentStyle}
          url={activeStyleConfig.url}
          attribution={activeStyleConfig.attribution}
          maxZoom={19}
        />

        {/* Reference Labels Overlay Layer for Satellite & Dark modes */}
        {activeStyleConfig.hasOverlay && (
          <TileLayer
            key={`${currentStyle}-overlay`}
            url={activeStyleConfig.overlayUrl}
            maxZoom={19}
            opacity={0.8}
          />
        )}

        {villages.map(v => {
          const isSelected = selectedId === v.id;
          const isSimTarget = simulationActive && simulationTargetId === v.id;

          return (
            <div key={v.id}>
              {isSimTarget && (
                <CircleMarker
                  center={[v.lat, v.lng]}
                  radius={34}
                  fillColor="#dc2626"
                  color="#dc2626"
                  weight={2.5}
                  dashArray="6,6"
                  opacity={0.85}
                  fillOpacity={0.15}
                />
              )}

              <CircleMarker
                center={[v.lat, v.lng]}
                radius={isSelected ? 15 : 11}
                fillColor={v.cat.hex}
                color={isSelected ? '#ffffff' : '#000000'}
                weight={isSelected ? 3.5 : 2}
                opacity={1}
                fillOpacity={0.9}
                eventHandlers={{
                  click: () => onSelect(v.id),
                }}
              >
                <Popup>
                  <div className="popup-header">
                    <span>{v.name}</span>
                    <span style={{ color: v.cat.hex, fontSize: '0.85rem' }}>{v.cat.label}</span>
                  </div>

                  <div className="popup-metric">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldAlert size={12} style={{ color: v.cat.hex }} /> Risk Score
                    </span>
                    <strong style={{ color: v.cat.hex }}>{v.score} / 100</strong>
                  </div>
                  <div className="popup-progress-bar">
                    <div 
                      className="popup-progress-fill" 
                      style={{ width: `${v.score}%`, backgroundColor: v.cat.hex }}
                    />
                  </div>

                  {mode === 'flash_flood' ? (
                    <>
                      <div className="popup-metric">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Waves size={12} style={{ color: '#38bdf8' }} /> River Level
                        </span>
                        <strong>{(v.riverLevel || 1.4).toFixed(2)} m</strong>
                      </div>

                      <div className="popup-metric">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} style={{ color: '#f59e0b' }} /> Evac Lead Time
                        </span>
                        <strong style={{ color: (v.leadTimeMins || 45) < 30 ? '#ef4444' : '#f59e0b' }}>
                          {(v.leadTimeMins || 45) < 99 ? `${v.leadTimeMins || 45} mins` : '120+ mins'}
                        </strong>
                      </div>

                      <div className="popup-metric">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CloudRain size={12} style={{ color: 'var(--accent-blue)' }} /> Rain Rate
                        </span>
                        <strong>{Math.round(v.rain)} mm/hr</strong>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="popup-metric">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CloudRain size={12} style={{ color: 'var(--accent-blue)' }} /> Rainfall
                        </span>
                        <strong>{Math.round(v.rain)} mm/hr</strong>
                      </div>

                      <div className="popup-metric">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Droplets size={12} style={{ color: 'var(--risk-low)' }} /> Soil Moisture
                        </span>
                        <strong>{Math.round(v.moisture)}%</strong>
                      </div>

                      <div className="popup-metric">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mountain size={12} style={{ color: 'var(--risk-medium)' }} /> Slope Stability
                        </span>
                        <strong>{Math.round(v.slope)} Index</strong>
                      </div>
                    </>
                  )}

                  <button 
                    className="popup-select-btn" 
                    onClick={() => onSelect(v.id)}
                    style={{
                      backgroundColor: isSelected ? 'var(--risk-low)' : 'var(--accent-blue)'
                    }}
                  >
                    {isSelected ? (
                      <>
                        <Check size={14} /> Ward Selected
                      </>
                    ) : (
                      <>
                        <MapPin size={14} /> Select Ward
                      </>
                    )}
                  </button>
                </Popup>
              </CircleMarker>
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}

