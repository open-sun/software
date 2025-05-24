import React, { useState, useEffect } from 'react';
import { Spin, Typography, Empty, Button } from 'antd';
import { getMarketData, MarketData, MarketQueryParams } from '../services/marketService';
import MarketDataTable from '../components/MarketDataTable';
import { ReloadOutlined, ShoppingOutlined } from '@ant-design/icons';

const { Title } = Typography;

const MarketPanel: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [marketLoading, setMarketLoading] = useState(true);
  const [marketError, setMarketError] = useState<string | null>(null);

  const fetchMarketData = async (params: MarketQueryParams = {}) => {
    try {
      setMarketLoading(true);
      setMarketError(null);
      let retryCount = 0;
      let result;
      while (retryCount < 3) {
        try {
          result = await getMarketData(params);
          if (result && result.list && result.list.length > 0) {
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
          retryCount++;
        } catch (error) {
          retryCount++;
          if (retryCount >= 3) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      if (result && result.list) {
        if (result.list.length === 0) {
          setMarketError('今日市场未开市，没有获取到市场数据，请稍后再试');
        } else {
          setMarketData(result.list);
        }
      } else {
        setMarketError('市场数据格式异常，请检查接口');
        setMarketData([]);
      }
    } catch (error) {
      setMarketError('获取市场数据失败，请稍后再试');
      setMarketData([]);
    } finally {
      setMarketLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  const handleRefreshMarket = (params: MarketQueryParams = {}) => {
    setMarketLoading(true);
    fetchMarketData(params);
  };

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
    </>
  );
};

export default MarketPanel;