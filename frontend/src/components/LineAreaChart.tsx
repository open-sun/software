import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

interface LineAreaChartProps {
  data: [string, number][];
  title?: string;
  yName?: string;
  seriesName?: string;
}

const LineAreaChart: React.FC<LineAreaChartProps> = ({
  data,
  title = '折线面积图',
  yName = '',
  seriesName = '数值'
}) => {
  const [option, setOption] = useState<echarts.EChartsOption>({});

  useEffect(() => {
    // 转换为 [timestamp, value] 格式
    const chartData: [number, number][] = data.map(([time, value]) => {
      const dateStr = `2020-${time}`; // 假设年份2020
      const date = new Date(dateStr.replace(' ', 'T') + ':00');
      return [date.getTime(), value as number];
    });

    // 自动计算y轴范围和间隔，提升精度
    const values = chartData.map(item => item[1]);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue;
    const padding = range === 0 ? Math.max(1, minValue * 0.05) : range * 0.05;
    const yMin = Math.floor(minValue - padding);
    const yMax = Math.ceil(maxValue + padding);
    const interval = range === 0 ? 1 : Math.max(1, Math.round((yMax - yMin) / 5));

    setOption({
      tooltip: {
        trigger: 'axis',
        position: function (pt) {
          return [pt[0], '10%'];
        }
      },
      title: {
        left: 'center',
        text: title
      },
      toolbox: {
        feature: {
          dataZoom: { yAxisIndex: 'none' },
          restore: {},
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'time',
        boundaryGap: [0, 0]
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, 0],
        name: yName,
        min: yMin,
        max: yMax,
        interval: interval
      },
      dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        { start: 0, end: 100 }
      ],
      series: [
        {
          name: seriesName,
          type: 'line',
          smooth: true,
          symbol: 'none',
          areaStyle: {},
          data: chartData
        }
      ]
    });
  }, [data, title, yName, seriesName]);

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default LineAreaChart;