// src/components/HomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // HomePage.css는 그대로 사용합니다.

// 아이콘 SVG 컴포넌트
const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

const HomePage = () => {
  return (
    <div className="home-page">
      {/* [수정] 헤더 부분을 간결하게 변경합니다. 사용자 정보와 로그아웃은 NavigationBar가 담당합니다. */}
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
            <h2>Start Learning</h2>
            <p>[초급 / 중급 / 고급 / 전문가]의 AI 선생님을 선택할 수 있습니다.</p>
          </Link>
          
          {/* [삭제] 로그아웃 카드는 NavigationBar로 이동했으므로 삭제합니다. */}
        </div>
      </main>
    </div>
  );
};

export default HomePage;