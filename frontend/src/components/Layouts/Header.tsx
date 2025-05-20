// Header.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Avatar, ListItemButton, ListItemText, ListItemIcon, Divider, Box } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  function stringAvatar(name: string) {
    return {
      children: name.charAt(0),
    };
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: '#007bff' }}>
      <Toolbar>
        {/* Only show "Home" button if the user is not authenticated */}
        {!isAuthenticated && (
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            flexGrow: 1,  //占据剩余空间
            maxWidth: 'fit-content' // 限制为内容宽度
          }}>
            <ListItemButton 
              component={Link} 
              to="/" 
              sx={{ 
                '&:hover': { backgroundColor: '#34495E' },
                padding: '8px 16px',
                borderRadius: '4px'
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
                    whiteSpace: 'nowrap'
                  } 
                }} 
              />
            </ListItemButton>
          </Box>
        )}

        {/* 右侧用户信息 */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginLeft: 'auto' // 自动左外边距推至最右
        }}>
          {isAuthenticated ? (
            <>
              <Avatar {...stringAvatar(user?.username || 'U')} />
              <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>
                {user?.username || 'Unknown'}
              </Typography>
              <Button 
                onClick={handleLogout} 
                sx={{ 
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
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
