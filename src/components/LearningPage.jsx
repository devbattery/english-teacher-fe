import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/api';
import './LearningPage.css';
import CustomLoader from './CustomLoader';
import FloatingVocabList from './FloatingVocabList'; // 단어장 컴포넌트 임포트

const teacherLevels = [
  { id: 'beginner', name: '초급 (Beginner)' },
  { id: 'intermediate', name: '중급 (Intermediate)' },
  { id: 'advanced', name: '고급 (Advanced)' },
  { id: 'ielts', name: 'IELTS 전문가' },
];

const LearningPage = () => {
  const { level: levelParam } = useParams();
  const [level, setLevel] = useState(() => {
    const initialLevel = teacherLevels.find(t => t.id === levelParam);
    return initialLevel ? initialLevel.id : teacherLevels[0].id;
  });
  const [learningContent, setLearningContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // --- 단어장 및 팝오버 기능 추가 ---
  const [popover, setPopover] = useState({ show: false, x: 0, y: 0, text: '' });
  const [vocabulary, setVocabulary] = useState([]);
  const [isVocabVisible, setIsVocabVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const contentRef = useRef(null); // 본문 영역을 참조하기 위한 ref

  // 페이지 로드 시, 사용자의 단어장 데이터 불러오기
  useEffect(() => {
    const fetchVocabulary = async () => {
      try {
        // TODO: 실제 사용자 인증 정보를 바탕으로 API를 호출해야 합니다.
        const response = await api.get('/api/vocabulary');
        setVocabulary(response.data);
      } catch (err) {
        console.error("Error fetching vocabulary:", err);
      }
    };
    fetchVocabulary();
  }, []);

  // 학습 콘텐츠 로딩
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setIsGenerating(false);
      setError(null);
      setLearningContent(null);
      setPopover({ show: false, x: 0, y: 0, text: '' }); // 레벨 변경 시 팝오버 닫기

      const timer = setTimeout(() => {
        setIsGenerating(true);
      }, 500);

      try {
        const response = await api.get(`/api/learning/today/${level}`);
        clearTimeout(timer);
        const { status, content } = response.data;
        setIsGenerating(status === 'GENERATED_NEW');
        setLearningContent(content);
      } catch (err) {
        clearTimeout(timer);
        console.error("Error fetching learning content:", err);
        setError("콘텐츠를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [level]);
  
  // 텍스트 드래그(선택) 완료 시 호출될 함수
  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    // 100자 미만의 유효한 텍스트가 선택되었을 때
    if (selectedText.length > 0 && selectedText.length < 100) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // 본문(contentRef) 안에서 선택된 경우에만 팝오버를 띄움
      if (contentRef.current && contentRef.current.contains(range.startContainer)) {
        setPopover({
          show: true,
          x: rect.left + rect.width / 2, // 선택 영역의 가로 중앙
          y: rect.top + window.scrollY - 45, // 선택 영역보다 45px 위
          text: selectedText,
        });
      }
    } else {
      // 텍스트 선택이 해제되면 팝오버 숨김 (선택 없이 클릭만 한 경우)
       if (!popover.show) { // 불필요한 리렌더링 방지
         setPopover({ ...popover, show: false });
       }
    }
  };

  // 단어 저장 처리 함수
  const handleSaveWord = async () => {
    if (isSaving || !popover.text) return;

    setIsSaving(true);
    try {
      const response = await api.post('/api/vocabulary', { expression: popover.text });
      const newWord = response.data;
      
      if (!vocabulary.some(v => v.id === newWord.id)) {
        setVocabulary(prev => [newWord, ...prev]);
      }
      setIsVocabVisible(true); // 저장 후 단어장 자동 열기
    } catch (err) {
      console.error("Error saving word:", err);
      alert("단어 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
      setPopover({ show: false, x: 0, y: 0, text: '' });
    }
  };
  
  // 단어 삭제 처리 함수
  const handleDeleteWord = async (wordId) => {
    try {
      await api.delete(`/api/vocabulary/${wordId}`);
      setVocabulary(prev => prev.filter(word => word.id !== wordId));
    } catch (err) {
        console.error("Error deleting word:", err);
        alert("단어 삭제에 실패했습니다.");
    }
  };

  // 팝오버 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popover.show && !event.target.closest('.save-popover')) {
        setPopover({ ...popover, show: false });
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [popover]);


  const loadingMessage = isGenerating 
    ? "오늘의 맞춤 콘텐츠를 만들고 있어요. 잠시만 기다려 주세요... ✍️" 
    : "오늘의 콘텐츠를 불러오는 중입니다... 📡";

  return (
    <div className="learning-page" onMouseUp={handleTextSelection}>
      {popover.show && (
        <div 
          className="save-popover" 
          style={{ top: `${popover.y}px`, left: `${popover.x}px` }}
        >
          <button onClick={handleSaveWord} disabled={isSaving}>
            {isSaving ? '저장중...' : '✍️ 내 단어장에 저장'}
          </button>
        </div>
      )}

      {!isVocabVisible && (
        <button className="vocab-toggle-btn" onClick={() => setIsVocabVisible(true)}>
          📖 나의 단어장
        </button>
      )}

      <FloatingVocabList 
        words={vocabulary}
        isVisible={isVocabVisible}
        onClose={() => setIsVocabVisible(false)}
        onDelete={handleDeleteWord}
      />
      
      <header className="learning-header">
        <h1>Today's Contents</h1>
        <p>AI 선생님이 매일 제공하는 오늘의 학습 콘텐츠입니다.</p>
      </header>
      
      <div className="page-guide-link-wrapper">
        <Link to="/level-guide" className="page-guide-link">
          레벨 가이드 보기 👈
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

      <main className={`content-area ${loading ? 'loading' : ''}`}>
        {loading && <CustomLoader message={loadingMessage} />}
        {error && <div className="error-message">{error}</div>}
        
        {!loading && learningContent && (
          <>
            <article className="learning-article" ref={contentRef}>
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