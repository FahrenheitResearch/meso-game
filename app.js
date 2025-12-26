// SPC Mesoanalysis Clone - Main Application Logic

class MesoanalysisApp {
    constructor() {
        // State
        this.currentSector = 14; // Central Plains default
        this.currentParam = 'sbcp'; // Surface-Based CAPE default
        this.currentParamName = 'CAPE - Surface-Based';
        this.timeOffset = 0;
        this.historicDate = null; // YYMMDDHH format for outbreak viewing
        this.historicHourOffset = 0;
        this.useNarrServer = false; // Whether to use NARR server for pre-2020 data
        this.narrServerAvailable = false; // Whether NARR server is running
        this.isLooping = false;
        this.loopInterval = null;
        this.loopFrames = 6;
        this.loopSpeed = 500;
        this.currentLoopFrame = 0;
        this.activeOverlays = ['cnty'];
        this.activeUnderlay = 'none';

        // DOM Elements
        this.paramImg = document.getElementById('paramImg');
        this.underlayImg = document.getElementById('underlayImg');
        this.overlayImgs = [
            document.getElementById('overlayImg1'),
            document.getElementById('overlayImg2'),
            document.getElementById('overlayImg3'),
            document.getElementById('overlayImg4'),
            document.getElementById('overlayImg5'),
            document.getElementById('overlayImg6')
        ];
        this.mapWrapper = document.getElementById('mapWrapper');
        this.currentParamEl = document.getElementById('currentParam');
        this.currentTimeEl = document.getElementById('currentTime');
        this.mapLegend = document.getElementById('mapLegend');

        this.init();
    }

    init() {
        this.setupSectorButtons();
        this.setupParameterMenus();
        this.setupOverlayControls();
        this.setupUnderlayControls();
        this.setupOutbreakControls();
        this.setupTimeControls();
        this.setupAnimationControls();
        this.checkNarrServer();
        this.loadCurrentImage();
        this.updateTimeDisplay();
    }

    // Check if NARR server is available
    async checkNarrServer() {
        try {
            const response = await fetch(`${NARR_SERVER_URL}/health`, {
                method: 'GET',
                mode: 'cors',
                timeout: 3000
            });
            if (response.ok) {
                this.narrServerAvailable = true;
                console.log('NARR server available for historic data');
            }
        } catch (e) {
            this.narrServerAvailable = false;
            console.log('NARR server not available - historic data limited to SPC archive (~5 years)');
        }
    }

    // Check if a date requires NARR server (pre-2020)
    isPreSpcArchive(dateStr) {
        // dateStr format: YYMMDDHH
        const yy = parseInt(dateStr.slice(0, 2));
        // Handle century - 90+ is 1990s, <90 is 2000s
        const year = yy >= 90 ? 1900 + yy : 2000 + yy;
        // SPC archive goes back to roughly mid-2020
        return year < 2020;
    }

    // Check if parameter is available from NARR
    isNarrParam(param) {
        return typeof NARR_PARAMS !== 'undefined' && NARR_PARAMS[param];
    }

