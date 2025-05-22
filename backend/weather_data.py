from flask import Blueprint, request, jsonify
import requests

weather_bp = Blueprint("weather", __name__)

@weather_bp.route('/api/weather/current')
def get_weather():
    try:
        latitude = request.args.get('latitude', type=float)
        longitude = request.args.get('longitude', type=float)
        
        if not latitude or not longitude:
            return jsonify({'error': 'Latitude and longitude are required'}), 400
            
        # 使用OpenMeteo免费开放API
        url = 'https://api.open-meteo.com/v1/forecast'
        params = {
            'latitude': latitude,
            'longitude': longitude,
            'current': 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m',
            'daily': 'precipitation_sum',
            'forecast_days': 5,
            'timezone': 'auto'
        }
        
        print(f"Requesting OpenMeteo weather data: {params}")
        
        response = requests.get(url, params=params)
        
        if response.status_code == 200:
            data = response.json()
            print(f"Weather data received successfully")
            
            # 确保返回数据的结构一致
            if 'current' not in data:
                data['current'] = {
                    'temperature_2m': 0,
                    'wind_speed_10m': 0,
                    'relative_humidity_2m': 0,
                    'precipitation': 0,
                    'time': ''
                }
            
            # 如果没有降水量数据，设为0
            if 'precipitation' not in data['current']:
                data['current']['precipitation'] = 0
                
            # 确保daily数据存在
            if 'daily' not in data:
                data['daily'] = {
                    'time': [],
                    'precipitation_sum': []
                }
                
            return jsonify(data)
        else:
            error_msg = f"Failed to fetch weather data: {response.status_code}, {response.text}"
            print(error_msg)
            return jsonify({'error': error_msg}), response.status_code
            
    except Exception as e:
        error_msg = f"Error in weather API: {str(e)}"
        print(error_msg)
        return jsonify({'error': error_msg}), 500
