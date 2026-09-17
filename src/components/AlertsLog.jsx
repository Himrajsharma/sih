import { useState } from 'react';
import { Bell, AlertCircle, Info, Trash2 } from 'lucide-react';

export default function AlertsLog({ alerts = [], onClearAlerts }) {
  const [filterCriticalOnly, setFilterCriticalOnly] = useState(false);

  const displayedAlerts = filterCriticalOnly 
    ? alerts.filter(a => a.critical)
    : alerts;

  return (
    <div className="panel alerts-panel">
      <div className="panel-title">
        <div className="panel-title-left">
          <Bell size={16} />
          <span>System Emergency Log</span>
        </div>

        <div className="alerts-header-actions">
          <button 
            className={`filter-pill ${filterCriticalOnly ? 'active' : ''}`}
            onClick={() => setFilterCriticalOnly(!filterCriticalOnly)}
            title="Filter Critical Alerts"
          >
            Critical Only
          </button>
          
          {onClearAlerts && (
            <button 
              className="clear-btn" 
              onClick={onClearAlerts}
              title="Clear Alert Logs"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="alerts-log">
        {displayedAlerts.map((alert, i) => (
          <div key={i} className={`alert-entry ${alert.critical ? 'critical' : 'info'}`}>
            <div className="alert-top">
              <span className={`alert-tag ${alert.critical ? 'critical' : 'info'}`}>
                {alert.critical ? (
                  <>
                    <AlertCircle size={10} /> EVACUATION SIREN
                  </>
                ) : (
                  <>
                    <Info size={10} /> TELEMETRY INFO
                  </>
                )}
              </span>
              <span className="time">{alert.time}</span>
            </div>
            <div className="message" dangerouslySetInnerHTML={{ __html: alert.message }}></div>
          </div>
        ))}

        {displayedAlerts.length === 0 && (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No log entries recorded.
          </div>
        )}
      </div>
    </div>
  );
}
