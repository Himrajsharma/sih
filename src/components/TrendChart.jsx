import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

ChartJS.defaults.color = '#9ca3af';
ChartJS.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export default function TrendChart({ village, history }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 }, // Disable animation for snappy live updates
    scales: {
      y: { beginAtZero: true, max: 100 },
      x: { display: false } // Hide x axis labels for clean sparkline look
    },
    plugins: {
      legend: { display: true, position: 'top', labels: { boxWidth: 12 } }
    }
  };

  const data = {
    labels: history ? history.labels : [],
    datasets: [
      {
        label: 'Rainfall (mm/h)',
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        data: history ? history.rain : [],
        fill: true,
        tension: 0.4
      },
      {
        label: 'Moisture (%)',
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        data: history ? history.moisture : [],
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <div className="panel chart-panel">
      <h2>Sensor Trends <span>{village ? `- ${village.name}` : '(Select a village)'}</span></h2>
      <div className="chart-container">
        {village ? (
          <Line options={options} data={data} />
        ) : (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>
            Select a village on the map to view live sensor trends.
          </div>
        )}
      </div>
    </div>
  );
}