    // Sector Selection
    setupSectorButtons() {
        const buttons = document.querySelectorAll('.sector-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentSector = parseInt(btn.dataset.sector);
                this.loadCurrentImage();
            });
        });
    }

    // Parameter Menu System
    setupParameterMenus() {
        Object.keys(PARAMETERS).forEach(catKey => {
            const category = PARAMETERS[catKey];
            const listEl = document.getElementById(`params-${catKey}`);
            const categoryBtn = document.querySelector(`[data-category="${catKey}"]`);

            if (!listEl || !categoryBtn) return;

            // Populate parameter list
            category.params.forEach(param => {
                const item = document.createElement('div');
                item.className = 'param-item';
                item.textContent = param.name;
                item.dataset.code = param.code;
                item.dataset.name = param.name;

                item.addEventListener('click', () => {
                    // Remove active class from all params
                    document.querySelectorAll('.param-item').forEach(p => p.classList.remove('active'));
                    item.classList.add('active');

                    this.currentParam = param.code;
                    this.currentParamName = param.name;
                    this.loadCurrentImage();
                });

                listEl.appendChild(item);
            });

            // Category toggle
            categoryBtn.addEventListener('click', () => {
                categoryBtn.classList.toggle('expanded');
                listEl.classList.toggle('show');
            });
        });

        // Set default active parameter
        const defaultParam = document.querySelector('[data-code="sbcp"]');
        if (defaultParam) {
            defaultParam.classList.add('active');
            // Expand the thermodynamics category
            const thermoBtn = document.querySelector('[data-category="thermo"]');
            const thermoList = document.getElementById('params-thermo');
            if (thermoBtn && thermoList) {
                thermoBtn.classList.add('expanded');
                thermoList.classList.add('show');
            }
        }
    }

    // Filter parameters based on historic mode
    updateParamAvailability() {
        const isHistoric = this.historicDate && this.isPreSpcArchive(this.historicDate);
        const paramItems = document.querySelectorAll('.param-item');
        const categories = document.querySelectorAll('.param-category');

        // Add/remove historic mode class to body for styling
        document.body.classList.toggle('historic-mode', isHistoric && this.narrServerAvailable);

        paramItems.forEach(item => {
            const code = item.dataset.code;
            const isAvailable = !isHistoric || !this.narrServerAvailable || this.isNarrParam(code);

            item.classList.toggle('unavailable', !isAvailable);
            item.style.display = isHistoric && !isAvailable ? 'none' : '';
        });

        // Hide empty categories
        categories.forEach(cat => {
            const list = cat.querySelector('.param-list');
            const visibleItems = list ? list.querySelectorAll('.param-item:not([style*="display: none"])') : [];
            cat.style.display = visibleItems.length === 0 ? 'none' : '';
        });

        // If current param is not available, switch to sbcp
        if (isHistoric && this.narrServerAvailable && !this.isNarrParam(this.currentParam)) {
            const sbcpItem = document.querySelector('[data-code="sbcp"]');
            if (sbcpItem) {
                document.querySelectorAll('.param-item').forEach(p => p.classList.remove('active'));
                sbcpItem.classList.add('active');
                this.currentParam = 'sbcp';
                this.currentParamName = 'CAPE - Surface-Based';
            }
        }

        // Update historic mode indicator
        this.updateHistoricIndicator(isHistoric);
    }

    // Show/hide historic mode indicator
    updateHistoricIndicator(isHistoric) {
        let indicator = document.getElementById('historicIndicator');

        if (isHistoric && this.narrServerAvailable) {
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.id = 'historicIndicator';
                indicator.className = 'historic-indicator';
                indicator.innerHTML = '<span>NARR Historic Mode</span><small>Limited parameters available</small>';
                const controlsPanel = document.querySelector('.controls-panel');
                if (controlsPanel) {
                    controlsPanel.insertBefore(indicator, controlsPanel.firstChild);
                }
            }
            indicator.style.display = 'block';
        } else if (indicator) {
            indicator.style.display = 'none';
        }
    }

    // Overlay Controls
    setupOverlayControls() {
        const checkboxes = document.querySelectorAll('#overlayOptions input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                this.activeOverlays = Array.from(checkboxes)
                    .filter(c => c.checked)
                    .map(c => c.value);
                this.updateOverlays();
            });
        });
    }

    // Underlay Controls
    setupUnderlayControls() {
        const radios = document.querySelectorAll('#underlayOptions input[type="radio"]');
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    this.activeUnderlay = radio.value;
                    this.updateUnderlay();
                }
            });
        });

        // Underlay opacity slider
        const opacitySlider = document.getElementById('underlayOpacity');
        if (opacitySlider) {
            opacitySlider.addEventListener('input', () => {
                this.underlayImg.style.opacity = opacitySlider.value / 100;
            });
            // Set initial opacity
            this.underlayImg.style.opacity = opacitySlider.value / 100;
        }
    }

    // Outbreak Controls
    setupOutbreakControls() {
        const outbreakSelect = document.getElementById('outbreakSelect');
        const outbreakHours = document.getElementById('outbreakHours');

        outbreakSelect.addEventListener('change', () => {
            const dateStr = outbreakSelect.value;
            if (dateStr) {
                this.historicDate = dateStr;
                this.historicHourOffset = 0;
                this.generateOutbreakHourButtons(dateStr);
                this.updateParamAvailability();
                this.loadCurrentImage();
                this.updateTimeDisplay();
            } else {
                this.historicDate = null;
                this.historicHourOffset = 0;
                outbreakHours.innerHTML = '';
                this.updateParamAvailability();
                this.loadCurrentImage();
                this.updateTimeDisplay();
            }
        });
    }

    generateOutbreakHourButtons(baseDateStr) {
        const outbreakHours = document.getElementById('outbreakHours');
        // Generate buttons for -6 to +6 hours from the outbreak peak
        let html = '<div class="hour-buttons">';
        for (let h = -6; h <= 6; h++) {
            const label = h === 0 ? 'Peak' : (h > 0 ? `+${h}h` : `${h}h`);
            const activeClass = h === 0 ? 'active' : '';
            html += `<button class="hour-btn ${activeClass}" data-offset="${h}">${label}</button>`;
        }
        html += '</div>';
        html += '<button class="return-current-btn" id="returnCurrentBtn">Return to Current</button>';
        outbreakHours.innerHTML = html;

        // Add event listeners
        outbreakHours.querySelectorAll('.hour-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                outbreakHours.querySelectorAll('.hour-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.historicHourOffset = parseInt(btn.dataset.offset);
                this.loadCurrentImage();
                this.updateTimeDisplay();
            });
        });

        document.getElementById('returnCurrentBtn').addEventListener('click', () => {
            document.getElementById('outbreakSelect').value = '';
            this.historicDate = null;
            this.historicHourOffset = 0;
            outbreakHours.innerHTML = '';
            this.updateParamAvailability();
            this.loadCurrentImage();
            this.updateTimeDisplay();
        });
    }

    // Time Controls
    setupTimeControls() {
        const timeSelect = document.getElementById('timeOffset');
        timeSelect.addEventListener('change', () => {
            if (this.historicDate) return; // Ignore if viewing outbreak
            this.timeOffset = parseInt(timeSelect.value);
            this.loadCurrentImage();
            this.updateTimeDisplay();
        });
    }

    // Animation Controls
    setupAnimationControls() {
        const loopBtn = document.getElementById('loopBtn');
        const stopBtn = document.getElementById('stopBtn');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const speedSlider = document.getElementById('loopSpeed');
        const framesInput = document.getElementById('loopFrames');

        loopBtn.addEventListener('click', () => this.startLoop());
        stopBtn.addEventListener('click', () => this.stopLoop());
        prevBtn.addEventListener('click', () => this.stepFrame(-1));
        nextBtn.addEventListener('click', () => this.stepFrame(1));

        speedSlider.addEventListener('input', () => {
            this.loopSpeed = parseInt(speedSlider.value);
            if (this.isLooping) {
                this.stopLoop();
                this.startLoop();
            }
        });

        framesInput.addEventListener('change', () => {
            this.loopFrames = parseInt(framesInput.value);
        });
    }

    // Build image URL
    // SPC URL pattern: https://www.spc.noaa.gov/exper/mesoanalysis/s{sector}/{param}/{param}.gif
    // NARR URL pattern: http://localhost:5000/mesoanalysis/{param}/{YYYYMMDDHH}?sector={sector}
    buildImageUrl(param, sector, hourOffset = 0) {
        const timestamp = new Date().getTime();

        // If viewing historic outbreak
        if (this.historicDate) {
            // Combine base offset with any additional offset (for loops)
            const totalOffset = this.historicHourOffset + hourOffset;
            const dateStr = this.adjustHistoricDate(this.historicDate, totalOffset);

            // Check if we should use NARR server for pre-2020 data
            if (this.isPreSpcArchive(dateStr) && this.narrServerAvailable && this.isNarrParam(param)) {
                this.useNarrServer = true;
                // Convert YYMMDDHH to YYYYMMDDHH
                const yy = parseInt(dateStr.slice(0, 2));
                const century = yy >= 90 ? '19' : '20';
                const fullDate = century + dateStr;
                return `${NARR_SERVER_URL}/mesoanalysis/${param}/${fullDate}?sector=${sector}`;
            }

            this.useNarrServer = false;
            return `${SPC_BASE_URL}/s${sector}/${param}/${param}_${dateStr}.gif?${timestamp}`;
        }

        this.useNarrServer = false;
        if (hourOffset === 0) {
            // Current time: /exper/mesoanalysis/s{sector}/{param}/{param}.gif
            return `${SPC_BASE_URL}/s${sector}/${param}/${param}.gif?${timestamp}`;
        } else {
            // Historical: need date-based URL pattern
            const now = new Date();
            now.setHours(now.getHours() + hourOffset);
            const yy = now.getFullYear().toString().slice(-2);
            const mm = (now.getMonth() + 1).toString().padStart(2, '0');
            const dd = now.getDate().toString().padStart(2, '0');
            const hh = now.getHours().toString().padStart(2, '0');
            return `${SPC_BASE_URL}/s${sector}/${param}/${param}_${yy}${mm}${dd}${hh}.gif?${timestamp}`;
        }
    }

    // Adjust historic date by hour offset
    adjustHistoricDate(baseDateStr, hourOffset) {
        // baseDateStr format: YYMMDDHH
        const yy = parseInt(baseDateStr.slice(0, 2));
        const mm = parseInt(baseDateStr.slice(2, 4)) - 1; // JS months are 0-indexed
        const dd = parseInt(baseDateStr.slice(4, 6));
        const hh = parseInt(baseDateStr.slice(6, 8));

        // Handle century - 90+ is 1990s, <90 is 2000s
        const fullYear = yy >= 90 ? 1900 + yy : 2000 + yy;
        const date = new Date(fullYear, mm, dd, hh);
        date.setHours(date.getHours() + hourOffset);

        const newYY = date.getFullYear().toString().slice(-2);
        const newMM = (date.getMonth() + 1).toString().padStart(2, '0');
        const newDD = date.getDate().toString().padStart(2, '0');
        const newHH = date.getHours().toString().padStart(2, '0');

        return `${newYY}${newMM}${newDD}${newHH}`;
    }

    // Build overlay URL
    buildOverlayUrl(overlay, sector) {
        const timestamp = new Date().getTime();

        // For Day 1 outlook in historic mode, try to fetch archived outlook
        if (overlay === 'dy1' && this.historicDate) {
            const dateStr = this.adjustHistoricDate(this.historicDate, this.historicHourOffset);
            const yy = parseInt(dateStr.slice(0, 2));
            const fullYear = yy >= 90 ? 1900 + yy : 2000 + yy;

            // SPC outlook archive goes back to 2003
            if (fullYear >= 2003) {
                const mm = dateStr.slice(2, 4);
                const dd = dateStr.slice(4, 6);
                const hh = dateStr.slice(6, 8);
                // Find nearest outlook time (outlooks issued at 0600, 1300, 1630, 2000Z)
                const hour = parseInt(hh);
                let outlookTime;
                if (hour < 10) outlookTime = '0600';
                else if (hour < 15) outlookTime = '1300';
                else if (hour < 18) outlookTime = '1630';
                else outlookTime = '2000';
                return `https://www.spc.noaa.gov/products/outlook/archive/${fullYear}/day1otlk_${fullYear}${mm}${dd}_${outlookTime}.gif?${timestamp}`;
            }
            // Pre-2003: no archived outlooks available
            return '';
        }

        const overlayMap = {
            cnty: 'cnty/cnty',
            cwa: 'cwa/cwa',
            hwy: 'hiway/hiway',
            artcc: 'artcc/artcc',
            warn: 'warns/warns',
            dy1: 'otlk/otlk',
            rpts: 'rpts/rpts'
        };
        const path = overlayMap[overlay] || `${overlay}/${overlay}`;
        return `${SPC_BASE_URL}/s${sector}/${path}.gif?${timestamp}`;
    }

    // Build underlay URL
    buildUnderlayUrl(underlay, sector) {
        if (underlay === 'none') return '';
        const timestamp = new Date().getTime();
        const underlayMap = {
            rad: 'rgnlrad/rgnlrad',
            topo: 'topo/topo',
            pop: 'population/population',
            sfc: 'bigsfc/bigsfc'
        };
        const path = underlayMap[underlay] || `${underlay}/${underlay}`;
        return `${SPC_BASE_URL}/s${sector}/${path}.gif?${timestamp}`;
    }

    // Load current image
    loadCurrentImage() {
        this.mapWrapper.classList.add('loading');

        // Check if pre-2020 outbreak without NARR server
        if (this.historicDate && this.isPreSpcArchive(this.historicDate) && !this.narrServerAvailable) {
            this.showNarrRequiredMessage();
            return;
        }

        const url = this.buildImageUrl(this.currentParam, this.currentSector, this.timeOffset);
        const isHistoric = this.historicDate && this.isPreSpcArchive(this.historicDate);

        // Clear current image immediately to prevent flash when switching modes
        this.paramImg.style.opacity = '0';

        this.paramImg.onload = () => {
            this.paramImg.style.opacity = '1';
            this.mapWrapper.classList.remove('loading');
            this.hideNarrMessage();
            this.updateLegend();
        };

        this.paramImg.onerror = () => {
            this.paramImg.style.opacity = '1';
            this.mapWrapper.classList.remove('loading');
            console.error('Failed to load image:', url);
            // Try without time offset
            if (this.timeOffset !== 0) {
                this.paramImg.src = this.buildImageUrl(this.currentParam, this.currentSector, 0);
            }
        };

        this.paramImg.src = url;
        this.currentParamEl.textContent = this.currentParamName + (this.useNarrServer ? ' (NARR)' : '');
        this.updateOverlays(isHistoric);
        this.updateUnderlay(isHistoric);
    }

    // Show message when NARR server is required
    showNarrRequiredMessage() {
        this.mapWrapper.classList.remove('loading');
        let msg = document.getElementById('narrMessage');
        if (!msg) {
            msg = document.createElement('div');
            msg.id = 'narrMessage';
            msg.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff3cd;border:2px solid #ffc107;padding:20px;border-radius:8px;text-align:center;z-index:100;max-width:80%;';
            msg.innerHTML = `
                <h3 style="margin:0 0 10px 0;color:#856404;">NARR Server Required</h3>
                <p style="margin:0 0 10px 0;color:#856404;">This classic outbreak (pre-2020) requires the NARR data server.</p>
                <p style="margin:0;font-size:12px;color:#666;">
                    Run: <code style="background:#eee;padding:2px 6px;border-radius:3px;">cd server && python app.py</code><br>
                    Then refresh this page.
                </p>
            `;
            this.mapWrapper.appendChild(msg);
        }
        msg.style.display = 'block';
        this.paramImg.src = '';
    }

    // Hide NARR required message
    hideNarrMessage() {
        const msg = document.getElementById('narrMessage');
        if (msg) msg.style.display = 'none';
    }

    // Update overlays
    updateOverlays(isHistoric = false) {
        // Hide all overlay images first
        this.overlayImgs.forEach(img => {
            img.src = '';
            img.style.display = 'none';
        });

        // Overlays that don't work for historic mode (they show current data)
        // Note: dy1 now works for 2003+ via SPC archive
        const currentOnlyOverlays = ['warn', 'rpts', 'wch'];

        // Load active overlays
        let imgIndex = 0;
        this.activeOverlays.forEach((overlay) => {
            // Skip current-only overlays in historic mode
            if (isHistoric && currentOnlyOverlays.includes(overlay)) {
                return;
            }
            if (imgIndex < this.overlayImgs.length) {
                const url = this.buildOverlayUrl(overlay, this.currentSector);
                // Skip if URL is empty (e.g., pre-2003 outlook)
                if (!url) return;
                this.overlayImgs[imgIndex].src = url;
                this.overlayImgs[imgIndex].style.display = 'block';
                imgIndex++;
            }
        });

        // Update overlay checkboxes to show unavailable state in historic mode
        const overlayCheckboxes = document.querySelectorAll('#overlayOptions input[type="checkbox"]');
        overlayCheckboxes.forEach(cb => {
            const overlay = cb.value;
            const label = cb.parentElement;
            if (isHistoric && currentOnlyOverlays.includes(overlay)) {
                label.style.opacity = '0.5';
                label.title = 'Not available for historic outbreaks';
            } else {
                label.style.opacity = '1';
                label.title = '';
            }
        });
    }

    // Update underlay
    updateUnderlay(isHistoric = false) {
        const url = this.buildUnderlayUrl(this.activeUnderlay, this.currentSector);
        if (url) {
            this.underlayImg.src = url;
            this.underlayImg.style.display = 'block';
        } else {
            this.underlayImg.src = '';
            this.underlayImg.style.display = 'none';
        }
    }

    // Update legend
    updateLegend() {
        const sectorName = SECTORS[this.currentSector]?.name || `Sector ${this.currentSector}`;

        // Legend is in the map image
        this.mapLegend.innerHTML = '';

        // Update scale label
        const scaleLabel = document.getElementById('scaleLabel');
        if (scaleLabel) {
            scaleLabel.textContent = `${this.currentParamName} | ${sectorName} | Data: NOAA/NWS Storm Prediction Center`;
        }
    }

    // Update time display
    updateTimeDisplay() {
        let displayDate;

        if (this.historicDate) {
            // Show historic outbreak date
            const dateStr = this.adjustHistoricDate(this.historicDate, this.historicHourOffset);
            const yy = parseInt(dateStr.slice(0, 2));
            const mm = parseInt(dateStr.slice(2, 4)) - 1;
            const dd = parseInt(dateStr.slice(4, 6));
            const hh = parseInt(dateStr.slice(6, 8));
            displayDate = new Date(2000 + yy, mm, dd, hh);
        } else {
            displayDate = new Date();
            displayDate.setMinutes(0, 0, 0);
            displayDate.setHours(displayDate.getHours() + this.timeOffset);
        }

        const options = {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        };

        const prefix = this.historicDate ? 'HISTORIC - ' : '';
        this.currentTimeEl.textContent = `${prefix}Valid: ${displayDate.toLocaleString('en-US', options)}`;
    }

    // Animation loop
    startLoop() {
        if (this.isLooping) return;

        this.isLooping = true;
        document.getElementById('loopBtn').classList.add('active');
        this.currentLoopFrame = 0;

        // Preload frames
        // NARR has 3-hourly data, so use 3-hour steps for pre-2020 historic
        const isNarrMode = this.historicDate &&
                           this.isPreSpcArchive(this.historicDate) &&
                           this.narrServerAvailable;
        const stepSize = isNarrMode ? 3 : 1;

        this.loopFrameUrls = [];
        this.loopFrameOffsets = [];
        for (let i = 0; i < this.loopFrames; i++) {
            const offset = -i * stepSize;
            this.loopFrameUrls.push(this.buildImageUrl(this.currentParam, this.currentSector, offset));
            this.loopFrameOffsets.push(offset);
        }

        // Preload images
        this.loopFrameUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });

        this.loopInterval = setInterval(() => {
            this.currentLoopFrame = (this.currentLoopFrame + 1) % this.loopFrames;
            this.paramImg.src = this.loopFrameUrls[this.currentLoopFrame];

            // Update time display for current frame
            const currentOffset = this.loopFrameOffsets[this.currentLoopFrame];
            let displayDate;
            if (this.historicDate) {
                // Historic mode - calculate date from historic base
                const dateStr = this.adjustHistoricDate(this.historicDate, this.historicHourOffset + currentOffset);
                const yy = parseInt(dateStr.slice(0, 2));
                const fullYear = yy >= 90 ? 1900 + yy : 2000 + yy;
                displayDate = new Date(fullYear,
                    parseInt(dateStr.slice(2, 4)) - 1,
                    parseInt(dateStr.slice(4, 6)),
                    parseInt(dateStr.slice(6, 8)));
            } else {
                displayDate = new Date();
                displayDate.setMinutes(0, 0, 0);
                displayDate.setHours(displayDate.getHours() + currentOffset);
            }
            const options = {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
            };
            const prefix = this.historicDate ? 'HISTORIC - ' : '';
            this.currentTimeEl.textContent = `${prefix}Valid: ${displayDate.toLocaleString('en-US', options)}`;
        }, this.loopSpeed);
    }

    stopLoop() {
        if (!this.isLooping) return;

        this.isLooping = false;
        document.getElementById('loopBtn').classList.remove('active');

        if (this.loopInterval) {
            clearInterval(this.loopInterval);
            this.loopInterval = null;
        }

        // Reset to current time
        this.loadCurrentImage();
    }

    stepFrame(direction) {
        this.stopLoop();

        const timeSelect = document.getElementById('timeOffset');
        const options = Array.from(timeSelect.options);
        const currentIndex = options.findIndex(opt => opt.value === timeSelect.value);

        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = 0;
        if (newIndex >= options.length) newIndex = options.length - 1;

        timeSelect.selectedIndex = newIndex;
        this.timeOffset = parseInt(timeSelect.value);
        this.loadCurrentImage();
        this.updateTimeDisplay();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mesoApp = new MesoanalysisApp();
});
