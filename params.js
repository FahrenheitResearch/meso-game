// SPC Mesoanalysis Parameters - Complete Definition
// All parameters from https://www.spc.noaa.gov/exper/mesoanalysis/

const PARAMETERS = {
    obs: {
        name: "Observations",
        params: [
            { code: "bigsfc", name: "Surface Observations" },
            { code: "1kmv", name: "Visible Satellite" },
            { code: "rgnlrad", name: "Radar Base Reflectivity" }
        ]
    },
    sfc: {
        name: "Surface",
        params: [
            { code: "pmsl", name: "MSL Pressure/Wind" },
            { code: "ttd", name: "Temp/Wind/Dwpt" },
            { code: "mcon", name: "MSL Pressure/Theta-E/Wind" },
            { code: "thea", name: "Moisture Convergence" },
            { code: "thadv", name: "Theta-E Advection" },
            { code: "mxth", name: "Mixing Ratio / Theta" },
            { code: "icon", name: "Inst Contraction Rate (Sfc)" },
            { code: "trap", name: "Fluid Trapping (Sfc)" },
            { code: "vtm", name: "Velocity Tensor Magnitude (Sfc)" },
            { code: "dvvr", name: "Divergence and Vorticity (Sfc)" },
            { code: "def", name: "Deformation and Axes of Dilation" },
            { code: "pchg", name: "2-hour Pressure Change" },
            { code: "temp_chg", name: "3-hour Temp Change" },
            { code: "dwpt_chg", name: "3-hour Dwpt Change" },
            { code: "mixr_chg", name: "3-hour 100mb MixR Change" },
            { code: "thte_chg", name: "3-hour Theta-E Change" }
        ]
    },
    upper: {
        name: "Upper Air",
        params: [
            { code: "925mb", name: "925mb Analysis" },
            { code: "850mb", name: "850mb Analysis" },
            { code: "850mb2", name: "850mb Analysis (v2)" },
            { code: "700mb", name: "700mb Analysis" },
            { code: "500mb", name: "500mb Analysis" },
            { code: "300mb", name: "300mb Analysis" },
            { code: "dlcp", name: "Deep Moist Convergence" },
            { code: "tadv_925", name: "925mb Temp Advection" },
            { code: "tadv", name: "850mb Temp Advection" },
            { code: "7tad", name: "700mb Temp/Advection" },
            { code: "sfnt", name: "Sfc Frontogenesis" },
            { code: "9fnt", name: "925mb Frontogenesis" },
            { code: "8fnt", name: "850mb Frontogenesis" },
            { code: "7fnt", name: "700mb Frontogenesis" },
            { code: "98ft", name: "1000-925mb Frontogenesis" },
            { code: "89ft", name: "925-850mb Frontogenesis" },
            { code: "857f", name: "850-700mb Frontogenesis" },
            { code: "75ft", name: "700-500mb Frontogenesis" },
            { code: "vadv", name: "700-400mb Diff Vort Advection" },
            { code: "padv", name: "400-250mb Pot Vort Advection" },
            { code: "ddiv", name: "850-250mb Diff Divergence" },
            { code: "ageo", name: "300mb Jet Circulation" },
            { code: "500mb_chg", name: "12-hour 500mb Height Change" },
            { code: "trap_500", name: "Fluid Trapping (500mb)" },
            { code: "trap_250", name: "Fluid Trapping (250mb)" }
        ]
    },
    thermo: {
        name: "Thermodynamics",
        params: [
            { code: "sbcp", name: "CAPE - Surface-Based" },
            { code: "mlcp", name: "CAPE - 100mb Mixed-Layer" },
            { code: "mucp", name: "CAPE - Most-Unstable / LPL Height" },
            { code: "eltm", name: "EL Temp / MUCAPE / MUCIN" },
            { code: "ncap", name: "CAPE - Normalized" },
            { code: "dcape", name: "CAPE - Downdraft" },
            { code: "muli", name: "Surface-Based Lifted Index" },
            { code: "laps", name: "Mid-Level Lapse Rates (700-500)" },
            { code: "lllr", name: "Low-Level Lapse Rates (0-3km)" },
            { code: "lr3c", name: "Max 2-6km AGL Lapse Rate" },
            { code: "tdlr", name: "Temp/Dwpt Lapse Rates" },
            { code: "lclh", name: "LCL Height" },
            { code: "lfch", name: "LFC Height" },
            { code: "lfrh", name: "LCL-LFC Mean RH" },
            { code: "sbcp_chg", name: "3-hour SB CAPE Change" },
            { code: "mlcp_chg", name: "3-hour ML CAPE Change" },
            { code: "mucp_chg", name: "3-hour MU CAPE Change" },
            { code: "lllr_chg", name: "3-hour Low-Level LR Change" },
            { code: "laps_chg", name: "6-hour Mid-Level LR Change" }
        ]
    },
    shear: {
        name: "Wind Shear",
        params: [
            { code: "eshr", name: "Bulk Shear - Effective" },
            { code: "shr1", name: "Bulk Shear - Sfc-1km" },
            { code: "shr3", name: "Bulk Shear - Sfc-3km" },
            { code: "shr6", name: "Bulk Shear - Sfc-6km" },
            { code: "shr8", name: "Bulk Shear - Sfc-8km" },
            { code: "brns", name: "BRN Shear" },
            { code: "effh", name: "SR Helicity - Effective" },
            { code: "srh5", name: "SR Helicity - Sfc-500m" },
            { code: "srh1", name: "SR Helicity - Sfc-1km" },
            { code: "srh3", name: "SR Helicity - Sfc-3km" },
            { code: "llsr", name: "SR Wind - Sfc-2km" },
            { code: "mlsr", name: "SR Wind - 4-6km" },
            { code: "ulsr", name: "SR Wind - 9-11km" },
            { code: "alsr", name: "SR Wind - Anvil Level" },
            { code: "mnwd", name: "850-300mb Mean Wind" },
            { code: "xover", name: "850 and 500mb Winds" },
            { code: "hodo", name: "Hodograph Map" }
        ]
    },
    comp: {
        name: "Composite Indices",
        params: [
            { code: "scp", name: "Supercell Composite" },
            { code: "lscp", name: "Supercell Composite (left-moving)" },
            { code: "stor", name: "Sgfnt Tornado (fixed layer)" },
            { code: "stpc", name: "Sgfnt Tornado (effective layer)" },
            { code: "stpc5", name: "Sgfnt Tornado (0-500m SRH)" },
            { code: "cpsh", name: "Cond Prob Sigtor (Eqn 1)" },
            { code: "cpsh2", name: "Cond Prob Sigtor (Eqn 2)" },
            { code: "nstp", name: "Non-Supercell Tornado" },
            { code: "vtp", name: "Violent Tornado Parameter (VTP)" },
            { code: "sigh", name: "Sgfnt Hail" },
            { code: "sars1", name: "SARS Hail Size" },
            { code: "sars2", name: "SARS Sig Hail Percentage" },
            { code: "lhp", name: "Large Hail Parameter" },
            { code: "dcp", name: "Derecho Composite" },
            { code: "cbsig", name: "Craven/Brooks Sgfnt Severe" },
            { code: "brn", name: "Bulk Richardson Number" },
            { code: "mcsm", name: "MCS Maintenance" },
            { code: "mbcp", name: "Microburst Composite" },
            { code: "desp", name: "Enhanced Stretching Potential" },
            { code: "ehi1", name: "EHI - Sfc-1km" },
            { code: "ehi3", name: "EHI - Sfc-3km" },
            { code: "vgp", name: "VGP - Sfc-3km" },
            { code: "crit", name: "Critical Angle" },
            { code: "qlcs1", name: "QLCS Tornado Parameter 1" },
            { code: "qlcs2", name: "QLCS Tornado Parameter 2" }
        ]
    },
    multi: {
        name: "Multi-Parameter Fields",
        params: [
            { code: "mlcp_eshr", name: "100mb ML CAPE / Eff Shear" },
            { code: "mucp_eshr", name: "MU CAPE / Eff Shear" },
            { code: "lcls", name: "LCL Height / Sfc-1km SRH" },
            { code: "lr3c_mlcp", name: "Sfc-3km LR / Sfc-3km MLCAPE" },
            { code: "shr3_mlcp", name: "Sfc-3km Shear / Sfc-3km MLCAPE" },
            { code: "dvvr_mlcp", name: "Sfc Vort / Sfc-3km MLCAPE" },
            { code: "3cvr", name: "Sfc Dwpt / 700-500mb LR" }
        ]
    },
    rain: {
        name: "Heavy Rain",
        params: [
            { code: "pwtr", name: "Precipitable Water" },
            { code: "tran", name: "PW / 850mb Moisture Transport" },
            { code: "tran_925", name: "925mb Moisture Transport" },
            { code: "tran_925-850", name: "925-850mb Moisture Transport" },
            { code: "prop", name: "Upwind Propagation Vector" },
            { code: "peff", name: "Precipitation Efficiency" },
            { code: "mixr", name: "100mb Mean Mixing Ratio" }
        ]
    },
    winter: {
        name: "Winter Weather",
        params: [
            { code: "fzlv", name: "Near-Freezing Sfc Temp" },
            { code: "swbt", name: "Surface Wet-Bulb Temp" },
            { code: "fztp", name: "Freezing Level" },
            { code: "thck", name: "Critical Thicknesses" },
            { code: "epvl", name: "800-750mb EPVg" },
            { code: "epvm", name: "650-500mb EPVg" },
            { code: "les1", name: "Lake Effect Snow 1" },
            { code: "les2", name: "Lake Effect Snow 2" },
            { code: "snsq", name: "Snow Squall Parameter" },
            { code: "dend", name: "Dendritic Growth Layer Depth" },
            { code: "mxwb", name: "Max Wet Bulb Temperature" }
        ]
    },
    fire: {
        name: "Fire Weather",
        params: [
            { code: "sfir", name: "Sfc RH / Temp / Wind" },
            { code: "fosb", name: "Fosberg Index" },
            { code: "lfrh2", name: "LCL-LFC Mean RH (Fire Wx)" },
            { code: "pblh", name: "PBL Height" },
            { code: "lasi", name: "Lower Atmos Severity Index" }
        ]
    },
    classic: {
        name: "Classic",
        params: [
            { code: "ttot", name: "Total Totals" },
            { code: "kidx", name: "K-Index" },
            { code: "show", name: "Showalter Index" },
            { code: "swet", name: "SWEAT Index" }
        ]
    },
    beta: {
        name: "Beta",
        params: [
            { code: "sherbe", name: "SHERBE" },
            { code: "moshe", name: "Modified SHERBE" },
            { code: "cwasp", name: "CWASP" },
            { code: "tehi", name: "Tornadic 0-1km EHI" },
            { code: "tts", name: "Tornadic Tilting & Stretching" },
            { code: "oprh", name: "OPRH" }
        ]
    }
};

