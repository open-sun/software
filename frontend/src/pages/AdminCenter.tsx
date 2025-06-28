import React from 'react';
import { Box, Typography, Divider, useMediaQuery, useTheme } from '@mui/material';
import UserManagement from '../components/AdminCenter/UserManagement';

const AdminCenter: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        <Typography variant="h5" sx={{ mb: 2, color: '#1976d2' }}>
          用户管理
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <UserManagement />
      </Box>
    </Box>
  );
};

export default AdminCenter;
