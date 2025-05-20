import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { getJsonData } from '../services/DataGet';
import { Box, FormControl, InputLabel, MenuItem, Select, Button, LinearProgress,Card } from '@mui/material';



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
export const locationData = [
  { province: "北京市", basin: "海河流域", area: "沿河城" },
  { province: "北京市", basin: "海河流域", area: "古北口" },
  { province: "天津市", basin: "海河流域", area: "三岔口" },
  { province: "天津市", basin: "海河流域", area: "果河桥" },
  { province: "河北省", basin: "海河流域", area: "岗南水库" },
  { province: "河北省", basin: "海河流域", area: "八号桥" },
  { province: "山西省", basin: "黄河流域", area: "河津大桥" },
  { province: "山西省", basin: "黄河流域", area: "万家寨水库" },
  { province: "内蒙古自治区", basin: "黄河流域", area: "画匠营子" },
  { province: "内蒙古自治区", basin: "黄河流域", area: "海勃湾" },
  { province: "内蒙古自治区", basin: "松花江流域", area: "黑山头" },
  { province: "辽宁省", basin: "辽河流域", area: "大伙房水库" },
  { province: "辽宁省", basin: "辽河流域", area: "江桥" },
  { province: "辽宁省", basin: "辽河流域", area: "辽河公园" },
  { province: "辽宁省", basin: "辽河流域", area: "汤河水库" },
  { province: "辽宁省", basin: "辽河流域", area: "盘锦兴安(兴安)" },
  { province: "辽宁省", basin: "辽河流域", area: "珠尔山" },
  { province: "吉林省", basin: "松花江流域", area: "松花江村" },
  { province: "吉林省", basin: "松花江流域", area: "白沙滩" },
  { province: "吉林省", basin: "松花江流域", area: "圈河" },
  { province: "黑龙江省", basin: "松花江流域", area: "肇源" },
  { province: "黑龙江省", basin: "松花江流域", area: "乌苏镇" },
  { province: "黑龙江省", basin: "松花江流域", area: "同江" },
  { province: "黑龙江省", basin: "松花江流域", area: "黑河下(黑河)" },
  { province: "上海市", basin: "长江流域", area: "急水港桥" },
  { province: "江苏省", basin: "长江流域", area: "林山" },
  { province: "江苏省", basin: "太湖流域", area: "沙渚" },
  { province: "江苏省", basin: "淮河流域", area: "小红圈" },
  { province: "江苏省", basin: "淮河流域", area: "李集桥" },
  { province: "江苏省", basin: "淮河流域", area: "艾山西大桥" },
  { province: "江苏省", basin: "太湖流域", area: "兰山嘴(老)" },
  { province: "江苏省", basin: "太湖流域", area: "西山" },
  { province: "江苏省", basin: "淮河流域", area: "大兴桥" },
  { province: "江苏省", basin: "淮河流域", area: "淮河大桥" },
  { province: "江苏省", basin: "长江流域", area: "三江营" },
  { province: "江苏省", basin: "淮河流域", area: "大屈" },
  { province: "浙江省", basin: "浙闽片河流", area: "街口(鸠坑口)" },
  { province: "浙江省", basin: "太湖流域", area: "斜路港" },
  { province: "浙江省", basin: "太湖流域", area: "王江泾" },
  { province: "浙江省", basin: "太湖流域", area: "新港口(新塘港)" },
  { province: "安徽省", basin: "巢湖流域", area: "湖滨(老)" },
  { province: "安徽省", basin: "巢湖流域", area: "裕溪口(老)" },
  { province: "安徽省", basin: "淮河流域", area: "蚌埠闸上(蚌埠闸)" },
  { province: "安徽省", basin: "淮河流域", area: "石头埠(老)" },
  { province: "安徽省", basin: "淮河流域", area: "小王桥" },
  { province: "安徽省", basin: "长江流域", area: "皖河口" },
  { province: "安徽省", basin: "淮河流域", area: "小柳巷" },
  { province: "安徽省", basin: "淮河流域", area: "张大桥" },
  { province: "安徽省", basin: "淮河流域", area: "王家坝" },
  { province: "安徽省", basin: "淮河流域", area: "界首七渡口(七渡口)" },
  { province: "安徽省", basin: "淮河流域", area: "许庄(徐庄)" },
  { province: "安徽省", basin: "淮河流域", area: "杨庄" },
  { province: "安徽省", basin: "淮河流域", area: "泗县公路桥" },
  { province: "安徽省", basin: "淮河流域", area: "颜集" },
  { province: "福建省", basin: "浙闽片河流", area: "白岩潭" },
  { province: "江西省", basin: "长江流域", area: "滁槎" },
  { province: "江西省", basin: "长江流域", area: "姚港(河西水厂)" },
  { province: "江西省", basin: "长江流域", area: "蛤蟆石" },
  { province: "山东省", basin: "黄河流域", area: "泺口" },
  { province: "山东省", basin: "淮河流域", area: "台儿庄大桥" },
  { province: "山东省", basin: "淮河流域", area: "清泉寺" },
  { province: "山东省", basin: "淮河流域", area: "重坊桥" },
  { province: "山东省", basin: "淮河流域", area: "捷庄(涝沟桥)" },
  { province: "山东省", basin: "海河流域", area: "秤勾湾(秤钩湾)" },
  { province: "河南省", basin: "长江流域", area: "陶岔" },
  { province: "河南省", basin: "淮河流域", area: "黄口" },
  { province: "河南省", basin: "淮河流域", area: "蒋集" },
  { province: "河南省", basin: "淮河流域", area: "淮滨水文站(淮滨)" },
  { province: "河南省", basin: "淮河流域", area: "沈丘闸" },
  { province: "河南省", basin: "淮河流域", area: "鹿邑付桥(鹿邑付桥闸)" },
  { province: "河南省", basin: "淮河流域", area: "新蔡班台(班台)" },
  { province: "河南省", basin: "黄河流域", area: "小浪底水库(小浪底)" },
  { province: "湖北省", basin: "长江流域", area: "宗关" },
  { province: "湖北省", basin: "长江流域", area: "坝上中(胡家岭)" },
  { province: "湖北省", basin: "长江流域", area: "南津关" },
  { province: "湖南省", basin: "长江流域", area: "新港" },
  { province: "湖南省", basin: "长江流域", area: "岳阳楼" },
  { province: "湖南省", basin: "长江流域", area: "城陵矶" },
  { province: "广东省", basin: "珠江流域", area: "七星岗" },
  { province: "广东省", basin: "珠江流域", area: "横栏" },
  { province: "广西壮族自治区", basin: "珠江流域", area: "老口" },
  { province: "广西壮族自治区", basin: "珠江流域", area: "阳朔" },
  { province: "广西壮族自治区", basin: "珠江流域", area: "界首" },
  { province: "广西壮族自治区", basin: "珠江流域", area: "石嘴" },
  { province: "广西壮族自治区", basin: "珠江流域", area: "平而关" },
  { province: "重庆市", basin: "长江流域", area: "朱沱" },
  { province: "四川省", basin: "长江流域", area: "龙洞" },
  { province: "四川省", basin: "长江流域", area: "沱江大桥(沱江二桥)" },
  { province: "四川省", basin: "长江流域", area: "清风峡" },
  { province: "四川省", basin: "长江流域", area: "岷江大桥" },
  { province: "四川省", basin: "长江流域", area: "凉姜沟" },
  { province: "云南省", basin: "滇池流域", area: "西苑隧道" },
  { province: "云南省", basin: "滇池流域", area: "观音山" },
  { province: "云南省", basin: "西南诸河", area: "河口县医院(河口)" },
  { province: "云南省", basin: "西南诸河", area: "橄榄坝" },
  { province: "陕西省", basin: "黄河流域", area: "潼关吊桥" },
  { province: "甘肃省", basin: "黄河流域", area: "新城桥" },
  { province: "宁夏回族自治区", basin: "黄河流域", area: "中卫下河沿(新墩)" }
];

