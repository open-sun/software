// Sidebar.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
  Avatar,
  Typography,
  IconButton,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

import InfoIcon from '@mui/icons-material/Info';
import UnderwaterIcon from '@mui/icons-material/Water';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import SearchIcon from '@mui/icons-material/Search';
import MapIcon from '@mui/icons-material/Map';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface SidebarProps {
  isMobile: boolean;
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

const MIN_WIDTH = 56; // 收起时宽度
const MAX_WIDTH = 400; // 最大宽度
const DEFAULT_RATIO = 0.18; // 默认占页面宽度比例
const DEFAULT_WIDTH = Math.round(window.innerWidth * DEFAULT_RATIO);

const Sidebar: React.FC<SidebarProps> = ({ isMobile, mobileOpen, handleDrawerToggle }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  // 用比例和像素双重控制
  const [drawerWidth, setDrawerWidth] = useState(() => {
    const w = Math.round(window.innerWidth * DEFAULT_RATIO);
    return Math.max(Math.min(w, MAX_WIDTH), MIN_WIDTH);
  });
  const [collapsed, setCollapsed] = useState(false);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const animationFrame = useRef<number>(0);

  // 保持宽度与页面成比例
  useEffect(() => {
    const handleResize = () => {
      if (!collapsed && !dragging.current) {
        const w = Math.round(window.innerWidth * DEFAULT_RATIO);
        setDrawerWidth(Math.max(Math.min(w, MAX_WIDTH), MIN_WIDTH));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed]);

  // 拖拽事件优化
  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastX.current = e.clientX;
    document.body.style.cursor = 'col-resize';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragging.current && !collapsed) {
      // 只在鼠标移动时用 requestAnimationFrame 优化性能
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      animationFrame.current = requestAnimationFrame(() => {
        let newWidth = e.clientX;
        // 防止拖到页面外
        if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
        if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;
        setDrawerWidth(newWidth);
      });
    }
  };

  const handleMouseUp = () => {
    dragging.current = false;
    document.body.style.cursor = '';
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
    // eslint-disable-next-line
  }, [collapsed]);

  // 收起/展开
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    if (!collapsed) {
      setDrawerWidth(MIN_WIDTH);
    } else {
      // 恢复为当前窗口宽度的比例
      const w = Math.round(window.innerWidth * DEFAULT_RATIO);
      setDrawerWidth(Math.max(Math.min(w, MAX_WIDTH), MIN_WIDTH));
    }
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          height: '20%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: 2,
          borderBottom: '1px solid #34495E',
          transition: 'padding 0.2s',
          ...(collapsed && { padding: 0 }),
        }}
      >
        <Avatar
          alt="智慧海洋牧场 Logo"
          src="/logo192.png"
          sx={{
            width: collapsed ? 40 : 80,
            height: collapsed ? 40 : 80,
            margin: '0 auto',
            mb: collapsed ? 0 : 2,
            boxShadow: 3,
            transition: 'all 0.2s',
          }}
        />
        {!collapsed && (
          <Typography variant="subtitle2" color="white">
            系统导航
          </Typography>
        )}
      </Box>

      <List sx={{ flexGrow: 1, overflowY: 'auto', px: collapsed ? 0.5 : 2 }}>
        {isAuthenticated && (
          <>
            <ListItemButton component={Link} to="/MainInfo" sx={{ '&:hover': { backgroundColor: '#34495E' }, justifyContent: collapsed ? 'center' : 'flex-start' }}>
              <ListItemIcon sx={{ color: '#fff', minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}><InfoIcon /></ListItemIcon>
              {!collapsed && <ListItemText primary="主要信息" />}
            </ListItemButton>
            <ListItemButton component={Link} to="/Underwater" sx={{ '&:hover': { backgroundColor: '#34495E' }, justifyContent: collapsed ? 'center' : 'flex-start' }}>
              <ListItemIcon sx={{ color: '#fff', minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}><UnderwaterIcon /></ListItemIcon>
              {!collapsed && <ListItemText primary="水下系统" />}
            </ListItemButton>
            <ListItemButton component={Link} to="/SmartCenter" sx={{ '&:hover': { backgroundColor: '#34495E' }, justifyContent: collapsed ? 'center' : 'flex-start' }}>
              <ListItemIcon sx={{ color: '#fff', minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}><SmartToyIcon /></ListItemIcon>
              {!collapsed && <ListItemText primary="智能中心" />}
            </ListItemButton>
            <ListItemButton component={Link} to="/DataCenter" sx={{ '&:hover': { backgroundColor: '#34495E' }, justifyContent: collapsed ? 'center' : 'flex-start' }}>
              <ListItemIcon sx={{ color: '#fff', minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}><DataUsageIcon /></ListItemIcon>
              {!collapsed && <ListItemText primary="数据中心" />}
            </ListItemButton>
            <ListItemButton component={Link} to="/WaterDataViewer" sx={{ '&:hover': { backgroundColor: '#34495E' }, justifyContent: collapsed ? 'center' : 'flex-start' }}>
              <ListItemIcon sx={{ color: '#fff', minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}><SearchIcon /></ListItemIcon>
              {!collapsed && <ListItemText primary="测试" />}
            </ListItemButton>
            <ListItemButton component={Link} to="/MapTest" sx={{ '&:hover': { backgroundColor: '#34495E' }, justifyContent: collapsed ? 'center' : 'flex-start' }}>
              <ListItemIcon sx={{ color: '#fff', minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}><MapIcon /></ListItemIcon>
              {!collapsed && <ListItemText primary="地图" />}
            </ListItemButton>
          </>
        )}
        {user?.role === 'admin' && (
          <ListItemButton component={Link} to="/AdminCenter" sx={{ '&:hover': { backgroundColor: '#34495E' }, justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <ListItemIcon sx={{ color: '#fff', minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}><AdminPanelSettingsIcon /></ListItemIcon>
            {!collapsed && <ListItemText primary="管理中心" />}
          </ListItemButton>
        )}
        <ListItemButton component={Link} to="/Dashboard" sx={{ '&:hover': { backgroundColor: '#34495E' }, justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <ListItemIcon sx={{ color: '#fff', minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}><DashboardIcon /></ListItemIcon>
          {!collapsed && <ListItemText primary="测试布局" />}
        </ListItemButton>
      </List>
    </Box>
  );

  return isMobile ? (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{ keepMounted: true }}
      sx={{
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          backgroundColor: '#2C3E50',
          color: '#fff',
          transition: 'width 0.2s',
          overflowX: 'hidden',
        },
      }}
    >
      {/* 收起/展开按钮 */}
      <Box sx={{ position: 'absolute', top: 10, right: -16, zIndex: 1 }}>
        <IconButton onClick={toggleCollapse} size="small" sx={{ background: '#34495E', color: '#fff', '&:hover': { background: '#222' } }}>
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
      {/* 拖拽分隔条 */}
      {!collapsed && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 6,
            height: '100%',
            cursor: 'col-resize',
            zIndex: 2,
            background: 'rgba(0,0,0,0.05)',
          }}
          onMouseDown={handleMouseDown}
        />
      )}
      {drawerContent}
    </Drawer>
  ) : (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          backgroundColor: '#2C3E50',
          color: '#fff',
          boxSizing: 'border-box',
          transition: 'width 0.2s',
          overflowX: 'hidden',
        },
      }}
      open
    >
      {/* 收起/展开按钮 */}
      <Box sx={{ position: 'absolute', top: 10, right: -16, zIndex: 1 }}>
        <IconButton onClick={toggleCollapse} size="small" sx={{ background: '#34495E', color: '#fff', '&:hover': { background: '#222' } }}>
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
      {/* 拖拽分隔条 */}
      {!collapsed && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 6,
            height: '100%',
            cursor: 'col-resize',
            zIndex: 2,
            background: 'rgba(0,0,0,0.05)',
          }}
          onMouseDown={handleMouseDown}
        />
      )}
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;