import React, { useEffect, useState } from 'react';
import { Layout, Card, Row, Col, Progress, Statistic, Button, Descriptions, Space, Typography } from 'antd';
import { 
    DatabaseOutlined, 
    HddOutlined, 
    DashboardOutlined, 
    SyncOutlined,
    CloudUploadOutlined,
    PieChartOutlined,
    SlidersOutlined,
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text } = Typography;

// 随机数生成工具
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number, fixed = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(fixed));
const smallRandomIncrement = (factor = 1) => Math.random() * factor;
const smallRandomFluctuation = (base: number, range: number) => base + (Math.random() - 0.5) * range;

// MUI Info 色系 (近似值)
const muiInfoColors = {
  main: '#0288d1',      // MUI default info.main
  light: '#4fb2e3',     // MUI default info.light
  dark: '#015f92',      // MUI default info.dark
  contrastText: '#fff',
  pageBg: '#f4f6f8',     // 中性浅灰色背景，突出卡片
  lightestCardBg: '#e3f2fd', // 非常浅的蓝，接近MUI背景
  mediumLightCardBg: '#b3e5fc', // 另一个更鲜明一点的浅蓝
  lightGreenCardBg: '#e8f5e9', // 新增：非常浅的绿色，用于环境监测卡片
};

// 统一的卡片基础样式
const baseCardStyle: React.CSSProperties = {
    borderRadius: '12px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.07)', // 更柔和的阴影
    border: '1px solid transparent', // 边框先透明，由背景色决定是否需要边框感
    color: muiInfoColors.dark,      // 主要文字用深蓝色
    display: 'flex',
    flexDirection: 'column',
    height: '100%', 
};

// 卡片标题样式
const cardHeaderStyle: React.CSSProperties = {
    fontSize: '17px',
    fontWeight: 'bold', // 加粗标题
    color: muiInfoColors.dark, 
    borderBottom: `1px solid ${muiInfoColors.light}`,
    paddingBottom: '12px',
    marginBottom: '20px'
};

const UNCHANGING_DISK_TOTAL = 2500;
const INITIAL_DB_QUERY = 500000;
const INITIAL_TOTAL_DATA_TB = 9.5; // 初始数据量 9500 GB

