import React, { useState, useMemo } from 'react';
import CustomLoader from './CustomLoader'; // 로더 컴포넌트 임포트
import './FloatingVocabList.css';

const FloatingVocabList = ({ words, isVisible, onClose, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // 삭제 중인 단어의 ID를 저장할 state
  const [deletingId, setDeletingId] = useState(null);

  const filteredWords = useMemo(() => {
    if (!searchTerm.trim()) {
      return words;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return words.filter(word =>
      word.englishExpression.toLowerCase().includes(lowercasedTerm) ||
      word.koreanMeaning.toLowerCase().includes(lowercasedTerm)
    );
  }, [words, searchTerm]);

  // 로딩 상태를 제어하는 새로운 삭제 핸들러 함수
  const handleDelete = async (wordId) => {
    // 이미 다른 단어가 삭제 중이면 아무것도 하지 않음
    if (deletingId) return;

    setDeletingId(wordId); // 로딩 시작
    try {
      // 부모 컴포넌트로부터 받은 비동기 삭제 함수를 기다림
      await onDelete(wordId);
    } catch (error) {
      console.error("Failed to delete word:", error);
      alert("단어 삭제에 실패했습니다.");
    } finally {
      // 작업이 끝나면(성공/실패 무관) 로딩 상태 해제
      setDeletingId(null);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="floating-vocab-list">
      <div className="vocab-header">
        <h3>My Vocabulary 📝</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="vocab-search-wrapper">
        <input
          type="text"
          placeholder="영어 혹은 한국어를 입력하세요."
          className="vocab-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search Vocabulary"
        />
      </div>

      <div className="vocab-content">
        {filteredWords.length > 0 ? (
          <ul>
            {filteredWords.map(word => (
              <li 
                key={word.id} 
                className={`vocab-item ${deletingId === word.id ? 'is-deleting' : ''}`}
              >
                {deletingId === word.id ? (
                  <CustomLoader size="small" />
                ) : (
                  <>
                    <span className="expression">{word.englishExpression}</span>
                    <span className="meaning">{word.koreanMeaning}</span>
                    <button
                      onClick={() => handleDelete(word.id)}
                      className="delete-btn"
                      // 다른 항목이 삭제 중일 땐 버튼 비활성화
                      disabled={deletingId !== null}
                      aria-label={`Delete ${word.englishExpression}`}
                    >
                      🗑️
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-message">
            {words.length > 0 ? `No results for "${searchTerm}"` : '저장된 단어가 없습니다. 본문에서 단어를 드래그하여 추가해보세요!'}
          </p>
        )}
      </div>
    </div>
  );
};

export default FloatingVocabList;