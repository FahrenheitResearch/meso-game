// Custom readable legends for SPC parameters
// Since embedded legends are too small, we render our own

const LEGENDS = {
    // Thermodynamics - CAPE
    sbcp: {
        title: "Surface-Based CAPE (J/kg)",
        stops: [
            { color: "#ffffff", label: "0" },
            { color: "#c8ffc8", label: "250" },
            { color: "#00ff00", label: "500" },
            { color: "#00c800", label: "1000" },
            { color: "#009600", label: "1500" },
            { color: "#ffff00", label: "2000" },
            { color: "#ffc800", label: "2500" },
            { color: "#ff9600", label: "3000" },
            { color: "#ff0000", label: "4000" },
            { color: "#c80000", label: "5000+" }
        ]
    },
    mlcp: {
        title: "100mb Mixed-Layer CAPE (J/kg)",
        stops: [
            { color: "#ffffff", label: "0" },
            { color: "#c8ffc8", label: "250" },
            { color: "#00ff00", label: "500" },
            { color: "#00c800", label: "1000" },
            { color: "#009600", label: "1500" },
            { color: "#ffff00", label: "2000" },
            { color: "#ffc800", label: "2500" },
            { color: "#ff9600", label: "3000" },
            { color: "#ff0000", label: "4000" },
            { color: "#c80000", label: "5000+" }
        ]
    },
    mucp: {
        title: "Most-Unstable CAPE (J/kg)",
        stops: [
            { color: "#ffffff", label: "0" },
            { color: "#c8ffc8", label: "250" },
            { color: "#00ff00", label: "500" },
            { color: "#00c800", label: "1000" },
            { color: "#009600", label: "1500" },
            { color: "#ffff00", label: "2000" },
            { color: "#ffc800", label: "2500" },
            { color: "#ff9600", label: "3000" },
            { color: "#ff0000", label: "4000" },
            { color: "#c80000", label: "5000+" }
        ]
    },
    dcape: {
        title: "Downdraft CAPE (J/kg)",
        stops: [
            { color: "#c8c8c8", label: "0" },
            { color: "#96c8ff", label: "200" },
            { color: "#00c8ff", label: "400" },
            { color: "#00ff00", label: "600" },
            { color: "#ffff00", label: "800" },
            { color: "#ff9600", label: "1000" },
            { color: "#ff0000", label: "1200" },
            { color: "#c80000", label: "1500+" }
        ]
    },

    // Composite Indices
    scp: {
        title: "Supercell Composite",
        stops: [
            { color: "#c8c8c8", label: "0" },
            { color: "#96ffff", label: "1" },
            { color: "#00c8ff", label: "2" },
            { color: "#00ff00", label: "4" },
            { color: "#ffff00", label: "6" },
            { color: "#ff9600", label: "8" },
            { color: "#ff0000", label: "10" },
            { color: "#ff00ff", label: "15+" }
        ]
    },
    stpc: {
        title: "Sig Tornado Parameter (effective)",
        stops: [
            { color: "#c8c8c8", label: "0" },
            { color: "#96c896", label: "0.5" },
            { color: "#00ff00", label: "1" },
            { color: "#ffff00", label: "2" },
            { color: "#ffc800", label: "3" },
            { color: "#ff9600", label: "4" },
            { color: "#ff0000", label: "6" },
            { color: "#ff00ff", label: "8" },
            { color: "#c800c8", label: "10+" }
        ]
    },
    stor: {
        title: "Sig Tornado Parameter (fixed)",
        stops: [
            { color: "#c8c8c8", label: "0" },
            { color: "#96c896", label: "0.5" },
            { color: "#00ff00", label: "1" },
            { color: "#ffff00", label: "2" },
            { color: "#ffc800", label: "3" },
            { color: "#ff9600", label: "4" },
            { color: "#ff0000", label: "6" },
            { color: "#ff00ff", label: "8+" }
        ]
    },
    sigh: {
        title: "Significant Hail Parameter",
        stops: [
            { color: "#c8c8c8", label: "0" },
            { color: "#96ff96", label: "0.5" },
            { color: "#00ff00", label: "1" },
            { color: "#ffff00", label: "2" },
            { color: "#ff9600", label: "3" },
            { color: "#ff0000", label: "4" },
            { color: "#ff00ff", label: "5+" }
        ]
    },

    // Wind Shear
    eshr: {
        title: "Effective Bulk Shear (kt)",
        stops: [
            { color: "#c8c8c8", label: "0" },
            { color: "#96ffff", label: "10" },
            { color: "#00c8ff", label: "20" },
            { color: "#00ff00", label: "30" },
            { color: "#ffff00", label: "40" },
            { color: "#ff9600", label: "50" },
            { color: "#ff0000", label: "60" },
            { color: "#ff00ff", label: "70+" }
        ]
    },
    shr6: {
        title: "0-6km Bulk Shear (kt)",
        stops: [
            { color: "#c8c8c8", label: "0" },
            { color: "#96ffff", label: "10" },
            { color: "#00c8ff", label: "20" },
            { color: "#00ff00", label: "30" },
            { color: "#ffff00", label: "40" },
            { color: "#ff9600", label: "50" },
            { color: "#ff0000", label: "60" },
            { color: "#ff00ff", label: "70+" }
        ]
    },
    shr1: {
        title: "0-1km Bulk Shear (kt)",
        stops: [
            { color: "#c8c8c8", label: "0" },
            { color: "#96ffff", label: "5" },
            { color: "#00c8ff", label: "10" },
            { color: "#00ff00", label: "15" },
            { color: "#ffff00", label: "20" },
            { color: "#ff9600", label: "25" },
            { color: "#ff0000", label: "30" },
            { color: "#ff00ff", label: "35+" }
        ]
    },
    effh: {
        title: "Effective SRH (m²/s²)",
        stops: [
            { color: "#c8c8c8", label: "0" },
            { color: "#96ff96", label: "50" },
            { color: "#00ff00", label: "100" },
            { color: "#ffff00", label: "200" },
            { color: "#ffc800", label: "300" },
            { color: "#ff9600", label: "400" },
            { color: "#ff0000", label: "500" },
            { color: "#ff00ff", label: "600+" }
        ]
    },
    srh1: {
        title: "0-1km SRH (m²/s²)",
        stops: [
            { color: "#c8c8c8", label: "0" },
            { color: "#96ff96", label: "50" },
            { color: "#00ff00", label: "100" },
            { color: "#ffff00", label: "150" },
            { color: "#ffc800", label: "200" },
            { color: "#ff9600", label: "300" },
            { color: "#ff0000", label: "400" },
            { color: "#ff00ff", label: "500+" }
        ]
    },
    srh3: {
        title: "0-3km SRH (m²/s²)",
        stops: [
            { color: "#c8c8c8", label: "0" },
            { color: "#96ff96", label: "100" },
            { color: "#00ff00", label: "200" },
            { color: "#ffff00", label: "300" },
            { color: "#ffc800", label: "400" },
            { color: "#ff9600", label: "500" },
            { color: "#ff0000", label: "600" },
            { color: "#ff00ff", label: "700+" }
        ]
    },

    // Lapse Rates
    laps: {
        title: "700-500mb Lapse Rate (°C/km)",
        stops: [
            { color: "#00c8ff", label: "4" },
            { color: "#00ff00", label: "5" },
            { color: "#96ff00", label: "6" },
            { color: "#ffff00", label: "7" },
            { color: "#ffc800", label: "7.5" },
            { color: "#ff9600", label: "8" },
            { color: "#ff0000", label: "8.5" },
            { color: "#c80000", label: "9+" }
        ]
    },
    lllr: {
        title: "0-3km Lapse Rate (°C/km)",
        stops: [
            { color: "#00c8ff", label: "4" },
            { color: "#00ff00", label: "5" },
            { color: "#96ff00", label: "6" },
            { color: "#ffff00", label: "7" },
            { color: "#ffc800", label: "7.5" },
            { color: "#ff9600", label: "8" },
            { color: "#ff0000", label: "8.5" },
            { color: "#c80000", label: "9+" }
        ]
    },

    // Heavy Rain
    pwtr: {
        title: "Precipitable Water (inches)",
        stops: [
            { color: "#c8c8c8", label: "0" },
            { color: "#c8ffc8", label: "0.5" },
            { color: "#00ff00", label: "1.0" },
            { color: "#00c800", label: "1.5" },
            { color: "#ffff00", label: "2.0" },
            { color: "#ff9600", label: "2.5" },
            { color: "#ff0000", label: "3.0" },
            { color: "#ff00ff", label: "3.5+" }
        ]
    },

    // LCL
    lclh: {
        title: "LCL Height (m AGL)",
        stops: [
            { color: "#ff0000", label: "250" },
            { color: "#ff9600", label: "500" },
            { color: "#ffff00", label: "750" },
            { color: "#00ff00", label: "1000" },
            { color: "#00c8ff", label: "1500" },
            { color: "#0096ff", label: "2000" },
            { color: "#9696ff", label: "2500" },
            { color: "#c8c8c8", label: "3000+" }
        ]
    },

    // EHI
    ehi1: {
        title: "0-1km EHI",
        stops: [
            { color: "#c8c8c8", label: "0" },
            { color: "#96ff96", label: "0.5" },
            { color: "#00ff00", label: "1" },
            { color: "#ffff00", label: "2" },
            { color: "#ff9600", label: "3" },
            { color: "#ff0000", label: "4" },
            { color: "#ff00ff", label: "5+" }
        ]
    },

    // Lifted Index
    muli: {
        title: "Surface Lifted Index (°C)",
        stops: [
            { color: "#ff00ff", label: "-10" },
            { color: "#ff0000", label: "-8" },
            { color: "#ff9600", label: "-6" },
            { color: "#ffff00", label: "-4" },
            { color: "#00ff00", label: "-2" },
            { color: "#00c8ff", label: "0" },
            { color: "#c8c8c8", label: "+2" },
            { color: "#9696ff", label: "+4+" }
        ]
    }
};

// Render a legend for the given parameter
function renderLegend(paramCode) {
    const legend = LEGENDS[paramCode];
    if (!legend) {
        return `<div class="custom-legend no-legend">
            <span class="legend-title">Scale shown in map image</span>
        </div>`;
    }

    let stopsHtml = legend.stops.map(stop =>
        `<div class="legend-stop">
            <div class="legend-color" style="background:${stop.color}"></div>
            <span class="legend-label">${stop.label}</span>
        </div>`
    ).join('');

    return `<div class="custom-legend">
        <div class="legend-title">${legend.title}</div>
        <div class="legend-bar">${stopsHtml}</div>
    </div>`;
}
