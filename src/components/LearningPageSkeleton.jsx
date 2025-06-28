// src/components/LearningPageSkeleton.jsx
import React from "react";
import "./HomePageSkeleton.css"; // 기존 스켈레톤 CSS 재활용

const LearningPageSkeleton = () => {
  return (
    <div className="learning-article-skeleton">
      <div className="skeleton skeleton-article-title"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text-short"></div>
      <br />
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text-medium"></div>
    </div>
  );
};

export default LearningPageSkeleton;
