// src/components/LevelGuidePage.jsx

import React, { useState } from 'react';
import './LevelGuidePage.css';
import { levelData } from '../data/levelData';

const LevelGuidePage = () => {
  const [activeLevel, setActiveLevel] = useState('elementary');

  const currentLevelData = levelData.find(level => level.id === activeLevel);

  return (
    <div className="level-guide-page">
      <div className="level-guide-header">
        <h1>레벨 가이드</h1>
        <p>자신에게 맞는 AI 선생님을 선택하여 학습 효율을 높여보세요!</p>
      </div>

      <div className="level-tabs">
        {levelData.map(level => (
          <button
            key={level.id}
            className={`tab-btn ${activeLevel === level.id ? 'active' : ''}`}
            onClick={() => setActiveLevel(level.id)}
          >
            {/* [수정] level.title -> level.name */}
            {level.name}
          </button>
        ))}
      </div>

      {currentLevelData && (
        <div className="level-content-card">
          {/* [수정] levelData에 추가한 summary, description 필드 사용 */}
          <h2 className="level-summary">{currentLevelData.summary}</h2>
          <p className="level-description">{currentLevelData.description}</p>

          <div className="recommendations-section">
            <h3>이런 분들께 추천해요!</h3>
            <ul className="recommendations-list">
              {/* [핵심 수정] rec 객체 전체가 아닌, rec.label을 렌더링 */}
              {currentLevelData.recommendations.map((rec, index) => (
                <li key={index}>✅ {rec.label}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelGuidePage;