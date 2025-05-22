import React from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
  Avatar,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import UnderwaterIcon from '@mui/icons-material/Water';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import SearchIcon from '@mui/icons-material/Search';
import MapIcon from '@mui/icons-material/Map';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DashboardIcon from '@mui/icons-material/Dashboard';

const Sidebar: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: '#2C3E50',
          color: '#fff',
          borderRight: '1px solid #34495E',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* 顶部 1/5 区域：Logo/Icon */}
      <Box
        sx={{
          height: '20%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: 2,
          borderBottom: '1px solid #34495E',
        }}
      >
           <Avatar
            alt="智慧海洋牧场 Logo"
            src="/logo192.png" // 这里是你的 logo 图片路径
            className="App-logo" // 给 Avatar 组件添加 App-logo 类
            sx={{
              width: 80,
              height: 80,
              margin: '0 auto',
              mb: 2,
              boxShadow: 3,
            }}
          />
        <Typography variant="subtitle2" color="white">
          系统导航
        </Typography>
      </Box>

      {/* 菜单区域 4/5 */}
      <List sx={{ height: '80%', overflowY: 'auto' }}>
        {isAuthenticated && (
          <>
            <ListItemButton component={Link} to="/MainInfo" sx={{ '&:hover': { backgroundColor: '#34495E' } }}>
              <ListItemIcon sx={{ color: '#fff' }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="主要信息" />
            </ListItemButton>

            <ListItemButton component={Link} to="/Underwater" sx={{ '&:hover': { backgroundColor: '#34495E' } }}>
              <ListItemIcon sx={{ color: '#fff' }}>
                <UnderwaterIcon />
              </ListItemIcon>
              <ListItemText primary="水下系统" />
            </ListItemButton>

            <ListItemButton component={Link} to="/SmartCenter" sx={{ '&:hover': { backgroundColor: '#34495E' } }}>
              <ListItemIcon sx={{ color: '#fff' }}>
                <SmartToyIcon />
              </ListItemIcon>
              <ListItemText primary="智能中心" />
            </ListItemButton>

            <ListItemButton component={Link} to="/DataCenter" sx={{ '&:hover': { backgroundColor: '#34495E' } }}>
              <ListItemIcon sx={{ color: '#fff' }}>
                <DataUsageIcon />
              </ListItemIcon>
              <ListItemText primary="数据中心" />
            </ListItemButton>

            <ListItemButton component={Link} to="/WaterDataViewer" sx={{ '&:hover': { backgroundColor: '#34495E' } }}>
              <ListItemIcon sx={{ color: '#fff' }}>
                <SearchIcon />
              </ListItemIcon>
              <ListItemText primary="测试" />
            </ListItemButton>

            <ListItemButton component={Link} to="/MapTest" sx={{ '&:hover': { backgroundColor: '#34495E' } }}>
              <ListItemIcon sx={{ color: '#fff' }}>
                <MapIcon />
              </ListItemIcon>
              <ListItemText primary="地图" />
            </ListItemButton>
          </>
        )}

        {user?.role === 'admin' && (
          <ListItemButton component={Link} to="/AdminCenter" sx={{ '&:hover': { backgroundColor: '#34495E' } }}>
            <ListItemIcon sx={{ color: '#fff' }}>
              <AdminPanelSettingsIcon />
            </ListItemIcon>
            <ListItemText primary="管理中心" />
          </ListItemButton>
        )}

        <ListItemButton component={Link} to="/Dashboard" sx={{ '&:hover': { backgroundColor: '#34495E' } }}>
          <ListItemIcon sx={{ color: '#fff' }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="测试布局" />
        </ListItemButton>
      </List>
    </Drawer>
  );
};

export default Sidebar;
