// src/components/VocabularyPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/api';
import CustomLoader from './CustomLoader';
import './VocabularyPage.css';

const VocabularyPage = () => {
  const [vocab, setVocab] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // [수정] "가리기" 상태를 단일 문자열로 관리 ('none', 'english', 'korean')
  const [hideOption, setHideOption] = useState('none');

  // [수정] "정렬" 상태의 기본값을 'memorized'로 변경
  const [sortBy, setSortBy] = useState('memorized');
  
  // API 통신 상태 관리
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchVocab = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/vocabulary');
        setVocab(response.data);
      } catch (err) {
        setError('단어장을 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVocab();
  }, []);

  const handleToggleMemorized = async (id) => {
    if (updatingId || deletingId) return;
    
    setUpdatingId(id);
    const originalVocab = [...vocab];
    
    // Optimistic UI Update
    setVocab(prev => prev.map(word => 
      word.id === id ? { ...word, isMemorized: !word.isMemorized } : word
    ));
    
    try {
      await api.patch(`/api/vocabulary/${id}/toggle-memorized`);
    } catch (err) {
      console.error('Failed to update memorized status:', err);
      alert('상태 업데이트에 실패했습니다.');
      setVocab(originalVocab); // Revert on failure
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (updatingId || deletingId) return;

    if (window.confirm("정말로 이 단어를 삭제하시겠습니까?")) {
      setDeletingId(id);
      const originalVocab = [...vocab];

      try {
        await api.delete(`/api/vocabulary/${id}`);
        setVocab(prev => prev.filter(word => word.id !== id));
      } catch (err) {
        console.error('Failed to delete word:', err);
        alert('단어 삭제에 실패했습니다.');
        setVocab(originalVocab);
      } finally {
        setDeletingId(null);
      }
    }
  };

  // [추가] "가리기" 버튼 클릭 핸들러
  const handleHideToggle = (option) => {
    // 이미 선택된 옵션을 다시 클릭하면 선택 해제
    if (hideOption === option) {
      setHideOption('none');
    } else {
      // 새로운 옵션을 선택
      setHideOption(option);
    }
  };

  const sortedVocab = useMemo(() => {
    // isMemorized와 createdAt이 없는 경우를 대비한 안정성 추가
    const safeVocab = vocab.map(v => ({
      ...v,
      isMemorized: v.isMemorized || false,
      createdAt: v.createdAt || '1970-01-01T00:00:00Z',
    }));

    return [...safeVocab].sort((a, b) => {
      if (sortBy === 'memorized') {
        if (a.isMemorized !== b.isMemorized) {
          return a.isMemorized ? 1 : -1;
        }
      }
      // 날짜 정렬은 외운단어 정렬 후 2차 정렬 기준으로 항상 적용
      if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      // 'newest' 또는 'memorized' 선택 시 기본 2차 정렬 기준
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [vocab, sortBy]);

  if (loading) return <div className="page-loader"><CustomLoader message="단어장을 불러오는 중..." /></div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="vocabulary-page">
      <header className="vocab-header">
        <h1>내 단어장 📝</h1>
        <div className="vocab-controls">
          <div className="control-group">
            <span className="control-label">정렬:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="memorized">외운 단어 뒤로</option>
              <option value="newest">최신순</option>
              <option value="oldest">오래된순</option>
            </select>
          </div>
          <div className="control-group">
            <span className="control-label">가리기:</span>
            <button 
              className={`toggle-btn ${hideOption === 'english' ? 'active' : ''}`}
              onClick={() => handleHideToggle('english')}>
              영어
            </button>
            <button 
              className={`toggle-btn ${hideOption === 'korean' ? 'active' : ''}`}
              onClick={() => handleHideToggle('korean')}>
              한글
            </button>
          </div>
        </div>
      </header>

      {sortedVocab.length > 0 ? (
        <ul className="vocab-list">
          {sortedVocab.map((word, index) => (
            <li
              key={word.id}
              className={`
                vocab-card 
                ${word.isMemorized ? 'memorized' : ''}
                ${deletingId === word.id ? 'deleting' : ''}
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="card-content">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={!!word.isMemorized} // undefined 방지를 위해 boolean으로 변환
                    onChange={() => handleToggleMemorized(word.id)}
                    disabled={updatingId === word.id || deletingId}
                  />
                  <span className="checkmark"></span>
                  {updatingId === word.id && <div className="updating-spinner"></div>}
                </label>
                <div className={`expression ${hideOption === 'english' ? 'hidden' : ''}`}>
                  {word.englishExpression}
                </div>
                <div className={`meaning ${hideOption === 'korean' ? 'hidden' : ''}`}>
                  {word.koreanMeaning}
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(word.id)}
                  disabled={deletingId === word.id || updatingId}
                  aria-label="Delete word"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-vocab">
          <p>저장된 단어가 없습니다.</p>
          <span>학습 페이지에서 단어를 드래그하여 추가해보세요!</span>
        </div>
      )}
    </div>
  );
};

export default VocabularyPage;