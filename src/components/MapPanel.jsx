import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

function MapController({ selectedId, villages }) {
  const map = useMap();
  useEffect(() => {
    if (selectedId && map) {
      const v = villages.find(v => v.id === selectedId);
      if (v) {
        map.flyTo([v.lat, v.lng], 13);
      }
    }
  }, [selectedId, villages, map]);
  return null;
}

export default function MapPanel({ villages, selectedId, onSelect }) {
  return (
    <div className="panel map-panel">
      <MapContainer 
        center={[30.45, 79.45]} 
        zoom={11} 
        style={{ width: '100%', height: '100%', background: '#1a1a1a', borderRadius: '8px' }}
      >
        <MapController selectedId={selectedId} villages={villages} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={20}
        />
        {villages.map(v => (
          <CircleMarker
            key={v.id}
            center={[v.lat, v.lng]}
            radius={10}
            fillColor={v.cat.hex}
            color="#fff"
            weight={2}
            opacity={1}
            fillOpacity={0.8}
            eventHandlers={{
              click: () => onSelect(v.id),
            }}
          >
            <Popup>
              <h4>{v.name}</h4>
              <div className="popup-stat">
                <span>Risk Score:</span> 
                <strong style={{color: v.cat.hex}}>{v.score}/100 ({v.cat.label})</strong>
              </div>
              <div className="popup-stat">
                <span>Rainfall:</span> 
                <span>{Math.round(v.rain)} mm/hr</span>
              </div>
              <div className="popup-stat">
                <span>Moisture:</span> 
                <span>{Math.round(v.moisture)}%</span>
              </div>
              <div className="popup-stat">
                <span>Slope Index:</span> 
                <span>{Math.round(v.slope)}</span>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
