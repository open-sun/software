import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';
import LineAreaChart from '../components/LineAreaChart';
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

// 统一样式对象
// 统一样式对象
const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 999,
    transition: 'background-color 0.3s',
    backdropFilter: 'blur(2px)',
  },
  modal: {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    padding: '32px 28px 24px 28px',
    borderRadius: '14px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18), 0 1.5px 6px rgba(0,0,0,0.08)',
    zIndex: 1000,
    maxHeight: '80vh',
    overflowY: 'auto' as const,
    width: '90%',
    maxWidth: 700,
    minWidth: 320,
    fontFamily: 'Segoe UI, Arial, sans-serif',
    color: '#222',
  },
  selectGroup: {
    marginBottom: 20,
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    gap: '18px',
  },
  select: {
    marginRight: 12,
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #b0b0b0',
    fontSize: '15px',
    background: '#f8fafd',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
};

const MapTest: React.FC = () => {
  const [option, setOption] = useState<echarts.EChartsCoreOption | null>(null);
  const [modalVisible, setModalVisible] = useState(false); // 控制模态框显示
  const [modalData, setModalData] = useState<any>(null); // 存储模态框数据
  const [selectedBasin, setSelectedBasin] = useState<string>('');
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [filteredFile, setFilteredFile] = useState<any>(null);
  const [selectedColumn, setSelectedColumn] = useState<string>('');

  // 获取可选的指标列（排除指定字段）
  const columnOptions = React.useMemo(() => {
    if (!filteredFile || !filteredFile.thead) return [];
    return filteredFile.thead.filter(
      (col: string) =>
        !['省份', '流域', '断面名称', '监测时间'].includes(col)
    );
  }, [filteredFile]);

  // 当 columnOptions 变化时，优先保留上次选择的 selectedColumn
  useEffect(() => {
    if (columnOptions.length === 0) {
      setSelectedColumn('');
    } else if (!columnOptions.includes(selectedColumn)) {
      setSelectedColumn(columnOptions[0]);
    }
    // 如果当前 selectedColumn 还在 options 里，则不变
    // 否则自动选第一个
  }, [columnOptions]);

  // 获取所有流域
const basins = React.useMemo(() => {
  if (!modalData || !Array.isArray(modalData.files)) return [];
  return Array.from(new Set(
    modalData.files.flatMap((f: any) =>
      Array.isArray(f.tbody) ? f.tbody.map((row: any) => row['流域']) : []
    )
  ));
}, [modalData]);

  // 获取当前流域下的断面名称
  const sites = React.useMemo(() => {
    if (!modalData || !modalData.files || !selectedBasin) return [];
    return Array.from(new Set(
      modalData.files.flatMap((f: any) =>
        f.tbody.filter((row: any) => row['流域'] === selectedBasin)
          .map((row: any) => row['断面名称'])
      )
    ));
  }, [modalData, selectedBasin]);

  // 监听modalData和下拉框变化，自动设置默认选项
  useEffect(() => {
    if (basins.length > 0 && !selectedBasin) setSelectedBasin(String(basins[0]));
  }, [basins]);
  useEffect(() => {
    if (sites.length > 0 && !selectedSite) setSelectedSite(String(sites[0]));
    // 如果切换流域后，当前断面不在新流域下，重置断面
    if (selectedSite && sites.length > 0 && !sites.includes(selectedSite)) {
      setSelectedSite(String(sites[0]));
    }
  }, [sites]);
  useEffect(() => {
    if (!modalData || !modalData.files || !selectedBasin || !selectedSite) {
      setFilteredFile(null);
      return;
    }
    // 查找路径中同时包含流域和断面名称的文件
    const file = modalData.files.find((f: any) =>
      f.path.includes(selectedBasin) && f.path.includes(selectedSite)
    );
    setFilteredFile(file || null);
  }, [modalData, selectedBasin, selectedSite]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 使用封装的服务获取地图数据
        const usaGeoJson = await getJsonData('china');

        echarts.registerMap('china', usaGeoJson);
        // const projection = d3.geoAlbersUsa(); // 未用到可移除

const chartOption: echarts.EChartsCoreOption = {
  title: {
    text: '',
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
        '#e0f3f8', '#abd9e9', '#74add1', '#4575b4',
        '#313695', '#fee090', '#fdae61', '#f46d43', '#d73027'
      ]
    },
    text: ['高', '低'],
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
      roam: true, // 支持缩放和拖拽
      zoom: 1.2,  // 默认放大
      itemStyle: {
        borderColor: '#666',
        borderWidth: 1.2,
        areaColor: '#f5faff'
      },
      emphasis: {
        label: {
          show: true,
          color: '#222',
          fontWeight: 'bold'
        },
        itemStyle: {
          areaColor: '#ffe082',
          borderColor: '#ff9800',
          borderWidth: 2
        }
      },
      data: [
        // ...你的数据
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
    try {
      const data = await getWaterDataByName(params.name, '', '');
      setModalData(data);

      // 立即初始化流域和断面名称
      const allBasins = Array.from(new Set(
        data.files.flatMap((f: any) => f.tbody.map((row: any) => row['流域']))
      ));
      const firstBasin = allBasins[0] || '';
      setSelectedBasin(String(firstBasin));

      const allSites = Array.from(new Set(
        data.files.flatMap((f: any) =>
          f.tbody.filter((row: any) => row['流域'] === firstBasin)
            .map((row: any) => row['断面名称'])
        )
      ));
      setSelectedSite(String(allSites[0]) || '');

      setModalVisible(true);
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

      {modalVisible && (
        <>
          {/* 遮罩层 */}
          <div
            style={styles.overlay}
            onClick={() => setModalVisible(false)}
          />
          {/* 模态框 */}
          <div
            style={styles.modal}
            onClick={e => e.stopPropagation()}
          >
            <h3>水质数据</h3>
            {/* 下拉框选择 */}
            <div style={styles.selectGroup}>
              <label>
                流域：
                <select
                  value={selectedBasin}
                  onChange={e => {
                    const newBasin = e.target.value;
                    setSelectedBasin(newBasin);
                    const newSites = Array.from(new Set(
                      modalData.files.flatMap((f: any) =>
                        f.tbody.filter((row: any) => row['流域'] === newBasin)
                          .map((row: any) => row['断面名称'])
                      )
                    ));
                    setSelectedSite(String(newSites[0] || ''));
                  }}
                  style={styles.select}
                >
                  {basins.map((basin) => (
                    <option key={String(basin)} value={String(basin)}>{String(basin)}</option>
                  ))}
                </select>
              </label>
              <label>
                断面名称：
                <select
                  value={selectedSite}
                  onChange={e => setSelectedSite(e.target.value)}
                  style={styles.select}
                >
                  {sites.map((site) => (
                    <option key={String(site)} value={String(site)}>{String(site)}</option>
                  ))}
                </select>
              </label>
              <label>
                指标列：
                <select
                  value={selectedColumn}
                  onChange={e => setSelectedColumn(e.target.value)}
                  style={styles.select}
                >
                  {columnOptions.map((col: string) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </label>
            </div>
            {/* 展示对应文件内容 */}
            {filteredFile ? (
              <div>
                {filteredFile && selectedColumn && (
                  <div>
                    <h4>监测时间与 {selectedColumn}</h4>
                    <LineAreaChart
                      data={
                        filteredFile.tbody
                          .filter((row: any) => row['监测时间'] && !isNaN(Number(row[selectedColumn])))
                          .map((row: any) => [row['监测时间'], Number(row[selectedColumn])])
                      }
                      title={`${selectedColumn} 随时间变化`}
                      yName={selectedColumn}
                      seriesName={selectedColumn}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div>未找到对应文件</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MapTest;