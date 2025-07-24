// src/components/LevelGuidePage.jsx

import React, { useState } from 'react';
import './LevelGuidePage.css';
import { levelData } from '../data/levelData'; // [수정] 외부에서 데이터 임포트

const LevelGuidePage = () => {
  // [핵심 수정] 첫 번째 활성화 탭을 'elementary'로 변경
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
            {level.title}
          </button>
        ))}
      </div>

      {currentLevelData && (
        <div className="level-content-card">
          <h2 className="level-summary">{currentLevelData.summary}</h2>
          <p className="level-description">{currentLevelData.description}</p>

          <div className="recommendations-section">
            <h3>이런 분들께 추천해요!</h3>
            <ul className="recommendations-list">
              {currentLevelData.recommendations.map((rec, index) => (
                <li key={index}>✅ {rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelGuidePage;