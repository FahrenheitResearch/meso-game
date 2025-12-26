#!/usr/bin/env python3
"""
NARR Data Fetcher for Historic Mesoanalysis
Fetches data from NOAA PSL THREDDS server and generates SPC-style images
"""

import xarray as xr
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
from matplotlib.colors import LinearSegmentedColormap
import cartopy.crs as ccrs
import cartopy.feature as cfeature
from datetime import datetime, timedelta
from pathlib import Path
import io
import os

# NARR OPeNDAP base URL
NARR_BASE = "https://psl.noaa.gov/thredds/dodsC/Datasets/NARR"

# Output directory for cached images
CACHE_DIR = Path(__file__).parent / "cache"
CACHE_DIR.mkdir(exist_ok=True)

# SPC-style colormaps
COLORMAPS = {
    'cape': {
        'levels': [0, 250, 500, 1000, 1500, 2000, 2500, 3000, 4000, 5000],
        'colors': ['#ffffff', '#c8ffc8', '#00ff00', '#00c800', '#009600',
                   '#ffff00', '#ffc800', '#ff9600', '#ff0000', '#c80000']
    },
    'cin': {
        'levels': [-500, -300, -200, -150, -100, -50, -25, 0],
        'colors': ['#960000', '#c80000', '#ff0000', '#ff9600', '#ffc800',
                   '#ffff00', '#ffffc8', '#ffffff']
    },
    'hlcy': {  # SRH
        'levels': [0, 50, 100, 200, 300, 400, 500, 600],
        'colors': ['#c8c8c8', '#96ff96', '#00ff00', '#ffff00', '#ffc800',
                   '#ff9600', '#ff0000', '#ff00ff']
    },
    'lftx4': {  # Lifted Index (inverted - negative is unstable)
        'levels': [-10, -8, -6, -4, -2, 0, 2, 4],
        'colors': ['#ff00ff', '#ff0000', '#ff9600', '#ffff00', '#00ff00',
                   '#00c8ff', '#c8c8c8', '#9696ff']
    },
    'pr_wtr': {  # Precipitable Water (inches - NARR is kg/m2, divide by 25.4)
        'levels': [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5],
        'colors': ['#c8c8c8', '#c8ffc8', '#00ff00', '#00c800', '#ffff00',
                   '#ff9600', '#ff0000', '#ff00ff']
    },
    'shear': {  # Bulk shear (kt)
        'levels': [0, 10, 20, 30, 40, 50, 60, 70],
        'colors': ['#c8c8c8', '#96ffff', '#00c8ff', '#00ff00', '#ffff00',
                   '#ff9600', '#ff0000', '#ff00ff']
    },
    'dpt': {  # Dewpoint (F)
        'levels': [30, 40, 50, 55, 60, 65, 70, 75, 80],
        'colors': ['#964B00', '#c8a000', '#c8c800', '#00c800', '#00ff00',
                   '#00ffc8', '#00ffff', '#00c8ff', '#0096ff']
    },
    'temp': {  # Temperature (F)
        'levels': [0, 20, 32, 40, 50, 60, 70, 80, 90, 100],
        'colors': ['#ff00ff', '#9600ff', '#0000ff', '#00c8ff', '#00ffff',
                   '#00ff00', '#ffff00', '#ff9600', '#ff0000', '#c80000']
    },
    'rhum': {  # Relative Humidity (%)
        'levels': [0, 20, 40, 50, 60, 70, 80, 90, 100],
        'colors': ['#c86400', '#ffc800', '#ffff00', '#c8ff00', '#00ff00',
                   '#00c800', '#00c8ff', '#0096ff', '#0000ff']
    },
    'hpbl': {  # PBL Height (m)
        'levels': [0, 250, 500, 750, 1000, 1500, 2000, 3000, 4000],
        'colors': ['#9696ff', '#c8c8ff', '#c8ffff', '#c8ffc8', '#ffff00',
                   '#ffc800', '#ff9600', '#ff0000', '#c80000']
    },
    'tke': {  # Turbulent Kinetic Energy (J/kg)
        'levels': [0, 1, 2, 4, 6, 8, 10, 15, 20],
        'colors': ['#c8c8c8', '#c8ffc8', '#00ff00', '#00c800', '#ffff00',
                   '#ffc800', '#ff9600', '#ff0000', '#ff00ff']
    },
    'vwsh': {  # Vertical Wind Shear (1/s * 1000)
        'levels': [0, 2, 4, 6, 8, 10, 12, 15, 20],
        'colors': ['#c8c8c8', '#96ffff', '#00c8ff', '#00ff00', '#ffff00',
                   '#ff9600', '#ff0000', '#ff00ff', '#c800c8']
    },
    'mconv': {  # Moisture Convergence
        'levels': [-20, -15, -10, -5, 0, 5, 10, 15, 20],
        'colors': ['#c86400', '#ff9600', '#ffc800', '#ffff00', '#ffffff',
                   '#c8ffc8', '#00ff00', '#00c800', '#006400']
    },
    'wind': {  # Wind speed (kt)
        'levels': [0, 10, 20, 30, 40, 50, 60, 70, 80],
        'colors': ['#c8c8c8', '#96ffff', '#00c8ff', '#00ff00', '#ffff00',
                   '#ff9600', '#ff0000', '#ff00ff', '#c800c8']
    },
    'tcdc': {  # Total cloud cover (%)
        'levels': [0, 10, 25, 40, 50, 60, 75, 90, 100],
        'colors': ['#00c8ff', '#64d8ff', '#96e8ff', '#c8f0ff', '#ffffff',
                   '#d0d0d0', '#a0a0a0', '#707070', '#404040']
    },
    'vis': {  # Visibility (miles)
        'levels': [0, 0.5, 1, 2, 3, 5, 7, 10, 15],
        'colors': ['#ff0000', '#ff6400', '#ffc800', '#ffff00', '#c8ff00',
                   '#64ff00', '#00ff00', '#00c800', '#009600']
    },
    'mslet': {  # MSL Pressure (mb)
        'levels': [980, 990, 1000, 1005, 1010, 1015, 1020, 1025, 1030],
        'colors': ['#ff00ff', '#ff0000', '#ff9600', '#ffff00', '#ffffff',
                   '#c8ffc8', '#00ff00', '#00c800', '#0000ff']
    },
    'ustm': {  # Storm motion U component (m/s -> kt)
        'levels': [-40, -30, -20, -10, 0, 10, 20, 30, 40],
        'colors': ['#0000ff', '#0096ff', '#00c8ff', '#00ffff', '#ffffff',
                   '#ffff00', '#ff9600', '#ff0000', '#c80000']
    },
    'apcp': {  # Precipitation (inches)
        'levels': [0, 0.1, 0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0],
        'colors': ['#ffffff', '#c8ffc8', '#00ff00', '#00c800', '#ffff00',
                   '#ffc800', '#ff9600', '#ff0000', '#ff00ff']
    },
    'omega': {  # Vertical velocity (Pa/s * -1 for upward)
        'levels': [-1.5, -1.0, -0.5, -0.25, 0, 0.25, 0.5, 1.0, 1.5],
        'colors': ['#ff00ff', '#ff0000', '#ff9600', '#ffff00', '#ffffff',
                   '#c8ffc8', '#00ff00', '#00c800', '#006400']
    },
    'shum': {  # Specific humidity (g/kg)
        'levels': [0, 2, 4, 6, 8, 10, 12, 14, 16],
        'colors': ['#c86400', '#c8a000', '#c8c800', '#00c800', '#00ff00',
                   '#00ffc8', '#00ffff', '#00c8ff', '#0096ff']
    },
    'vvel': {  # Vertical velocity (Pa/s, negative = upward)
        'levels': [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2],
        'colors': ['#ff00ff', '#ff0000', '#ff9600', '#ffff00', '#ffffff',
                   '#c8ffc8', '#00ff00', '#00c800', '#006400']
    },
    'bmixl': {  # Boundary layer mixing length (m)
        'levels': [0, 100, 200, 300, 500, 750, 1000, 1500, 2000],
        'colors': ['#c8c8c8', '#c8ffc8', '#00ff00', '#00c800', '#ffff00',
                   '#ffc800', '#ff9600', '#ff0000', '#c80000']
    },
    'prmsl': {  # MSL Pressure (mb) - MAPS reduction
        'levels': [980, 990, 1000, 1005, 1010, 1015, 1020, 1025, 1030],
        'colors': ['#ff00ff', '#ff0000', '#ff9600', '#ffff00', '#ffffff',
                   '#c8ffc8', '#00ff00', '#00c800', '#0000ff']
    },
    'acpcp': {  # Convective precipitation (inches)
        'levels': [0, 0.1, 0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0],
        'colors': ['#ffffff', '#c8ffc8', '#00ff00', '#00c800', '#ffff00',
                   '#ffc800', '#ff9600', '#ff0000', '#ff00ff']
    },
    'lcdc': {  # Low cloud cover (%)
        'levels': [0, 10, 25, 40, 50, 60, 75, 90, 100],
        'colors': ['#00c8ff', '#64d8ff', '#96e8ff', '#c8f0ff', '#ffffff',
                   '#d0d0d0', '#a0a0a0', '#707070', '#404040']
    }
}

