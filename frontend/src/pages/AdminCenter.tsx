// src/pages/AdminCenter.tsx
import React, { useState } from 'react';
import { Box, Typography, ListItemButton, ListItemText, Divider } from '@mui/material';
import UserManagement from '../components/AdminCenter/UserManagement';
import HydrologyManagement from '../components/AdminCenter/HydrologyManagement';
import FishManagement from '../components/AdminCenter/FishManagement';

const AdminCenter: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState('用户管理');

  const sections = ['用户管理', '水文管理', '鱼类管理'];

  const renderSectionContent = () => {
    switch (selectedSection) {
      case '用户管理':
        return <UserManagement />;
      case '水文管理':
        return <HydrologyManagement />;
      case '鱼类管理':
        return <FishManagement />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8', p: 4 }}>
      {/* 左侧菜单栏 */}
      <Box sx={{ width: '20%', backgroundColor: '#ffffff', p: 2, borderRadius: '12px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <Typography variant="h5" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>管理中心</Typography>
        {sections.map((section) => (
          <ListItemButton
            key={section}
            onClick={() => setSelectedSection(section)}
            sx={{
              backgroundColor: selectedSection === section ? '#e3f2fd' : 'transparent',
              borderRadius: '8px',
              mb: 1,
              '&:hover': { backgroundColor: '#e3f2fd' },
            }}
          >
            <ListItemText primary={section} sx={{ color: '#1976d2', fontWeight: selectedSection === section ? 'bold' : 'normal' }} />
          </ListItemButton>
        ))}
      </Box>

      {/* 右侧内容区 */}
      <Box sx={{ flex: 1, ml: 4, backgroundColor: '#ffffff', p: 3, borderRadius: '12px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <Typography variant="h5" sx={{ mb: 2, color: '#1976d2' }}>{selectedSection}</Typography>
        <Divider sx={{ mb: 2 }} />
        {renderSectionContent()}
      </Box>
    </Box>
  );
};

export default AdminCenter;
