import React from 'react';
import { Card, Divider, Tooltip } from 'antd';

interface WeatherCardProps {
  temperature: number;
  windSpeed: number;
  humidity: number;
  precipitation: number;
  time: string;
  cityName: string;
  description: string;
}

// 根据天气情况确定背景样式
const getWeatherBackground = (temperature: number, precipitation: number, humidity: number) => {
  // 大雨
  if (precipitation > 5) {
    return 'linear-gradient(135deg, #3C6382 0%, #0A3D62 100%)';
  }
  
  // 小雨
  if (precipitation > 0) {
    return 'linear-gradient(135deg, #6a85b6 0%, #5a7baa 100%)';
  }
  
  // 高温晴天
  if (temperature > 30) {
    return 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)';
  }
  
  // 温暖晴天
  if (temperature > 20 && temperature <= 30) {
    return 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)';
  }
  
  // 寒冷天气
  if (temperature < 10) {
    return 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)';
  }
  
  // 高湿度
  if (humidity > 80) {
    return 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)';
  }
  
  // 默认天气（晴朗）
  return 'linear-gradient(135deg, #2980B9 0%, #6DD5FA 100%)';
};

// 获取天气状态描述
const getWeatherStatus = (temperature: number, precipitation: number, humidity: number, windSpeed: number) => {
  // 天气图标
  let icon = '☀️';
  let status = '晴朗';
  
  if (precipitation > 5) {
    icon = '🌧️';
    status = "大雨";
  } else if (precipitation > 2) {
    icon = '🌦️';
    status = "中雨";
  } else if (precipitation > 0) {
    icon = '🌤️';
    status = "小雨";
  } else if (temperature > 30) {
    icon = '🔥';
    status = "炎热";
  } else if (temperature > 25) {
    icon = '☀️';
    status = "温暖";
  } else if (temperature < 5) {
    icon = '❄️';
    status = "严寒";
  } else if (temperature < 10) {
    icon = '🌡️';
    status = "寒冷";
  } else if (humidity > 85) {
    icon = '💧';
    status = "潮湿";
  } else if (windSpeed > 8) {
    icon = '🌪️';
    status = "大风";
  } else {
    icon = '☀️';
    status = "晴朗";
  }
  
  return { icon, status };
};

const WeatherCard: React.FC<WeatherCardProps> = ({
  temperature,
  windSpeed,
  humidity,
  precipitation,
  time,
  cityName,
  description
}) => {
  // 根据气象条件确定背景和状态
  const background = getWeatherBackground(temperature, precipitation, humidity);
  const { icon, status } = getWeatherStatus(temperature, precipitation, humidity, windSpeed);
  
  // 确保时间格式正确
  const formattedTime = time ? new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }) : '未知';
  
  return (
    <Card
      style={{
        borderRadius: '15px',
        background,
        color: 'white',
        marginBottom: '20px',
        height: '100%',
        boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
      }}
      hoverable
    >
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ color: 'white', margin: 0, fontSize: '22px', fontWeight: 600 }}>{cityName}</h2>
            <div style={{ 
              fontSize: '14px', 
              color: 'white', 
              padding: '3px 8px', 
              background: 'rgba(255,255,255,0.2)', 
              borderRadius: '20px',
              display: 'inline-block',
              marginTop: '5px'
            }}>
              {icon} {status}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ color: 'white', margin: 0, fontSize: '28px', fontWeight: 700 }}>{temperature}°C</h2>
            <div style={{ 
              fontSize: '10px', 
              color: 'rgba(255,255,255,0.8)', 
              marginTop: '2px'
            }}>
              实时数据
            </div>
          </div>
        </div>

        <div style={{ 
          fontSize: '12px', 
          color: 'rgba(255,255,255,0.9)', 
          marginTop: '10px', 
          minHeight: '36px',
          padding: '5px 8px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '8px'
        }}>
          {description}
        </div>
        
        <Divider style={{ margin: '12px 0', borderColor: 'rgba(255,255,255,0.2)' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Tooltip title="风速">
            <div style={{ 
              padding: '5px 8px', 
              background: 'rgba(255,255,255,0.15)', 
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '16px' }}>💨</span>
              <span style={{ color: 'white', marginTop: '3px', fontWeight: '500' }}>{windSpeed} m/s</span>
            </div>
          </Tooltip>
          
          <Tooltip title="湿度">
            <div style={{ 
              padding: '5px 8px', 
              background: 'rgba(255,255,255,0.15)', 
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '16px' }}>💧</span>
              <span style={{ color: 'white', marginTop: '3px', fontWeight: '500' }}>{humidity}%</span>
            </div>
          </Tooltip>
          
          <Tooltip title="当前降水量">
            <div style={{ 
              padding: '5px 8px', 
              background: 'rgba(255,255,255,0.15)', 
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '16px' }}>🌧️</span>
              <span style={{ color: 'white', marginTop: '3px', fontWeight: '500' }}>
                {precipitation > 0 ? `${precipitation.toFixed(1)} mm` : '无'}
              </span>
            </div>
          </Tooltip>
        </div>

        <div style={{ color: 'rgba(255,255,255,0.8)', marginTop: '12px', fontSize: '11px', textAlign: 'center' }}>
          更新时间: {formattedTime}
        </div>
      </div>
    </Card>
  );
};

export default WeatherCard; 