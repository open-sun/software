import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Tabs, Spin, Alert, Typography, Empty, Button } from 'antd';
import { getWeatherData } from '../services/weatherService';
import { getMarketData,  MarketData, MarketQueryParams } from '../services/marketService';
import WeatherCard from '../components/WeatherCard';
import HoverRainfallChart from '../components/HoverRainfallChart';
import MarketDataTable from '../components/MarketDataTable';
import { ReloadOutlined, CloudOutlined, ShoppingOutlined, LineChartOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { TabPane } = Tabs;
const { Title } = Typography;

// 定义中国主要水产养殖业丰富的城市及其坐标
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

// 定义天气数据类型
interface WeatherInfo {
  temperature_2m: number;
  wind_speed_10m: number;
  relative_humidity_2m: number;
  precipitation: number;
  time: string;
}

// 定义城市天气数据map类型
interface CityWeatherMap {
  [city: string]: {
    current: WeatherInfo | null;
    daily?: {
      time: string[];
      precipitation_sum: number[];
    };
  } | null;
}

const DataCenter: React.FC = () => {
  const [weatherData, setWeatherData] = useState<CityWeatherMap>({});
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [marketLoading, setMarketLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [dataConsistencyIssue, setDataConsistencyIssue] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState('weather');
  
  // 移除以下市场价格趋势相关状态
  // const [trendLoading, setTrendLoading] = useState(false);
  // const [selectedProduct, setSelectedProduct] = useState<string>('');
  // const [selectedSpec, setSelectedSpec] = useState<string>('');
  // const [specOptions, setSpecOptions] = useState<string[]>([]);

  const fetchAllCitiesWeather = async () => {
    try {
      setWeatherError(null);
      setRefreshing(true);
      console.log('开始获取天气数据...');
      
      // 创建一个新的map来存储天气数据
      const weatherMap: CityWeatherMap = {};
      let hasConsistencyIssue = false;
      
      // 依次获取每个城市的天气数据
      for (const city of AQUACULTURE_CITIES) {
        try {
          const data = await getWeatherData(city.lat, city.lng);
          console.log(`成功获取${city.name}天气数据:`, data);
          
          // 确保数据格式正确
          if (!data.current) {
            data.current = {
              temperature_2m: 0,
              wind_speed_10m: 0,
              relative_humidity_2m: 0,
              precipitation: 0,
              time: new Date().toISOString()
            };
          }
          
          // 确保daily数据存在且格式正确
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
          
          // 确保数组长度一致
          const minLength = Math.min(data.daily.time.length, data.daily.precipitation_sum.length);
          data.daily.time = data.daily.time.slice(0, minLength);
          data.daily.precipitation_sum = data.daily.precipitation_sum.slice(0, minLength);
          
          // 检查数据一致性
          if (data.current && data.daily && data.daily.time.length > 0) {
            const currentDate = new Date(data.current.time).toISOString().split('T')[0];
            const firstDailyDate = data.daily.time[0];
            
            // 如果当前日期与第一个预报日期相同，但降水量不同，则可能存在不一致
            if (currentDate === firstDailyDate && 
                Math.abs(data.current.precipitation - data.daily.precipitation_sum[0]) > 1) {
              hasConsistencyIssue = true;
              console.warn("数据一致性问题: 当前降水量与预报降水量不一致");
            }
          }
          
          weatherMap[city.name] = {
            current: data.current,
            daily: data.daily
          };
        } catch (err) {
          console.error(`获取${city.name}天气数据失败:`, err);
          // 为失败的城市提供默认数据，避免UI显示异常
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
      console.log('所有天气数据结果:', weatherMap);
      setWeatherData(weatherMap);
    } catch (error) {
      console.error('获取天气数据失败:', error);
      setWeatherError('获取天气数据失败，请稍后再试');
    } finally {
      setWeatherLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMarketData = async (params: MarketQueryParams = {}) => {
    try {
      setMarketLoading(true);
      setMarketError(null);
      
      // 尝试获取数据
      let retryCount = 0;
      let result;
      
      // 最多尝试3次
      while (retryCount < 3) {
        try {
          result = await getMarketData(params);
          
          // 如果成功获取到数据并且list不为空，跳出循环
          if (result && result.list && result.list.length > 0) {
            break;
          }
          
          // 如果没有获取到数据，等待一段时间后重试
          console.log(`未获取到市场数据，第${retryCount + 1}次重试中...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
          retryCount++;
        } catch (error) {
          console.error(`第${retryCount + 1}次获取市场数据失败:`, error);
          retryCount++;
          
          // 最后一次尝试失败，抛出异常
          if (retryCount >= 3) {
            throw error;
          }
          
          // 等待后重试
          await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
        }
      }
      
      if (result && result.list) {
        if (result.list.length === 0) {
          setMarketError('今日市场未开市，没有获取到市场数据，请稍后再试');
        } else {
          setMarketData(result.list);
          console.log(`成功获取到${result.list.length}条市场数据`);
        }
      } else {
        setMarketError('市场数据格式异常，请检查接口');
        setMarketData([]);
      }
    } catch (error) {
      console.error('获取市场数据失败:', error);
      setMarketError('获取市场数据失败，请稍后再试');
      setMarketData([]);
    } finally {
      setMarketLoading(false);
    }
  };

  useEffect(() => {
    if (activeTabKey === 'weather') {
      fetchAllCitiesWeather();
    } else if (activeTabKey === 'market') {
      fetchMarketData();
    }
  }, [activeTabKey]);
  
  const handleRefreshWeather = () => {
    setWeatherLoading(true);
    fetchAllCitiesWeather();
  };
  
  const handleRefreshMarket = (params: MarketQueryParams = {}) => {
    setMarketLoading(true);
    fetchMarketData(params);
  };
  
  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
  };

  // 获取唯一的产品名称列表
  const getUniqueProducts = () => {
    const products = new Set<string>();
    marketData.forEach(item => {
      if (item.prodName) {
        products.add(item.prodName);
      }
    });
    return Array.from(products);
  };

  const renderWeatherContent = () => {
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

  const renderMarketContent = () => {
    if (marketLoading && marketData.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: '20px', color: '#999' }}>
            正在获取水产市场价格数据...
          </div>
        </div>
      );
    }
    
    if (marketError && marketData.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span style={{ color: '#ff4d4f' }}>{marketError}</span>
          }
        >
          <Button type="primary" onClick={() => handleRefreshMarket()} icon={<ReloadOutlined />}>
            重新加载
          </Button>
        </Empty>
      );
    }
    
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            <ShoppingOutlined style={{ marginRight: '8px' }} />
            水产市场价格监控
          </Title>
        </div>
        
        <MarketDataTable 
          data={marketData} 
          loading={marketLoading} 
          onRefresh={handleRefreshMarket}
        />
        
        {/* 移除价格趋势分析区域的所有代码 */}
      </>
    );
  };

  return (
    <Layout>
      <Content style={{ padding: '20px' }}>
        <Card 
          title="数据中心" 
          bordered={false}
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '8px' }}
        >
          <Tabs 
            defaultActiveKey="weather" 
            activeKey={activeTabKey}
            onChange={handleTabChange}
            style={{ marginTop: '5px' }}
          >
            <TabPane 
              tab={
                <span>
                  <CloudOutlined />
                  天气数据
                </span>
              } 
              key="weather"
            >
              {renderWeatherContent()}
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <ShoppingOutlined />
                  市场数据
                </span>
              } 
              key="market"
            >
              {renderMarketContent()}
            </TabPane>
          </Tabs>
        </Card>
      </Content>
    </Layout>
  );
};

export default DataCenter;