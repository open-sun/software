// store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './components/AuthContext'; // 你的认证状态切片

export const store = configureStore({
  reducer: {
    auth: authReducer // 注册你的reducer
  }
});

// 导出类型（TypeScript必需）
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;