// --- DATA MODEL ---
const VILLAGES = [
    { id: 'v1', name: 'Joshimath Ward 1', lat: 30.5506, lng: 79.5660, rain: 5, moisture: 20, slope: 85 },
    { id: 'v2', name: 'Tapovan', lat: 30.4900, lng: 79.6200, rain: 2, moisture: 15, slope: 90 },
    { id: 'v3', name: 'Reni Village', lat: 30.4850, lng: 79.6900, rain: 8, moisture: 25, slope: 75 },
    { id: 'v4', name: 'Gopeshwar', lat: 30.4100, lng: 79.3200, rain: 0, moisture: 10, slope: 95 },
    { id: 'v5', name: 'Pipalkoti', lat: 30.4300, lng: 79.4300, rain: 4, moisture: 22, slope: 80 },
    { id: 'v6', name: 'Helang', lat: 30.5100, lng: 79.5100, rain: 1, moisture: 18, slope: 88 },
    { id: 'v7', name: 'Urgam Valley', lat: 30.5400, lng: 79.4700, rain: 12, moisture: 35, slope: 70 },
    { id: 'v8', name: 'Karnaprayag', lat: 30.2600, lng: 79.2100, rain: 0, moisture: 12, slope: 92 },
];

// Keep a copy of baselines for reset
const BASELINES = JSON.parse(JSON.stringify(VILLAGES));

// State
let selectedVillageId = null;
let simulationActive = false;
let simulationTargetId = null;
let simulationInterval = null;
let mapMarkers = {};
let trendChart = null;
let chartDataHistory = {};
let alertedVillages = new Set(); // Prevent spamming alerts

// --- RISK ENGINE ---
function calculateRisk(rain, moisture, slope) {
    const normRain = Math.min(rain / 100, 1);
    const normMoisture = Math.min(moisture / 100, 1);
    const normSlopeRisk = Math.max(0, (100 - slope) / 100);

    const score = (normRain * 0.4) + (normMoisture * 0.35) + (normSlopeRisk * 0.25);
    return Math.round(score * 100);
}

function getRiskCategory(score) {
    if (score < 40) return { label: 'LOW', color: 'var(--risk-low)', hex: '#10b981' };
    if (score < 70) return { label: 'MEDIUM', color: 'var(--risk-medium)', hex: '#f59e0b' };
    return { label: 'HIGH', color: 'var(--risk-high)', hex: '#ef4444' };
}


// --- MAP INITIALIZATION ---
const map = L.map('map').setView([30.45, 79.45], 11);

// Standard OpenStreetMap with a dark filter applied via CSS class if needed, or CartoDB dark matter
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

function initMapMarkers() {
    VILLAGES.forEach(v => {
        const risk = calculateRisk(v.rain, v.moisture, v.slope);
        const cat = getRiskCategory(risk);

        const marker = L.circleMarker([v.lat, v.lng], {
            radius: 10,
            fillColor: cat.hex,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map);

        marker.on('click', () => selectVillage(v.id));
        mapMarkers[v.id] = marker;

        // Init chart history array
        chartDataHistory[v.id] = { labels: [], rain: [], moisture: [] };
    });
}

function updateMapPopups() {
    VILLAGES.forEach(v => {
        const risk = calculateRisk(v.rain, v.moisture, v.slope);
        const cat = getRiskCategory(risk);
        const marker = mapMarkers[v.id];
        
        // Update Color
        marker.setStyle({ fillColor: cat.hex });

        // Update Popup
        const popupContent = `
            <h4>${v.name}</h4>
            <div class="popup-stat"><span>Risk Score:</span> <strong style="color:${cat.hex}">${risk}/100 (${cat.label})</strong></div>
            <div class="popup-stat"><span>Rainfall:</span> <span>${Math.round(v.rain)} mm/hr</span></div>
            <div class="popup-stat"><span>Moisture:</span> <span>${Math.round(v.moisture)}%</span></div>
            <div class="popup-stat"><span>Slope Index:</span> <span>${Math.round(v.slope)}</span></div>
        `;
        
        if (marker.getPopup()) {
            marker.getPopup().setContent(popupContent);
        } else {
            marker.bindPopup(popupContent);
        }
    });
}


// --- UI UPDATES ---
function updateRiskList() {
    const listEl = document.getElementById('village-list');
    
    // Calculate current scores and sort
    const scoredVillages = VILLAGES.map(v => {
        const score = calculateRisk(v.rain, v.moisture, v.slope);
        return { ...v, score, cat: getRiskCategory(score) };
    }).sort((a, b) => b.score - a.score);

    listEl.innerHTML = '';
    scoredVillages.forEach(v => {
        const li = document.createElement('li');
        li.className = `village-item ${selectedVillageId === v.id ? 'selected' : ''}`;
        li.style.borderLeftColor = v.cat.hex;
        li.innerHTML = `
            <span class="village-name">${v.name}</span>
            <span class="risk-badge" style="background-color: ${v.cat.hex}">${v.score}</span>
        `;
        li.onclick = () => selectVillage(v.id);
        listEl.appendChild(li);

        // Check for alerts
        if (v.score >= 70 && !alertedVillages.has(v.id)) {
            triggerAlert(v);
        } else if (v.score < 70 && alertedVillages.has(v.id)) {
            // Reset alert state if it drops back down (optional, but good for reset)
            alertedVillages.delete(v.id);
        }
    });
}

function selectVillage(id) {
    selectedVillageId = id;
    const v = VILLAGES.find(x => x.id === id);
    
    // Update map view
    map.setView([v.lat, v.lng], 13);
    mapMarkers[id].openPopup();
    
    // Update List selection UI
    updateRiskList();
    
    // Update Chart
    document.getElementById('chart-village-name').textContent = `- ${v.name}`;
    updateChartData();

    // Update Sliders
    document.getElementById('override-village-name').textContent = `(${v.name})`;
    document.getElementById('slider-rain').value = v.rain;
    document.getElementById('val-rain').textContent = Math.round(v.rain);
    document.getElementById('slider-moisture').value = v.moisture;
    document.getElementById('val-moisture').textContent = Math.round(v.moisture) + '%';
    document.getElementById('slider-slope').value = v.slope;
    document.getElementById('val-slope').textContent = Math.round(v.slope);
}


// --- ALERT SYSTEM ---
function triggerAlert(village) {
    alertedVillages.add(village.id);

    // 1. Log Entry
    const logEl = document.getElementById('alerts-log');
    const timeString = new Date().toLocaleTimeString();
    const estPop = Math.floor(Math.random() * 2000) + 500; // Fake population

    const entry = document.createElement('div');
    entry.className = 'alert-entry critical';
    entry.innerHTML = `
        <span class="time">${timeString}</span>
        <span class="message"><strong>CRITICAL:</strong> Threshold breached at ${village.name}. Automated SMS broadcast sent to ${estPop} registered mobile devices in the ward. Evacuation siren triggered.</span>
    `;
    logEl.prepend(entry);

    // 2. Toast Banner
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `⚠️ EVACUATION ALERT: ${village.name} (Risk: ${village.score}/100)`;
    toast.onclick = () => toast.remove(); // Click to dismiss
    toastContainer.appendChild(toast);

    // Remove toast after 10s
    setTimeout(() => {
        if(toast.parentElement) toast.remove();
    }, 10000);

    // 3. Audio (Stretch Goal)
    try {
        const audio = document.getElementById('alert-sound');
        audio.currentTime = 0;
        audio.play().catch(e => console.log("Audio play prevented by browser policy", e));
    } catch(e) {}
}


// --- CHART INITIALIZATION ---
function initChart() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    Chart.defaults.color = '#9ca3af';
    Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Rainfall (mm/h)',
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    data: [],
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Moisture (%)',
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    data: [],
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
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
        }
    });
}

function updateChartData() {
    if (!selectedVillageId || !trendChart) return;
    
    const hist = chartDataHistory[selectedVillageId];
    trendChart.data.labels = hist.labels;
    trendChart.data.datasets[0].data = hist.rain;
    trendChart.data.datasets[1].data = hist.moisture;
    trendChart.update();
}

function recordHistoryPoint() {
    const timeLabel = new Date().toLocaleTimeString();
    
    VILLAGES.forEach(v => {
        const hist = chartDataHistory[v.id];
        hist.labels.push(timeLabel);
        hist.rain.push(v.rain);
        hist.moisture.push(v.moisture);
        
        // Keep last 30 data points
        if (hist.labels.length > 30) {
            hist.labels.shift();
            hist.rain.shift();
            hist.moisture.shift();
        }
    });

    updateChartData();
}


