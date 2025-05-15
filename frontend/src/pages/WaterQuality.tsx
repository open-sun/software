import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { getJsonData } from '../services/DataGet';
import { Box, FormControl, InputLabel, MenuItem, Select, Button } from '@mui/material';

// 月份列表
const months = [
  "2020-05", "2020-06", "2020-07", "2020-08", "2020-09",
  "2020-10", "2020-11", "2020-12", "2021-01", "2021-02",
  "2021-03", "2021-04"
];

// 指标列表
const indicators = [
  "水温", "pH", "溶解氧", "电导率", "浊度",
  "高锰酸盐指数", "氨氮", "总磷", "总氮",
  "叶绿素α", "藻密度"
];

// 模拟地点数据
const locationData = [
  { province: "北京市", basin: "海河流域", area: "沿河城" },
  { province: "北京市", basin: "淮河流域", area: "八间房漫水桥" },
  { province: "天津市", basin: "海河流域", area: "三岔口" },
  { province: "河北省", basin: "海河流域", area: "八号桥" },
  { province: "内蒙古自治区", basin: "黄河流域", area: "海勃湾" },
  { province: "浙江省", basin: "太湖流域", area: "新港口(新塘港)" },
  { province: "江苏省", basin: "淮河流域", area: "大兴桥" },
];

const WaterQuality: React.FC = () => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedIndicator, setSelectedIndicator] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedBasin, setSelectedBasin] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(null);

  // 获取省份列表
  const provinces = Array.from(new Set(locationData.map(loc => loc.province)));

  // 根据省份获取流域
  const basins = selectedProvince
    ? Array.from(new Set(locationData.filter(loc => loc.province === selectedProvince).map(loc => loc.basin)))
    : [];

  // 根据流域获取具体区域
  const areas = selectedBasin
    ? locationData
      .filter(loc => loc.province === selectedProvince && loc.basin === selectedBasin)
      .map(loc => loc.area)
    : [];

  useEffect(() => {
    const instance = echarts.init(chartRef.current as HTMLDivElement);
    setChartInstance(instance);

    window.addEventListener('resize', () => {
      instance.resize();
    });

    return () => {
      window.removeEventListener('resize', () => instance.resize());
      instance.dispose();
    };
  }, []);

  const handleLoadData = async () => {
    if (!selectedMonth || !selectedIndicator || !selectedArea) {
      console.warn("请选择月份、指标和区域！");
      return;
    }

    console.log(selectedArea, selectedBasin, selectedProvince);

    const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
    const budget2012List: number[] = Array(indicators.length).fill(0);

    for (const day of days) {
      const filename = `${selectedMonth}-${day}`;

      try {
        const data = await getJsonData(`WaterQualitybyDate/${selectedMonth}/${filename}`);

        console.log(data);

        if (data && data.thead && data.tbody) {
          const targetRow = data.tbody.find(
            (row: any[]) => row[0] === selectedProvince && row[1] === selectedBasin && row[2].includes(selectedArea)
          );

          console.log(targetRow) //已经筛出一个json文件里的一个区域



          if (targetRow) {
            for (let i = 0; i < indicators.length; i++) {
              const indicatorIndex = data.thead.findIndex((item: string) => item.includes(indicators[i]));
              if (indicatorIndex !== -1) {
                const value = targetRow[indicatorIndex];
                let numericValue = 0;
                if (typeof value === "string") {
                  // 提取<span>标签内的数字
                  const match = value.match(/>([\d\.\-eE]+)</);
                  if (match) {
                    numericValue = parseFloat(match[1]);
                  } else if (value !== "--") {
                    numericValue = parseFloat(value);
                  }
                }
                budget2012List[i] += isNaN(numericValue) ? 0 : numericValue;
              }
            }
          }

          console.log(budget2012List); //为什么全是0！！！！！！！！！！！！！

        }
      } catch (error) {
        console.warn(`数据获取失败: ${filename}`);
      }
    }

    for (let i = 0; i < budget2012List.length; i++) {
      budget2012List[i] = parseFloat((budget2012List[i] / days.length).toFixed(2));
    }

    updateChart({ names: indicators, budget2012List });
  };

  const updateChart = (data: { names: string[], budget2012List: number[] }) => {
    if (!chartInstance) return;

    const { names, budget2012List } = data;

    const option: any = {
      xAxis: {
        type: 'category',
        data: names,
        axisLabel: { rotate: 45 },
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '数据值',
          type: 'bar',
          data: budget2012List,
          itemStyle: { color: '#73C0DE' },
        },
      ],
    };

    chartInstance.setOption(option);
  };

  return (
    <Box sx={{ padding: '20px' }}>
      <h1>水质数据页面</h1>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>省份</InputLabel>
          <Select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)}>
            {provinces.map((prov) => (
              <MenuItem key={prov} value={prov}>{prov}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>流域</InputLabel>
          <Select value={selectedBasin} onChange={(e) => setSelectedBasin(e.target.value)}>
            {basins.map((basin) => (
              <MenuItem key={basin} value={basin}>{basin}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>区域</InputLabel>
          <Select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
            {areas.map((area) => (
              <MenuItem key={area} value={area}>{area}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>月份</InputLabel>
          <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {months.map((month) => (
              <MenuItem key={month} value={month}>{month}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>指标</InputLabel>
          <Select value={selectedIndicator} onChange={(e) => setSelectedIndicator(e.target.value)}>
            {indicators.map((indicator) => (
              <MenuItem key={indicator} value={indicator}>{indicator}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={handleLoadData}>加载数据</Button>
      </Box>

      <div ref={chartRef} style={{ width: '100%', height: '400px', backgroundColor: '#f5f5f5' }} />
    </Box>
  );
};

export default WaterQuality;
