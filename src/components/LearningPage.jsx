// src/components/LearningPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import './LearningPage.css';
// 기존 스켈레톤 대신 새로운 로딩 컴포넌트를 임포트합니다.
import CustomLoader from './CustomLoader';

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
  // '생성 중'인지 '단순 로딩 중'인지 구분하기 위한 새로운 상태
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setIsGenerating(false); // 상태 초기화
      setError(null);
      setLearningContent(null);

      // API 요청이 길어질 경우(새 콘텐츠 생성 시) '생성 중' 메시지를 보여주기 위한 타이머
      const timer = setTimeout(() => {
        setIsGenerating(true);
      }, 500); // 0.5초 이상 걸리면 '생성 중'으로 간주

      try {
        const response = await api.get(`/api/learning/today/${level}`);
        clearTimeout(timer); // 응답을 받으면 타이머를 즉시 취소

        // 백엔드에서 받은 응답에서 status와 content를 분리
        const { status, content } = response.data;
        
        // 백엔드에서 'GENERATED_NEW' 상태를 받았다면 isGenerating을 true로 유지
        // 그렇지 않으면(FOUND_EXISTING) false로 설정
        setIsGenerating(status === 'GENERATED_NEW');

        setLearningContent(content);

      } catch (err) {
        clearTimeout(timer); // 에러 발생 시에도 타이머 취소
        console.error("Error fetching learning content:", err);
        setError("콘텐츠를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [level]);

  // isGenerating 상태에 따라 다른 로딩 메시지를 결정
  const loadingMessage = isGenerating 
    ? "오늘의 맞춤 콘텐츠를 만들고 있어요. 잠시만 기다려 주세요... ✍️" 
    : "오늘의 콘텐츠를 불러오는 중입니다... 📡";

  return (
    <div className="learning-page">
      <header className="learning-header">
        <h1>Today's Contents</h1>
        <p>AI 선생님이 매일 제공하는 오늘의 학습 콘텐츠입니다.</p>
      </header>
      
      <div className="page-guide-link-wrapper">
        <Link to="/level-guide" className="page-guide-link">
          내게 맞는 레벨은? 🧐
        </Link>
      </div>

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
        {/* 로딩 중일 때 CustomLoader를 렌더링 */}
        {loading && <CustomLoader message={loadingMessage} />}
        
        {/* 에러 발생 시 에러 메시지를 렌더링 */}
        {error && <div className="error-message">{error}</div>}
        
        {/* 로딩이 아니고, 콘텐츠가 있을 때만 콘텐츠를 렌더링 */}
        {!loading && learningContent && (
          <>
            <article className="learning-article">
              <h2 className="article-title">{learningContent.title}</h2>
              <div className="article-content">
                {learningContent.content.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </div>
            </article>

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