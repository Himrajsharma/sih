import { useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';

// Create a component to handle map flying since useMap must be used inside APIProvider
function MapController({ selectedId, villages }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedId && map) {
      const v = villages.find(v => v.id === selectedId);
      if (v) {
        map.panTo({ lat: v.lat, lng: v.lng });
        map.setZoom(13);
      }
    }
  }, [selectedId, villages, map]);
  
  return null;
}

export default function MapPanel({ villages, selectedId, onSelect }) {
  const [activePopup, setActivePopup] = useState(null);

  // Sync active popup with selectedId from sidebar
  useEffect(() => {
    setActivePopup(selectedId);
  }, [selectedId]);

  return (
    <div className="panel map-panel">
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
        <Map
          defaultCenter={{ lat: 30.45, lng: 79.45 }}
          defaultZoom={11}
          mapId="DEMO_MAP_ID" // Requires a Map ID for AdvancedMarkers
          style={{ width: '100%', height: '100%', borderRadius: '8px' }}
          disableDefaultUI={true} // Cleaner dashboard look
          gestureHandling={'greedy'}
        >
          <MapController selectedId={selectedId} villages={villages} />
          
          {villages.map(v => (
            <div key={v.id}>
              <AdvancedMarker
                position={{ lat: v.lat, lng: v.lng }}
                onClick={() => {
                  onSelect(v.id);
                  setActivePopup(v.id);
                }}
              >
                {/* Custom HTML Circle to match our old Leaflet style */}
                <div 
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: v.cat.hex,
                    border: '2px solid white',
                    borderRadius: '50%',
                    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                    opacity: 0.9
                  }}
                />
              </AdvancedMarker>

              {activePopup === v.id && (
                <InfoWindow
                  position={{ lat: v.lat, lng: v.lng }}
                  onCloseClick={() => setActivePopup(null)}
                  headerDisabled={true}
                >
                  <div className="google-popup-content">
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
                  </div>
                </InfoWindow>
              )}
            </div>
          ))}
        </Map>
      </APIProvider>
    </div>
  );
}