# Sector bounds (matching game.js)
SECTOR_BOUNDS = {
    19: {'minLat': 24, 'maxLat': 50, 'minLon': -125, 'maxLon': -66},   # National
    11: {'minLat': 40, 'maxLat': 50, 'minLon': -128, 'maxLon': -110},  # Northwest
    12: {'minLat': 30, 'maxLat': 42, 'minLon': -125, 'maxLon': -108},  # Southwest
    22: {'minLat': 35, 'maxLat': 45, 'minLon': -120, 'maxLon': -105},  # Great Basin
    13: {'minLat': 40, 'maxLat': 50, 'minLon': -110, 'maxLon': -95},   # Northern Plains
    14: {'minLat': 34, 'maxLat': 44, 'minLon': -105, 'maxLon': -92},   # Central Plains
    15: {'minLat': 26, 'maxLat': 38, 'minLon': -106, 'maxLon': -90},   # Southern Plains
    20: {'minLat': 36, 'maxLat': 46, 'minLon': -96, 'maxLon': -82},    # Midwest
    21: {'minLat': 40, 'maxLat': 50, 'minLon': -92, 'maxLon': -76},    # Great Lakes
    16: {'minLat': 38, 'maxLat': 48, 'minLon': -82, 'maxLon': -66},    # Northeast
    17: {'minLat': 34, 'maxLat': 44, 'minLon': -84, 'maxLon': -72},    # Mid-Atlantic
    18: {'minLat': 26, 'maxLat': 38, 'minLon': -92, 'maxLon': -76},    # Southeast
}

