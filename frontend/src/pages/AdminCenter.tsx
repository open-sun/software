import React, { useState } from 'react';
import { Box, Typography, Divider, Tabs, Tab, useMediaQuery, useTheme } from '@mui/material';
import UserManagement from '../components/AdminCenter/UserManagement';
import HydrologicalManagement from '../components/AdminCenter/HydrologyManagement'; // Assuming this component exists
import FishManagement from '../components/AdminCenter/FishManagement'; // Assuming you create this component

const AdminCenter: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State to track the active tab
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f0f4f8',
        p: isMobile ? 2 : 4,
      }}
    >
      <Box
        sx={{
          backgroundColor: '#ffffff',
          p: 3,
          borderRadius: '12px',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Tabs for navigating between User, Hydrological, and Fish Management */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="Admin Center Tabs"
          centered
        >
          <Tab label="用户管理" />
          <Tab label="水文管理" />
          <Tab label="鱼类管理" /> {/* 新的标签 */}
        </Tabs>

        {/* Divider */}
        <Divider sx={{ mb: 2 }} />

        {/* Render the selected tab content */}
        {activeTab === 0 && <UserManagement />}
        {activeTab === 1 && <HydrologicalManagement />}
        {activeTab === 2 && <FishManagement />} {/* 渲染 FishManagement 组件 */}
      </Box>
    </Box>
  );
};

export default AdminCenter;
