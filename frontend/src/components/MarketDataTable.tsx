import React, { useState, useEffect } from 'react';
import { Table, Card, Tooltip, Badge, Tag, Empty, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MarketData } from '../services/marketService';
import { ArrowUpOutlined, ArrowDownOutlined, ShoppingOutlined, ReloadOutlined } from '@ant-design/icons';

interface MarketDataTableProps {
  data: MarketData[];
  loading: boolean;
  onRefresh?: (params: any) => void;
}

const MarketDataTable: React.FC<MarketDataTableProps> = ({ data, loading, onRefresh }) => {
  const [filteredData, setFilteredData] = useState<MarketData[]>(data);

  // 当数据变化时更新筛选后的数据
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  // 刷新数据
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh({});
    }
  };

  // 获取价格等级样式和标签
  const getPriceLevel = (lowPrice: string, highPrice: string, avgPrice: string) => {
    const avg = parseFloat(avgPrice);
    
    // 根据价格确定级别
    if (avg > 30) {
      return { color: '#f5222d', level: '高', icon: <ArrowUpOutlined />, tagColor: 'red' };
    } else if (avg > 15) {
      return { color: '#fa8c16', level: '中高', icon: <ArrowUpOutlined />, tagColor: 'orange' };
    } else if (avg > 8) {
      return { color: '#1890ff', level: '中', icon: null, tagColor: 'blue' };
    } else if (avg > 3) {
      return { color: '#52c41a', level: '中低', icon: <ArrowDownOutlined />, tagColor: 'green' };
    } else {
      return { color: '#13c2c2', level: '低', icon: <ArrowDownOutlined />, tagColor: 'cyan' };
    }
  };

  const columns: ColumnsType<MarketData> = [
    {
      title: '商品名称',
      dataIndex: 'prodName',
      key: 'prodName',
      width: 120,
      render: (text, record) => (
        <Tooltip title={`分类: ${record.prodPcat || '未知'}`}>
          <span style={{ fontWeight: 'bold' }}>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: '规格',
      dataIndex: 'specInfo',
      key: 'specInfo',
      width: 120,
      render: (text) => text || '无规格信息',
    },
    {
      title: '价格区间',
      dataIndex: 'lowPrice',
      key: 'priceRange',
      render: (lowPrice, record) => {
        const unit = record.unitInfo || '斤';
        return `${lowPrice} - ${record.highPrice} 元/${unit}`;
      },
    },
    {
      title: '平均价格',
      dataIndex: 'avgPrice',
      key: 'avgPrice',
      sorter: (a, b) => parseFloat(a.avgPrice) - parseFloat(b.avgPrice),
      render: (text, record) => {
        const { color, level, icon, tagColor } = getPriceLevel(record.lowPrice, record.highPrice, text);
        const unit = record.unitInfo || '斤';
        
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color, fontWeight: 'bold', marginRight: '8px' }}>
              {text} 元/{unit}
            </span>
            <Tag color={tagColor}>
              {icon} {level}
            </Tag>
          </div>
        );
      },
    },
    {
      title: '发布日期',
      dataIndex: 'pubDate',
      key: 'pubDate',
      width: 120,
      render: text => {
        try {
          const date = new Date(text);
          return date.toLocaleDateString('zh-CN');
        } catch (error) {
          return text || '未知';
        }
      },
    },
  ];

  // 构建表格的本地化配置
  const tableLocale = {
    emptyText: (
      <Empty 
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="暂无价格数据" 
      />
    )
  };

  // 分组数据，按产品名称分组，计算每种产品的最低价、最高价和平均价
  const groupedData = React.useMemo(() => {
    const groups: Record<string, any> = {};
    
    filteredData.forEach(item => {
      const key = item.prodName;
      if (!groups[key]) {
        groups[key] = {
          prodName: key,
          specs: new Set(),
          lowPrice: Infinity,
          highPrice: -Infinity,
          avgPrices: [],
          items: []
        };
      }
      
      // 添加规格
      if (item.specInfo) {
        groups[key].specs.add(item.specInfo);
      }
      
      // 更新价格范围
      const low = parseFloat(item.lowPrice);
      const high = parseFloat(item.highPrice);
      const avg = parseFloat(item.avgPrice);
      
      if (low < groups[key].lowPrice) groups[key].lowPrice = low;
      if (high > groups[key].highPrice) groups[key].highPrice = high;
      
      groups[key].avgPrices.push(avg);
      groups[key].items.push(item);
    });
    
    // 计算平均价格
    Object.keys(groups).forEach(key => {
      const sum = groups[key].avgPrices.reduce((a: number, b: number) => a + b, 0);
      groups[key].avgPrice = (sum / groups[key].avgPrices.length).toFixed(2);
      groups[key].specs = Array.from(groups[key].specs).join('、');
    });
    
    return Object.values(groups);
  }, [filteredData]);

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ShoppingOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          <span>水产市场价格</span>
          {filteredData.length > 0 && (
            <Tag color="blue" style={{ marginLeft: '8px' }}>
              {filteredData.length} 项
            </Tag>
          )}
        </div>
      }
      extra={
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          onClick={handleRefresh}
          loading={loading}
        >
          刷新数据
        </Button>
      }
      bordered={false}
      style={{ 
        boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
        borderRadius: '8px',
        marginBottom: '20px'
      }}
    >
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        pagination={{ 
          pageSize: 10,
          showTotal: total => `共 ${total} 条数据`
        }}
        locale={tableLocale}
        bordered
        size="middle"
        scroll={{ x: 'max-content' }}
        style={{ 
          background: 'white' 
        }}
      />
    </Card>
  );
};

export default MarketDataTable;