// Mesoanalysis Forecasting Game - Full SPC-Style Probabilistic Forecasting

class ForecastGame {
    constructor(mesoApp) {
        this.mesoApp = mesoApp;
        this.gameActive = false;
        this.currentForecast = null;
        this.forecasts = this.loadForecasts();
        this.leaderboard = this.loadLeaderboard();
        this.playerName = this.sanitize(localStorage.getItem('playerName') || 'Forecaster');
        this.drawingMode = false;
        this.currentHazard = 'tornado';
        this.currentProb = 5;
        this.sigSevere = false;
        this.drawnAreas = [];
        this.canvas = null;
        this.ctx = null;
        this.currentPath = [];
        this.stormReports = null;

        // SPC-style probability levels by hazard type
        this.hazardTypes = {
            tornado: {
                name: 'Tornado',
                probs: [2, 5, 10, 15, 30, 45, 60],
                sigThreshold: 10, // 10%+ can have sig (EF2+)
                unit: 'EF2+ tornado'
            },
            wind: {
                name: 'Wind',
                probs: [5, 15, 30, 45, 60],
                sigThreshold: 15,
                unit: '65kt+ winds'
            },
            hail: {
                name: 'Hail',
                probs: [5, 15, 30, 45, 60],
                sigThreshold: 15,
                unit: '2"+ hail'
            }
        };

        // Probability colors (SPC style)
        this.probColors = {
            2: '#008B00',   // Dark green
            5: '#8B4513',   // Brown
            10: '#FFD700',  // Yellow
            15: '#FF8C00',  // Dark orange
            30: '#FF0000',  // Red
            45: '#FF00FF',  // Magenta
            60: '#8B008B'   // Dark magenta
        };

        // Map bounds for converting lat/lon to canvas coords
        // Approximate bounds for each SPC sector
        this.mapBounds = {
            19: { minLat: 24, maxLat: 50, minLon: -125, maxLon: -66 },  // National
            11: { minLat: 40, maxLat: 50, minLon: -128, maxLon: -110 }, // Northwest
            12: { minLat: 30, maxLat: 42, minLon: -125, maxLon: -108 }, // Southwest
            22: { minLat: 35, maxLat: 45, minLon: -120, maxLon: -105 }, // Great Basin
            13: { minLat: 40, maxLat: 50, minLon: -110, maxLon: -95 },  // Northern Plains
            14: { minLat: 34, maxLat: 44, minLon: -105, maxLon: -92 },  // Central Plains
            15: { minLat: 26, maxLat: 38, minLon: -106, maxLon: -90 },  // Southern Plains / Gulf Coast
            20: { minLat: 36, maxLat: 46, minLon: -96, maxLon: -82 },   // Midwest
            21: { minLat: 40, maxLat: 50, minLon: -92, maxLon: -76 },   // Great Lakes
            16: { minLat: 38, maxLat: 48, minLon: -82, maxLon: -66 },   // Northeast
            17: { minLat: 34, maxLat: 44, minLon: -84, maxLon: -72 },   // Mid-Atlantic
            18: { minLat: 26, maxLat: 38, minLon: -92, maxLon: -76 },   // Southeast
            9:  { minLat: 24, maxLat: 50, minLon: -125, maxLon: -66 }   // Fallback national
        };

        this.init();
    }

    init() {
        this.createGameUI();
        this.createCanvas();
        this.setupEventListeners();
    }

