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
import { getJsonData, getWaterDataByName } from '../services/DataGet'; // 引入服务
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

const MapTest: React.FC = () => {
  const [option, setOption] = useState<echarts.EChartsCoreOption | null>(null);
  const [modalVisible, setModalVisible] = useState(false); // 控制模态框显示
  const [modalData, setModalData] = useState<any>(null); // 存储模态框数据

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 使用封装的服务获取地图数据
        const usaGeoJson = await getJsonData('china');

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
                { name: '辽宁省', value: 4822023 }
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

  // 定义事件处理函数
  const onChartClick = async (params: any) => {
    console.log('点击位置的名字:', params.name); // 打印点击位置的名字

    try {
      // 调用 getWaterDataByName 获取数据
      const data = await getWaterDataByName(params.name, '', '');
      setModalData(data); // 设置模态框数据
      setModalVisible(true); // 显示模态框
    } catch (error) {
      console.error('获取水质数据失败:', error);
    }
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      {option ? (
        <ReactECharts
          option={option}
          style={{ height: '100%' }}
          onEvents={{
            click: onChartClick // 监听点击事件
          }}
        />
      ) : (
        <div>地图加载中...</div>
      )}


{/* 模态框 */}
{modalVisible && (
  <div
    style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '20px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      zIndex: 1000,
      maxHeight: '80vh', // 设置模态框的最大高度
      overflowY: 'auto', // 启用垂直滚动
      width: '80%', // 可选：设置模态框宽度
    }}
  >
    <h3>水质数据</h3>
    <pre>{JSON.stringify(modalData, null, 2)}</pre>
    <button onClick={() => setModalVisible(false)}>关闭</button>
  </div>
)}
    </div>
  );
};

export default MapTest;