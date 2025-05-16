import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

interface RainfallChartProps {
  dates: string[];
  rainfallData: number[];
  title?: string;
}

const RainfallChart: React.FC<RainfallChartProps> = ({ 
  dates, 
  rainfallData,
  title = '未来降水量预测'
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(null);
  
  // 初始化图表
  useEffect(() => {
    if (!chartRef.current) return;
    
    const chart = echarts.init(chartRef.current);
    setChartInstance(chart);
    
    const handleResize = () => {
      chart.resize();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      chart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // 更新图表数据
  useEffect(() => {
    if (!chartInstance || !chartRef.current) return;
    
    // 确保容器挂载完成并有尺寸
    setTimeout(() => {
      if (chartInstance) {
        chartInstance.resize();
      }
    }, 0);
    
    // 格式化日期，只保留月-日
    const formattedDates = dates.map(date => {
      const dateObj = new Date(date);
      return `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
    });

    // 计算最大降水量，用于调整Y轴
    const maxRainfall = Math.max(...rainfallData, 5); // 至少5mm以确保图表高度
    
    // 颜色确定函数 - 根据降水量变化颜色深浅
    const getItemColor = (value: number) => {
      if (value <= 0) return '#A5D8FF';
      if (value < 2) return '#74C0FC';
      if (value < 5) return '#4DABF7';
      if (value < 10) return '#3498DB';
      if (value < 20) return '#228BE6';
      return '#1971C2';
    };
    
    // 使用as any绕过类型检查
    const option: any = {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 16,
          color: '#333',
          fontWeight: 'normal'
        },
        padding: [5, 0, 15, 0]
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const dataIndex = params[0].dataIndex;
          const date = dates[dataIndex];
          const value = rainfallData[dataIndex];
          const dateObj = new Date(date);
          const formattedDate = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
          
          let precipitationDesc = '';
          if (value <= 0) {
            precipitationDesc = '无降水';
          } else if (value < 2) {
            precipitationDesc = '小雨';
          } else if (value < 5) {
            precipitationDesc = '中雨';
          } else if (value < 10) {
            precipitationDesc = '大雨';
          } else {
            precipitationDesc = '暴雨';
          }
          
          return `<div style="padding: 4px 8px;">
            <div style="font-weight: bold; margin-bottom: 4px;">${formattedDate}</div>
            <div>预计降水量: ${value.toFixed(1)} mm</div>
            <div>天气预报: ${precipitationDesc}</div>
          </div>`;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#E9ECEF',
        textStyle: {
          color: '#495057',
          fontSize: 13
        },
        borderWidth: 1,
        extraCssText: 'box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); border-radius: 4px;'
      },
      xAxis: {
        type: 'category',
        data: formattedDates,
        axisLine: {
          lineStyle: {
            color: '#909399'
          }
        },
        axisTick: {
          alignWithLabel: true
        },
        axisLabel: {
          fontSize: 12,
          color: '#606266',
          rotate: 0,
          margin: 10,
          interval: 0
        }
      },
      yAxis: {
        type: 'value',
        name: '降水量 (mm)',
        nameTextStyle: {
          padding: [0, 0, 0, 40],
          color: '#606266'
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#DCDFE6'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#EBEEF5',
            type: 'dashed'
          }
        },
        max: maxRainfall * 1.2,
        axisLabel: {
          formatter: (value: number) => {
            return value.toFixed(1);  // 限制小数位为1位
          }
        }
      },
      series: [
        {
          data: rainfallData.map((value, index) => {
            return {
              value: value,
              itemStyle: {
                color: getItemColor(value)
              }
            };
          }),
          type: 'bar',
          barWidth: '40%',
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.2)'
            }
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => {
              return params.value > 0 ? `${params.value.toFixed(1)}` : '';
            },
            fontSize: 11,
            color: '#606266'
          }
        }
      ],
      grid: {
        left: '8%',
        right: '8%',
        bottom: '12%',
        top: '18%',
        containLabel: true
      },
      animation: true,
      animationDuration: 800,
      animationEasing: 'elasticOut',
      backgroundColor: 'rgba(252, 252, 252, 0.6)',
      graphic: [
        {
          type: 'rect',
          left: '0%',
          top: '0%',
          right: '0%',
          bottom: '0%',
          z: -1,
          style: {
            fill: 'rgba(255, 255, 255, 0.9)',
            stroke: '#F0F2F5',
            lineWidth: 2,
            shadowBlur: 8,
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowOffsetX: 3,
            shadowOffsetY: 3,
            borderRadius: 8
          }
        }
      ]
    };
    
    chartInstance.setOption(option);
    
    // 再次确保正确适应容器大小
    setTimeout(() => {
      if (chartInstance) {
        chartInstance.resize();
      }
    }, 100);
    
  }, [dates, rainfallData, title, chartInstance]);
  
  return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />;
};

export default RainfallChart; 