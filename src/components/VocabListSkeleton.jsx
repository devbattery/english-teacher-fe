// src/components/VocabListSkeleton.jsx (신규 파일)

import React from 'react';
import './VocabListSkeleton.css';

const SkeletonCard = () => (
  <div className="vocab-card-skeleton">
    <div className="skeleton skeleton-checkbox"></div>
    <div className="skeleton-text-group">
      <div className="skeleton skeleton-line"></div>
      <div className="skeleton skeleton-line-short"></div>
    </div>
  </div>
);

const VocabListSkeleton = ({ count = 5 }) => {
  return (
    <div className="vocab-list-skeleton">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

export default VocabListSkeleton;