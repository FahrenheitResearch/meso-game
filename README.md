# SPC Mesoanalysis Forecasting Game

A web-based forecasting game built on real NWS Storm Prediction Center mesoanalysis data. Practice issuing SPC-style probabilistic severe weather outlooks and verify your forecasts against actual storm reports.

![Mesoanalysis Clone](https://www.spc.noaa.gov/exper/mesoanalysis/s14/sbcp/sbcp.gif)

## Features

### Mesoanalysis Viewer
- **Real SPC data** - Pulls live imagery from NOAA/NWS Storm Prediction Center
- **12 regional sectors** - National, Northwest, Southwest, Great Basin, Northern/Central/Southern Plains, Midwest, Great Lakes, Northeast, Mid-Atlantic, Southeast
- **~100 weather parameters** - CAPE, shear, composite indices, thermodynamics, and more
- **Overlays** - County boundaries, highways, watches/warnings, SPC outlooks, storm reports
- **Underlays** - Radar, terrain, population density, surface observations
- **Animation** - Loop through recent hours with adjustable speed

### Historic Tornado Outbreaks
View mesoanalysis data from notable tornado events:

**Recent (SPC Archive - 2020+):**
- Dec 10-11, 2021 - Quad-State (Mayfield EF4)
- Mar 31, 2023 - Little Rock EF4
- Apr 27, 2024 - Nebraska/Iowa
- May 21, 2024 - Greenfield, Iowa EF4

**Classic (NARR Server - 1979-2019):**
- May 3, 1999 - Oklahoma Outbreak (Bridge Creek EF5)
- Apr 27, 2011 - Super Outbreak (Tuscaloosa, Hackleburg)
- May 22, 2011 - Joplin EF5
- May 20, 2013 - Moore EF5
- May 31, 2013 - El Reno EF3 (widest tornado on record)
- Apr 27, 2014 - Arkansas/Mayflower EF4
- *And any date back to 1979!*

### Forecasting Game
- **SPC-style probabilities** - Draw outlook areas with realistic probability thresholds
  - Tornado: 2%, 5%, 10%, 15%, 30%, 45%, 60%
  - Wind: 5%, 15%, 30%, 45%, 60%
  - Hail: 5%, 15%, 30%, 45%, 60%
- **Significant severe** - Mark areas for EF2+ tornadoes, 65kt+ winds, or 2"+ hail
- **Real verification** - Fetches actual SPC storm reports to score your forecast
- **Brier scoring** - Industry-standard probabilistic forecast verification
- **Leaderboard** - Track your performance over time

## Quick Start

1. Clone the repo:
   ```bash
   git clone https://github.com/FahrenheitResearch/meso-game.git
   cd meso-game
   ```

2. Serve the files locally (required for fetch to work):
   ```bash
   # Python 3
   python -m http.server 8080

   # Node.js
   npx serve -p 8080 .

   # Or use VS Code Live Server, etc.
   ```

3. Open `http://localhost:8080` in your browser

### Optional: Enable Classic Outbreaks (Pre-2020)

To view historic outbreaks before 2020 (Joplin, Super Outbreak, 1999 Oklahoma, etc.), run the NARR server:

```bash
# Install Python dependencies
cd server
pip install -r requirements.txt

# Start the NARR server (fetches data from NOAA)
python app.py

# Server runs on http://localhost:5000
```

The NARR server fetches reanalysis data from NOAA PSL and generates SPC-style mesoanalysis images on-demand. First load of each image takes 10-30 seconds; subsequent loads are cached.

## Project Structure

```
meso-game/
├── index.html          # Main HTML structure
├── styles.css          # NWS-inspired styling
├── app.js              # Mesoanalysis viewer logic
├── game.js             # Forecasting game logic
├── params.js           # SPC parameter definitions
├── legends.js          # Custom legend definitions
└── server/             # NARR historic data server
    ├── app.py          # Flask API server
    ├── narr_fetcher.py # NARR data fetching & image generation
    └── requirements.txt
```

## Customization Ideas

### Add New Outbreak Events
Edit `index.html` to add options to the outbreak selector:
```html
<option value="YYMMDDHH">Event Name</option>
```
Format is 2-digit year, month, day, hour (UTC).

### Add New Parameters
Edit `params.js` to add parameters to categories:
```javascript
thermo: [
    { code: 'sbcp', name: 'Surface-Based CAPE' },
    { code: 'your_param', name: 'Your Parameter Name' },
    // ...
]
```

### Adjust Map Bounds
Edit `game.js` `mapBounds` object to fine-tune lat/lon bounds for each sector (affects verification accuracy):
```javascript
this.mapBounds = {
    14: { minLat: 34, maxLat: 44, minLon: -105, maxLon: -92 },
    // ...
}
```

### Custom Scoring
Modify `calculateVerificationScore()` in `game.js` to implement your own scoring algorithm.

### Add Game Modes
The game supports three modes - extend `gameModeSelect` and add logic for:
- Training scenarios with known outcomes
- Real-time forecasting competitions
- Custom/fictional weather setups

## Data Sources

All meteorological data comes from NOAA:

- **Mesoanalysis imagery (2020+)**: `https://www.spc.noaa.gov/exper/mesoanalysis/`
- **Storm reports**: `https://www.spc.noaa.gov/climo/reports/`
- **Historic outlooks (2003+)**: `https://www.spc.noaa.gov/products/outlook/archive/`
- **NARR Reanalysis (1979-present)**: `https://psl.noaa.gov/thredds/catalog/Datasets/NARR/`

### NARR Data Limitations

The NARR server provides approximate historic data, but has limitations compared to SPC real-time products:

| SPC Product | NARR Equivalent | Notes |
|-------------|-----------------|-------|
| SB/ML/MU CAPE | Single CAPE field | NARR doesn't distinguish parcel types |
| 0-1km, 0-3km, Effective SRH | 0-3km only | Single helicity field |
| Layer-specific shear | Single shear field | Vertical wind shear only |
| All lapse rates | Lifted Index proxy | No direct lapse rate fields |

For research purposes, NARR provides valuable insight into historic events, but derived parameters may differ from what SPC displayed at the time.

## Technical Notes

- **No backend required** - Pure client-side JavaScript for basic features
- **NARR server** - Optional Python/Flask server for pre-2020 historic data
  - Uses OPeNDAP to fetch NARR data from NOAA PSL
  - Renders SPC-style images with Matplotlib/Cartopy
  - Caches generated images locally
- **CORS**: Storm report CSV fetching may be blocked by CORS in some browsers; falls back to simulated verification
- **Storage**: Forecasts and leaderboard stored in localStorage
- **Browser support**: Modern browsers with ES6+ support

## Contributing

Contributions welcome! Some ideas:
- [ ] Multiplayer/real-time competitions
- [x] ~~More historic events~~ - NARR server supports any date 1979-present!
- [ ] Improved map projections for better verification
- [ ] Mobile touch drawing improvements
- [ ] Export/share forecasts
- [ ] Backend for persistent leaderboards
- [ ] Additional NARR parameters (pressure levels, derived products)
- [ ] Historic storm reports overlay for classic outbreaks

## License

MIT License - Use freely for educational and non-commercial purposes.

## Acknowledgments

- [NOAA/NWS Storm Prediction Center](https://www.spc.noaa.gov/) for providing public mesoanalysis data
- [NOAA Physical Sciences Laboratory](https://psl.noaa.gov/) for NARR reanalysis data via OPeNDAP
- [NCEP North American Regional Reanalysis](https://www.ncei.noaa.gov/products/weather-climate-models/north-american-regional) for historic atmospheric data back to 1979
- SPC mesoanalysis is an incredible free resource for weather enthusiasts and researchers

---

*This is an unofficial fan project and is not affiliated with or endorsed by NOAA, NWS, or the Storm Prediction Center.*