// Sector definitions with names (actual SPC sector numbers)
// Note: Geographic coverage is defined by SPC, not customizable
const SECTORS = {
    11: { name: "Northwest", abbr: "nw" },
    12: { name: "Southwest", abbr: "sw" },
    13: { name: "Northern Plains", abbr: "np" },
    14: { name: "Central Plains", abbr: "cp" },
    15: { name: "Southern Plains", abbr: "sp" },
    16: { name: "Northeast", abbr: "ne" },
    17: { name: "Mid-Atlantic", abbr: "ma" },
    18: { name: "Southeast", abbr: "se" },
    19: { name: "National", abbr: "us" },
    20: { name: "Midwest", abbr: "mw" },
    21: { name: "Great Lakes", abbr: "gl" },
    22: { name: "Great Basin", abbr: "gb" }
};

// Overlay definitions
const OVERLAYS = {
    cnty: { name: "County Boundaries", file: "cnty" },
    cwa: { name: "County Warning Areas", file: "cwa" },
    hwy: { name: "Highways & Cities", file: "hiway" },
    artcc: { name: "ARTCC Regions", file: "artcc" },
    warn: { name: "NWS Watches/Warnings", file: "warns" },
    dy1: { name: "SPC Day1 Outlook", file: "otlk" },
    rpts: { name: "Storm Reports", file: "rpts" }
};

