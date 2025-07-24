// src/components/NavigationBar.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './NavigationBar.css';
import CustomLoader from './CustomLoader';
import logo from '../assets/icon.png';

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const NavigationBar = () => {
  // openLoginModal 함수를 context에서 가져옵니다.
  const { user, logout, loading, userLoading, accessToken, logoutLoading, openLoginModal } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
  
  const isLoading = loading || userLoading || (accessToken && !user);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <img src={logo} alt="English Teacher Logo" className="navbar-logo" />
        </Link>
      </div>
      <div className="navbar-menu">
        <button onClick={toggleTheme} className="theme-toggle-button">
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        {isLoading ? (
          <div className="navbar-user-skeleton">
            <div className="skeleton skeleton-profile-pic"></div>
            <div className="skeleton skeleton-username"></div>
          </div>
        ) : user ? (
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
                      <li className="dropdown-menu-item" onClick={() => {
                          setIsDropdownOpen(false); // 드롭다운 닫기
                          logout();
                        }}>
                        <button className="navbar-button logout-button">
                          로그아웃
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          // <Link> 대신 <button>을 사용하고 onClick으로 모달을 엽니다.
          <button onClick={openLoginModal} className="navbar-button login-button">
            로그인
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;