import React from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Select,
  MenuItem,
  Grid,
  Link,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import {register}  from "../components/axioxapi"; // 导入注册函数
import { loginSuccess } from "../components/AuthContext";
import { useDispatch } from "react-redux";




const Register : React.FC = () =>  {
  const [username, setUsername] = useState('');
  const [password,setPassword]=useState('');
  const [error, setError] = useState('');
  const [role,setRole]=useState('');
  const dispatch = useDispatch();

  const navigate = useNavigate(); // 用于页面跳转
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await register(username, password, role);
      if (!response.ok) {
        setError(response.message );
        throw new Error(response.message);
      }
      dispatch(loginSuccess({ username, role })); // 调用登录成功的 action
      navigate("/maininfo");
    } catch (error) {
      if (error instanceof Error) {
        console.error("注册失败:", error.message);
      } else {
        console.error("未知错误:", error);
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        注册
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
            <FormControl fullWidth>
              <InputLabel>角色</InputLabel>
              <Select
                value={role}
                label="角色"
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <MenuItem value="user">普通用户</MenuItem>
                <MenuItem value="admin">管理员</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={8}>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
            >
              注册
            </Button>
          </Grid>
          <Grid >
            <Typography variant="body2">
              已有账号？<Link href="/login">去登录</Link>
            </Typography>
          </Grid>
          {error && (
            <Grid >
              <Typography color="error">{error}</Typography>
            </Grid>
          )}
        </Grid>
      </form>
    </Box>
  );
};

export default Register;
