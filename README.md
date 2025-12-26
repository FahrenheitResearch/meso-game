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
- Dec 10-11, 2021 - Quad-State (Mayfield EF4)
- Mar 31, 2023 - Little Rock EF4
- Apr 27, 2024 - Nebraska/Iowa
- May 21, 2024 - Greenfield, Iowa EF4
- And more...

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
   python -m http.server 8000

   # Node.js
   npx serve .

   # Or use VS Code Live Server, etc.
   ```

3. Open `http://localhost:8000` in your browser

## Project Structure

```
meso-game/
├── index.html      # Main HTML structure
├── styles.css      # NWS-inspired styling
├── app.js          # Mesoanalysis viewer logic
├── game.js         # Forecasting game logic
├── params.js       # SPC parameter definitions
└── legends.js      # Custom legend definitions
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

All meteorological data comes from NOAA/NWS Storm Prediction Center:
- **Mesoanalysis imagery**: `https://www.spc.noaa.gov/exper/mesoanalysis/`
- **Storm reports**: `https://www.spc.noaa.gov/climo/reports/`

Historic data is available going back approximately 5 years.

## Technical Notes

- **No backend required** - Pure client-side JavaScript
- **CORS**: Storm report CSV fetching may be blocked by CORS in some browsers; falls back to simulated verification
- **Storage**: Forecasts and leaderboard stored in localStorage
- **Browser support**: Modern browsers with ES6+ support

## Contributing

Contributions welcome! Some ideas:
- [ ] Multiplayer/real-time competitions
- [ ] More historic events
- [ ] Improved map projections for better verification
- [ ] Mobile touch drawing improvements
- [ ] Export/share forecasts
- [ ] Backend for persistent leaderboards

## License

MIT License - Use freely for educational and non-commercial purposes.

## Acknowledgments

- [NOAA/NWS Storm Prediction Center](https://www.spc.noaa.gov/) for providing public mesoanalysis data
- SPC mesoanalysis is an incredible free resource for weather enthusiasts and researchers

---

*This is an unofficial fan project and is not affiliated with or endorsed by NOAA, NWS, or the Storm Prediction Center.*
