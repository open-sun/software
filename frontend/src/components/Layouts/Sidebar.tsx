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
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface SidebarProps {
  isMobile: boolean;
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

const MIN_WIDTH = 56; // 收起时宽度
const MAX_WIDTH = 400; // 电脑端最大宽度
const DEFAULT_RATIO = 0.18; // 电脑端默认宽度比例

const Sidebar: React.FC<SidebarProps> = ({ isMobile, mobileOpen, handleDrawerToggle }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  // 电脑端的宽度状态（拖拽可变）
  const [drawerWidth, setDrawerWidth] = useState(() => {
    const w = Math.round(window.innerWidth * DEFAULT_RATIO);
    return Math.max(Math.min(w, MAX_WIDTH), MIN_WIDTH);
  });

  // 手机端和电脑端的收起状态共享
  const [collapsed, setCollapsed] = useState(false);

  const dragging = useRef(false);
  const animationFrame = useRef<number>(0);

  // 电脑端：监听窗口变化，调整宽度比例（仅未收起时生效）
  useEffect(() => {
    if (!isMobile) {
      const handleResize = () => {
        if (!collapsed && !dragging.current) {
          const w = Math.round(window.innerWidth * DEFAULT_RATIO);
          setDrawerWidth(Math.max(Math.min(w, MAX_WIDTH), MIN_WIDTH));
        }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [collapsed, isMobile]);

  // 电脑端拖拽逻辑
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMobile && !collapsed) {
      dragging.current = true;
      document.body.style.cursor = 'col-resize';
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragging.current && !collapsed && !isMobile) {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      animationFrame.current = requestAnimationFrame(() => {
        let newWidth = e.clientX;
        if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
        if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;
        setDrawerWidth(newWidth);
      });
    }
  };

  const handleMouseUp = () => {
    if (!isMobile) {
      dragging.current = false;
      document.body.style.cursor = '';
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    }
  };

  useEffect(() => {
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      };
    }
  }, [collapsed, isMobile]);

  // 切换收起/展开
  const toggleCollapse = () => {
    if (collapsed) {
      // 从收起到展开
      if (isMobile) {
        // 手机端展开占满全屏
        setDrawerWidth(window.innerWidth);
      } else {
        // 电脑端展开恢复比例宽度
        const w = Math.round(window.innerWidth * DEFAULT_RATIO);
        setDrawerWidth(Math.max(Math.min(w, MAX_WIDTH), MIN_WIDTH));
      }
      setCollapsed(false);
    } else {
      // 收起时宽度固定最小
      setDrawerWidth(MIN_WIDTH);
      setCollapsed(true);
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
            <ListItemButton
              component={Link}
              to="/MainInfo"
              sx={{ '&:hover': { backgroundColor: '#34495E' }, justifyContent: collapsed ? 'center' : 'flex-start' }}
            >
              <ListItemIcon sx={{ color: '#fff', minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}>
                <InfoIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="主要信息" />}
            </ListItemButton>
            <ListItemButton
              component={Link}
              to="/Underwater"
              sx={{ '&:hover': { backgroundColor: '#34495E' }, justifyContent: collapsed ? 'center' : 'flex-start' }}
            >
              <ListItemIcon sx={{ color: '#fff', minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}>
                <UnderwaterIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="水下系统" />}
            </ListItemButton>
            <ListItemButton
              component={Link}
              to="/SmartCenter"
              sx={{ '&:hover': { backgroundColor: '#34495E' }, justifyContent: collapsed ? 'center' : 'flex-start' }}
            >
              <ListItemIcon sx={{ color: '#fff', minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}>
                <SmartToyIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="智能中心" />}
            </ListItemButton>
            <ListItemButton
              component={Link}
              to="/DataCenter"
              sx={{ '&:hover': { backgroundColor: '#34495E' }, justifyContent: collapsed ? 'center' : 'flex-start' }}
            >
              <ListItemIcon sx={{ color: '#fff', minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}>
                <DataUsageIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="数据中心" />}
            </ListItemButton>
          </>
        )}
        {user?.role === 'admin' && (
          <ListItemButton
            component={Link}
            to="/AdminCenter"
            sx={{ '&:hover': { backgroundColor: '#34495E' }, justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            <ListItemIcon sx={{ color: '#fff', minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}>
              <AdminPanelSettingsIcon />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="管理中心" />}
          </ListItemButton>
        )}
      </List>
    </Box>
  );

if (isMobile) {
  return (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{ keepMounted: true }}
      sx={{
        [`& .MuiDrawer-paper`]: {
          width: '50vw',      // 手机端宽度固定全屏
          backgroundColor: '#2C3E50',
          color: '#fff',
          overflowX: 'hidden',
        },
      }}
    >
      {/* 这里可以放个关闭按钮 */}
      <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
        <IconButton
          onClick={handleDrawerToggle}   // 关闭时调用父组件控制
          size="small"
          sx={{ background: '#34495E', color: '#fff', '&:hover': { background: '#222' } }}
        >
          <ChevronLeftIcon />
        </IconButton>
      </Box>

      {drawerContent}
    </Drawer>
  );
}


  // 电脑端 Drawer，支持拖拽和收起/展开
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          maxWidth: '100vw',
          backgroundColor: '#2C3E50',
          color: '#fff',
          boxSizing: 'border-box',
          transition: 'width 0.2s',
          overflowX: 'hidden',
          position: 'relative',
          userSelect: dragging.current ? 'none' : 'auto',
        },
      }}
      open
    >
      {/* 拖拽条 */}
      {!collapsed && (
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 8,
            height: '100%',
            cursor: 'col-resize',
            zIndex: 1000,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        />
      )}

      {/* 收起/展开按钮 */}
      <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1100 }}>
        <IconButton
          onClick={toggleCollapse}
          size="small"
          sx={{ background: '#34495E', color: '#fff', '&:hover': { background: '#222' } }}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
