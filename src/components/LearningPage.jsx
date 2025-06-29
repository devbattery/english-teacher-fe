// src/components/LearningPage.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import './LearningPage.css';
import LearningPageSkeleton from './LearningPageSkeleton'; // 스켈레톤 임포트

// ChatPage에서 사용한 teacherLevels 배열을 재활용하거나 새로 정의
const teacherLevels = [
  { id: 'beginner', name: '초급 (Beginner)' },
  { id: 'intermediate', name: '중급 (Intermediate)' },
  { id: 'advanced', name: '고급 (Advanced)' },
  { id: 'ielts', name: 'IELTS 전문가' },
];

const LearningPage = () => {
  const [level, setLevel] = useState(teacherLevels[0].id);
  const [learningContent, setLearningContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      setLearningContent(null); // 레벨 변경 시 기존 콘텐츠 초기화
      try {
        const response = await api.get(`/api/learning/today/${level}`);
        setLearningContent(response.data);
      } catch (err) {
        console.error("Error fetching learning content:", err);
        setError("콘텐츠를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [level]); // level이 변경될 때마다 데이터를 다시 불러옴

  return (
    <div className="learning-page">
      <header className="learning-header">
        <h1>Today's Contents</h1>
        <p>AI 선생님이 매일 제공하는 오늘의 학습 콘텐츠입니다.</p>
      </header>
      
      <nav className="level-selector">
        {teacherLevels.map((teacher) => (
          <button
            key={teacher.id}
            className={`level-btn ${level === teacher.id ? 'active' : ''}`}
            onClick={() => setLevel(teacher.id)}
            disabled={loading}
          >
            {teacher.name}
          </button>
        ))}
      </nav>

      <main className="content-area">
        {loading && <LearningPageSkeleton />}
        {error && <div className="error-message">{error}</div>}
        {learningContent && (
          <>
            {/* 1. 학습 아티클 섹션 */}
            <article className="learning-article">
              <h2 className="article-title">{learningContent.title}</h2>
              <div className="article-content">
                {/* 백엔드에서 받은 텍스트의 줄바꿈(\n)을 <br>로 변환하여 보여줌 */}
                {learningContent.content.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </div>
            </article>

            {/* 2. [신규] 핵심 표현 섹션 */}
            {learningContent.keyExpressions && learningContent.keyExpressions.length > 0 && (
              <section className="key-expressions-section">
                <h3 className="expressions-title">Key Expressions ✨</h3>
                <ul className="expressions-list">
                  {learningContent.keyExpressions.map((item, index) => (
                    <li key={index} className="expression-item">
                      <p className="expression-en">{item.expression}</p>
                      <p className="expression-kr">{item.meaning}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default LearningPage;