// Underlay definitions
const UNDERLAYS = {
    none: { name: "None", file: null },
    rad: { name: "Radar", file: "rgnlrad" },
    topo: { name: "Terrain", file: "topo" },
    pop: { name: "Population", file: "population" },
    sfc: { name: "Surface Obs", file: "bigsfc" }
};

// Base URL for SPC imagery
const SPC_BASE_URL = "https://www.spc.noaa.gov/exper/mesoanalysis";

// NARR server for historic data (pre-2020)
// Set this to your local server URL when running the NARR server
const NARR_SERVER_URL = "http://localhost:5000";

// Parameters available from NARR server (pre-2020 historic data)
//
// IMPORTANT: NARR has limited derived products compared to SPC realtime.
// Many SPC params that look different are actually the SAME underlying NARR data:
//   - ALL CAPE variants (sbcp/mlcp/mucp) → single NARR 'cape' field
//   - ALL SRH variants (srh1/srh3/srh5/effh) → single NARR 'hlcy' (0-3km only)
//   - ALL shear variants (shr1/shr3/shr6/shr8/eshr/brns) → single NARR 'vwsh'
//   - Lapse rates (laps/lllr) → using 'lftx4' as proxy (not actual lapse rates)
//
// We only expose DISTINCT parameters to avoid confusion:

