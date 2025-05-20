import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from './pages/Home'
import Header from './components/Layouts/Header'
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
import Dashboard from './pages/dashboard';
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
  return (
    <Router>
      <Routes>
        {/* 使用 AuthLayout 的页面 */}
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

        {/* 使用完整 Layout 的页面 */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/maininfo" element={<Layout><MainInfo /></Layout>} />
        <Route path="/underwater" element={<Layout><UnderwaterSystem /></Layout>} />
        <Route path="/datacenter" element={<Layout><Datacenter /></Layout>} />
        <Route path="/WaterDataViewer" element={<Layout><WaterDataViewer /></Layout>} />
        <Route path="/MapTest" element={<Layout><MapTest /></Layout>} />
        <Route path="/management" element={<Layout><Management /></Layout>} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/smartcenter" element={<Layout><SmartCenter /></Layout>} />
      </Routes>
    </Router>
  );
};

export default App;