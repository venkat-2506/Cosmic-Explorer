# 3I/ATLAS Intercept Simulator Backend

This Flask backend provides orbital mechanics calculations for the intercept simulator.

## Setup Instructions

### 1. Python Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Run the Server
```bash
python api.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### POST /api/optimal_window
Calculate optimal launch windows for intercept missions.

**Request:**
```json
{
  "propulsion": "chemical|ion|nuclear|solar",
  "payloadMass": 1000
}
```

**Response:**
```json
{
  "success": true,
  "interceptSuccess": true,
  "optimalLaunchDate": "2024-02-15T00:00:00",
  "arrivalDate": "2024-08-12T00:00:00",
  "travelTime": 178,
  "deltaV": "8.5",
  "fuelRequired": 2650,
  "explanation": "Optimal window found...",
  "educationalNote": "This window minimizes...",
  "alternativeWindows": [...]
}
```

### POST /api/anytime_chase
Calculate intercept for user-selected launch date.

**Request:**
```json
{
  "propulsion": "ion",
  "payloadMass": 1500,
  "launchDate": "2024-03-01"
}
```

**Response:**
```json
{
  "success": true,
  "interceptSuccess": true,
  "launchDate": "2024-03-01T00:00:00",
  "arrivalDate": "2024-09-15T00:00:00",
  "travelTime": 198,
  "deltaV": "12.3",
  "fuelRequired": 1850,
  "explanation": "Mission successful...",
  "educationalNote": "Launch timing affects..."
}
```

### GET /api/propulsion_info
Get information about available propulsion systems.

### GET /api/health
Health check endpoint.

## Key Features

1. **Real Orbital Mechanics**: Uses Lambert's problem solver for trajectory calculations
2. **Multiple Propulsion Types**: Chemical, Ion, Nuclear Thermal, Solar Sail
3. **Fuel Calculations**: Tsiolkovsky rocket equation implementation
4. **Educational Content**: Explains why missions succeed or fail
5. **Optimal Window Finding**: Searches for best launch opportunities

## Dependencies

- **Flask**: Web framework
- **astropy**: Astronomical calculations
- **poliastro**: Orbital mechanics library
- **numpy**: Numerical computations
- **scipy**: Scientific computing

## Development Notes

- The current implementation uses simplified orbital mechanics for demo purposes
- Production version would integrate real ephemeris data
- Lambert solver is simplified - production would use poliastro's implementation
- Real 3I/ATLAS orbital elements would be loaded from JPL Horizons
