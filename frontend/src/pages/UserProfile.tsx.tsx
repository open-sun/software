// src/pages/UserProfile.tsx

import React, { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { changepassword } from "../services/usermanagement";

const UserProfile: React.FC = () => {
  // 从 Redux 中获取当前用户名
  const username = useSelector((state: RootState) => state.auth.user?.username);

  // 表单状态
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 提示状态
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError(true);
      setMessage("新密码与确认密码不一致");
      return;
    }

    try {
      const res = await changepassword(username || "", oldPassword, newPassword);
      if (res.ok) {
        setError(false);
        setMessage("密码修改成功");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(true);
        setMessage(res.message || "修改失败");
      }
    } catch (e) {
      setError(true);
      setMessage("服务器错误");
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 5 }}>
      <Typography variant="h6" gutterBottom>
        个人中心
      </Typography>

      <TextField
        label="用户名"
        value={username || ""}
        fullWidth
        margin="normal"
        InputProps={{ readOnly: true }}
      />

      <TextField
        label="旧密码"
        type="password"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        fullWidth
        margin="normal"
      />

      <TextField
        label="新密码"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        fullWidth
        margin="normal"
      />

      <TextField
        label="确认新密码"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        fullWidth
        margin="normal"
      />

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleChangePassword}

        disabled={!username || !oldPassword || !newPassword || !confirmPassword}
      >
        修改密码
      </Button>

      {message && (
        <Alert severity={error ? "error" : "success"} sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}
    </Box>
  );
};

export default UserProfile;