const WaterQuality: React.FC = () => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedIndicator, setSelectedIndicator] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedBasin, setSelectedBasin] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(null);

  //进度条
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

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
    setLoading(true);
    setProgress(0);

  if (!selectedMonth || !selectedIndicator || !selectedArea) {
    console.warn("请选择月份、指标和区域！");
    return;
  }

  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const indicatorValues: number[] = [];

  for (const day of days) {
    const filename = `${selectedMonth}-${day}`;
    try {
      const data = await getJsonData(`WaterQualitybyDate/${selectedMonth}/${filename}`);
      if (data && data.thead && data.tbody) {
        const targetRow = data.tbody.find(
          (row: any[]) => row[0] === selectedProvince && row[1] === selectedBasin && row[2].includes(selectedArea)
        );
        if (targetRow) {
          const indicatorIndex = data.thead.findIndex((item: string) => item.includes(selectedIndicator));
          if (indicatorIndex !== -1) {
            const value = targetRow[indicatorIndex];
            let numericValue = NaN;
            if (typeof value === "string") {
              const match = value.match(/>([\d\.\-eE]+)</);
              if (match) {
                numericValue = parseFloat(match[1]);
              } else if (value !== "--") {
                numericValue = parseFloat(value);
              }
            }
            indicatorValues.push(isNaN(numericValue as number) ? NaN : numericValue);
          } else {
            indicatorValues.push(NaN);
          }
        } else {
          indicatorValues.push(NaN);
        }
      } else {
        indicatorValues.push(NaN);
      }
    } catch (error) {
      indicatorValues.push(NaN);
    }
    setProgress(Math.round(((indicatorValues.length) / days.length) * 100)); //更新进度条
  }
setLoading(false);
  // 横坐标为每一天
  const xAxis = days.map(day => `${selectedMonth}-${day}`);

  updateChart({
    names: xAxis,
    budget2012List: indicatorValues
  });
};

  const updateChart = (data: { names: string[], budget2012List: number[] }) => {
  if (!chartInstance) return;

  const { names, budget2012List } = data;

  const option: any = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        label: { show: true }
      }
    },
    toolbox: {
      show: true,
      feature: {
        mark: { show: true },
        dataView: { show: true, readOnly: false },
        magicType: { show: true, type: ['line', 'bar'] },
        restore: { show: true },
        saveAsImage: { show: true }
      }
    },
    legend: {
      data: ['数据值'],
      itemGap: 5
    },
    grid: {
      top: '12%',
      left: '5%',
      right: '10%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: names
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '数值',
        axisLabel: {
          formatter: function (a: number) {
            a = +a;
            return isFinite(a) ? echarts.format.addCommas(a) : '';
          }
        }
      }
    ],
    dataZoom: [
      {
        show: true,
        start: 0,
        end: 100
      },
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        show: true,
        yAxisIndex: 0,
        filterMode: 'empty',
        width: 30,
        height: '80%',
        showDataShadow: false,
        left: '93%'
      }
    ],
    series: [
      {
        name: '数据值',
        type: 'bar',
        data: budget2012List,
        itemStyle: { color: '#73C0DE' }
      }
    ]
  };

  chartInstance.setOption(option);
};

  return (
    <Card sx={{ padding: '20px' }}>
      {loading && <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />}
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

      <div ref={chartRef} style={{ width: '100%', height: '450px', backgroundColor: '#f5f5f5' }} />
    </Card>
  );
};

export default WaterQuality;
