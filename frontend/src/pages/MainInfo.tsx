import React, { useState, useEffect } from 'react';
import { Typography, Box, Card, CardMedia, TextField, Button } from '@mui/material';
import { getVideosByDate } from '../services/DataGet';
import WaterQuality from './WaterQuality';
import MapTest from './MapTest';
import WeatherPanel from './WeatherPanel';
import MarketPanel from './MarketPanel';

const MainInfo: React.FC = () => {
  const [date, setDate] = useState('');
  const [videos, setVideos] = useState<{ filename: string; url: string }[]>([]);

  // 获取视频数据
  const fetchVideos = async () => {
    try {
      const videoData = await getVideosByDate(date);
      setVideos(videoData);
    } catch (error) {
      console.error('获取视频数据失败：', error);
    }
  };

  const handleSearch = () => {
    fetchVideos();
  };

  const MIN_WIDTH = 56; // 收起时宽度
  const MAX_WIDTH = 400; // 最大宽度
  const DEFAULT_RATIO = 0.18; // 默认占页面宽度比例

  return (
      <Box
    sx={{
      p: { xs: 1, sm: 2, md: 4 },
      background: 'linear-gradient(135deg,rgb(247, 247, 247), #ffffff)',
      minHeight: '100vh',
      width: {
        xs: '100vw',
        md: `calc(100vw - ${DEFAULT_RATIO * 100}vw)`, // 默认侧栏宽度
        lg: `calc(100vw - ${MAX_WIDTH}px)`,            // 大屏最大侧栏宽度
      },
      maxWidth: 1600,
      margin: '0 auto',
      boxSizing: 'border-box',
      overflowX: 'auto',
      transition: 'width 0.3s',
    }}
  >
      {/* 上部分：左侧主要信息，右侧视频模块（查找和展示） */}
      <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
        {/* 左侧 - 主要信息 */}
        <Box sx={{ flex: '0 0 60%', backgroundColor: '#ffffff', padding: 3, borderRadius: '12px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', position: 'relative' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            智慧海洋牧场 - 主要信息
          </Typography>
          <Box sx={{ position: 'absolute', right: '16px', top: '16px', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1976d2', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ffffff', fontWeight: 'bold' }}>
            i
          </Box>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
            智慧海洋牧场系统是一个集监控视频展示与水质数据可视化于一体的综合系统。用户可通过该系统快速查询视频监控内容并查看水质监测数据，以全面掌握牧场实时动态，提高环境管理与养殖监测的精确性和有效性。
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
            本模块旨在为用户提供系统概览，包括系统核心功能、使用场景及其重要性。通过展示主要信息，用户可以直观了解当前监测数据，并快速进入各个功能模块进行详细操作。
          </Typography>
        </Box>

        {/* 右侧 - 视频模块（查找和展示）  这个地方其实没对齐 */}
        <Box sx={{ flex: '0 0 38%', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 视频查找模块 */}
          <Box sx={{ backgroundColor: '#ffffff', padding: 3, borderRadius: '12px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              视频查找
            </Typography>
            <TextField
              fullWidth
              label="输入日期 (如2025-05-11)"
              variant="outlined"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" fullWidth onClick={handleSearch}>
              搜索视频
            </Button>
          </Box>

          {/* 视频展示区 */}
          <Box sx={{ flex: 1, backgroundColor: '#ffffff', padding: 3, borderRadius: '12px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', overflowY: 'auto' }}>
            <Typography variant="h6" component="h6" gutterBottom>
              视频展示
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
              {videos.length > 0 ? (
                videos.map((video, index) => (
                  <Box key={index} sx={{ width: '300px', mb: 2, backgroundColor: '#f5f5f5', padding: 2, borderRadius: '8px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
                    <Card>
                      <CardMedia
                        component="video"
                        controls
                        src={video.url}
                        title={video.filename}
                        style={{ width: '100%', height: '200px' }}
                      />
                    </Card>
                    <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                      {video.filename}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ mt: 2 }}>
                  暂无视频，请输入日期进行查询。
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 水质数据展示区 */}
      <Box sx={{ mt: 4, p: 4, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          水质数据可视化
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          下方模块展示了当前监测区域的水质数据，包括溶解氧、温度、电导率等关键指标，帮助管理者及时掌握水质变化趋势，确保水产健康。
        </Typography>
        <WaterQuality />
      </Box>
      
      <Box sx={{ display: 'flex', gap: 4, mt: 4 }}>
        {/* 水质地图展示区 */}
        <Box
          sx={{
            p: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
            width: '50%',
          }}
        >
          <MapTest />
        </Box>
        {/* 市场信息展示区 */}
        <Box
          sx={{
            p: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
            width: '50%',
          }}
        >
          <MarketPanel />
        </Box>
      </Box>
      {/* 天气信息展示区 */}
      <Box sx={{ mt: 4, p: 4, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)' }}>
        <WeatherPanel />
      </Box>

    </Box>
  );
};

export default MainInfo;