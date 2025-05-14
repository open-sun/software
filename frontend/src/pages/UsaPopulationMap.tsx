import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  ToolboxComponent,
  DatasetComponent,
  GeoComponent
} from 'echarts/components';
import { MapChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { getMapData } from '../services/DataGet';
import * as d3 from 'd3-geo';

// 注册 echarts 组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  ToolboxComponent,
  DatasetComponent,
  GeoComponent,
  MapChart,
  CanvasRenderer
]);

const UsaPopulationMap: React.FC = () => {
  const [option, setOption] = useState<echarts.EChartsCoreOption | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 使用封装的服务获取地图数据
        const usaGeoJson = await getMapData('china');

        echarts.registerMap('china', usaGeoJson);
        const projection = d3.geoAlbersUsa();

        const chartOption: echarts.EChartsCoreOption = {
          title: {
            text: '',
            subtext: '',
            sublink: '',
            left: 'right'
          },
          tooltip: {
            trigger: 'item',
            showDelay: 0,
            transitionDuration: 0.2
          },
          visualMap: {
            left: 'right',
            min: 500000,
            max: 38000000,
            inRange: {
              color: [
                '#313695', '#4575b4', '#74add1', '#abd9e9',
                '#e0f3f8', '#ffffbf', '#fee090', '#fdae61',
                '#f46d43', '#d73027', '#a50026'
              ]
            },
            text: ['High', 'Low'],
            calculable: true
          },
          toolbox: {
            show: true,
            left: 'left',
            top: 'top',
            feature: {
              dataView: { readOnly: false },
              restore: {},
              saveAsImage: {}
            }
          },
          series: [
            {
              name: 'china PopEstimates',
              type: 'map',
              map: 'china',
              emphasis: {
                label: {
                  show: true
                }
              },
              data: [
                 { name: '辽宁省', value: 4822023 },
              ]
            }
          ]
        };

        setOption(chartOption);
      } catch (error) {
        console.error('地图加载失败：', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      {option ? (
        <ReactECharts option={option} style={{ height: '100%' }} />
      ) : (
        <div>地图加载中...</div>
      )}
    </div>
  );
};

export default UsaPopulationMap;