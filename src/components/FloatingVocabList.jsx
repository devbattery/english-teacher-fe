import React, { useState, useMemo } from 'react';
import './FloatingVocabList.css';

const FloatingVocabList = ({ words, isVisible, onClose, onDelete }) => {
  // 1. 검색어를 저장하기 위한 state
  const [searchTerm, setSearchTerm] = useState('');

  // 2. 검색어에 따라 필터링된 단어 목록을 계산
  // useMemo를 사용하여 words나 searchTerm이 변경될 때만 재계산
  const filteredWords = useMemo(() => {
    // 검색어가 없으면 모든 단어를 반환
    if (!searchTerm.trim()) {
      return words;
    }

    const lowercasedTerm = searchTerm.toLowerCase();

    // 영어 표현 또는 한국어 뜻에 검색어가 포함된 경우만 필터링
    return words.filter(word =>
      word.englishExpression.toLowerCase().includes(lowercasedTerm) ||
      word.koreanMeaning.toLowerCase().includes(lowercasedTerm)
    );
  }, [words, searchTerm]);


  if (!isVisible) {
    return null;
  }

  return (
    <div className="floating-vocab-list">
      <div className="vocab-header">
        <h3>My Vocabulary 📝</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      {/* 3. 검색 입력 필드 추가 */}
      <div className="vocab-search-wrapper">
        <input
          type="text"
          placeholder="Search my words..."
          className="vocab-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search Vocabulary"
        />
      </div>

      <div className="vocab-content">
        {/* 4. 기존 words 배열 대신 필터링된 filteredWords 배열을 렌더링 */}
        {filteredWords.length > 0 ? (
          <ul>
            {filteredWords.map(word => (
              <li key={word.id}>
                <span className="expression">{word.englishExpression}</span>
                <span className="meaning">{word.koreanMeaning}</span>
                <button 
                  onClick={() => onDelete(word.id)} 
                  className="delete-btn"
                  aria-label={`Delete ${word.englishExpression}`}
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-message">
            {/* 검색 결과가 없을 때와 아예 단어가 없을 때 다른 메시지 표시 */}
            {words.length > 0 ? `No results for "${searchTerm}"` : '저장된 단어가 없습니다. 본문에서 단어를 드래그하여 추가해보세요!'}
          </p>
        )}
      </div>
    </div>
  );
};

export default FloatingVocabList;