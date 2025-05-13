import React from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Link,
} from "@mui/material";
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../components/AuthContext";
import {login}  from "../components/axioxapi"; // 导入注册函数

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password,setPassword]=useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate(); // 用于页面跳转


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
          const response = await login(username, password);
          if (!response.ok) {
            setError(response.message );
            throw new Error(response.message);
          }
          const role=response.role
          dispatch(loginSuccess({ username,role})); // 调用登录成功的 action
          navigate("/maininfo");
        } catch (error) {
          if (error instanceof Error) {
            console.error("登录失败:", error.message);
          } else {
            console.error("未知错误:", error);
          }
        }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        登录
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid size={8}>
            <TextField
              fullWidth
              label="用户名"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Grid>
          <Grid size={8}>
            <TextField
              fullWidth
              label="密码"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Grid>
          <Grid size={8}>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
            >
              登录
            </Button>
          </Grid>
          <Grid size={8}>
            <Typography variant="body2">
              没有账号？<Link href="/register">立即注册</Link>
            </Typography>
          </Grid>
          {error && (
            <Grid size={8}>
              <Typography color="error">{error}</Typography>
            </Grid>
          )}
        </Grid>
      </form>
    </Box>
  );
};

export default LoginPage;