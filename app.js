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
        this.loadCurrentImage();
        this.updateTimeDisplay();
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
                this.loadCurrentImage();
                this.updateTimeDisplay();
            } else {
                this.historicDate = null;
                this.historicHourOffset = 0;
                outbreakHours.innerHTML = '';
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
    buildImageUrl(param, sector, hourOffset = 0) {
        const timestamp = new Date().getTime();

        // If viewing historic outbreak
        if (this.historicDate) {
            const dateStr = this.adjustHistoricDate(this.historicDate, this.historicHourOffset);
            return `${SPC_BASE_URL}/s${sector}/${param}/${param}_${dateStr}.gif?${timestamp}`;
        }

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

        const date = new Date(2000 + yy, mm, dd, hh);
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

        const url = this.buildImageUrl(this.currentParam, this.currentSector, this.timeOffset);

        this.paramImg.onload = () => {
            this.mapWrapper.classList.remove('loading');
            this.updateLegend();
        };

        this.paramImg.onerror = () => {
            this.mapWrapper.classList.remove('loading');
            console.error('Failed to load image:', url);
            // Try without time offset
            if (this.timeOffset !== 0) {
                this.paramImg.src = this.buildImageUrl(this.currentParam, this.currentSector, 0);
            }
        };

        this.paramImg.src = url;
        this.currentParamEl.textContent = this.currentParamName;
        this.updateOverlays();
        this.updateUnderlay();
    }

    // Update overlays
    updateOverlays() {
        // Hide all overlay images first
        this.overlayImgs.forEach(img => {
            img.src = '';
            img.style.display = 'none';
        });

        // Load active overlays
        this.activeOverlays.forEach((overlay, index) => {
            if (index < this.overlayImgs.length) {
                const url = this.buildOverlayUrl(overlay, this.currentSector);
                this.overlayImgs[index].src = url;
                this.overlayImgs[index].style.display = 'block';
            }
        });
    }

    // Update underlay
    updateUnderlay() {
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
        this.loopFrameUrls = [];
        for (let i = 0; i < this.loopFrames; i++) {
            const offset = -i;
            this.loopFrameUrls.push(this.buildImageUrl(this.currentParam, this.currentSector, offset));
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
            const now = new Date();
            now.setMinutes(0, 0, 0);
            now.setHours(now.getHours() - this.currentLoopFrame);
            const options = {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
            };
            this.currentTimeEl.textContent = `Valid: ${now.toLocaleString('en-US', options)}`;
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
