// src/components/HomePageSkeleton.jsx

import React from 'react';
import './HomePageSkeleton.css';

const HomePageSkeleton = () => {
  return (
    <div className="home-page skeleton-page">
      <div className="page-title">
        {/* 제목과 부제목에 대한 스켈레톤 */}
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-subtitle"></div>
      </div>
      
      <main className="home-main">
        <div className="card-container">
          {/* 카드에 대한 스켈레톤 */}
          <div className="home-card skeleton-card">
            <div className="skeleton skeleton-icon"></div>
            <div className="skeleton skeleton-card-h2"></div>
            <div className="skeleton skeleton-card-p"></div>
            <div className="skeleton skeleton-card-p-short"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePageSkeleton;