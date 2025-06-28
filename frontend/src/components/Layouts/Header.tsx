// Header.tsx
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Box,
  IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

interface HeaderProps {
  handleDrawerToggle?: () => void;
  isMobile?: boolean;
}

const Header: React.FC<HeaderProps> = ({ handleDrawerToggle, isMobile }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  function stringAvatar(name: string) {
    return { children: name.charAt(0).toUpperCase() };
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: '#007bff' }}>
      <Toolbar>
        {isMobile && handleDrawerToggle && (
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
        )}

        {!isAuthenticated && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ListItemButton
              component={Link}
              to="/"
              sx={{
                '&:hover': { backgroundColor: '#34495E' },
                padding: '8px 16px',
                borderRadius: '4px',
              }}
            >
              <ListItemIcon sx={{ color: '#fff', minWidth: '36px' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText
                primary="首页"
                sx={{
                  '& .MuiTypography-root': {
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap',
                    color: 'white',
                  },
                }}
              />
            </ListItemButton>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
          {isAuthenticated ? (
            <>
              <Avatar
                {...stringAvatar(user?.username || 'U')}
                sx={{ cursor: 'pointer', bgcolor: 'white', color: '#007bff' }}
                onClick={() => navigate('/UserProfile')} // 👈 点击跳转
              />
              <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>
                {user?.username || 'Unknown'}
              </Typography>
              <Button
                onClick={handleLogout}
                sx={{
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                登出
              </Button>
            </>
          ) : (
            <>
              <Avatar {...stringAvatar('G')} />
              <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>
                未登录
              </Typography>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
