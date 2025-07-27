// src/components/VocabularyPage.jsx (신규 파일)
import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/api';
import CustomLoader from './CustomLoader';
import './VocabularyPage.css';

const VocabularyPage = () => {
  const [vocab, setVocab] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI 상태 관리
  const [viewOptions, setViewOptions] = useState({ hideEnglish: false, hideKorean: false });
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'memorized'
  
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

  const sortedVocab = useMemo(() => {
    return [...vocab].sort((a, b) => {
      if (sortBy === 'memorized') {
        if (a.isMemorized !== b.isMemorized) {
          return a.isMemorized ? 1 : -1;
        }
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      // 'newest' (default)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [vocab, sortBy]);

  if (loading) return <div className="page-loader"><CustomLoader message="단어장을 불러오는 중..." /></div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="vocabulary-page">
      <header className="vocab-header">
        <h1>내 단어장</h1>
        <div className="vocab-controls">
          <div className="control-group">
            <span className="control-label">정렬:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="memorized">외운단어 뒤로</option>
            </select>
          </div>
          <div className="control-group">
            <span className="control-label">가리기:</span>
            <button 
              className={`toggle-btn ${viewOptions.hideEnglish ? 'active' : ''}`}
              onClick={() => setViewOptions(v => ({...v, hideEnglish: !v.hideEnglish}))}>
              영어
            </button>
            <button 
              className={`toggle-btn ${viewOptions.hideKorean ? 'active' : ''}`}
              onClick={() => setViewOptions(v => ({...v, hideKorean: !v.hideKorean}))}>
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
                    checked={word.isMemorized}
                    onChange={() => handleToggleMemorized(word.id)}
                    disabled={updatingId === word.id || deletingId}
                  />
                  <span className="checkmark"></span>
                  {updatingId === word.id && <div className="updating-spinner"></div>}
                </label>
                <div className={`expression ${viewOptions.hideEnglish ? 'hidden' : ''}`}>
                  {word.englishExpression}
                </div>
                <div className={`meaning ${viewOptions.hideKorean ? 'hidden' : ''}`}>
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