# Map SPC param codes to NARR variable names
PARAM_MAP = {
    # ===== THERMODYNAMICS =====
    # CAPE variants - NARR has single CAPE field
    'sbcp': 'cape',     # Surface-Based CAPE
    'mlcp': 'cape',     # 100mb Mixed-Layer CAPE
    'mucp': 'cape',     # Most-Unstable CAPE
    'mxcp': 'cape',     # Max CAPE
    'ncap': 'cape',     # Normalized CAPE

    # CIN variants
    'cin': 'cin',
    'ncin': 'cin',      # CIN
    'lcin': 'cin',      # Low-level CIN

    # Lifted Index
    'muli': 'lftx4',    # Surface-Based Lifted Index
    'lllr': 'lftx4',    # Low-Level Lapse Rates (proxy)
    'laps': 'lftx4',    # Mid-Level Lapse Rates (proxy)

    # ===== HELICITY / SRH =====
    'srh3': 'hlcy',     # SR Helicity - Sfc-3km
    'srh1': 'hlcy',     # SR Helicity - Sfc-1km (use 0-3km as proxy)
    'srh5': 'hlcy',     # SR Helicity - Sfc-500m (use 0-3km as proxy)
    'effh': 'hlcy',     # SR Helicity - Effective

    # ===== MOISTURE =====
    'pwtr': 'pr_wtr',   # Precipitable Water
    'dwpt': 'dpt',      # Surface Dewpoint
    'ttd': 'dpt',       # Temp/Wind/Dwpt
    'thtd': 'dpt',      # Theta-E deficit proxy
    'mcon': 'mconv',    # Moisture Convergence
    'thea': 'mconv',    # Theta-E Advection (use mconv as proxy)
    'tdlr': 'dpt',      # Temp/Dwpt Lapse Rates
    'mixr': 'shum',     # 100mb Mean Mixing Ratio

    # ===== WIND/SHEAR =====
    'shr6': 'vwsh',     # Bulk Shear - Sfc-6km
    'shr8': 'vwsh',     # Bulk Shear - Sfc-8km
    'shr1': 'vwsh',     # Bulk Shear - Sfc-1km
    'shr3': 'vwsh',     # Bulk Shear - Sfc-3km
    'eshr': 'vwsh',     # Bulk Shear - Effective
    'brns': 'vwsh',     # BRN Shear

    # Storm-Relative Winds
    'llsr': 'ustm',     # SR Wind - Sfc-2km (use storm motion)
    'mlsr': 'ustm',     # SR Wind - 4-6km
    'ulsr': 'ustm',     # SR Wind - 9-11km
    'alsr': 'ustm',     # SR Wind - Anvil Level
    'mnwd': 'uwnd',     # 850-300mb Mean Wind

    # ===== SURFACE =====
    'pmsl': 'mslet',    # MSL Pressure/Wind
    'pchg': 'mslet',    # 2-hour Pressure Change (use MSL as proxy)
    'temp': 'air',      # Surface Temperature
    'sfcp': 'pres',     # Surface Pressure

    # ===== BOUNDARY LAYER =====
    'pblh': 'hpbl',     # PBL Height
    'lclh': 'hpbl',     # LCL Height (use PBL as proxy)
    'lfch': 'hpbl',     # LFC Height (use PBL as proxy)

    # ===== CLOUDS =====
    'tcdc': 'tcdc',     # Total Cloud Cover
    'lcdc': 'lcdc',     # Low Cloud Cover
    'mcdc': 'mcdc',     # Mid Cloud Cover
    'hcdc': 'hcdc',     # High Cloud Cover

    # ===== PRECIPITATION =====
    'apcp': 'apcp',     # Accumulated Precipitation
    'prate': 'prate',   # Precipitation Rate

    # ===== WINTER WEATHER =====
    'snod': 'snod',     # Snow Depth
    'snowc': 'snowc',   # Snow Cover
    'weasd': 'weasd',   # Water Equivalent of Snow Depth

    # ===== MISCELLANEOUS =====
    'tke': 'tke',       # Turbulent Kinetic Energy
    'vis': 'vis',       # Visibility

    # ===== FIRE WEATHER =====
    'sfir': 'rhum',     # Sfc RH / Temp / Wind (use RH)
    'lfrh': 'rhum',     # LCL-LFC Mean RH
    'lfrh2': 'rhum',    # LCL-LFC Mean RH (Fire Wx)

    # ===== DIRECT NARR VARIABLE MAPPINGS =====
    'cape': 'cape',
    'cin': 'cin',
    'hlcy': 'hlcy',
    'lftx4': 'lftx4',
    'pr_wtr': 'pr_wtr',
    'dpt': 'dpt',
    'air': 'air',
    'rhum': 'rhum',
    'hpbl': 'hpbl',
    'pottmp': 'pottmp',
    'mconv': 'mconv',
    'vwsh': 'vwsh',
    'mslet': 'mslet',
    'prmsl': 'prmsl',  # MAPS reduction MSL pressure
    'ustm': 'ustm',
    'vstm': 'vstm',
    'uwnd': 'uwnd',
    'vwnd': 'vwnd',
    'shum': 'shum',
    'pres': 'pres',
    'tcdc': 'tcdc',
    'lcdc': 'lcdc',
    'mcdc': 'mcdc',
    'hcdc': 'hcdc',
    'vis': 'vis',
    'apcp': 'apcp',
    'acpcp': 'acpcp',  # Convective precipitation
    'prate': 'prate',
    'snod': 'snod',
    'snowc': 'snowc',
    'weasd': 'weasd',
    'tke': 'tke',
    'vvel': 'vvel',    # Vertical velocity
    'bmixl': 'bmixl',  # Boundary layer mixing length
}


