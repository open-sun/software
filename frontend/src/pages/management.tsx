import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Link,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getusers, updateuserrole } from "../services/usermanagement";

interface User {
  id: number;
  username: string;
  role: string;
  // 根据你的实际用户数据结构添加其他字段
}

const Management: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  // 获取用户数据
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

  const handleChangeRole = async (userid:number, newRole: string) => {
    try {
      // 调用更新角色接口
      await updateuserrole(userid, newRole);
      // 更新本地状态
      setUsers(users.map(user => 
        user.id === userid ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        用户管理
      </Typography>
      
      <TableContainer component={Paper}>
  <Table sx={{ minWidth: 650 }} aria-label="用户表格">
    <TableHead>
      <TableRow>
        <TableCell>用户ID</TableCell> {/* 新增ID列 */}
        <TableCell>用户名</TableCell>
        <TableCell align="right">当前角色</TableCell>
        <TableCell align="right">操作</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {users.map((user) => (
        <TableRow key={user.id}>
          <TableCell component="th" scope="row">
            {user.id} {/* 显示用户ID */}
          </TableCell>
          <TableCell>{user.username}</TableCell>
          <TableCell align="right">{user.role}</TableCell>
          <TableCell align="right">
            <FormControl variant="outlined" size="small">
              <InputLabel>角色</InputLabel>
              <Select
                value={user.role}
                label="角色"
                onChange={(e) => handleChangeRole(user.id, e.target.value as string)}
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

export default Management;