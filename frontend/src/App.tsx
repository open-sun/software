import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from './components/AuthContext'; // 导入 loginSuccess
import Home from './pages/Home'
import Header from './components/Layouts/Header'
import Login from './pages/Login'
import Register from './pages/Register'
import MainInfo from './pages/MainInfo'
import AdminCenter from './pages/AdminCenter';
import WaterDataViewer from './pages/WaterDataViewer';
import MapTest from './pages/MapTest';
import UnderwaterSystem from './pages/UnderwaterSystem';
import DataCenter from './pages/DataCenter';
import NewDataCenter from './pages/NewDataCenter';
import WaterQuality from './pages/WaterQuality';
import LineArea from './pages/LineArea';
import Dashboard from './pages/DashBoard';
import Layout from './components/Layouts/Layout';
import SmartCenter from './pages/SmartCenter';

// 新增简单布局（仅包含 Header）
const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    <main>{children}</main>
  </>
);

const App: React.FC = () => {
  const dispatch = useDispatch();

  // 应用初始化时检测 localStorage，实现持久化登录
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user && user.username && user.role) {
          dispatch(loginSuccess(user));
        }
      } catch (e) {
        // 解析失败则清除
        localStorage.removeItem('user');
      }
    }
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* 使用 AuthLayout 的页面 */}
        <Route path="/Login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/Register" element={<AuthLayout><Register /></AuthLayout>} />

        {/* 使用完整 Layout 的页面 */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/MainInfo" element={<Layout><MainInfo /></Layout>} />
        <Route path="/Underwater" element={<Layout><UnderwaterSystem /></Layout>} />
        <Route path="/DataCenter" element={<Layout><NewDataCenter /></Layout>} />
        <Route path="/OldDataCenter" element={<Layout><DataCenter /></Layout>} />
        <Route path="/WaterDataViewer" element={<Layout><WaterDataViewer /></Layout>} />
        <Route path="/MapTest" element={<Layout><MapTest /></Layout>} />
        <Route path="/AdminCenter" element={<Layout><AdminCenter /></Layout>} />
        <Route path="/Dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/SmartCenter" element={<Layout><SmartCenter /></Layout>} />
        <Route path="/WaterQuality" element={<Layout><WaterQuality /></Layout>} />
        <Route path="/LineArea" element={<Layout><LineArea /></Layout>} />
      </Routes>
    </Router>
  );
};

export default App;