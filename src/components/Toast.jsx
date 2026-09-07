export default function Toast({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className="toast" onClick={() => onDismiss(t.id)}>
          ⚠️ EVACUATION ALERT: {t.villageName} (Risk: {t.score}/100)
        </div>
      ))}
    </div>
  );
}
