// Layout.tsx
import React, { useState } from 'react';
import { Box, useMediaQuery, Theme } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} isMobile={isMobile} />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Header handleDrawerToggle={handleDrawerToggle} isMobile={isMobile} />
        <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default Layout;