    createGameUI() {
        const gamePanel = document.createElement('div');
        gamePanel.id = 'gamePanel';
        gamePanel.className = 'game-panel';
        gamePanel.innerHTML = `
            <div class="game-header">
                <h3>Forecast Game</h3>
                <button id="toggleGameBtn" class="game-toggle-btn">Start Game</button>
            </div>
            <div class="game-content" id="gameContent" style="display:none;">
                <div class="player-info">
                    <label>Forecaster: <input type="text" id="playerNameInput" value="${this.playerName}" maxlength="20"></label>
                </div>

                <div class="game-mode-select">
                    <h4>Game Mode</h4>
                    <select id="gameModeSelect">
                        <option value="current">Current Day (verify tomorrow)</option>
                        <option value="historic">Historic Event (verify now)</option>
                        <option value="practice">Practice Mode</option>
                    </select>
                </div>

                <div class="hazard-selector">
                    <h4>Hazard Type</h4>
                    <div class="hazard-buttons" id="hazardButtons">
                        <button class="hazard-btn active" data-hazard="tornado">Tornado</button>
                        <button class="hazard-btn" data-hazard="wind">Wind</button>
                        <button class="hazard-btn" data-hazard="hail">Hail</button>
                    </div>
                </div>

                <div class="prob-selector">
                    <h4>Probability (%)</h4>
                    <div class="prob-buttons" id="probButtons"></div>
                    <label class="sig-toggle">
                        <input type="checkbox" id="sigSevereCheck">
                        <span id="sigLabel">Significant (EF2+ tornado)</span>
                    </label>
                </div>

                <div class="drawing-controls">
                    <h4>Draw Outlook</h4>
                    <div class="draw-btn-row">
                        <button id="drawModeBtn" class="draw-btn">Start Drawing</button>
                        <button id="undoBtn" class="draw-btn">Undo</button>
                        <button id="clearAllBtn" class="draw-btn">Clear</button>
                    </div>
                </div>

                <div class="drawn-areas-list">
                    <h4>Your Forecast Areas</h4>
                    <div id="areasListDisplay"></div>
                </div>

                <div class="forecast-actions">
                    <button id="submitForecastBtn" class="submit-btn">Submit Forecast</button>
                    <button id="verifyBtn" class="verify-btn" style="display:none;">Verify Against Reports</button>
                </div>

                <div class="verification-results" id="verificationResults" style="display:none;">
                    <h4>Verification Results</h4>
                    <div id="resultsContent"></div>
                </div>

                <div class="score-display">
                    <h4>Your Stats</h4>
                    <div id="playerStats">
                        <p>Forecasts: <span id="statForecasts">0</span></p>
                        <p>Avg Brier: <span id="statBrier">--</span></p>
                        <p>Best Score: <span id="statBestScore">0</span></p>
                    </div>
                </div>

                <div class="leaderboard">
                    <h4>Leaderboard</h4>
                    <div id="leaderboardList"></div>
                </div>
            </div>
        `;

        const controlsPanel = document.querySelector('.controls-panel');
        controlsPanel.appendChild(gamePanel);

        // Initialize probability buttons
        this.updateProbButtons();
    }

