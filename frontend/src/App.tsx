import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from './pages/Home'
import Header from './components/Header'
import Login from './pages/login'
import Register from './pages/register'
import MainInfo from './pages/maininfo'
import Management from './pages/management';

const App: React.FC = () => {
  return (
    <Router>
        <Header />
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/maininfo" element={<MainInfo />} />
            <Route path="/management" element={<Management />} />
        </Routes>
    </Router>
  );
};

export default App;
