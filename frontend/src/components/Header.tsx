import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar,
  Box
} from '@mui/material';
import { useSelector, useDispatch } from "react-redux";
import { RootState } from '../store';
import { logout } from '../components/AuthContext';


const Header: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch=useDispatch();
  const navigate=useNavigate();
  function stringAvatar(name: string) {
    return {
      children: name.charAt(0), // 提取字符串首字母
    };
  }
  const handleLogout = () => {
    dispatch(logout()); // 调用登出操作
    navigate('/'); // 跳转到登录页面 
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: '#007bff' }}>
      <Toolbar>        
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
          {!isAuthenticated&&(<Button 
            component={Link} 
            to="/" 
            sx={{ color: 'white' }}
          >
            首页
          </Button>)}
          {isAuthenticated && (
            <Button 
              component={Link} 
              to="/maininfo" 
              sx={{ color: 'white' }}
            >
            主要信息
            </Button>
          )}
          {isAuthenticated && (
            <Button 
              component={Link} 
              to="/underwater" 
              sx={{ color: 'white' }}
            >
              水下系统
            </Button>
          )}
          {isAuthenticated && (
            <Button 
              component={Link} 
              to="/smartcenter" 
              sx={{ color: 'white' }}
            >
              智能中心
            </Button>
          )}
            {isAuthenticated && (
            <Button 
              component={Link} 
              to="/datacenter" 
              sx={{ color: 'white' }}
            >
              数据中心
            </Button>
          )}
          {user?.role=='admin' && (
            <Button 
              component={Link} 
              to="/management" 
              sx={{ color: 'white' }}
            >
            管理中心
            </Button>
          )}
          {isAuthenticated && (
            <Button 
              component={Link} 
              to="/WaterDataViewer" 
              sx={{ color: 'white' }}
            >
              测试
            </Button>
          )}
          {isAuthenticated && (
            <Button 
              component={Link} 
              to="/MapTest" 
              sx={{ color: 'white' }}
            >
              地图
            </Button>
          )}

        </Box>
        <Box 
          sx={{ 
            ml: 'auto',       // 整体靠右
            mr: 4,            // 右侧间距
            display: 'flex',  // 启用flex布局
            alignItems: 'center' // 垂直居中
          }}
        >
          {isAuthenticated ? (
            <>
              <Avatar {...stringAvatar(user?.username || 'Unknown')} />
              <Typography 
                sx={{ 
                  ml: 2,           // 头像右侧间距
                  color: "white",
                  fontWeight: 500,
                  display: 'flex',  // 确保文字垂直居中
                  alignItems: 'center'
                }}
              >
                {user?.username || "Unknown"}
              </Typography>
              <Button
              onClick={handleLogout}
              sx={{ color: 'white' }}
            >
              登出
            </Button>

            </>
          ) : (
            <>
            <Avatar {...stringAvatar('Guest')} />
            <Typography 
                sx={{ 
                  ml: 2,           // 头像右侧间距
                  color: "white",
                  fontWeight: 500,
                  display: 'flex',  // 确保文字垂直居中
                  alignItems: 'center'
                }}
              >
                {"未登录"}
              </Typography>


            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;