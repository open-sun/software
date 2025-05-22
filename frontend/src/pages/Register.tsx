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
  Paper,
  Avatar,
} from "@mui/material";
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import {register}  from "../services/login-register";
import { loginSuccess } from "../components/AuthContext";
import { useDispatch } from "react-redux";

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await register(username, password, role);
      if (!response.ok) {
        setError(response.message);
        throw new Error(response.message);
      }
      dispatch(loginSuccess({ username, role }));
      navigate("/MainInfo");
    } catch (error) {
      if (error instanceof Error) {
        console.error("注册失败:", error.message);
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
      bgcolor: '#f0f8ff',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <Paper sx={{
        p: 4,
        width: 400,
        borderRadius: 2,
        boxShadow: 3,
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
      }}>
        {/* 品牌标识部分 */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Avatar
            alt="智慧海洋牧场 Logo"
            src="/logo192.png"
            className="App-logo"
            sx={{
              width: 80,
              height: 80,
              margin: '0 auto',
              mb: 2,
              boxShadow: 3,
            }}
          />
          <Typography variant="h3" component="h1" gutterBottom sx={{
            fontFamily: "'Pacifico', cursive",
            color: '#1e90ff',
            fontWeight: 'bold',
            textShadow: '2px 2px 5px rgba(0, 0, 0, 0.2)',
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
                    '& fieldset': { borderColor: '#1e90ff' },
                    '&:hover fieldset': { borderColor: '#4682b4' },
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
                    '& fieldset': { borderColor: '#1e90ff' },
                    '&:hover fieldset': { borderColor: '#4682b4' },
                  },
                }}
              />
            </Grid>

           <Grid size={{ xs: 12, md: 6, lg: 12 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#1e90ff' }}>角色</InputLabel>
                <Select
                  value={role}
                  label="角色"
                  onChange={(e) => setRole(e.target.value)}
                  required
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#1e90ff' },
                      '&:hover fieldset': { borderColor: '#4682b4' },
                    },
                  }}
                >
                  <MenuItem value="user">普通用户</MenuItem>
                  <MenuItem value="admin">管理员</MenuItem>
                </Select>
              </FormControl>
            </Grid>

           <Grid size={{ xs: 12, md: 6, lg: 12 }}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: '#1e90ff',
                  '&:hover': {
                    bgcolor: '#4682b4',
                    transform: 'scale(1.05)',
                  },
                  borderRadius: 1,
                  transition: 'transform 0.2s ease',
                }}
              >
                注册
              </Button>
            </Grid>

           <Grid size={{ xs: 12, md: 6, lg: 12 }}>
              <Typography variant="body2" align="center" sx={{ fontSize: '14px', color: '#333' }}>
                已有账号？<Link href="/Login" sx={{ color: '#1e90ff', textDecoration: 'underline' }}>去登录</Link>
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

export default Register;