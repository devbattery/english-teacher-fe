import React from 'react';
import './FloatingVocabList.css';

const FloatingVocabList = ({ words, isVisible, onClose, onDelete }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="floating-vocab-list">
      <div className="vocab-header">
        <h3>My Vocabulary 📝</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      <div className="vocab-content">
        {words.length === 0 ? (
          <p className="empty-message">저장된 단어가 없습니다. 본문에서 단어를 드래그하여 추가해보세요!</p>
        ) : (
          <ul>
            {words.map(word => (
              <li key={word.id}>
                <span className="expression">{word.englishExpression}</span>
                <span className="meaning">{word.koreanMeaning}</span>
                <button onClick={() => onDelete(word.id)} className="delete-btn">🗑️</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FloatingVocabList;