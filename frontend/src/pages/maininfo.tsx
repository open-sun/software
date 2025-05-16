import React, { useState, useEffect } from 'react';
import { Typography, Box, Card, CardMedia, TextField, Button } from '@mui/material';
import { getVideosByDate } from '../services/DataGet';
import WaterQuality from './WaterQuality'; // 导入 WaterQuality 组件

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

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        主要信息
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          label="输入日期 (YYYY-MM-DD)"
          variant="outlined"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Button variant="contained" onClick={handleSearch}>
          搜索视频
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {videos.length > 0 ? (
          videos.map((video, index) => (
            <Box 
              key={index} 
              sx={{
                width: 'calc(33.33% - 16px)', 
                mb: 2, 
                backgroundColor: '#f5f5f5', 
                padding: 2, 
                boxSizing: 'border-box',
                borderRadius: '8px',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Card>
                <CardMedia
                  component="video"
                  controls
                  src={video.url}
                  title={video.filename}
                  style={{ width: '100%', height: '180px' }}
                />
              </Card>
              <Typography variant="subtitle1" align="center" sx={{ mt: 1 }}>
                {video.filename}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body1" sx={{ mt: 2 }}>
            暂无视频，请输入日期进行查询。
          </Typography>
        )}
      </Box>

         {/* 在 MainInfo 中嵌入 WaterQuality 组件 */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          水质数据
        </Typography>
        <WaterQuality />
      </Box>
    </Box>


  );
};

export default MainInfo;