def get_time_index(year: int, month: int, day: int, hour: int) -> int:
    """
    Calculate the time index in the NARR yearly file.
    NARR has 3-hourly data (8 times per day).
    """
    # Days since start of year
    start_of_year = datetime(year, 1, 1, 0, 0)
    target_time = datetime(year, month, day, hour, 0)

    # Round hour to nearest 3-hour interval
    hour_3h = (hour // 3) * 3
    target_time = datetime(year, month, day, hour_3h, 0)

    # Calculate index (3-hourly = 8 per day)
    delta = target_time - start_of_year
    time_index = int(delta.total_seconds() / (3 * 3600))

    return time_index


def fetch_narr_data(variable: str, year: int, month: int, day: int, hour: int):
    """
    Fetch NARR data for a specific variable and time via OPeNDAP.
    Returns xarray DataArray with lat/lon coordinates.
    """
    # Monolevel variables with special naming patterns (based on PSL THREDDS catalog)
    monolevel_2m = ['dpt', 'air', 'rhum', 'shum']  # These have .2m suffix
    monolevel_10m = ['uwnd', 'vwnd']  # Wind at 10m
    monolevel_sfc = ['pres']  # These have .sfc suffix
    monolevel_tropo = ['vwsh', 'hgt_tropo', 'pres_tropo']  # These have .tropo suffix
    monolevel_hl1 = ['mconv', 'pottmp', 'tke', 'vvel', 'bmixl']  # These have .hl1 suffix
    monolevel_plain = ['cape', 'cin', 'hlcy', 'lftx4', 'pr_wtr', 'hpbl', 'mslet',
                       'ustm', 'vstm', 'tcdc', 'lcdc', 'mcdc', 'hcdc', 'vis', 'prmsl',
                       'apcp', 'acpcp', 'prate', 'snod', 'snowc', 'weasd', 'evap',
                       'soilm', 'mstav', 'lhtfl', 'shtfl', 'gflux']

    if variable in monolevel_tropo:
        url = f"{NARR_BASE}/monolevel/{variable}.tropo.{year}.nc"
        var_name = variable
    elif variable in monolevel_hl1:
        url = f"{NARR_BASE}/monolevel/{variable}.hl1.{year}.nc"
        var_name = variable
    elif variable in monolevel_2m:
        url = f"{NARR_BASE}/monolevel/{variable}.2m.{year}.nc"
        var_name = variable
    elif variable in monolevel_10m:
        url = f"{NARR_BASE}/monolevel/{variable}.10m.{year}.nc"
        var_name = variable
    elif variable in monolevel_sfc:
        url = f"{NARR_BASE}/monolevel/{variable}.sfc.{year}.nc"
        var_name = variable
    elif variable in monolevel_plain:
        url = f"{NARR_BASE}/monolevel/{variable}.{year}.nc"
        var_name = variable
    else:
        # Try pressure level (monthly files)
        url = f"{NARR_BASE}/pressure/{variable}.{year}{month:02d}.nc"
        var_name = variable

    print(f"Fetching: {url}")

    # Calculate time index
    time_idx = get_time_index(year, month, day, hour)
    print(f"Time index: {time_idx} for {year}-{month:02d}-{day:02d} {hour:02d}Z")

    # Open dataset with OPeNDAP, only fetch the time slice we need
    try:
        ds = xr.open_dataset(url)

        # Get the variable data for this time
        data = ds[variable].isel(time=time_idx)

        # Get lat/lon grids
        lat = ds['lat'].values
        lon = ds['lon'].values

        ds.close()

        return data.values, lat, lon

    except Exception as e:
        print(f"Error fetching data: {e}")
        raise


def calculate_shear(year: int, month: int, day: int, hour: int, level1: int = 1000, level2: int = 500):
    """
    Calculate bulk wind shear between two pressure levels.
    Returns shear magnitude in knots.
    """
    # This would require fetching uwnd and vwnd at multiple levels
    # For now, return the vertical wind shear variable
    data, lat, lon = fetch_narr_data('vwsh', year, month, day, hour)
    return data, lat, lon


def create_colormap(param: str):
    """Create a matplotlib colormap from SPC-style colors."""
    if param not in COLORMAPS:
        param = 'cape'  # Default

    cmap_def = COLORMAPS[param]
    colors = cmap_def['colors']
    levels = cmap_def['levels']

    # Normalize levels to 0-1
    norm_levels = np.array(levels)
    norm_levels = (norm_levels - norm_levels.min()) / (norm_levels.max() - norm_levels.min())

    # Create colormap
    cmap = LinearSegmentedColormap.from_list(param, list(zip(norm_levels, colors)))

    return cmap, levels


def render_image(data: np.ndarray, lat: np.ndarray, lon: np.ndarray,
                 param: str, sector: int = 19, title: str = None) -> bytes:
    """
    Render NARR data as a PNG image matching SPC mesoanalysis style.
    Returns PNG bytes.
    """
    bounds = SECTOR_BOUNDS.get(sector, SECTOR_BOUNDS[19])

    # Create figure with cartopy projection
    fig = plt.figure(figsize=(10, 8), dpi=100)

    # Use Lambert Conformal (similar to NARR native projection)
    proj = ccrs.LambertConformal(central_longitude=-97, central_latitude=38)
    ax = fig.add_subplot(1, 1, 1, projection=proj)

    # Set extent
    ax.set_extent([bounds['minLon'], bounds['maxLon'],
                   bounds['minLat'], bounds['maxLat']],
                  crs=ccrs.PlateCarree())

    # Get colormap
    cmap, levels = create_colormap(param)
    norm = mcolors.BoundaryNorm(levels, cmap.N)

    # Plot the data - fully opaque, no extra map features
    # NARR data is on a Lambert Conformal grid, we need to transform
    mesh = ax.pcolormesh(lon, lat, data,
                         transform=ccrs.PlateCarree(),
                         cmap=cmap, norm=norm)

    # Don't add geographic features - SPC overlays will provide those
    # ax.add_feature(cfeature.STATES, linewidth=0.5, edgecolor='gray')
    # ax.add_feature(cfeature.COASTLINE, linewidth=0.5)
    # ax.add_feature(cfeature.BORDERS, linewidth=0.5)

    # Remove axes, ticks, and frame for clean overlay
    ax.set_frame_on(False)
    ax.set_xticks([])
    ax.set_yticks([])

    # Save to bytes - tight layout, grey background to match SPC
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0,
                facecolor='#4a4a4a', edgecolor='none', transparent=False)
    plt.close(fig)
    buf.seek(0)

    return buf.read()


