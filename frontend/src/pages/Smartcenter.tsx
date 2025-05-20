import React, { useState } from 'react';
import { Box, Typography, List, ListItemButton, ListItemText, Divider } from '@mui/material';
import  AiTalk from '../components/smartcenter/aitalk'
import ImageRecognizer from '../components/smartcenter/ImageRecognizer'
const Smartcenter: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState('智能问答');

  const features = ['智能问答', '鱼类体长预测', '图片识别', '运动轨迹追踪'];

  const handleSelectFeature = (feature: string) => {
    setSelectedFeature(feature);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8', p: 4 }}>
      {/* 左侧菜单栏 */}
      <Box sx={{ width: '20%', backgroundColor: '#ffffff', p: 2, borderRadius: '12px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <Typography variant="h5" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>智能中心</Typography>
        {features.map((feature) => (
          <ListItemButton 
            key={feature} 
            onClick={() => handleSelectFeature(feature)}
            sx={{
              backgroundColor: selectedFeature === feature ? '#e3f2fd' : 'transparent',
              borderRadius: '8px',
              mb: 1,
              '&:hover': {
                backgroundColor: '#e3f2fd',
              },
            }}
          >
            <ListItemText primary={feature} sx={{ color: '#1976d2', fontWeight: selectedFeature === feature ? 'bold' : 'normal' }} />
          </ListItemButton>
        ))}
      </Box>

      {/* 右侧功能展示区 */}
      <Box sx={{ flex: 1, ml: 4, backgroundColor: '#ffffff', p: 3, borderRadius: '12px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <Typography variant="h5" sx={{ mb: 2, color: '#1976d2' }}>{selectedFeature}</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box>
          {selectedFeature === '智能问答' && (
            <AiTalk/>
          )}
          {selectedFeature === '鱼类体长预测' && (
            <Typography variant="body1">此处为鱼类体长预测功能的内容展示区域。</Typography>
          )}
          {selectedFeature === '图片识别' && (
            <ImageRecognizer/>
          )}
          {selectedFeature === '运动轨迹追踪' && (
            <Typography variant="body1">此处为运动轨迹追踪功能的内容展示区域。</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Smartcenter;