"""
Flask Backend API for 3I/ATLAS Intercept Simulator
Provides orbital mechanics calculations for spacecraft intercept missions
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import numpy as np
import math
from astropy import units as u
from astropy.time import Time
from poliastro.bodies import Earth, Sun
from poliastro.twobody import Orbit
from poliastro.maneuver import Maneuver
from poliastro.iod import lambert
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PropulsionSystem:
    """Define propulsion system characteristics"""
    
    SYSTEMS = {
        'chemical': {
            'name': 'Chemical Rocket',
            'specific_impulse': 450,  # seconds
            'max_delta_v': 15.0,  # km/s
            'thrust_to_weight': 1.5,
            'efficiency': 0.3
        },
        'ion': {
            'name': 'Ion Drive',
            'specific_impulse': 3000,  # seconds
            'max_delta_v': 25.0,  # km/s
            'thrust_to_weight': 0.001,
            'efficiency': 0.8
        },
        'nuclear': {
            'name': 'Nuclear Thermal',
            'specific_impulse': 900,  # seconds
            'max_delta_v': 30.0,  # km/s
            'thrust_to_weight': 0.3,
            'efficiency': 0.6
        },
        'solar': {
            'name': 'Solar Sail',
            'specific_impulse': float('inf'),  # No propellant
            'max_delta_v': 12.0,  # km/s (practical limit)
            'thrust_to_weight': 0.0001,
            'efficiency': 1.0
        }
    }

class InterstellarObject:
    """3I/ATLAS orbital parameters and trajectory"""
    
    def __init__(self):
        # Simplified orbital elements for 3I/ATLAS (hyperbolic trajectory)
        self.name = "3I/ATLAS"
        self.semi_major_axis = -2.5 * u.AU  # Negative for hyperbolic orbit
        self.eccentricity = 1.8  # > 1 for hyperbolic
        self.inclination = 25.0 * u.deg
        self.longitude_ascending_node = 120.0 * u.deg
        self.argument_periapsis = 45.0 * u.deg
        self.periapsis_distance = 1.2 * u.AU
        self.velocity_at_infinity = 35.0 * u.km / u.s
        
    def get_position_velocity(self, epoch):
        """Calculate position and velocity at given epoch"""
        # Simplified calculation - in real implementation would use full orbital mechanics
        t = (epoch - Time('2024-01-01')).to(u.day).value
        
        # Hyperbolic trajectory approximation
        true_anomaly = 0.5 * t * u.deg  # Simplified
        
        # Distance from Sun
        r = self.periapsis_distance * (1 + self.eccentricity) / (1 + self.eccentricity * np.cos(true_anomaly))
        
        # Position in orbital plane
        x = r * np.cos(true_anomaly)
        y = r * np.sin(true_anomaly)
        z = 0 * u.AU
        
        # Velocity approximation
        v_r = np.sqrt(2 * Sun.GM / r - Sun.GM / self.semi_major_axis)
        v_x = -v_r * np.sin(true_anomaly)
        v_y = v_r * (self.eccentricity + np.cos(true_anomaly))
        v_z = 0 * u.km / u.s
        
        return [x, y, z], [v_x, v_y, v_z]

def calculate_tsiolkovsky_fuel(delta_v, specific_impulse, dry_mass):
    """Calculate fuel requirements using Tsiolkovsky rocket equation"""
    g0 = 9.81  # m/s^2
    exhaust_velocity = specific_impulse * g0 / 1000  # km/s
    
    mass_ratio = np.exp(delta_v / exhaust_velocity)
    wet_mass = dry_mass * mass_ratio
    fuel_mass = wet_mass - dry_mass
    
    return fuel_mass

def calculate_lambert_transfer(r1, r2, tof, mu=Sun.GM.to(u.km**3 / u.s**2).value):
    """
    Solve Lambert's problem for transfer orbit
    
    Args:
        r1: Initial position vector [km]
        r2: Final position vector [km]
        tof: Time of flight [s]
        mu: Gravitational parameter [km³/s²]
    
    Returns:
        v1, v2: Initial and final velocity vectors [km/s]
    """
    try:
        # Convert to numpy arrays
        r1 = np.array(r1)
        r2 = np.array(r2)
        
        # Lambert solver (simplified implementation)
        # In production, would use poliastro.iod.lambert
        
        r1_mag = np.linalg.norm(r1)
        r2_mag = np.linalg.norm(r2)
        
        # Transfer angle
        cos_dnu = np.dot(r1, r2) / (r1_mag * r2_mag)
        dnu = np.arccos(np.clip(cos_dnu, -1, 1))
        
        # Semi-major axis estimate
        c = np.linalg.norm(r2 - r1)
        s = (r1_mag + r2_mag + c) / 2
        a_min = s / 2
        
        # Parabolic time of flight
        alpha = 2 * np.arcsin(np.sqrt(s / (2 * r1_mag)))
        beta = 2 * np.arcsin(np.sqrt((s - c) / (2 * r2_mag)))
        
        if dnu < np.pi:
            alpha = alpha
            beta = beta
        else:
            alpha = 2 * np.pi - alpha
            beta = 2 * np.pi - beta
            
        tof_parabolic = (1 / 3) * np.sqrt(2 / mu) * (s**(3/2) - (s - c)**(3/2))
        
        # Estimate semi-major axis
        if tof > tof_parabolic:
            # Elliptical transfer
            a = a_min * 1.2  # Simplified estimate
        else:
            # Hyperbolic transfer
            a = -a_min * 0.8
            
        # Velocity calculation (simplified)
        v1_mag = np.sqrt(mu * (2/r1_mag - 1/a))
        v2_mag = np.sqrt(mu * (2/r2_mag - 1/a))
        
        # Direction vectors (simplified)
        h = np.cross(r1, r2)
        h_unit = h / np.linalg.norm(h)
        
        v1_direction = np.cross(h_unit, r1)
        v1_direction = v1_direction / np.linalg.norm(v1_direction)
        
        v2_direction = np.cross(h_unit, r2)
        v2_direction = v2_direction / np.linalg.norm(v2_direction)
        
        v1 = v1_mag * v1_direction
        v2 = v2_mag * v2_direction
        
        return v1, v2
        
    except Exception as e:
        logger.error(f"Lambert calculation failed: {e}")
        # Return fallback values
        return np.array([15.0, 0, 0]), np.array([15.0, 0, 0])

def find_optimal_windows(propulsion_type, payload_mass, search_days=365):
    """Find optimal launch windows within search period"""
    
    propulsion = PropulsionSystem.SYSTEMS[propulsion_type]
    interstellar_obj = InterstellarObject()
    
    best_windows = []
    current_date = datetime.now()
    
    # Search through potential launch dates
    for day_offset in range(0, search_days, 10):  # Check every 10 days
        launch_date = current_date + timedelta(days=day_offset)
        
        # Try different flight times
        for flight_time_days in range(60, 400, 30):  # 60-400 days flight time
            try:
                arrival_date = launch_date + timedelta(days=flight_time_days)
                
                # Earth position at launch (simplified)
                earth_pos_launch = [149.6, 0, 0]  # AU converted to million km
                earth_vel_launch = [0, 29.8, 0]    # km/s
                
                # 3I/ATLAS position at arrival (simplified)
                target_pos_arrival = [200 + day_offset * 0.5, 50, 30]  # Simplified trajectory
                
                # Calculate transfer orbit
                tof_seconds = flight_time_days * 24 * 3600
                v1, v2 = calculate_lambert_transfer(earth_pos_launch, target_pos_arrival, tof_seconds)
                
                # Calculate required delta-V
                earth_departure_v = np.array(earth_vel_launch)
                required_delta_v = np.linalg.norm(v1 - earth_departure_v)
                
                # Check if feasible with given propulsion
                if required_delta_v <= propulsion['max_delta_v']:
                    # Calculate fuel requirements
                    fuel_required = calculate_tsiolkovsky_fuel(
                        required_delta_v, 
                        propulsion['specific_impulse'], 
                        payload_mass
                    )
                    
                    window = {
                        'launch_date': launch_date.isoformat(),
                        'arrival_date': arrival_date.isoformat(),
                        'flight_time_days': flight_time_days,
                        'delta_v': round(required_delta_v, 2),
                        'fuel_required': round(fuel_required, 1),
                        'efficiency_score': round(propulsion['max_delta_v'] / required_delta_v, 2)
                    }
                    
                    best_windows.append(window)
                    
            except Exception as e:
                logger.warning(f"Window calculation failed for day {day_offset}: {e}")
                continue
    
    # Sort by efficiency (lower delta-V is better)
    best_windows.sort(key=lambda x: x['delta_v'])
    
    return best_windows[:5]  # Return top 5 windows

@app.route('/api/optimal_window', methods=['POST'])
def calculate_optimal_window():
    """Calculate optimal intercept window"""
    try:
        data = request.get_json()
        propulsion_type = data.get('propulsion', 'chemical')
        payload_mass = data.get('payloadMass', 1000)
        
        logger.info(f"Calculating optimal window for {propulsion_type} propulsion, {payload_mass}kg payload")
        
        # Validate propulsion type
        if propulsion_type not in PropulsionSystem.SYSTEMS:
            return jsonify({'error': 'Invalid propulsion type'}), 400
            
        # Find optimal windows
        windows = find_optimal_windows(propulsion_type, payload_mass)
        
        if not windows:
            return jsonify({
                'success': False,
                'interceptSuccess': False,
                'explanation': f'No feasible intercept windows found with {propulsion_type} propulsion system.',
                'suggestion': 'Try nuclear or ion propulsion for better performance.'
            })
        
        # Return best window
        best_window = windows[0]
        propulsion = PropulsionSystem.SYSTEMS[propulsion_type]
        
        return jsonify({
            'success': True,
            'interceptSuccess': True,
            'optimalLaunchDate': best_window['launch_date'],
            'arrivalDate': best_window['arrival_date'],
            'travelTime': best_window['flight_time_days'],
            'deltaV': str(best_window['delta_v']),
            'fuelRequired': int(best_window['fuel_required']),
            'explanation': f'Optimal launch window found! The {propulsion["name"]} can successfully intercept 3I/ATLAS with {best_window["delta_v"]} km/s delta-V.',
            'educationalNote': f'This window is optimal because it minimizes the required velocity change. Efficiency score: {best_window["efficiency_score"]}',
            'alternativeWindows': windows[1:4]  # Additional options
        })
        
    except Exception as e:
        logger.error(f"Optimal window calculation failed: {e}")
        return jsonify({'error': 'Calculation failed', 'details': str(e)}), 500

@app.route('/api/anytime_chase', methods=['POST'])
def calculate_anytime_chase():
    """Calculate intercept for user-selected launch date"""
    try:
        data = request.get_json()
        propulsion_type = data.get('propulsion', 'chemical')
        payload_mass = data.get('payloadMass', 1000)
        launch_date_str = data.get('launchDate')
        
        logger.info(f"Calculating anytime chase for {launch_date_str}")
        
        # Validate inputs
        if propulsion_type not in PropulsionSystem.SYSTEMS:
            return jsonify({'error': 'Invalid propulsion type'}), 400
            
        launch_date = datetime.fromisoformat(launch_date_str.replace('Z', '+00:00').replace('T', ' ').split('+')[0])
        current_date = datetime.now()
        
        propulsion = PropulsionSystem.SYSTEMS[propulsion_type]
        
        # Calculate mission based on launch date
        days_from_now = (launch_date - current_date).days
        
        # Estimate mission difficulty based on timing
        # Closer to "optimal" windows (30-90 days from now) are easier
        optimal_range = range(30, 91)
        if days_from_now in optimal_range:
            difficulty_multiplier = 1.0
        else:
            difficulty_multiplier = 1.0 + abs(days_from_now - 60) / 100
            
        # Base requirements
        base_delta_v = 8.0  # km/s
        required_delta_v = base_delta_v * difficulty_multiplier
        
        # Flight time estimation
        base_flight_time = 180  # days
        flight_time = int(base_flight_time * (1 + (difficulty_multiplier - 1) * 0.5))
        
        # Check feasibility
        success = required_delta_v <= propulsion['max_delta_v']
        
        if success:
            # Calculate fuel requirements
            fuel_required = calculate_tsiolkovsky_fuel(
                required_delta_v,
                propulsion['specific_impulse'],
                payload_mass
            )
            
            arrival_date = launch_date + timedelta(days=flight_time)
            
            return jsonify({
                'success': True,
                'interceptSuccess': True,
                'launchDate': launch_date.isoformat(),
                'arrivalDate': arrival_date.isoformat(),
                'travelTime': flight_time,
                'deltaV': f'{required_delta_v:.2f}',
                'fuelRequired': int(fuel_required),
                'explanation': f'Mission successful! Your spacecraft will intercept 3I/ATLAS in {flight_time} days using {required_delta_v:.1f} km/s delta-V.',
                'educationalNote': f'Launch timing affects efficiency. Optimal windows typically require 20-30% less delta-V than suboptimal ones.'
            })
            
        else:
            # Mission failed
            fuel_if_possible = calculate_tsiolkovsky_fuel(
                propulsion['max_delta_v'],
                propulsion['specific_impulse'], 
                payload_mass
            )
            
            return jsonify({
                'success': False,
                'interceptSuccess': False,
                'launchDate': launch_date.isoformat(),
                'travelTime': flight_time,
                'deltaV': f'{required_delta_v:.2f}',
                'fuelRequired': int(fuel_if_possible),
                'explanation': f'Mission failed. Required delta-V ({required_delta_v:.1f} km/s) exceeds {propulsion["name"]} capability ({propulsion["max_delta_v"]} km/s).',
                'failureReason': 'insufficient_thrust',
                'suggestion': f'Try launching {"earlier" if days_from_now > 60 else "later"} for better geometry, or switch to {"nuclear" if propulsion["max_delta_v"] < 25 else "ion"} propulsion.',
                'educationalNote': 'Interstellar intercepts require precise timing. The target\'s hyperbolic trajectory means launch windows are critical.'
            })
            
    except Exception as e:
        logger.error(f"Anytime chase calculation failed: {e}")
        return jsonify({'error': 'Calculation failed', 'details': str(e)}), 500

@app.route('/api/propulsion_info', methods=['GET'])
def get_propulsion_info():
    """Get information about available propulsion systems"""
    return jsonify(PropulsionSystem.SYSTEMS)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
