import React from 'react';
import AnimatedTextChart from '../components/AnimatedTextChart';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Button 
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';


const Home: React.FC = () => {
  

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* 系统介绍 */}
      <Box sx={{ mb: 6 }}>
        <AnimatedTextChart
        text="智 慧 海 洋 牧 场"
        fontSize={160}
        color="#007acc"
        stroke="#007acc"
        lineWidth={2}
      />
        <Typography variant="h4" gutterBottom>
          智慧海洋牧场可视化系统
        </Typography>
        <Typography variant="body1">
          本系统基于物联网与大数据技术，实现对海洋牧场环境参数的实时监测与可视化展示。通过整合水质监测、生物行为追踪、生态预警等模块，为海洋资源管理提供科学决策支持。
        </Typography>
        <Typography variant="body1" >
          系统具备多维度数据分析能力，支持环境异常自动预警、历史数据回溯、可视化图表展示等功能，助力实现海洋牧场的智能化管理和可持续发展。
        </Typography>
      </Box>

      {/* 核心功能 */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        核心功能
      </Typography>
      <Grid container spacing={4}>
        <Grid >
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
            实时监测
          </Typography>
          <Typography variant="body2" color="text.secondary">
            24小时不间断监测水温、盐度、溶解氧等关键指标，精准掌握海洋环境动态
          </Typography>
        </Grid>
        <Grid >
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
            智能预警
          </Typography>
          <Typography variant="body2" color="text.secondary">
            基于AI算法实现异常数据自动识别，及时推送预警信息，预防生态风险
          </Typography>
        </Grid>
        <Grid>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
            数据分析
          </Typography>
          <Typography variant="body2" color="text.secondary">
            提供多维度数据报表与趋势分析，支持养殖策略优化和科研决策
          </Typography>
        </Grid>
      </Grid>

      {/* 注册和登录选项 */}
      <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
        <Button 
          component={Link}
          color="primary" 
          to="/Register"
          sx={{ marginRight: 2 }}
        >
          注册
        </Button>
        <Button 
           component={Link}
           color="primary" 
           to="/Login"
        >
          登录
        </Button>
      </Box>
    </Container>
  );
};

export default Home;
