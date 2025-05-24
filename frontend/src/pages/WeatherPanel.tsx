import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spin, Alert, Typography, Empty, Button } from 'antd';
import { getWeatherData } from '../services/weatherService';
import WeatherCard from '../components/WeatherCard';
import HoverRainfallChart from '../components/HoverRainfallChart';
import { ReloadOutlined, CloudOutlined } from '@ant-design/icons';

const { Title } = Typography;

const AQUACULTURE_CITIES = [
  { name: '大连', lat: 38.9140, lng: 121.6147, desc: '海水养殖中心，以贝类、海参养殖为主' },
  { name: '青岛', lat: 36.0671, lng: 120.3826, desc: '海水鱼类、贝类养殖基地' },
  { name: '舟山', lat: 29.9855, lng: 122.2067, desc: '海岛渔业发达，海水养殖规模大' },
  { name: '厦门', lat: 24.4798, lng: 118.0894, desc: '对虾、鲍鱼等高端海产养殖' },
  { name: '湛江', lat: 21.2707, lng: 110.3594, desc: '热带海水养殖中心，对虾养殖基地' },
  { name: '武汉', lat: 30.5928, lng: 114.3055, desc: '长江流域淡水鱼养殖中心' },
  { name: '南京', lat: 32.0603, lng: 118.7969, desc: '淡水鱼类养殖区，长江水系' },
  { name: '中山', lat: 22.5415, lng: 113.3926, desc: '珠江三角洲水产养殖基地' },
  { name: '长沙', lat: 28.2282, lng: 112.9388, desc: '湖南淡水鱼类养殖基地，洞庭湖区' }
];

interface WeatherInfo {
  temperature_2m: number;
  wind_speed_10m: number;
  relative_humidity_2m: number;
  precipitation: number;
  time: string;
}
interface CityWeatherMap {
  [city: string]: {
    current: WeatherInfo | null;
    daily?: {
      time: string[];
      precipitation_sum: number[];
    };
  } | null;
}

const WeatherPanel: React.FC = () => {
  const [weatherData, setWeatherData] = useState<CityWeatherMap>({});
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [dataConsistencyIssue, setDataConsistencyIssue] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllCitiesWeather = async () => {
    try {
      setWeatherError(null);
      setRefreshing(true);
      const weatherMap: CityWeatherMap = {};
      let hasConsistencyIssue = false;
      for (const city of AQUACULTURE_CITIES) {
        try {
          const data = await getWeatherData(city.lat, city.lng);
          if (!data.current) {
            data.current = {
              temperature_2m: 0,
              wind_speed_10m: 0,
              relative_humidity_2m: 0,
              precipitation: 0,
              time: new Date().toISOString()
            };
          }
          if (!data.daily || !data.daily.time || !data.daily.precipitation_sum) {
            data.daily = {
              time: Array(5).fill('').map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                return date.toISOString().split('T')[0];
              }),
              precipitation_sum: Array(5).fill(0)
            };
          }
          const minLength = Math.min(data.daily.time.length, data.daily.precipitation_sum.length);
          data.daily.time = data.daily.time.slice(0, minLength);
          data.daily.precipitation_sum = data.daily.precipitation_sum.slice(0, minLength);
          if (data.current && data.daily && data.daily.time.length > 0) {
            const currentDate = new Date(data.current.time).toISOString().split('T')[0];
            const firstDailyDate = data.daily.time[0];
            if (currentDate === firstDailyDate && 
                Math.abs(data.current.precipitation - data.daily.precipitation_sum[0]) > 1) {
              hasConsistencyIssue = true;
            }
          }
          weatherMap[city.name] = {
            current: data.current,
            daily: data.daily
          };
        } catch (err) {
          weatherMap[city.name] = {
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
      }
      setDataConsistencyIssue(hasConsistencyIssue);
      setWeatherData(weatherMap);
    } catch (error) {
      setWeatherError('获取天气数据失败，请稍后再试');
    } finally {
      setWeatherLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllCitiesWeather();
  }, []);

  const handleRefreshWeather = () => {
    setWeatherLoading(true);
    fetchAllCitiesWeather();
  };

  if (weatherLoading && !refreshing) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: '20px', color: '#999' }}>
          正在获取各城市天气数据...
        </div>
      </div>
    );
  }
  if (weatherError) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span style={{ color: '#ff4d4f' }}>{weatherError}</span>
        }
      >
        <Button type="primary" onClick={handleRefreshWeather} icon={<ReloadOutlined />}>
          重新加载
        </Button>
      </Empty>
    );
  }
  return (
    <>
      {dataConsistencyIssue && (
        <Alert
          message="数据说明"
          description="温馨提示：卡片中显示的是当前实时降水量(mm/h)，而悬停查看的预报图表中展示的是未来每日降水累计量(mm/天)，因此两者可能存在数值差异。"
          type="info"
          showIcon
          style={{ marginBottom: '20px' }}
          closable
        />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>
          <CloudOutlined style={{ marginRight: '8px' }} />
          城市天气实时监控
        </Title>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          loading={refreshing}
          onClick={handleRefreshWeather}
          style={{ borderRadius: '4px' }}
        >
          刷新数据
        </Button>
      </div>
      <Row gutter={[16, 16]}>
        {AQUACULTURE_CITIES.map(city => (
          <Col 
            xs={24} 
            sm={12} 
            md={8} 
            key={city.name}
            style={{ height: '100%' }}
          >
            {weatherData[city.name]?.current && weatherData[city.name]?.daily ? (
              <HoverRainfallChart
                dates={weatherData[city.name]?.daily?.time || []}
                rainfallData={weatherData[city.name]?.daily?.precipitation_sum || []}
                title={`${city.name}未来降水量预报`}
              >
                <WeatherCard
                  temperature={weatherData[city.name]?.current?.temperature_2m || 0}
                  windSpeed={weatherData[city.name]?.current?.wind_speed_10m || 0}
                  humidity={weatherData[city.name]?.current?.relative_humidity_2m || 0}
                  precipitation={weatherData[city.name]?.current?.precipitation || 0}
                  time={weatherData[city.name]?.current?.time || ''}
                  cityName={city.name}
                  description={city.desc}
                />
              </HoverRainfallChart>
            ) : (
              <Card
                style={{
                  borderRadius: '15px',
                  background: '#f0f2f5',
                  marginBottom: '20px',
                  height: '100%',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
                }}
                hoverable
              >
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <h3>{city.name}</h3>
                  <p>{city.desc}</p>
                  <div style={{ marginTop: '20px' }}>
                    {refreshing ? (
                      <Spin size="small" />
                    ) : (
                      <Button 
                        size="small" 
                        type="link" 
                        onClick={handleRefreshWeather}
                        icon={<ReloadOutlined />}
                      >
                        加载数据
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </Col>
        ))}
      </Row>
    </>
  );
};

export default WeatherPanel;