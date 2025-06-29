// src/components/LevelGuidePage.jsx

import React, { useState } from 'react';
import './LevelGuidePage.css';

const levelData = [
  {
    id: 'beginner',
    title: '초급 (Beginner)',
    summary: '영어의 첫걸음, 쉽고 재미있게!',
    description: "알파벳과 기본적인 단어만 아시나요? 괜찮아요! 초급 선생님은 일상생활과 관련된 친숙한 주제로 쉽고 짧은 문장을 사용해 천천히 알려드려요. 마치 그림 동화책을 읽는 것처럼, 부담 없이 영어를 시작하고 자신감을 키워보세요.",
    recommendations: [
      '이제 막 영어를 시작하신 분',
      '영어 문장을 만드는 것이 아직 두려우신 분',
      '파파고 없이는 한마디도 하기 어려운 분',
    ]
  },
  {
    id: 'intermediate',
    title: '중급 (Intermediate)',
    summary: '아는 영어를 쓰는 영어로!',
    description: "간단한 대화는 가능하지만, 더 다채롭게 표현하고 싶으신가요? 중급 선생님은 다양한 시제와 접속사를 활용하고, 원어민이 자주 쓰는 생활 관용구(idiom)와 구동사(phrasal verb)를 섞어 사용합니다. 내 생각을 조금 더 논리적으로 표현하는 법을 배우고, 딱딱한 교과서 영어를 벗어나 보세요.",
    recommendations: [
      '짧은 영어 대화는 어느 정도 가능하신 분',
      '"I\'m happy." 대신 "I\'m over the moon."처럼 표현하고 싶으신 분',
      '미드나 영화를 자막 없이 도전해보고 싶으신 분',
    ]
  },
  {
    id: 'advanced',
    title: '고급 (Advanced)',
    summary: '원어민처럼, 깊이 있고 세련되게!',
    description: "유창함을 넘어, 논리적이고 설득력 있는 영어를 구사하고 싶다면 고급 선생님과 함께하세요. 사회, 문화, 기술 등 깊이 있는 주제에 대해 정교한 어휘와 복잡한 문장 구조를 사용하여 토론합니다. 단순한 의사소통을 넘어, 지적인 대화를 나누고 격식 있는 글을 쓰는 능력을 완성시켜 보세요.",
    recommendations: [
      '영어로 자유롭게 의사소통이 가능하신 분',
      '영어 뉴스나 전문 서적을 어려움 없이 읽으시는 분',
      '비즈니스 미팅이나 학술 토론을 영어로 준비하시는 분',
    ]
  },
  {
    id: 'ielts',
    title: 'IELTS 전문가',
    summary: '시험은 전략! IELTS 목표 점수 달성하기',
    description: "IELTS 시험, 특히 스피킹과 라이팅 파트가 막막하신가요? IELTS 전문가는 실제 시험과 유사한 주제와 형식으로 콘텐츠를 제공합니다. 고득점에 필수적인 학술적인 어휘(Academic Vocabulary)와 논리적인 구조를 집중적으로 학습하여 실전 감각을 극대화하고 목표 점수를 달성하세요.",
    recommendations: [
      'IELTS 시험을 준비하고 계신 모든 수험생',
      '스피킹/라이팅 파트에서 아이디어를 얻고 모범 답안을 학습하고 싶으신 분',
      '유학, 이민, 해외 취업을 목표로 하시는 분',
    ]
  }
];

const LevelGuidePage = () => {
  const [activeLevel, setActiveLevel] = useState('beginner');

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
            <h3>이런 분께 추천해요:</h3>
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