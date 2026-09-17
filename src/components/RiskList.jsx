import { useState } from 'react';
import { Search, MapPin, CloudRain, Droplets, Mountain, ShieldAlert, Waves, Clock } from 'lucide-react';

export default function RiskList({ villages, selectedId, onSelect, mode = 'landslide' }) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('ALL');

  // Filter & Sort Villages
  const filteredVillages = villages.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCat === 'ALL' || v.cat.label === filterCat;
    return matchesSearch && matchesCat;
  });

  const sortedVillages = [...filteredVillages].sort((a, b) => b.score - a.score);

  return (
    <div className="panel risk-list-panel">
      <div className="panel-title">
        <div className="panel-title-left">
          {mode === 'flash_flood' ? (
            <Waves size={16} style={{ color: '#38bdf8' }} />
          ) : (
            <ShieldAlert size={16} />
          )}
          <span>{mode === 'flash_flood' ? 'Flash Flood Inundation Rankings' : 'Real-Time Risk Rankings'}</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {sortedVillages.length} of {villages.length} Wards
        </span>
      </div>

      {/* Search & Filter Bar */}
      <div className="list-filter-bar">
        <div className="search-box">
          <Search />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search ward or location..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-pills">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(cat => (
            <button 
              key={cat}
              className={`filter-pill ${filterCat === cat ? 'active' : ''}`}
              onClick={() => setFilterCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <ul className="village-list">
        {sortedVillages.map(v => {
          const catClass = v.cat.label.toLowerCase();
          const isSelected = selectedId === v.id;

          return (
            <li 
              key={v.id}
              className={`village-item ${catClass} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(v.id)}
            >
              <div className="village-info-primary">
                <span className="village-name">
                  <MapPin size={13} style={{ color: isSelected ? 'var(--accent-blue)' : 'var(--text-muted)' }} />
                  {v.name}
                </span>

                {mode === 'flash_flood' ? (
                  <div className="village-substats">
                    <span className="village-substat" title="River Level">
                      <Waves size={11} style={{ color: '#38bdf8' }} />
                      {(v.riverLevel || 1.4).toFixed(1)} m
                    </span>
                    <span className="village-substat" title="Evacuation Lead Time">
                      <Clock size={11} style={{ color: '#f59e0b' }} />
                      {(v.leadTimeMins || 45) < 99 ? `${v.leadTimeMins || 45}m` : '120m+'}
                    </span>
                    <span className="village-substat" title="Rainfall Rate">
                      <CloudRain size={11} style={{ color: 'var(--accent-blue)' }} />
                      {Math.round(v.rain)} mm/h
                    </span>
                  </div>
                ) : (
                  <div className="village-substats">
                    <span className="village-substat" title="Rainfall">
                      <CloudRain size={11} style={{ color: 'var(--accent-blue)' }} />
                      {Math.round(v.rain)} mm/h
                    </span>
                    <span className="village-substat" title="Soil Moisture">
                      <Droplets size={11} style={{ color: 'var(--risk-low)' }} />
                      {Math.round(v.moisture)}%
                    </span>
                    <span className="village-substat" title="Slope Index">
                      <Mountain size={11} style={{ color: 'var(--risk-medium)' }} />
                      {Math.round(v.slope)}
                    </span>
                  </div>
                )}
              </div>

              <div className={`risk-badge ${catClass}`}>
                <span>{v.score}</span>
                <span style={{ fontSize: '0.62rem', fontWeight: 600, opacity: 0.85 }}>{v.cat.label}</span>
              </div>
            </li>
          );
        })}

        {sortedVillages.length === 0 && (
          <li style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            No wards match the search filter.
          </li>
        )}
      </ul>
    </div>
  );
}

