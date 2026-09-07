export default function AlertsLog({ alerts }) {
  return (
    <div className="panel alerts-panel">
      <h2>System Alerts Log</h2>
      <div className="alerts-log">
        {alerts.map((alert, i) => (
          <div key={i} className={`alert-entry ${alert.critical ? 'critical' : 'info'}`}>
            <span className="time">{alert.time}</span>
            <span className="message" dangerouslySetInnerHTML={{__html: alert.message}}></span>
          </div>
        ))}
      </div>
    </div>
  );
}
