// src/components/NavigationBar.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './NavigationBar.css';

// 간단한 로딩 스피너 컴포넌트
const Spinner = () => <div className="spinner"></div>;

const NavigationBar = () => {
  const { user, logout, userLoading } = useAuth();
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

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">📘 English Teacher</Link>
      </div>
      <div className="navbar-menu">
        {userLoading ? (
          <div className="navbar-user">
            <Spinner />
            <span className="navbar-username">Loading...</span>
          </div>
        ) : user ? (
          <div className="navbar-user" ref={dropdownRef}>
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
                {/* [핵심 수정] 헤더 구조를 단순화하여 CSS로 제어하기 쉽게 만듭니다. */}
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
          </div>
        ) : (
          <Link to="/login" className="navbar-button login-button">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;