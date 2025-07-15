// src/components/NavigationBar.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './NavigationBar.css';
import CustomLoader from './CustomLoader';
import logo from '../assets/logo.png';

const NavigationBar = () => {
  // [수정] 필요한 모든 상태를 context에서 가져옵니다.
  const { user, logout, loading, userLoading, accessToken, logoutLoading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);
  
  // [핵심 로직] 로딩 상태를 최종적으로 판단합니다.
  // 1. loading: 앱의 초기 인증 상태를 확인하는 중 (가장 먼저)
  // 2. userLoading: 토큰으로 사용자 정보를 가져오는 중
  // 3. accessToken은 있지만 user 객체는 아직 없는 과도기적 상태
  const isLoading = loading || userLoading || (accessToken && !user);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <img src={logo} alt="English Teacher Logo" className="navbar-logo" />
        </Link>
      </div>
      <div className="navbar-menu">
        {isLoading ? (
          // 로딩 상태 UI
          <div className="navbar-user-skeleton">
            <div className="skeleton skeleton-profile-pic"></div>
            <div className="skeleton skeleton-username"></div>
          </div>
        ) : user ? (
          // 로그인 완료 상태 UI
          <div className="navbar-user" ref={dropdownRef}>
            {logoutLoading ? (
              <CustomLoader size="small" />
            ) : (
              <>
                {user.picture && (
                  <img
                    src={user.picture}
                    alt="Profile"
                    className="navbar-profile-pic clickable"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  />
                )}
                {isDropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <img src={user.picture} alt="Profile" className="dropdown-profile-pic" />
                      <span className="dropdown-username">{user.name}</span>
                      <span className="dropdown-email">{user.email}</span>
                    </div>
                    <ul className="dropdown-menu-list">
                      <li className="dropdown-menu-item" onClick={logout}>
                        <button className="navbar-button logout-button full-width">
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          // 비로그인 상태 UI
          <Link to="/login" className="navbar-button login-button">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;