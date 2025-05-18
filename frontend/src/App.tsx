import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from './components/AuthContext'; // 导入 loginSuccess
import Home from './pages/Home'
import Header from './components/Header'
import Login from './pages/login'
import Register from './pages/register'
import MainInfo from './pages/maininfo'
import Management from './pages/management';
import WaterDataViewer from './pages/WaterDataViewer';
import MapTest from './pages/MapTest';
import UnderwaterSystem from './pages/UnderwaterSystem';
import Datacenter from './pages/datacenter';
import WaterQuality from './pages/WaterQuality';
import LineArea from './pages/LineArea';
import Smartcenter from './pages/Smartcenter';

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
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/maininfo" element={<MainInfo />} />
        <Route path="/management" element={<Management />} />
        <Route path="/WaterDataViewer" element={<WaterDataViewer />} />
        <Route path="/MapTest" element={<MapTest />} />
        <Route path="/underwater" element={<UnderwaterSystem />} />
        <Route path="/WaterQuality" element={<WaterQuality />} />
        <Route path="/LineArea" element={<LineArea />} />
        <Route path="/datacenter" element={<Datacenter />} />
        <Route path="/smartcenter" element={<Smartcenter />} />
      </Routes>
    </Router>
  );
};

export default App;