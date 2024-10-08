import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import './Header.css';

const Header = ({ activeNav, onNavClick, toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth0();
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const toggleProfileMenu = () => {
    setProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <div className={`header-container ${isSidebarOpen ? 'open' : 'closed'}`}>
      {/* Sidebar toggle button */}
      <button className="toggle-sidebar" onClick={toggleSidebar}>
        {isSidebarOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff">
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff">
            <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
          </svg>
        )}
      </button>

      {/* Title */}
      <div className="sidebar-title">
        {isSidebarOpen && <h3>Expense Tracker</h3>}
      </div>

      {/* Navbar */}
      <nav className="navbar">
        <ul>
          <li className={activeNav === '/dashboard' ? 'active' : ''}>
            <Link to="/dashboard" onClick={() => onNavClick('/dashboard')}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff">
                <path d="M520-600v-240h320v240H520ZM120-440v-400h320v400H120Zm400 320v-400h320v400H520Zm-400 0v-240h320v240H120Zm80-400h160v-240H200v240Zm400 320h160v-240H600v240Zm0-480h160v-80H600v80ZM200-200h160v-80H200v80Zm160-320Zm240-160Zm0 240ZM360-280Z"/>
              </svg>
              {isSidebarOpen && <span className="text">Dashboard</span>}
            </Link>
          </li>
          <li className={activeNav === '/income' ? 'active' : ''}>
            <Link to="/income" onClick={() => onNavClick('/income')}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff">
                <path d="M880-720v480q0 33-23.5 56.5T800-160H160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720Zm-720 80h640v-80H160v80Zm0 160v240h640v-240H160Zm0 240v-480 480Z"/>
              </svg>
              {isSidebarOpen && <span className="text">Income Management</span>}
            </Link>
          </li>
          <li className={activeNav === '/expenses' ? 'active' : ''}>
            <Link to="/expenses" onClick={() => onNavClick('/expenses')}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff">
                <path d="M200-200v-560 560Zm0 80q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v100h-80v-100H200v560h560v-100h80v100q0 33-23.5 56.5T760-120H200Zm320-160q-33 0-56.5-23.5T440-360v-240q0-33 23.5-56.5T520-680h280q33 0 56.5 23.5T880-600v240q0 33-23.5 56.5T800-280H520Zm280-80v-240H520v240h280Zm-160-60q25 0 42.5-17.5T700-480q0-25-17.5-42.5T640-540q-25 0-42.5 17.5T580-480q0 25 17.5 42.5T640-420Z"/>
              </svg>
              {isSidebarOpen && <span className="text">Expense Management</span>}
            </Link>
          </li>
          <li className={activeNav === '/overview' ? 'active' : ''}>
            <Link to="/overview" onClick={() => onNavClick('/overview')}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff">
                <path d="m787-145 28-28-75-75v-112h-40v128l87 87Zm-587 25q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v268q-19-9-39-15.5t-41-9.5v-243H200v560h242q3 22 9.5 42t15.5 38H200Zm0-120v40-560 243-3 280Zm80-40h163q3-21 9.5-41t14.5-39H280v80Zm0-160h244q32-30 71.5-50t84.5-27v-3H280v80Zm0-160h400v-80H280v80ZM720-40q-83 0-141.5-58.5T520-240q0-83 58.5-141.5T720-440q83 0 141.5 58.5T920-240q0 83-58.5 141.5T720-40Z"/>
              </svg>
              {isSidebarOpen && <span className="text">Expense Overview</span>}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Profile Section */}
      <div className="profile-section">
        <img
          src={user?.picture}
          alt="Profile"
          className="profile-icon"
          onClick={toggleProfileMenu}
        />
        {isProfileMenuOpen && (
          <div className="profile-menu">
            <div className="profile-details">
              <p>{user?.nickname}</p>
            </div>
            <button
              className="logout-button"
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
