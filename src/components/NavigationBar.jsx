// src/components/NavigationBar.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './NavigationBar.css';

const NavigationBar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🚀 English Trainer</Link>
      </div>
      <div className="navbar-menu">
        {user ? (
          <div className="navbar-user">
            {user.picture && <img src={user.picture} alt="Profile" className="navbar-profile-pic" />}
            <span className="navbar-username">{user.name}</span>
            <button onClick={logout} className="navbar-button logout-button">Logout</button>
          </div>
        ) : (
          <Link to="/login" className="navbar-button login-button">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;