const NewDataCenter: React.FC = () => {
  // 数据总量
  const [totalDataTB, setTotalDataTB] = useState(INITIAL_TOTAL_DATA_TB);
  const [todayIncreaseGB, setTodayIncreaseGB] = useState(randomInt(50, 150));
  const [todayProcessedGB, setTodayProcessedGB] = useState(randomInt(50, 150));

  // 进程总量
  const [initialProcessCount] = useState(randomInt(800, 1200));
  const [processCount, setProcessCount] = useState(initialProcessCount);

  // 硬盘信息
  const [initialDiskUsedTB] = useState(randomInt(800, 1200) / 1000); 
  const [diskUsedTB, setDiskUsedTB] = useState(initialDiskUsedTB);
  const diskTotalTB = UNCHANGING_DISK_TOTAL / 1000;

  // 硬件状态 (设定基准值，小幅波动)
  const [baseCpu] = useState(randomInt(30, 60));
  const [baseMem] = useState(randomInt(40, 70));
  const [baseGpu] = useState(randomInt(20, 50));
  const [cpu, setCpu] = useState(baseCpu);
  const [mem, setMem] = useState(baseMem);
  const [gpu, setGpu] = useState(baseGpu);

  // 数据库交互
  const [dbQuery, setDbQuery] = useState(INITIAL_DB_QUERY);
  const [dbSuccess, setDbSuccess] = useState(INITIAL_DB_QUERY - randomInt(10,100));
  const [dbTime, setDbTime] = useState(randomFloat(0.08, 0.15, 2)); // 波动范围缩小

  // 传感器信息 (设定基准值，小幅波动)
  const [baseSensor] = useState({
    temperature: randomFloat(22, 26, 1),
    humidity: randomInt(45, 65),
    ph: randomFloat(6.8, 7.2, 2),
    oxygen: randomFloat(6, 8, 2),
    conductivity: randomInt(400, 600)
  });
  const [sensor, setSensor] = useState(baseSensor);

  // 定时刷新数据
  useEffect(() => {
    const timer = setInterval(() => {
      setTotalDataTB(v => v + smallRandomIncrement(0.005)); // 每次增加 0-0.005 TB
      setTodayIncreaseGB(randomInt(50, 150)); // 今日数据每日变化较大是合理的
      setTodayProcessedGB(randomInt(50, 150));
      
      setProcessCount(prev => Math.max(0, Math.round(smallRandomFluctuation(initialProcessCount, 50)))); // 在初始值上下50波动
      setDiskUsedTB(prev => Math.min(diskTotalTB, Math.max(0, prev + smallRandomFluctuation(0, 0.01)))); // 小幅波动，不超过总量
      
      setCpu(prev => Math.min(100, Math.max(0, Math.round(smallRandomFluctuation(baseCpu, 15)))));
      setMem(prev => Math.min(100, Math.max(0, Math.round(smallRandomFluctuation(baseMem, 20)))));
      setGpu(prev => Math.min(100, Math.max(0, Math.round(smallRandomFluctuation(baseGpu, 10)))));
      
      const queryIncrement = randomInt(1, 10);
      setDbQuery(v => v + queryIncrement);
      setDbSuccess(v => v + queryIncrement - randomInt(0,1)); // 成功数几乎同步增加
      setDbTime(randomFloat(0.08, 0.15, 2));

      setSensor({
        temperature: parseFloat(smallRandomFluctuation(baseSensor.temperature, 1).toFixed(1)),
        humidity: Math.round(smallRandomFluctuation(baseSensor.humidity, 5)),
        ph: parseFloat(smallRandomFluctuation(baseSensor.ph, 0.2).toFixed(2)),
        oxygen: parseFloat(smallRandomFluctuation(baseSensor.oxygen, 0.5).toFixed(2)),
        conductivity: Math.round(smallRandomFluctuation(baseSensor.conductivity, 50))
      });
    }, 3000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 依赖项移除，确保基准值只在初始化时设置
  
  const getStatusColor = (percent: number) => {
    if (percent > 80) return '#f5222d'; // antd red-6
    if (percent > 60) return '#fa8c16'; // antd orange-6
    return '#52c41a'; // antd green-6
  };

  const cardWithBg = (bgColor: string = muiInfoColors.lightestCardBg): React.CSSProperties => ({
    ...baseCardStyle,
    backgroundColor: bgColor,
    // 如果背景色深，可能需要调整边框使其可见或更协调
    borderColor: bgColor === muiInfoColors.main ? muiInfoColors.dark : 'transparent',
  });
  
  const primaryTextColor = muiInfoColors.dark;
  const secondaryTextColor = '#546e7a'; // 一个更中性的深灰色，用于次要文本
  const valueTextColor = muiInfoColors.main; // 用于Statistic组件的value

  return (
    <Layout style={{ background: muiInfoColors.pageBg, minHeight: '100vh' }}> {/* 页面背景 antd cyan-1, 更明亮些 */}
      <Content style={{ padding: '32px' }}> {/* 增加整体内边距 */}
      <Title level={2} style={{ color: primaryTextColor, marginBottom: '40px', textAlign: 'center', fontWeight: 'bold' }}>数据中心监控面板</Title> {/* 增加标题下方间距 */}
        <Row gutter={[32, 32]} align="stretch"> {/* 增加行列间距 */}
          {/* 数据总量卡片 */}
          <Col xs={24} sm={12} md={8} lg={8}>
            <Card style={cardWithBg(muiInfoColors.mediumLightCardBg)}>
              <Statistic 
                title={<Text style={{ color: secondaryTextColor }}>数据总量 (TB)</Text>} 
                value={totalDataTB} 
                precision={3}
                valueStyle={{ color: valueTextColor, fontSize: 30, fontWeight: 'bold' }} 
                prefix={<CloudUploadOutlined style={{ marginRight: 8, color: valueTextColor}}/>}
              />
              <div style={{ marginTop: 16 }}>
                <Text style={{color: secondaryTextColor, fontSize: '0.85em'}}>今日新增: {todayIncreaseGB} GB / 今日处理: {todayProcessedGB} GB</Text>
              </div>
            </Card>
          </Col>
          {/* 进程总量卡片 */}
          <Col xs={24} sm={12} md={8} lg={8}>
            <Card style={cardWithBg(muiInfoColors.mediumLightCardBg)}>
               <Statistic 
                title={<Text style={{ color: secondaryTextColor }}>活动进程</Text>} 
                value={processCount} 
                valueStyle={{ color: valueTextColor, fontSize: 30, fontWeight: 'bold' }} 
                prefix={<SlidersOutlined style={{ marginRight: 8, color: valueTextColor}}/>}
              />
            </Card>
          </Col>
          {/* 硬盘信息卡片 */}
          <Col xs={24} sm={12} md={8} lg={8}>
            <Card style={cardWithBg(muiInfoColors.mediumLightCardBg)}>
              <Space direction="vertical" style={{width: '100%'}}>
                <Text style={{ color: secondaryTextColor, fontSize: 16 }}><HddOutlined style={{color: valueTextColor}} /> 磁盘存储</Text>
                <Text style={{ color: valueTextColor, fontSize: 20, fontWeight: 'bold' }}>{diskUsedTB.toFixed(2)} TB / {diskTotalTB.toFixed(2)} TB</Text>
                <Progress 
                    percent={Math.round((diskUsedTB / diskTotalTB) * 100)} 
                    strokeColor={{ from: muiInfoColors.light, to: muiInfoColors.main }} 
                    trailColor={muiInfoColors.lightestCardBg} 
                    showInfo={false}
                />
              </Space>
            </Card>
          </Col>
          {/* 硬件信息统计卡片 */}
          <Col xs={24} sm={12} md={12} lg={12}>
            <Card 
                title={<div style={cardHeaderStyle}><PieChartOutlined /> 硬件负载监控</div>}
                style={cardWithBg(muiInfoColors.lightestCardBg)}
                headStyle={{borderBottom:0, color: cardHeaderStyle.color, paddingLeft: '24px', paddingRight: '24px'}}
                bodyStyle={{paddingTop: '0px'}} // 减少标题和内容之间的额外padding
            >
              <Row gutter={[16,16]} style={{padding: '0 8px'}}>
                <Col span={8}>
                    <Text style={{ color: secondaryTextColor }}>CPU: {cpu}%</Text>
                    <Progress percent={cpu} strokeColor={getStatusColor(cpu)} trailColor={muiInfoColors.mediumLightCardBg} showInfo={false}/>
                </Col>
                <Col span={8}>
                    <Text style={{ color: secondaryTextColor }}>内存: {mem}%</Text>
                    <Progress percent={mem} strokeColor={getStatusColor(mem)} trailColor={muiInfoColors.mediumLightCardBg} showInfo={false}/>
                </Col>
                <Col span={8}>
                    <Text style={{ color: secondaryTextColor }}>GPU: {gpu}%</Text>
                    <Progress percent={gpu} strokeColor={getStatusColor(gpu)} trailColor={muiInfoColors.mediumLightCardBg} showInfo={false}/>
                </Col>
              </Row>
            </Card>
          </Col>
          {/* 数据库交互统计卡片 */}
          <Col xs={24} sm={12} md={12} lg={12}>
            <Card 
                 title={<div style={cardHeaderStyle}><DatabaseOutlined /> 数据库性能</div>}
                 style={cardWithBg(muiInfoColors.lightestCardBg)}
                 headStyle={{borderBottom:0, color: cardHeaderStyle.color, paddingLeft: '24px', paddingRight: '24px'}}
                 bodyStyle={{paddingTop: '0px'}}
            >
              <Descriptions column={1} size="small" layout="horizontal" colon={false} contentStyle={{fontWeight:'normal'}} labelStyle={{color: secondaryTextColor, width: '100px'}} style={{padding: '0 8px'}}>
                <Descriptions.Item contentStyle={{color: primaryTextColor, fontWeight: 'bold'}} label="数据库类型">MySQL</Descriptions.Item>
                <Descriptions.Item contentStyle={{color: primaryTextColor, fontWeight: 'bold'}} label="查询总数">{dbQuery.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item contentStyle={{color: primaryTextColor, fontWeight: 'bold'}} label="成功次数">{dbSuccess.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item contentStyle={{color: getStatusColor(dbTime * 500), fontWeight:'bold'}} label="平均耗时">{dbTime}s</Descriptions.Item> 
              </Descriptions>
              <div style={{padding: '0 8px', marginTop: '16px'}}>
                <Button type="primary" style={{backgroundColor: muiInfoColors.main, borderColor: muiInfoColors.main}} icon={<SyncOutlined />}>访问数据服务</Button>
              </div>
            </Card>
          </Col>
          {/* 传感器信息卡片 */}
          <Col xs={24} sm={24} md={24} lg={24}> {/* 此卡片较宽，占满一行 */} 
            <Card 
                title={<div style={cardHeaderStyle}><DashboardOutlined /> 环境实时监测</div>}
                style={cardWithBg(muiInfoColors.lightGreenCardBg)} // 最浅的背景，因为内容多
                headStyle={{borderBottom:0, color: cardHeaderStyle.color, paddingLeft: '24px', paddingRight: '24px'}}
                bodyStyle={{paddingTop: '0px'}}
            >
              <Row gutter={[24,20]} style={{padding: '0 8px'}}>
                <Col xs={12} sm={8} md={4}><Statistic title={<Text style={{color: secondaryTextColor}}>温度</Text>} value={sensor.temperature} suffix="℃" valueStyle={{color: primaryTextColor}}/></Col>
                <Col xs={12} sm={8} md={4}><Statistic title={<Text style={{color: secondaryTextColor}}>湿度</Text>} value={sensor.humidity} suffix="%" valueStyle={{color: primaryTextColor}}/></Col>
                <Col xs={12} sm={8} md={4}><Statistic title={<Text style={{color: secondaryTextColor}}>pH值</Text>} value={sensor.ph} valueStyle={{color: primaryTextColor}}/></Col>
                <Col xs={12} sm={8} md={6}><Statistic title={<Text style={{color: secondaryTextColor}}>溶解氧</Text>} value={sensor.oxygen} suffix="mg/L" valueStyle={{color: primaryTextColor}}/></Col>
                <Col xs={24} sm={16} md={6}><Statistic title={<Text style={{color: secondaryTextColor}}>空气电导率</Text>} value={sensor.conductivity} suffix="μS/cm" valueStyle={{color: primaryTextColor}}/></Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default NewDataCenter; 