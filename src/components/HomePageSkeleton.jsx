// src/components/HomePageSkeleton.jsx

import React from 'react';
import CustomLoader from './CustomLoader';
import './HomePageSkeleton.css';

const SkeletonCard = ({ withLoader = false }) => (
    <div className="home-card skeleton-card">
        {withLoader && <div className="loader-wrapper"><CustomLoader /></div>}
        <div className="skeleton skeleton-icon"></div>
        <div className="skeleton skeleton-card-h2"></div>
        
        <div className="skeleton-description-wrapper">
          <div className="skeleton skeleton-tagline"></div>
          <div className="skeleton skeleton-feature-item"></div>
          <div className="skeleton skeleton-feature-item short"></div>
          <div className="skeleton skeleton-feature-item"></div>
        </div>
        
        <div className="skeleton-level-button-container">
          <div className="skeleton skeleton-level-button"></div>
          <div className="skeleton skeleton-level-button"></div>
          <div className="skeleton skeleton-level-button"></div>
          <div className="skeleton skeleton-level-button"></div>
        </div>
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
        <div className="card-container">
          <SkeletonCard />
          <SkeletonCard withLoader={true} />
        </div>
      </main>
    </div>
  );
};

export default HomePageSkeleton;