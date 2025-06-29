import React, { useEffect, useState } from "react";
import {
  Typography, Box, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, FormControl,
  InputLabel, Select, MenuItem, IconButton, TextField, Button, Stack, useTheme, useMediaQuery
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { getusers, updateuserrole, deleteuser } from "../../services/usermanagement";
import { register } from "../../services/login-register";
import axiosInstance from '../../services/axiosInstance';

interface User {
  id: number;
  username: string;
  role: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [loading, setLoading] = useState(false);  // Add loading state for download
  const [error, setError] = useState<string | null>(null);  // To handle errors

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getusers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleChangeRole = async (userid: number, newRole: string) => {
    try {
      await updateuserrole(userid, newRole);
      setUsers(
        users.map((user) =>
          user.id === userid ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleDeleteUser = async (userid: number) => {
    try {
      await deleteuser(userid);
      setUsers(users.filter((user) => user.id !== userid));
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleAddUser = async () => {
    try {
      const res = await register(newUsername, newPassword, newRole);
      if (res.ok) {
        setNewUsername("");
        setNewPassword("");
        setNewRole("user");
        fetchUsers();
      } else {
        alert(res.message || "添加用户失败");
      }
    } catch (error) {
      console.error("添加用户失败:", error);
    }
  };

  const handleDownloadCSV = async () => {
    setLoading(true);  // Start loading when initiating download
    setError(null);  // Reset any previous errors

    try {
      // 请求获取 CSV 文件，确保 responseType 是 blob
      const response = await axiosInstance.get('/api/exportusers', {
        responseType: 'blob', // 确保响应类型是 blob
      });

      // 检查响应状态
      if (response.status !== 200) {
        throw new Error("下载失败，服务器返回错误");
      }

      // 创建一个临时的 URL 对象
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // 创建一个 <a> 元素并模拟点击下载文件
      const a = document.createElement("a");
      a.href = url;
      a.download = "users.csv";  // 设置下载文件的名称
      document.body.appendChild(a);
      a.click();

      // 清理 URL 对象
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Provide success feedback to user
      alert("CSV 文件下载成功！");

    } catch (error) {
      console.error("下载 CSV 失败:", error);
      setError("下载失败，请重试！");  // Set error message
    } finally {
      setLoading(false);  // Stop loading
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        添加新用户
      </Typography>
      <Stack
        spacing={2}
        direction={isMobile ? "column" : "row"}
        alignItems={isMobile ? "stretch" : "center"}
        sx={{ mb: 3 }}
      >
        <TextField
          label="用户名"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          size="small"
          sx={{ flex: "1 1 150px", minWidth: 150 }}
        />
        <TextField
          label="密码"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          size="small"
          sx={{ flex: "1 1 150px", minWidth: 150 }}
        />
        <FormControl size="small" sx={{ flex: "1 1 150px", minWidth: 150 }}>
          <InputLabel>角色</InputLabel>
          <Select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            label="角色"
          >
            <MenuItem value="user">普通用户</MenuItem>
            <MenuItem value="admin">管理员</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={handleAddUser}
          sx={{ flexShrink: 0, minWidth: 100 }}
        >
          添加用户
        </Button>
      </Stack>

      <Button
        variant="outlined"
        onClick={handleDownloadCSV}
        sx={{ mb: 3 }}
        disabled={loading}  // Disable button during download
      >
        {loading ? '下载中...' : '下载用户列表'}
      </Button>

      {error && <Typography color="error">{error}</Typography>} {/* Show error if exists */}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>用户ID</TableCell>
              <TableCell>用户名</TableCell>
              <TableCell align="right">当前角色</TableCell>
              <TableCell align="right" sx={{ minWidth: isMobile ? 100 : "auto" }}>
                操作
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell align="right">{user.role}</TableCell>
                <TableCell align="right">
                  <Stack
                    direction={isMobile ? "column" : "row"}
                    spacing={isMobile ? 1 : 2}
                    alignItems="center"
                    justifyContent="flex-end"
                  >
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <InputLabel>角色</InputLabel>
                      <Select
                        value={user.role}
                        label="角色"
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                      >
                        <MenuItem value="user">普通用户</MenuItem>
                        <MenuItem value="admin">管理员</MenuItem>
                      </Select>
                    </FormControl>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteUser(user.id)}
                      aria-label="delete"
                      size={isMobile ? "medium" : "small"}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {users.length === 0 && (
        <Typography sx={{ mt: 2 }}>暂无用户数据</Typography>
      )}
    </Box>
  );
};

export default UserManagement;