// --- MAIN LOOP ---
setInterval(() => {
    // If simulation is active, nudge the target village values up
    if (simulationActive && simulationTargetId) {
        const v = VILLAGES.find(x => x.id === simulationTargetId);
        // Ramp up over ~30 seconds (assuming 1s interval)
        v.rain = Math.min(100, v.rain + (Math.random() * 3 + 1));
        v.moisture = Math.min(100, v.moisture + (Math.random() * 2 + 1));
        v.slope = Math.max(0, v.slope - (Math.random() * 0.8 + 0.2)); // Slope degrades slightly as water hits
        
        // Update sliders if targeting selected
        if (selectedVillageId === simulationTargetId) {
            document.getElementById('slider-rain').value = v.rain;
            document.getElementById('val-rain').textContent = Math.round(v.rain);
            document.getElementById('slider-moisture').value = v.moisture;
            document.getElementById('val-moisture').textContent = Math.round(v.moisture) + '%';
            document.getElementById('slider-slope').value = v.slope;
            document.getElementById('val-slope').textContent = Math.round(v.slope);
        }
    }

    // Add slight random jitter, and slowly drift back to baseline if not in active storm
    VILLAGES.forEach((v, index) => {
        if (!simulationActive || v.id !== simulationTargetId) {
            const baseline = BASELINES[index];
            
            // Jitter
            let rainDrift = (Math.random() - 0.5) * 0.5;
            let moistureDrift = (Math.random() - 0.5) * 0.5;
            let slopeDrift = (Math.random() - 0.5) * 0.2;
            
            // Pull towards baseline to prevent endless wandering
            rainDrift += (baseline.rain - v.rain) * 0.05;
            moistureDrift += (baseline.moisture - v.moisture) * 0.05;
            slopeDrift += (baseline.slope - v.slope) * 0.05;

            v.rain = Math.max(0, Math.min(100, v.rain + rainDrift));
            v.moisture = Math.max(0, Math.min(100, v.moisture + moistureDrift));
            v.slope = Math.max(0, Math.min(100, v.slope + slopeDrift));
        }
    });

    updateMapPopups();
    updateRiskList();
    recordHistoryPoint();

}, 1000); // 1 second tick


// --- CONTROLS EVENT LISTENERS ---

document.getElementById('btn-simulate').addEventListener('click', () => {
    if (simulationActive) return; // Already running
    
    // Target selected village, or default to Reni Village (v3) if none selected
    simulationTargetId = selectedVillageId || 'v3'; 
    const v = VILLAGES.find(x => x.id === simulationTargetId);
    
    // Select it on map to ensure visibility
    if (selectedVillageId !== simulationTargetId) {
        selectVillage(simulationTargetId);
    }

    simulationActive = true;
    document.getElementById('sim-status').innerHTML = `⛈️ Storm Cell tracking directly over <strong>${v.name}</strong>. Escalation imminent.`;
    document.getElementById('sim-status').style.color = 'var(--risk-high)';
    
    // Log start of event
    const logEl = document.getElementById('alerts-log');
    const entry = document.createElement('div');
    entry.className = 'alert-entry';
    entry.innerHTML = `<span class="time">${new Date().toLocaleTimeString()}</span><span class="message">Meteorological anomaly detected. Sudden cloudburst approaching ${v.name}.</span>`;
    logEl.prepend(entry);
});

document.getElementById('btn-reset').addEventListener('click', () => {
    simulationActive = false;
    simulationTargetId = null;
    alertedVillages.clear();
    
    document.getElementById('sim-status').innerHTML = `Simulation inactive. Ready.`;
    document.getElementById('sim-status').style.color = 'var(--text-secondary)';

    // Restore baselines
    for (let i = 0; i < VILLAGES.length; i++) {
        VILLAGES[i].rain = BASELINES[i].rain;
        VILLAGES[i].moisture = BASELINES[i].moisture;
        VILLAGES[i].slope = BASELINES[i].slope;
    }

    // Clear toasts
    document.getElementById('toast-container').innerHTML = '';

    // Re-sync UI
    if (selectedVillageId) selectVillage(selectedVillageId);
    updateMapPopups();
    updateRiskList();
});

// Manual Sliders
function setupSlider(idPrefix, prop) {
    const slider = document.getElementById(`slider-${idPrefix}`);
    const val = document.getElementById(`val-${idPrefix}`);
    
    slider.addEventListener('input', (e) => {
        const newValue = parseFloat(e.target.value);
        val.textContent = prop === 'moisture' ? newValue + '%' : newValue;
        
        // Apply to selected village, or all if none selected
        if (selectedVillageId) {
            const v = VILLAGES.find(x => x.id === selectedVillageId);
            v[prop] = newValue;
        } else {
            VILLAGES.forEach(v => v[prop] = newValue);
        }
        
        updateMapPopups();
        updateRiskList();
    });
}

setupSlider('rain', 'rain');
setupSlider('moisture', 'moisture');
setupSlider('slope', 'slope');


// BOOTSTRAP
initMapMarkers();
initChart();
updateMapPopups();
updateRiskList();
