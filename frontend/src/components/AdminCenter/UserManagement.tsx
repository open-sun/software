import React, { useEffect, useState } from "react";
import {
  Typography, Box, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, FormControl,
  InputLabel, Select, MenuItem, IconButton, TextField, Button, Stack
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { getusers, updateuserrole, deleteuser} from "../../services/usermanagement";
import {register} from "../../services/login-register"

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
      setUsers(users.map(user =>
        user.id === userid ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleDeleteUser = async (userid: number) => {
    try {
      await deleteuser(userid);
      setUsers(users.filter(user => user.id !== userid));
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
        fetchUsers(); // 刷新用户列表
      } else {
        alert(res.message || "添加用户失败");
      }
    } catch (error) {
      console.error("添加用户失败:", error);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>添加新用户</Typography>
      <Stack spacing={2} direction="row" alignItems="center" sx={{ mb: 3 }}>
        <TextField
          label="用户名"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          size="small"
        />
        <TextField
          label="密码"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          size="small"
        />
        <FormControl size="small">
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
        <Button variant="contained" onClick={handleAddUser}>添加用户</Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>用户ID</TableCell>
              <TableCell>用户名</TableCell>
              <TableCell align="right">当前角色</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell align="right">{user.role}</TableCell>
                <TableCell align="right">
                  <FormControl size="small">
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
                  >
                    <DeleteIcon />
                  </IconButton>
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
