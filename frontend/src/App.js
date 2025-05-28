import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OperationalTimePage from './pages/OperationalTimePage';
import './App.css';

function Header() {
  const location = useLocation();
  return (
    <div className="app-header">
      <div className="app-title">Machine Status</div>
      <nav className="app-nav">
        <Link to="/dashboard" className={`app-link${location.pathname === '/dashboard' ? ' active' : ''}`}>Dashboard</Link>
        <Link to="/operational-time" className={`app-link${location.pathname === '/operational-time' ? ' active' : ''}`}>Operational Time</Link>
      </nav>
    </div>
  );
}

function App() {
  const token = localStorage.getItem('token');
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={token ? <><Header /><DashboardPage /></> : <Navigate to="/login" />} />
        <Route path="/operational-time" element={token ? <><Header /><OperationalTimePage /></> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}
export default App; 