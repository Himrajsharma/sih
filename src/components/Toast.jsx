import { AlertTriangle, X } from 'lucide-react';

export default function Toast({ toasts = [], onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className="toast" onClick={() => onDismiss(t.id)}>
          <AlertTriangle size={20} />
          <span>
            CRITICAL EVACUATION ALERT: <strong>{t.villageName}</strong> (Risk: {t.score}/100)
          </span>
          <div className="toast-dismiss">
            <X size={16} />
          </div>
        </div>
      ))}
    </div>
  );
}
