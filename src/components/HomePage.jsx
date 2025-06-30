// src/components/HomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HomePageSkeleton from './HomePageSkeleton';
import './HomePage.css';

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

const BookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
);


const HomePage = () => {
  const { user, accessToken, loading } = useAuth();

  if (loading || (accessToken && !user)) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="home-page">
      <div className="page-title">
        <h1>Learn English, Effectively.</h1>
        <p>이제는 AI 선생님과 함께 효율적으로 공부하세요!</p>
      </div>
      
      <main className="home-main">
        <div className="level-guide-link-wrapper">
          <Link to="/level-guide" className="level-guide-link">
            레벨 가이드 보기 👈
          </Link>
        </div>
        
        <div className="card-container">
          <Link to="/chat" className="home-card primary-card">
            <div className="card-icon">
              <ChatIcon />
            </div>
            <h2>{user ? 'Start Chatting' : 'Chat to Learn'}</h2>
            <p>
             <b>[초급/중급/고급/전문가]</b> 레벨의 AI 선생님과 대화하며 실력을 향상시키세요.
            </p>
          </Link>
          
          <Link to="/learning" className="home-card secondary-card">
            <div className="card-icon">
              <BookIcon />
            </div>
            <h2>Today's Contents</h2>
            <p>
             매일 AI 선생님이 작성해주는 <b>레벨별 맞춤 학습 콘텐츠</b>를 읽어보세요.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HomePage;