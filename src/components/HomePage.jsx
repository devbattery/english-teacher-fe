// src/components/HomePage.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css'; // 새로 만들 HomePage.css를 임포트합니다.

// 아이콘 SVG 컴포넌트들
const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
);

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 로그아웃을 navigate와 함께 처리
  const handleLogout = () => {
    logout();
    // AuthContext의 logout 함수가 이미 /login으로 navigate 하므로 추가 동작은 필요 없습니다.
  };

  if (!user) {
    return <div>Loading...</div>; // 유저 정보 로딩 중
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="user-info">
          {user.picture && 
            <img src={user.picture} alt="Profile" className="profile-picture" />
          }
          <h1>Welcome, {user.name || user.email}!</h1>
        </div>
        <p>What would you like to do today?</p>
      </header>
      
      <main className="home-main">
        <div className="card-container">
          
          <Link to="/chat" className="home-card primary-card">
            <div className="card-icon">
              <ChatIcon />
            </div>
            <h2>Start Chatting</h2>
            <p>Practice your English with an AI Tutor.</p>
          </Link>
          
          <div className="home-card logout-card" onClick={handleLogout}>
            <div className="card-icon">
              <LogoutIcon />
            </div>
            <h2>Logout</h2>
            <p>Sign out from your account.</p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default HomePage;