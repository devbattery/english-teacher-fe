// src/components/NavigationBar.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './NavigationBar.css';

// 간단한 로딩 스피너 컴포넌트
const Spinner = () => <div className="spinner"></div>;

const NavigationBar = () => {
  const { user, logout, userLoading } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🚀 English Trainer</Link>
      </div>
      <div className="navbar-menu">
        {/* userLoading 상태를 가장 먼저 체크합니다. */}
        {userLoading ? (
          <div className="navbar-user">
            <Spinner />
            <span className="navbar-username">Loading...</span>
          </div>
        ) : user ? (
          // userLoading이 false이고 user가 존재할 때
          <div className="navbar-user">
            {user.picture && <img src={user.picture} alt="Profile" className="navbar-profile-pic" />}
            <span className="navbar-username">{user.name}</span>
            <button onClick={logout} className="navbar-button logout-button">Logout</button>
          </div>
        ) : (
          // userLoading이 false이고 user가 없을 때
          <Link to="/login" className="navbar-button login-button">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;