import { useAuth0 } from "@auth0/auth0-react";
import './App.css';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import IncomeManagement from './components/IncomeManagement';
import ExpenseManagement from './components/ExpenseManagement';
import Dashboard from './components/Dashboard';
import ExpenseOverview from './components/ExpenseOverview';
import { registerOrLoginUser } from './services/apiService';

function App() {
  const { user, loginWithRedirect, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [activeNav, setActiveNav] = useState('/dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      loginWithRedirect();
    } else if (isAuthenticated) {
      getRegisterUser(user);
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);

  const getRegisterUser = async (userData) => {
    try {
      const token = await getAccessTokenSilently();
      await registerOrLoginUser({
        auth0Id: userData.sub,
        email: userData.email,
        name: userData.nickname,
      }, token);
    } catch (error) {
      console.error('Error registering user:', error.message);
    }
  };

  const handleNavClick = (path) => {
    setActiveNav(path);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (isLoading) {
    return (
      <div className="loader-container">
        <div className="coin-loader">
          <div className="container">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          <div className="loadingText">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className={`App ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {isAuthenticated ? (
          <>
            <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
              <Header activeNav={activeNav} onNavClick={handleNavClick} toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            </div>

            <div className="main-content">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/income" element={<IncomeManagement />} />
                <Route path="/expenses" element={<ExpenseManagement />} />
                <Route path="/overview" element={<ExpenseOverview />} />
              </Routes>
            </div>
          </>
        ) : (
          <div className="redirect-message">Redirecting to login...</div>
        )}
      </div>
    </Router>
  );
}

export default App;