const NARR_PARAMS = {
    // ===== THERMODYNAMICS (distinct fields) =====
    'sbcp': true,   // CAPE (NARR single field - represents all CAPE types)
    'ncin': true,   // CIN
    'muli': true,   // Surface Lifted Index

    // ===== HELICITY (single NARR field) =====
    'srh3': true,   // 0-3km SRH (NARR only has 0-3km helicity)

    // ===== MOISTURE (distinct fields) =====
    'pwtr': true,   // Precipitable Water
    'dwpt': true,   // Surface Dewpoint
    'mcon': true,   // Moisture Convergence
    'mixr': true,   // Mixing Ratio (specific humidity)

    // ===== WIND/SHEAR (single NARR shear field) =====
    'shr6': true,   // Bulk Shear (NARR has single vertical shear field)

    // ===== SURFACE (distinct fields) =====
    'pmsl': true,   // MSL Pressure
    'temp': true,   // Surface Temperature

    // ===== BOUNDARY LAYER =====
    'pblh': true,   // PBL Height

    // ===== CLOUDS (distinct fields) =====
    'tcdc': true,   // Total Cloud Cover
    'lcdc': true,   // Low Cloud Cover
    'mcdc': true,   // Mid Cloud Cover
    'hcdc': true,   // High Cloud Cover

    // ===== FIRE/SURFACE =====
    'sfir': true,   // Surface RH

    // ===== DIRECT NARR VARIABLES =====
    // These are the actual distinct NARR fields available:
    'cape': true,
    'cin': true,
    'hlcy': true,
    'lftx4': true,
    'pr_wtr': true,
    'dpt': true,
    'air': true,
    'rhum': true,
    'hpbl': true,
    'mconv': true,
    'vwsh': true,
    'mslet': true,
    'ustm': true,
    'vstm': true,
    'uwnd': true,
    'vwnd': true,
    'shum': true,
    'pres': true,
    'vis': true,
    'tke': true,
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PARAMETERS, SECTORS, OVERLAYS, UNDERLAYS, SPC_BASE_URL, NARR_SERVER_URL, NARR_PARAMS };
}