    updateProbButtons() {
        const container = document.getElementById('probButtons');
        const hazard = this.hazardTypes[this.currentHazard];

        container.innerHTML = hazard.probs.map(p => `
            <button class="prob-btn ${p === this.currentProb ? 'active' : ''}"
                    data-prob="${p}"
                    style="background:${this.probColors[p]}; color:${p >= 30 ? '#fff' : '#000'}">
                ${p}%
            </button>
        `).join('');

        // Update sig severe label
        const sigLabel = document.getElementById('sigLabel');
        sigLabel.textContent = `Significant (${hazard.unit})`;

        // Update sig checkbox availability
        const sigCheck = document.getElementById('sigSevereCheck');
        sigCheck.disabled = this.currentProb < hazard.sigThreshold;
        if (sigCheck.disabled) {
            sigCheck.checked = false;
            this.sigSevere = false;
        }

        // Add event listeners to new buttons
        container.querySelectorAll('.prob-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.prob-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentProb = parseInt(btn.dataset.prob);

                // Update sig checkbox
                const sigCheck = document.getElementById('sigSevereCheck');
                sigCheck.disabled = this.currentProb < hazard.sigThreshold;
                if (sigCheck.disabled) {
                    sigCheck.checked = false;
                    this.sigSevere = false;
                }
            });
        });
    }

    createCanvas() {
        const mapWrapper = document.getElementById('mapWrapper');
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'forecastCanvas';
        this.canvas.className = 'forecast-canvas';
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 50;
            pointer-events: none;
        `;
        mapWrapper.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const mapWrapper = document.getElementById('mapWrapper');
        const rect = mapWrapper.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.redrawAreas();
    }

    setupEventListeners() {
        document.getElementById('toggleGameBtn').addEventListener('click', () => this.toggleGame());

        document.getElementById('playerNameInput').addEventListener('change', (e) => {
            this.playerName = this.sanitize(e.target.value || 'Forecaster');
            localStorage.setItem('playerName', this.playerName);
        });

        // Hazard type selection
        document.getElementById('hazardButtons').addEventListener('click', (e) => {
            if (e.target.classList.contains('hazard-btn')) {
                document.querySelectorAll('.hazard-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentHazard = e.target.dataset.hazard;
                this.updateProbButtons();
            }
        });

        // Sig severe toggle
        document.getElementById('sigSevereCheck').addEventListener('change', (e) => {
            this.sigSevere = e.target.checked;
        });

        // Drawing controls
        document.getElementById('drawModeBtn').addEventListener('click', () => this.toggleDrawing());
        document.getElementById('undoBtn').addEventListener('click', () => this.undoLast());
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAll());

        // Submit/Verify
        document.getElementById('submitForecastBtn').addEventListener('click', () => this.submitForecast());
        document.getElementById('verifyBtn').addEventListener('click', () => this.verifyForecast());

        // Canvas events
        const mapWrapper = document.getElementById('mapWrapper');
        mapWrapper.addEventListener('mousedown', (e) => this.startDrawing(e));
        mapWrapper.addEventListener('mousemove', (e) => this.draw(e));
        mapWrapper.addEventListener('mouseup', () => this.stopDrawing());
        mapWrapper.addEventListener('mouseleave', () => this.stopDrawing());

        // Touch support
        mapWrapper.addEventListener('touchstart', (e) => { e.preventDefault(); this.startDrawing(e.touches[0]); });
        mapWrapper.addEventListener('touchmove', (e) => { e.preventDefault(); this.draw(e.touches[0]); });
        mapWrapper.addEventListener('touchend', () => this.stopDrawing());
    }

    toggleGame() {
        this.gameActive = !this.gameActive;
        const btn = document.getElementById('toggleGameBtn');
        const content = document.getElementById('gameContent');

        if (this.gameActive) {
            btn.textContent = 'End Game';
            btn.classList.add('active');
            content.style.display = 'block';
            this.updateStats();
            this.updateLeaderboard();
        } else {
            btn.textContent = 'Start Game';
            btn.classList.remove('active');
            content.style.display = 'none';
            this.drawingMode = false;
            this.canvas.style.pointerEvents = 'none';
        }
    }

    toggleDrawing() {
        this.drawingMode = !this.drawingMode;
        const btn = document.getElementById('drawModeBtn');

        if (this.drawingMode) {
            btn.textContent = 'Stop Drawing';
            btn.classList.add('active');
            this.canvas.style.pointerEvents = 'auto';
            this.canvas.style.cursor = 'crosshair';
        } else {
            btn.textContent = 'Start Drawing';
            btn.classList.remove('active');
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.cursor = 'default';
        }
    }

    startDrawing(e) {
        if (!this.drawingMode) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.currentPath = [{ x, y }];
        this.isDrawing = true;
    }

    draw(e) {
        if (!this.isDrawing || !this.drawingMode) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.currentPath.push({ x, y });
        this.redrawAreas();
        this.drawCurrentPath();
    }

    stopDrawing() {
        if (!this.isDrawing) return;
        this.isDrawing = false;

        if (this.currentPath.length > 2) {
            this.currentPath.push(this.currentPath[0]); // Close path
            this.drawnAreas.push({
                hazard: this.currentHazard,
                prob: this.currentProb,
                sig: this.sigSevere && this.currentProb >= this.hazardTypes[this.currentHazard].sigThreshold,
                path: [...this.currentPath],
                color: this.probColors[this.currentProb]
            });
            this.updateAreasList();
        }
        this.currentPath = [];
        this.redrawAreas();
    }

    drawCurrentPath() {
        if (this.currentPath.length < 2) return;
        const color = this.probColors[this.currentProb];

        this.ctx.beginPath();
        this.ctx.moveTo(this.currentPath[0].x, this.currentPath[0].y);
        for (let i = 1; i < this.currentPath.length; i++) {
            this.ctx.lineTo(this.currentPath[i].x, this.currentPath[i].y);
        }
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    }

    redrawAreas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Sort by probability (lower probs drawn first, higher on top)
        const sortedAreas = [...this.drawnAreas].sort((a, b) => a.prob - b.prob);

        sortedAreas.forEach(area => {
            if (area.path.length < 3) return;

            this.ctx.beginPath();
            this.ctx.moveTo(area.path[0].x, area.path[0].y);
            for (let i = 1; i < area.path.length; i++) {
                this.ctx.lineTo(area.path[i].x, area.path[i].y);
            }
            this.ctx.closePath();

            // Fill with transparency
            this.ctx.fillStyle = area.color + '50';
            this.ctx.fill();

            // Stroke
            this.ctx.strokeStyle = area.color;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Hatching for significant
            if (area.sig) {
                this.drawHatching(area.path);
            }

            // Label
            const centerX = area.path.reduce((sum, p) => sum + p.x, 0) / area.path.length;
            const centerY = area.path.reduce((sum, p) => sum + p.y, 0) / area.path.length;
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 11px Arial';
            this.ctx.textAlign = 'center';
            const label = `${area.hazard.charAt(0).toUpperCase()}${area.prob}%${area.sig ? '*' : ''}`;
            this.ctx.fillText(label, centerX, centerY);
        });
    }

    drawHatching(path) {
        // Draw diagonal hatching pattern for significant areas
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            this.ctx.lineTo(path[i].x, path[i].y);
        }
        this.ctx.closePath();
        this.ctx.clip();

        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        const bounds = this.getPathBounds(path);

        for (let i = bounds.minX - bounds.height; i < bounds.maxX + bounds.height; i += 8) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, bounds.minY);
            this.ctx.lineTo(i + bounds.height, bounds.maxY);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    getPathBounds(path) {
        const xs = path.map(p => p.x);
        const ys = path.map(p => p.y);
        return {
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys),
            width: Math.max(...xs) - Math.min(...xs),
            height: Math.max(...ys) - Math.min(...ys)
        };
    }

    updateAreasList() {
        const container = document.getElementById('areasListDisplay');
        if (this.drawnAreas.length === 0) {
            container.innerHTML = '<p class="no-areas">No areas drawn yet</p>';
            return;
        }

        container.innerHTML = this.drawnAreas.map((area, i) => `
            <div class="area-item" style="border-left: 4px solid ${area.color}">
                <span class="area-type">${this.hazardTypes[area.hazard].name}</span>
                <span class="area-prob">${area.prob}%${area.sig ? ' SIG' : ''}</span>
                <button class="area-delete" data-index="${i}">×</button>
            </div>
        `).join('');

        container.querySelectorAll('.area-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                this.drawnAreas.splice(parseInt(btn.dataset.index), 1);
                this.updateAreasList();
                this.redrawAreas();
            });
        });
    }

    undoLast() {
        this.drawnAreas.pop();
        this.updateAreasList();
        this.redrawAreas();
    }

    clearAll() {
        this.drawnAreas = [];
        this.updateAreasList();
        this.redrawAreas();
    }

    submitForecast() {
        if (this.drawnAreas.length === 0) {
            alert('Please draw at least one forecast area!');
            return;
        }

        const gameMode = document.getElementById('gameModeSelect').value;

        // Get the date for verification
        let forecastDate;
        if (this.mesoApp.historicDate) {
            forecastDate = this.mesoApp.historicDate;
        } else {
            const now = new Date();
            forecastDate = now.getFullYear().toString().slice(-2) +
                          (now.getMonth() + 1).toString().padStart(2, '0') +
                          now.getDate().toString().padStart(2, '0');
        }

        const forecast = {
            id: Date.now(),
            player: this.playerName,
            timestamp: new Date().toISOString(),
            sector: this.mesoApp.currentSector,
            areas: JSON.parse(JSON.stringify(this.drawnAreas)),
            canvasSize: { width: this.canvas.width, height: this.canvas.height },
            mode: gameMode,
            forecastDate: forecastDate,
            historicDate: this.mesoApp.historicDate,
            verified: false,
            score: null
        };

        this.forecasts.push(forecast);
        this.saveForecasts();
        this.currentForecast = forecast;

        if (gameMode === 'historic' || gameMode === 'practice') {
            document.getElementById('verifyBtn').style.display = 'block';
            alert('Forecast submitted! Click "Verify Against Reports" to see your score.');
        } else {
            alert('Forecast submitted for ' + forecastDate + '! Check back tomorrow to verify.');
        }

        this.clearAll();
        if (this.drawingMode) this.toggleDrawing();
    }

    async verifyForecast() {
        if (!this.currentForecast) {
            alert('No forecast to verify!');
            return;
        }

        document.getElementById('verifyBtn').textContent = 'Loading reports...';
        document.getElementById('verifyBtn').disabled = true;

        try {
            // Fetch storm reports for the forecast date
            const reports = await this.fetchStormReports(this.currentForecast.forecastDate);
            const score = this.calculateVerificationScore(this.currentForecast, reports);

            this.currentForecast.verified = true;
            this.currentForecast.score = score;
            this.currentForecast.reports = reports;
            this.saveForecasts();

            this.displayVerificationResults(score, reports);
            this.updateLeaderboardScore(this.playerName, score);
            this.updateStats();
            this.updateLeaderboard();

        } catch (error) {
            console.error('Verification error:', error);
            alert('Error fetching storm reports. Using simulated verification.');
            // Fallback to simulated verification
            const score = this.simulateVerification(this.currentForecast);
            this.displayVerificationResults(score, []);
        }

        document.getElementById('verifyBtn').textContent = 'Verify Against Reports';
        document.getElementById('verifyBtn').disabled = false;
        document.getElementById('verifyBtn').style.display = 'none';
        this.currentForecast = null;
    }

    async fetchStormReports(dateStr) {
        // dateStr format: YYMMDD or YYMMDDHH
        const date = dateStr.slice(0, 6); // Just YYMMDD
        const url = `https://www.spc.noaa.gov/climo/reports/${date}_rpts_filtered.csv`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Reports not found');
            const text = await response.text();
            return this.parseStormReports(text);
        } catch (error) {
            console.log('Could not fetch reports:', error);
            return [];
        }
    }

    parseStormReports(csvText) {
        const lines = csvText.trim().split('\n');
        const reports = { tornado: [], wind: [], hail: [] };
        let currentType = null;

        for (const line of lines) {
            if (line.startsWith('Time,F_Scale')) {
                currentType = 'tornado';
                continue;
            } else if (line.startsWith('Time,Speed')) {
                currentType = 'wind';
                continue;
            } else if (line.startsWith('Time,Size')) {
                currentType = 'hail';
                continue;
            }

            if (!currentType || !line.trim()) continue;

            const parts = line.split(',');
            if (parts.length >= 7) {
                const report = {
                    time: parts[0],
                    magnitude: parts[1],
                    location: parts[2],
                    county: parts[3],
                    state: parts[4],
                    lat: parseFloat(parts[5]),
                    lon: parseFloat(parts[6]),
                    comments: parts.slice(7).join(',')
                };

                // Determine if significant
                if (currentType === 'tornado') {
                    report.significant = report.magnitude &&
                        (report.magnitude.includes('EF2') || report.magnitude.includes('EF3') ||
                         report.magnitude.includes('EF4') || report.magnitude.includes('EF5'));
                } else if (currentType === 'wind') {
                    const speed = parseInt(report.magnitude) || 0;
                    report.significant = speed >= 65;
                } else if (currentType === 'hail') {
                    const size = parseFloat(report.magnitude) || 0;
                    report.significant = size >= 2.0;
                }

                if (!isNaN(report.lat) && !isNaN(report.lon)) {
                    reports[currentType].push(report);
                }
            }
        }

        return reports;
    }

    calculateVerificationScore(forecast, reports) {
        const results = {
            tornado: { hits: 0, misses: 0, falseAlarms: 0, total: 0, sigHits: 0 },
            wind: { hits: 0, misses: 0, falseAlarms: 0, total: 0, sigHits: 0 },
            hail: { hits: 0, misses: 0, falseAlarms: 0, total: 0, sigHits: 0 }
        };

        // For each hazard type, check if reports fall within forecast areas
        ['tornado', 'wind', 'hail'].forEach(hazard => {
            const hazardAreas = forecast.areas.filter(a => a.hazard === hazard);
            const hazardReports = reports[hazard] || [];

            results[hazard].total = hazardReports.length;

            hazardReports.forEach(report => {
                const inArea = hazardAreas.some(area =>
                    this.isPointInArea(report.lat, report.lon, area, forecast)
                );

                if (inArea) {
                    results[hazard].hits++;
                    if (report.significant) {
                        const sigArea = hazardAreas.find(a => a.sig &&
                            this.isPointInArea(report.lat, report.lon, a, forecast));
                        if (sigArea) results[hazard].sigHits++;
                    }
                } else {
                    results[hazard].misses++;
                }
            });

            // False alarms: areas with no reports (simplified)
            hazardAreas.forEach(area => {
                const hasReport = hazardReports.some(r =>
                    this.isPointInArea(r.lat, r.lon, area, forecast)
                );
                if (!hasReport) results[hazard].falseAlarms++;
            });
        });

        // Calculate Brier-style score and points
        let totalPoints = 0;
        let brierSum = 0;
        let brierCount = 0;

        forecast.areas.forEach(area => {
            const hazardReports = reports[area.hazard] || [];
            const reportsInArea = hazardReports.filter(r =>
                this.isPointInArea(r.lat, r.lon, area, forecast)
            ).length;

            const observed = reportsInArea > 0 ? 1 : 0;
            const predicted = area.prob / 100;

            // Brier score component
            brierSum += Math.pow(predicted - observed, 2);
            brierCount++;

            // Points: reward correct high-prob forecasts, penalize false alarms
            if (observed === 1) {
                totalPoints += area.prob; // More points for higher correct probs
                if (area.sig && hazardReports.some(r => r.significant &&
                    this.isPointInArea(r.lat, r.lon, area, forecast))) {
                    totalPoints += 50; // Bonus for correct sig forecast
                }
            } else {
                totalPoints -= area.prob / 2; // Penalty for false alarm
            }
        });

        const brierScore = brierCount > 0 ? (brierSum / brierCount).toFixed(3) : 0;

        return {
            results,
            totalPoints: Math.max(0, Math.round(totalPoints)),
            brierScore,
            reportCounts: {
                tornado: reports.tornado?.length || 0,
                wind: reports.wind?.length || 0,
                hail: reports.hail?.length || 0
            }
        };
    }

    isPointInArea(lat, lon, area, forecast) {
        // Convert lat/lon to canvas coordinates
        const bounds = this.mapBounds[forecast.sector] || this.mapBounds[19];
        const canvasX = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * forecast.canvasSize.width;
        const canvasY = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * forecast.canvasSize.height;

        // Point-in-polygon test
        return this.pointInPolygon(canvasX, canvasY, area.path);
    }

    pointInPolygon(x, y, path) {
        let inside = false;
        for (let i = 0, j = path.length - 1; i < path.length; j = i++) {
            const xi = path[i].x, yi = path[i].y;
            const xj = path[j].x, yj = path[j].y;

            if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
                inside = !inside;
            }
        }
        return inside;
    }

    simulateVerification(forecast) {
        // Simulated verification when real reports unavailable
        const results = {
            tornado: { hits: 0, misses: 0, falseAlarms: 0, total: 0 },
            wind: { hits: 0, misses: 0, falseAlarms: 0, total: 0 },
            hail: { hits: 0, misses: 0, falseAlarms: 0, total: 0 }
        };

        let totalPoints = 0;

        forecast.areas.forEach(area => {
            // Simulate based on probability (higher prob = more likely to verify)
            const verified = Math.random() < (area.prob / 100 + 0.3);

            if (verified) {
                results[area.hazard].hits++;
                totalPoints += area.prob;
            } else {
                if (Math.random() > 0.5) {
                    results[area.hazard].falseAlarms++;
                    totalPoints -= area.prob / 2;
                }
            }
        });

        return {
            results,
            totalPoints: Math.max(0, Math.round(totalPoints)),
            brierScore: (Math.random() * 0.3).toFixed(3),
            reportCounts: { tornado: 0, wind: 0, hail: 0 },
            simulated: true
        };
    }

    displayVerificationResults(score, reports) {
        const container = document.getElementById('verificationResults');
        const content = document.getElementById('resultsContent');

        container.style.display = 'block';

        content.innerHTML = `
            <div class="score-summary">
                <div class="big-score">${score.totalPoints} pts</div>
                <div class="brier">Brier Score: ${score.brierScore}</div>
                ${score.simulated ? '<div class="simulated-note">(Simulated - reports unavailable)</div>' : ''}
            </div>

            <div class="report-counts">
                <h5>Storm Reports Found:</h5>
                <p>Tornadoes: ${score.reportCounts.tornado}</p>
                <p>Wind: ${score.reportCounts.wind}</p>
                <p>Hail: ${score.reportCounts.hail}</p>
            </div>

            <div class="verification-details">
                <h5>Verification by Hazard:</h5>
                ${['tornado', 'wind', 'hail'].map(h => `
                    <div class="hazard-result">
                        <strong>${h.charAt(0).toUpperCase() + h.slice(1)}:</strong>
                        Hits: ${score.results[h].hits} /
                        Misses: ${score.results[h].misses} /
                        False Alarms: ${score.results[h].falseAlarms}
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateLeaderboardScore(player, score) {
        const existing = this.leaderboard.find(e => e.player === player);
        if (existing) {
            existing.games++;
            existing.totalPoints += score.totalPoints;
            existing.avgScore = Math.round(existing.totalPoints / existing.games);
            existing.bestScore = Math.max(existing.bestScore, score.totalPoints);
        } else {
            this.leaderboard.push({
                player,
                games: 1,
                totalPoints: score.totalPoints,
                avgScore: score.totalPoints,
                bestScore: score.totalPoints
            });
        }
        this.saveLeaderboard();
    }

    updateStats() {
        const playerForecasts = this.forecasts.filter(f => f.player === this.playerName && f.verified);
        const totalForecasts = playerForecasts.length;
        const avgScore = totalForecasts > 0
            ? Math.round(playerForecasts.reduce((sum, f) => sum + (f.score?.totalPoints || 0), 0) / totalForecasts)
            : 0;
        const bestScore = totalForecasts > 0
            ? Math.max(...playerForecasts.map(f => f.score?.totalPoints || 0))
            : 0;
        const avgBrier = totalForecasts > 0
            ? (playerForecasts.reduce((sum, f) => sum + parseFloat(f.score?.brierScore || 0), 0) / totalForecasts).toFixed(3)
            : '--';

        document.getElementById('statForecasts').textContent = totalForecasts;
        document.getElementById('statBrier').textContent = avgBrier;
        document.getElementById('statBestScore').textContent = bestScore;
    }

    updateLeaderboard() {
        const sorted = [...this.leaderboard].sort((a, b) => b.avgScore - a.avgScore);
        const list = document.getElementById('leaderboardList');

        if (sorted.length === 0) {
            list.innerHTML = '<p class="no-scores">No scores yet!</p>';
            return;
        }

        list.innerHTML = sorted.slice(0, 10).map((entry, i) => `
            <div class="leaderboard-entry ${entry.player === this.playerName ? 'current-player' : ''}">
                <span class="rank">#${i + 1}</span>
                <span class="name">${this.sanitize(entry.player)}</span>
                <span class="score">${entry.avgScore} avg</span>
            </div>
        `).join('');
    }

    sanitize(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    loadForecasts() {
        try { return JSON.parse(localStorage.getItem('mesoForecasts')) || []; }
        catch { return []; }
    }

    saveForecasts() {
        localStorage.setItem('mesoForecasts', JSON.stringify(this.forecasts));
    }

    loadLeaderboard() {
        try { return JSON.parse(localStorage.getItem('mesoLeaderboard')) || []; }
        catch { return []; }
    }

    saveLeaderboard() {
        localStorage.setItem('mesoLeaderboard', JSON.stringify(this.leaderboard));
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const checkApp = setInterval(() => {
        if (window.mesoApp) {
            clearInterval(checkApp);
            window.forecastGame = new ForecastGame(window.mesoApp);
        }
    }, 100);
});
