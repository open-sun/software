import React, { useState, useEffect } from 'react';
import { Card, notification } from 'antd';
import MarketDataTable from '../components/MarketDataTable';
import { getMarketData, MarketData, MarketQueryParams } from '../services/marketService';

const MarketDataPage: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 获取市场数据
  const fetchMarketData = async (params: MarketQueryParams = {}) => {
    setLoading(true);
    try {
      const result = await getMarketData(params);
      setMarketData(result.list || []);
    } catch (error) {
      console.error('加载市场数据失败:', error);
      notification.error({
        message: '数据加载失败',
        description: '无法获取市场价格数据，请稍后再试',
      });
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchMarketData();
  }, []);

  return (
    <div className="market-data-page">
      <Card bordered={false}>
        <MarketDataTable 
          data={marketData} 
          loading={loading}
          onRefresh={fetchMarketData}
        />
      </Card>
    </div>
  );
};

export default MarketDataPage;