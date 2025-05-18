import { createSlice } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { PayloadAction } from "@reduxjs/toolkit";


interface User {
    username: string;
    role: string;
  }
  
  interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
  }
  
  const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
  };
  
  const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
      // 登录成功 action
      loginSuccess: (state, action: PayloadAction<User>) => {
        state.isAuthenticated = true;
        state.user = action.payload;
      },
      // 登出 action
      logout: (state) => {
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem("token"); // 清除本地存储的 token
        localStorage.removeItem("user");  // 清除本地存储的 user
      },
    },
  });



  // 导出生成的 action creators
export const { loginSuccess, logout } = authSlice.actions;



// 导出 reducer
export default authSlice.reducer;