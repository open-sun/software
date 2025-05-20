// src/components/admincenter/UserManagement.tsx
import React, { useEffect, useState } from "react";
import {
  Typography, Box, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, FormControl,
  InputLabel, Select, MenuItem
} from "@mui/material";
import { getusers, updateuserrole } from "../../services/usermanagement";

interface User {
  id: number;
  username: string;
  role: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getusers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();
  }, []);

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

  return (
    <Box>
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