def generate_mesoanalysis(param: str, year: int, month: int, day: int,
                          hour: int, sector: int = 19) -> bytes:
    """
    Main function to generate a mesoanalysis-style image.

    Args:
        param: SPC parameter code (sbcp, srh3, etc.)
        year: 4-digit year
        month: 1-12
        day: 1-31
        hour: 0-23 (will be rounded to nearest 3h)
        sector: SPC sector number

    Returns:
        PNG image bytes
    """
    # Map SPC param to NARR variable
    narr_var = PARAM_MAP.get(param, param)

    # Check cache first
    cache_key = f"{param}_{year}{month:02d}{day:02d}{hour:02d}_s{sector}.png"
    cache_path = CACHE_DIR / cache_key

    if cache_path.exists():
        print(f"Cache hit: {cache_key}")
        return cache_path.read_bytes()

    # Fetch data
    if narr_var == 'shear':
        data, lat, lon = calculate_shear(year, month, day, hour)
    else:
        data, lat, lon = fetch_narr_data(narr_var, year, month, day, hour)

    # Handle unit conversions
    if narr_var == 'pr_wtr':
        # Convert kg/m2 to inches (1 kg/m2 = 0.0394 inches)
        data = data * 0.0394
    elif narr_var in ['air', 'dpt', 'pottmp']:
        # Convert Kelvin to Fahrenheit
        data = (data - 273.15) * 9/5 + 32
    elif narr_var in ['pres', 'mslet', 'prmsl']:
        # Convert Pa to mb
        data = data / 100
    elif narr_var == 'shum':
        # Convert kg/kg to g/kg
        data = data * 1000
    elif narr_var == 'vis':
        # Convert m to miles
        data = data / 1609.34
    elif narr_var in ['ustm', 'vstm', 'uwnd', 'vwnd']:
        # Convert m/s to knots
        data = data * 1.94384
    elif narr_var in ['apcp', 'acpcp']:
        # Convert kg/m2 (mm) to inches
        data = data / 25.4
    elif narr_var == 'snod':
        # Convert m to inches
        data = data * 39.3701
    elif narr_var == 'vwsh':
        # Vertical wind shear is 1/s, multiply by 1000 for display
        data = data * 1000

    # Generate image
    title = f"{param.upper()} - {year}-{month:02d}-{day:02d} {hour:02d}Z"
    img_bytes = render_image(data, lat, lon, narr_var, sector, title)

    # Cache it
    cache_path.write_bytes(img_bytes)
    print(f"Cached: {cache_key}")

    return img_bytes


if __name__ == "__main__":
    # Test with Joplin tornado: May 22, 2011, 22Z
    print("Testing NARR fetch for Joplin tornado...")

    try:
        img = generate_mesoanalysis('sbcp', 2011, 5, 22, 21, sector=14)

        # Save test image
        test_path = CACHE_DIR / "test_joplin_cape.png"
        test_path.write_bytes(img)
        print(f"Test image saved to: {test_path}")
        print(f"Image size: {len(img)} bytes")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
