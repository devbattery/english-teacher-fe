// src/components/HomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HomePageSkeleton from './HomePageSkeleton';
import './HomePage.css';

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

// [추가] 학습 아이콘
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
        <p>AI 선생님과 채팅하거나, 오늘의 학습 콘텐츠로 실력을 키워보세요. ✅</p>
      </div>
      
      <main className="home-main">
        {/* [수정] 카드 컨테이너에 2개의 카드를 넣습니다. */}
        <div className="card-container">
          <Link to="/chat" className="home-card primary-card">
            <div className="card-icon">
              <ChatIcon />
            </div>
            <h2>{user ? 'Start Chatting' : 'Chat to Learn'}</h2>
            <p>
             <b>[초급/중급/고급/전문가]</b> 수준의 AI 선생님과 대화하며 실력을 향상시키세요.
            </p>
          </Link>
          
          {/* [추가] Start Learning 카드 */}
          <Link to="/learning" className="home-card secondary-card">
            <div className="card-icon">
              <BookIcon />
            </div>
            <h2>Start Learning</h2>
            <p>
             매일 AI 선생님이 작성해주는 <b>수준별 맞춤 학습 콘텐츠</b>를 읽어보세요.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HomePage;