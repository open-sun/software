import React, { useState } from 'react';
import { Popover, Badge } from 'antd';
import RainfallChart from './RainfallChart';

interface HoverRainfallChartProps {
  dates: string[];
  rainfallData: number[];
  title: string;
  children: React.ReactNode;
}

const HoverRainfallChart: React.FC<HoverRainfallChartProps> = ({
  dates,
  rainfallData,
  title,
  children
}) => {
  const [hovered, setHovered] = useState(false);

  // 计算是否有显著降水（用于显示提示标记）
  const hasSignificantRain = rainfallData.some(amount => amount > 0.5);
  
  // 计算最大降水日期和数值
  let maxRainfallIndex = -1;
  let maxRainfallValue = -1;
  
  rainfallData.forEach((value, index) => {
    if (value > maxRainfallValue) {
      maxRainfallValue = value;
      maxRainfallIndex = index;
    }
  });
  
  // 格式化最大降水日期
  const maxRainfallDate = maxRainfallIndex >= 0 
    ? new Date(dates[maxRainfallIndex]).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
    : '';
  
  // 降水等级描述
  const getRainfallLevel = (value: number) => {
    if (value <= 0) return '无降水';
    if (value < 2) return '小雨';
    if (value < 5) return '中雨';
    if (value < 10) return '大雨';
    return '暴雨';
  };
  
  const maxRainfallDesc = maxRainfallValue > 0 
    ? `${maxRainfallDate} ${getRainfallLevel(maxRainfallValue)}`
    : '无明显降水';
  
  const getStatusColor = () => {
    if (maxRainfallValue <= 0) return '#52c41a'; // 绿色
    if (maxRainfallValue < 5) return '#1890ff'; // 蓝色
    if (maxRainfallValue < 10) return '#faad14'; // 黄色
    return '#f5222d'; // 红色
  };
  
  const content = (
    <div style={{ width: '400px', height: '300px' }}>
      <RainfallChart 
        dates={dates}
        rainfallData={rainfallData}
        title={title}
      />
    </div>
  );

  return (
    <Popover 
      content={content} 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{title}</span>
          {hasSignificantRain && (
            <Badge 
              status={maxRainfallValue > 5 ? "warning" : "processing"} 
              text={maxRainfallDesc} 
              style={{ fontSize: '12px' }}
            />
          )}
        </div>
      }
      trigger="hover"
      placement="right"
      overlayStyle={{ 
        maxWidth: '500px',
        minWidth: '420px'
      }}
      onVisibleChange={setHovered}
      destroyTooltipOnHide={true}
    >
      <div 
        style={{ 
          position: 'relative',
          transition: 'transform 0.2s ease',
          transform: hovered ? 'translateY(-5px)' : 'none',
          zIndex: hovered ? 10 : 1
        }}
      >
        {children}
        {hasSignificantRain && (
          <div 
            style={{ 
              position: 'absolute', 
              top: '10px', 
              right: '10px', 
              background: 'rgba(255,255,255,0.9)', 
              borderRadius: '50%', 
              width: '26px', 
              height: '26px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: getStatusColor(),
              fontWeight: 'bold',
              fontSize: '14px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              border: `1px solid ${getStatusColor()}`,
              transition: 'all 0.3s ease',
              transform: hovered ? 'scale(1.2)' : 'scale(1)'
            }}
          >
            🌧️
          </div>
        )}
        <div 
          style={{ 
            position: 'absolute', 
            bottom: '8px', 
            left: '8px', 
            background: 'rgba(0,0,0,0.5)', 
            borderRadius: '4px', 
            padding: '2px 6px',
            fontSize: '10px',
            color: 'white'
          }}
        >
          预测数据
        </div>
      </div>
    </Popover>
  );
};

export default HoverRainfallChart; 