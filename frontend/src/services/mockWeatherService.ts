/**
 * 模拟天气数据服务，提供可靠的天气数据
 */

interface WeatherResponse {
  current: {
    temperature_2m: number;
    wind_speed_10m: number;
    relative_humidity_2m: number;
    precipitation: number;
    time: string;
  };
  daily: {
    time: string[];
    precipitation_sum: number[];
  };
}

// 生成随机的真实感天气数据
function generateRandomWeather(latitude: number, longitude: number): WeatherResponse {
  // 基于经纬度生成一些稍微固定一点的随机数
  const seed = (latitude * 1000 + longitude * 100) % 100;
  const randomFactor = (seed / 100) + 0.5;
  
  // 大致按照季节和地理位置计算基础温度
  const currentDate = new Date();
  const month = currentDate.getMonth(); // 0-11
  const isSummer = month >= 4 && month <= 9;
  const isNorth = latitude > 30;
  
  // 基础温度
  let baseTemp = isSummer ? 26 : 10;
  if (isNorth && !isSummer) baseTemp -= 5; // 北方冬天更冷
  if (!isNorth && isSummer) baseTemp += 3; // 南方夏天更热
  
  // 基于经度调整 (西部偏干燥)
  const isWest = longitude < 110;
  const humidity = isWest ? 
    40 + Math.floor(Math.random() * 20) : 
    60 + Math.floor(Math.random() * 20);
  
  // 生成当前时间
  const now = new Date();
  
  // 生成未来5天日期
  const nextDays = Array(5).fill(null).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date.toISOString().split('T')[0];
  });
  
  // 生成未来5天降水量，有20%概率连续降雨
  const isRainyPeriod = Math.random() < 0.2;
  const precipitationData = nextDays.map(() => {
    if (isRainyPeriod) {
      return Math.random() < 0.7 ? 
        parseFloat((Math.random() * 15 * randomFactor).toFixed(1)) : 0;
    } else {
      return Math.random() < 0.2 ? 
        parseFloat((Math.random() * 8 * randomFactor).toFixed(1)) : 0;
    }
  });
  
  // 当前是否有降水
  const currentPrecipitation = Math.random() < 0.2 ? 
    parseFloat((Math.random() * 3 * randomFactor).toFixed(1)) : 0;
  
  return {
    current: {
      temperature_2m: parseFloat((baseTemp + (Math.random() * 10 - 5) * randomFactor).toFixed(1)),
      wind_speed_10m: parseFloat((2 + Math.random() * 6 * randomFactor).toFixed(1)),
      relative_humidity_2m: humidity,
      precipitation: currentPrecipitation,
      time: now.toISOString()
    },
    daily: {
      time: nextDays,
      precipitation_sum: precipitationData
    }
  };
}

/**
 * 获取指定经纬度的天气数据
 */
export const getWeatherData = async (latitude: number, longitude: number): Promise<WeatherResponse> => {
  console.log(`模拟获取天气数据: 经度=${longitude}, 纬度=${latitude}`);
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
  
  // 生成模拟数据
  const mockData = generateRandomWeather(latitude, longitude);
  
  console.log(`生成的模拟天气数据:`, mockData);
  return mockData;
}; 