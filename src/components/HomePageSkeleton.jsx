// src/components/HomePageSkeleton.jsx

import React from 'react';
import './HomePageSkeleton.css';

const SkeletonCard = () => (
    <div className="home-card skeleton-card">
        <div className="skeleton skeleton-icon"></div>
        <div className="skeleton skeleton-card-h2"></div>
        <div className="skeleton skeleton-card-p"></div>
        <div className="skeleton skeleton-card-p-short"></div>
    </div>
);

const HomePageSkeleton = () => {
  return (
    <div className="home-page skeleton-page">
      <div className="page-title">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-subtitle"></div>
      </div>
      
      <main className="home-main">
        {/* [수정] 카드 스켈레톤을 2개 렌더링합니다. */}
        <div className="card-container">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </main>
    </div>
  );
};

export default HomePageSkeleton;