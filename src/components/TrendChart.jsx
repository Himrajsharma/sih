import { useState } from 'react';
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
  Filler,
} from 'chart.js';
import { LineChart, CloudRain, Droplets, ShieldAlert, Calendar, Zap, AlertTriangle, Waves, Clock } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

ChartJS.defaults.color = '#475569';
ChartJS.defaults.font.family = "'Inter', sans-serif";

export default function TrendChart({ village, history, monthlyHistory, mode = 'landslide' }) {
  const [viewMode, setViewMode] = useState('monthly'); // 'realtime' or 'monthly'

  const isMonthly = viewMode === 'monthly';

  // Calculate 30-Day Summary Metrics
  let monthlyTotalRain = 0;
  let monthlyPeakRisk = 0;
  let monthlyHighRiskDays = 0;

  if (monthlyHistory) {
    monthlyTotalRain = monthlyHistory.rain.reduce((a, b) => a + b, 0);
    monthlyPeakRisk = Math.max(...monthlyHistory.risk);
    monthlyHighRiskDays = monthlyHistory.risk.filter(r => r >= 70).length;
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: isMonthly ? 400 : 0 },
    scales: {
      y: { 
        beginAtZero: true, 
        max: 100,
        grid: {
          color: '#e2e8f0',
        },
        ticks: {
          font: { size: 10 },
          color: '#64748b'
        }
      },
      x: { 
        display: isMonthly,
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          font: { size: 9 },
          color: '#64748b',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8
        }
      }
    },
    plugins: {
      legend: { 
        display: true, 
        position: 'top', 
        align: 'end',
        labels: { 
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 10, weight: '600' },
          color: '#475569'
        } 
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#0f172a',
        bodyColor: '#334155',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        titleFont: { family: "'Outfit', sans-serif", weight: 'bold' },
        bodyFont: { family: "'Inter', sans-serif" },
        padding: 10,
        boxPadding: 4,
        cornerRadius: 8,
        shadowColor: 'rgba(0, 0, 0, 0.1)'
      }
    }
  };


  // Realtime Data vs 30-Day Monthly Data
  const chartData = isMonthly && monthlyHistory ? {
    labels: monthlyHistory.dates,
    datasets: mode === 'flash_flood' ? [
      {
        label: 'River Stage (m x10)',
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        borderWidth: 2,
        pointRadius: 2,
        data: monthlyHistory.rain.map(r => Math.min(100, Math.round(r * 0.8 + 12))),
        fill: true,
        tension: 0.3
      },
      {
        label: 'Discharge Flow (m³/s)',
        borderColor: '#06b6d4',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 2,
        data: monthlyHistory.moisture.map(m => Math.round(m * 0.9)),
        fill: false,
        tension: 0.3
      },
      {
        label: 'Inundation Risk Index',
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [4, 4],
        pointRadius: 0,
        data: monthlyHistory.risk,
        fill: false,
        tension: 0.3
      }
    ] : [
      {
        label: 'Daily Rain (mm)',
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 4,
        data: monthlyHistory.rain,
        fill: true,
        tension: 0.3
      },
      {
        label: 'Soil Saturation (%)',
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 4,
        data: monthlyHistory.moisture,
        fill: true,
        tension: 0.3
      },
      {
        label: 'Risk Score (0-100)',
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [4, 4],
        pointRadius: 0,
        data: monthlyHistory.risk,
        fill: false,
        tension: 0.3
      }
    ]
  } : {
    labels: history ? history.labels : [],
    datasets: mode === 'flash_flood' ? [
      {
        label: 'River Stage (m x10)',
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        borderWidth: 2,
        pointRadius: 0,
        data: history ? history.rain.map(r => Math.min(100, Math.round(r * 0.7 + 14))) : [],
        fill: true,
        tension: 0.4
      },
      {
        label: 'Rainfall Rate (mm/h)',
        borderColor: '#3b82f6',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        data: history ? history.rain : [],
        fill: false,
        tension: 0.4
      }
    ] : [
      {
        label: 'Rainfall (mm/h)',
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.12)',
        borderWidth: 2,
        pointRadius: 0,
        data: history ? history.rain : [],
        fill: true,
        tension: 0.4
      },
      {
        label: 'Soil Moisture (%)',
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
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
      <div className="panel-title">
        <div className="panel-title-left">
          <LineChart size={16} />
          <span>{mode === 'flash_flood' ? 'Hydro-Meteorological Telemetry & Historical Trends' : 'Telemetry & Historical Behavior'}</span>
        </div>

        {/* View Mode Switcher Pill */}
        <div className="mode-switcher" style={{ padding: '2px' }}>
          <button 
            className={`mode-btn ${isMonthly ? 'active' : ''}`}
            onClick={() => setViewMode('monthly')}
            style={{ fontSize: '0.72rem', padding: '4px 10px' }}
          >
            <Calendar size={11} /> 30-Day View
          </button>
          <button 
            className={`mode-btn ${!isMonthly ? 'active' : ''}`}
            onClick={() => setViewMode('realtime')}
            style={{ fontSize: '0.72rem', padding: '4px 10px' }}
          >
            <Zap size={11} /> Live (30s)
          </button>
        </div>
      </div>

      {village ? (
        <>
          {/* KPI Metrics Cards Header */}
          <div className="chart-metrics-row">
            {mode === 'flash_flood' ? (
              <>
                <div className="chart-metric-card">
                  <span className="metric-label">
                    <Waves size={12} style={{ color: '#38bdf8' }} /> River Level Stage
                  </span>
                  <span className="metric-val" style={{ color: '#38bdf8' }}>
                    {(village.riverLevel || 1.4).toFixed(2)} <span style={{ fontSize: '0.7rem' }}>m</span>
                  </span>
                </div>

                <div className="chart-metric-card">
                  <span className="metric-label">
                    <Clock size={12} style={{ color: '#f59e0b' }} /> Evac Lead Time
                  </span>
                  <span className="metric-val" style={{ color: '#f59e0b' }}>
                    {(village.leadTimeMins || 45) < 99 ? village.leadTimeMins || 45 : '120+'}<span style={{ fontSize: '0.7rem' }}> mins</span>
                  </span>
                </div>

                <div className="chart-metric-card">
                  <span className="metric-label">
                    <ShieldAlert size={12} style={{ color: village.cat.hex }} /> Flash Flood Risk
                  </span>
                  <span className="metric-val" style={{ color: village.cat.hex }}>
                    {village.score}<span style={{ fontSize: '0.7rem' }}>/100</span>
                  </span>
                </div>
              </>
            ) : isMonthly ? (
              <>
                <div className="chart-metric-card">
                  <span className="metric-label">
                    <CloudRain size={12} style={{ color: 'var(--accent-blue)' }} /> 30-Day Rain
                  </span>
                  <span className="metric-val" style={{ color: 'var(--accent-blue)' }}>
                    {monthlyTotalRain} <span style={{ fontSize: '0.7rem' }}>mm</span>
                  </span>
                </div>

                <div className="chart-metric-card">
                  <span className="metric-label">
                    <ShieldAlert size={12} style={{ color: 'var(--risk-high)' }} /> Peak Monthly Risk
                  </span>
                  <span className="metric-val" style={{ color: 'var(--risk-high)' }}>
                    {monthlyPeakRisk}<span style={{ fontSize: '0.7rem' }}>/100</span>
                  </span>
                </div>

                <div className="chart-metric-card">
                  <span className="metric-label">
                    <AlertTriangle size={12} style={{ color: 'var(--risk-medium)' }} /> High Risk Days
                  </span>
                  <span className="metric-val" style={{ color: 'var(--risk-medium)' }}>
                    {monthlyHighRiskDays} <span style={{ fontSize: '0.7rem' }}>Days</span>
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="chart-metric-card">
                  <span className="metric-label">
                    <CloudRain size={12} style={{ color: 'var(--accent-blue)' }} /> Current Rain
                  </span>
                  <span className="metric-val" style={{ color: 'var(--accent-blue)' }}>
                    {Math.round(village.rain)} <span style={{ fontSize: '0.7rem' }}>mm/h</span>
                  </span>
                </div>

                <div className="chart-metric-card">
                  <span className="metric-label">
                    <Droplets size={12} style={{ color: 'var(--risk-low)' }} /> Soil Saturation
                  </span>
                  <span className="metric-val" style={{ color: 'var(--risk-low)' }}>
                    {Math.round(village.moisture)}<span style={{ fontSize: '0.7rem' }}>%</span>
                  </span>
                </div>

                <div className="chart-metric-card">
                  <span className="metric-label">
                    <ShieldAlert size={12} style={{ color: village.cat.hex }} /> Composite Risk
                  </span>
                  <span className="metric-val" style={{ color: village.cat.hex }}>
                    {village.score}<span style={{ fontSize: '0.7rem' }}>/100</span>
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="chart-container">
            <Line options={chartOptions} data={chartData} />
          </div>
        </>
      ) : (
        <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.85rem' }}>
            Click on any Ward on the Map or Risk Rankings list to view historical & live behavior.
          </div>
        </div>
      )}
    </div>
  );
}

