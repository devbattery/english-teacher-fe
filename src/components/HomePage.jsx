// src/components/HomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HomePageSkeleton from './HomePageSkeleton'; // [추가] 스켈레톤 컴포넌트 임포트
import './HomePage.css';

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

const HomePage = () => {
  // [수정] user 뿐만 아니라 accessToken과 초기 로딩 상태(loading)도 가져옵니다.
  const { user, accessToken, loading } = useAuth();

  // --- [핵심 수정] 로딩 상태 판단 로직 ---
  // 1. 앱이 처음 초기화되는 중일 때 (AuthContext의 initializeAuth 실행 중)
  // 2. 초기화는 끝났지만, accessToken은 있는데 아직 user 객체를 받아오지 못한 상태일 때
  // 이 두 가지 경우 모두 스켈레톤 UI를 보여줍니다.
  if (loading || (accessToken && !user)) {
    return <HomePageSkeleton />;
  }
  // ------------------------------------

  return (
    <div className="home-page">
      <div className="page-title">
        <h1>Learn English, Effectively.</h1>
        <p>영어 수준에 따라 원하는 AI 선생님을 선택할 수 있습니다. ✅</p>
      </div>
      
      <main className="home-main">
        <div className="card-container">
          <Link to="/chat" className="home-card primary-card">
            <div className="card-icon">
              <ChatIcon />
            </div>
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