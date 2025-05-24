import React, { useState } from "react";
import  { useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Link,
  Paper,
  Avatar,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "../components/AuthContext";
import { login } from "../services/login-register"; // 导入登录函数
import '../App.css';
// import {img} from '../../public/logo192.png'

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate(); // 用于页面跳转

  // 检查本地存储，实现持久化登录
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const { username, role } = JSON.parse(userData);
      dispatch(loginSuccess({ username, role }));
      navigate("/MainInfo");
    }
  }, [dispatch, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await login(username, password);
      if (!response.ok) {
        setError(response.message );
        throw new Error(response.message);
      }
      const role = response.role;
      // 存储到 localStorage
      localStorage.setItem('user', JSON.stringify({ username, role }));
      dispatch(loginSuccess({ username, role })); // 调用登录成功的 action
      navigate("/MainInfo");
    } catch (error) {
      if (error instanceof Error) {
        console.error("登录失败:", error.message);
      } else {
        console.error("未知错误:", error);
      }
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#f0f8ff', // 海洋的浅蓝色背景
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <Paper sx={{
        p: 4,
        width: 400,
        borderRadius: 2,
        boxShadow: 3,
        bgcolor: 'rgba(255, 255, 255, 0.9)', // 更加透明的白色背景以突出内容
        backdropFilter: 'blur(10px)', // 添加模糊背景效果
      }}>
         {/* 上方品牌标识和艺术字 */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
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
          <Typography variant="h3" component="h1" gutterBottom sx={{
            fontFamily: "'Pacifico', cursive", // 艺术字体
            color: '#1e90ff', // 海洋蓝色
            fontWeight: 'bold',
            textShadow: '2px 2px 5px rgba(0, 0, 0, 0.2)', // 文字阴影
          }}>
            智慧海洋牧场
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
             <Grid size={{ xs: 12, md: 6, lg: 12 }}>
              <TextField
                fullWidth
                label="用户名"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                sx={{
                  backgroundColor: 'white',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#1e90ff', // 边框色使用海洋蓝
                    },
                    '&:hover fieldset': {
                      borderColor: '#4682b4', // 鼠标悬浮时的蓝色
                    },
                  },
                }}
              />
            </Grid>
             <Grid size={{ xs: 12, md: 6, lg: 12 }}>
              <TextField
                fullWidth
                label="密码"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{
                  backgroundColor: 'white',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#1e90ff', // 边框色使用海洋蓝
                    },
                    '&:hover fieldset': {
                      borderColor: '#4682b4', // 鼠标悬浮时的蓝色
                    },
                  },
                }}
              />
            </Grid>
             <Grid size={{ xs: 12, md: 6, lg: 12 }}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: '#1e90ff', // 采用海洋蓝
                  '&:hover': {
                    bgcolor: '#4682b4', // 悬浮时使用深蓝色
                    transform: 'scale(1.05)', // 悬浮时按钮放大效果
                  },
                  borderRadius: 1,
                  transition: 'transform 0.2s ease', // 动画效果
                }}
              >
                登录
              </Button>
            </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 12 }}>
              <Typography variant="body2" align="center" sx={{ fontSize: '14px', color: '#333' }}>
                没有账号？<Link href="/Register" sx={{ color: '#1e90ff', textDecoration: 'underline' }}>立即注册</Link>
              </Typography>
            </Grid>
            {error && (
              <Grid size={{ xs: 12, md: 6, lg: 12 }}>
                <Typography color="error" align="center">{error}</Typography>
              </Grid>
            )}
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginPage;
