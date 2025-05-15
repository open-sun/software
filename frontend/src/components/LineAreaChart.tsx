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
        boundaryGap: [0, '100%'],
        name: yName
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