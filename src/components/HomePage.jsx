// src/components/HomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // useAuth 훅을 가져옵니다.
import './HomePage.css';

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

const HomePage = () => {
  // useAuth를 통해 user 객체를 가져옵니다. 로그인하지 않았다면 user는 null입니다.
  const { user } = useAuth();

  return (
    <div className="home-page">
      <div className="page-title">
        <h1>Learn English, Effectively.</h1>
        <p>영어 수준에 따라 원하는 AI 선생님을 선택할 수 있습니다. ✅</p>
      </div>
      
      <main className="home-main">
        <div className="card-container">
          
          {/* 
            이 Link는 두 가지 경우 모두에 대해 올바르게 작동합니다.
            1. 로그인 사용자: /chat으로 이동 -> ProtectedRoute 통과 -> ChatPage 표시
            2. 로그아웃 사용자: /chat으로 이동 -> ProtectedRoute가 /login으로 리디렉션
          */}
          <Link to="/chat" className="home-card primary-card">
            <div className="card-icon">
              <ChatIcon />
            </div>
            
            {/* 로그인 상태에 따라 카드 내부의 텍스트를 다르게 렌더링합니다. */}
            <h2>{user ? 'Start Learning' : 'Login to Learn'}</h2>
            <p>
             <b>[초급 / 중급 / 고급 / 전문가]</b> 수준의 AI 선생님을 선택할 수 있습니다.
            </p>
          </Link>
          
        </div>
      </main>
    </div>
  );
};

export default HomePage;