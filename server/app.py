#!/usr/bin/env python3
"""
Flask server for serving historic NARR mesoanalysis images
"""

from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from narr_fetcher import generate_mesoanalysis, PARAM_MAP, SECTOR_BOUNDS
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for local development

# Available parameters (that we can generate from NARR)
# This is generated from PARAM_MAP - all keys are valid
AVAILABLE_PARAMS = {k: k for k in PARAM_MAP.keys()}


@app.route('/')
def index():
    """API documentation"""
    return jsonify({
        'name': 'NARR Historic Mesoanalysis API',
        'endpoints': {
            '/mesoanalysis/<param>/<date>': 'Get mesoanalysis image',
            '/params': 'List available parameters',
            '/sectors': 'List available sectors',
        },
        'example': '/mesoanalysis/sbcp/2011052221?sector=14',
        'date_format': 'YYYYMMDDHH (hour in UTC, rounded to 3h)',
    })


@app.route('/params')
def list_params():
    """List available parameters"""
    return jsonify(AVAILABLE_PARAMS)


@app.route('/sectors')
def list_sectors():
    """List available sectors"""
    return jsonify({
        str(k): {
            'bounds': v,
            'name': get_sector_name(k)
        } for k, v in SECTOR_BOUNDS.items()
    })


def get_sector_name(sector: int) -> str:
    """Get human-readable sector name"""
    names = {
        19: 'National',
        11: 'Northwest',
        12: 'Southwest',
        22: 'Great Basin',
        13: 'Northern Plains',
        14: 'Central Plains',
        15: 'Southern Plains',
        20: 'Midwest',
        21: 'Great Lakes',
        16: 'Northeast',
        17: 'Mid-Atlantic',
        18: 'Southeast',
    }
    return names.get(sector, f'Sector {sector}')


@app.route('/mesoanalysis/<param>/<date>')
def get_mesoanalysis(param: str, date: str):
    """
    Generate and return a mesoanalysis image.

    Args:
        param: Parameter code (sbcp, srh3, etc.)
        date: Date in YYYYMMDDHH format

    Query params:
        sector: Sector number (default 19)
    """
    try:
        # Parse date
        if len(date) != 10:
            return jsonify({'error': 'Date must be YYYYMMDDHH format'}), 400

        year = int(date[0:4])
        month = int(date[4:6])
        day = int(date[6:8])
        hour = int(date[8:10])

        # Validate
        if year < 1979 or year > 2025:
            return jsonify({'error': 'Year must be 1979-2025'}), 400
        if month < 1 or month > 12:
            return jsonify({'error': 'Month must be 1-12'}), 400
        if day < 1 or day > 31:
            return jsonify({'error': 'Day must be 1-31'}), 400
        if hour < 0 or hour > 23:
            return jsonify({'error': 'Hour must be 0-23'}), 400

        # Get sector
        sector = request.args.get('sector', 19, type=int)
        if sector not in SECTOR_BOUNDS:
            return jsonify({'error': f'Invalid sector. Valid: {list(SECTOR_BOUNDS.keys())}'}), 400

        # Validate param - accept any param in PARAM_MAP
        if param not in PARAM_MAP:
            return jsonify({
                'error': f'Unknown parameter: {param}',
                'available': sorted(list(PARAM_MAP.keys()))[:20]  # Show first 20
            }), 400

        # Generate image
        img_bytes = generate_mesoanalysis(param, year, month, day, hour, sector)

        return Response(img_bytes, mimetype='image/png')

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    import os
    print("Starting NARR Mesoanalysis Server...")
    print("Endpoints:")
    print("  GET /mesoanalysis/<param>/<date>?sector=<n>")
    print("  GET /params")
    print("  GET /sectors")
    print("")
    print("Example: http://localhost:5000/mesoanalysis/sbcp/2011052221?sector=14")
    print("")
    # Only enable debug mode if explicitly set via environment variable
    debug_mode = os.environ.get('FLASK_DEBUG', '0') == '1'
    app.run(host='0.0.0.0', port=5000, debug=debug_mode)
