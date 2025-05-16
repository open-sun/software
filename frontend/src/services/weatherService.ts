import axiosInstance from './axiosInstance';

interface WeatherResponse {
  current: {
    temperature_2m: number;
    wind_speed_10m: number;
    relative_humidity_2m: number;
    precipitation: number;
    time: string;
  };
  daily?: {
    time: string[];
    precipitation_sum: number[];
  };
}

export const getWeatherData = async (latitude: number, longitude: number) => {
  try {
    console.log(`Fetching weather data for coordinates: ${latitude}, ${longitude}`);
    const response = await axiosInstance.get<WeatherResponse>(
      `/api/weather/current?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,relative_humidity_2m,precipitation&daily=precipitation_sum&forecast_days=5`
    );
    
    // 日志输出响应数据，用于调试
    console.log(`Weather data response for ${latitude}, ${longitude}:`, response.data);
    
    // 确保数据格式正确
    const data = response.data;
    if (!data.current) {
      data.current = {
        temperature_2m: 0,
        wind_speed_10m: 0,
        relative_humidity_2m: 0,
        precipitation: 0,
        time: new Date().toISOString()
      };
    }
    
    // 如果没有降水量数据，设为0
    if (!data.current.precipitation && data.current.precipitation !== 0) {
      data.current.precipitation = 0;
    }
    
    // 如果没有daily数据，创建空数组
    if (!data.daily) {
      data.daily = {
        time: Array(5).fill('').map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + i);
          return date.toISOString().split('T')[0];
        }),
        precipitation_sum: Array(5).fill(0)
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // 返回默认数据，避免UI崩溃
    return {
      current: {
        temperature_2m: 0,
        wind_speed_10m: 0,
        relative_humidity_2m: 0,
        precipitation: 0,
        time: new Date().toISOString()
      },
      daily: {
        time: Array(5).fill('').map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + i);
          return date.toISOString().split('T')[0];
        }),
        precipitation_sum: Array(5).fill(0)
      }
    };
  }
}; 