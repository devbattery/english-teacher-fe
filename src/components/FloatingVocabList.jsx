import React, { useState, useMemo, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import CustomLoader from './CustomLoader';
import './FloatingVocabList.css';

const FloatingVocabList = ({ words, isVisible, onClose, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const [dimensions, setDimensions] = useState({ width: 400, height: 500 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedDimensions = JSON.parse(localStorage.getItem('vocabListDimensions'));
    const savedPosition = JSON.parse(localStorage.getItem('vocabListPosition'));

    let initialWidth = 400;
    let initialHeight = 500;

    if (savedDimensions) {
      initialWidth = savedDimensions.width;
      initialHeight = savedDimensions.height;
      setDimensions({ width: initialWidth, height: initialHeight });
    } else {
      initialWidth = Math.min(window.innerWidth * 0.8, 400);
      setDimensions({ width: initialWidth, height: 500 });
    }

    if (savedPosition) {
      setPosition(savedPosition);
    } else {
      const defaultX = (window.innerWidth - initialWidth) / 2;
      const defaultY = (window.innerHeight - initialHeight) / 2;
      setPosition({ x: defaultX, y: defaultY });
    }

    // Use a timeout to ensure the initial position is set before the animation starts
    const timer = setTimeout(() => setIsMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('vocabListDimensions', JSON.stringify(dimensions));
      localStorage.setItem('vocabListPosition', JSON.stringify(position));
    }
  }, [dimensions, position, isMounted]);

  const filteredWords = useMemo(() => {
    if (!searchTerm.trim()) return words;
    const lowercasedTerm = searchTerm.toLowerCase();
    return words.filter(word =>
      word.englishExpression.toLowerCase().includes(lowercasedTerm) ||
      word.koreanMeaning.toLowerCase().includes(lowercasedTerm)
    );
  }, [words, searchTerm]);

  const handleDelete = async (wordId) => {
    if (deletingId) return;
    setDeletingId(wordId);
    try {
      await onDelete(wordId);
    } catch (error) {
      console.error("Failed to delete word:", error);
      alert("단어 삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Rnd
      size={dimensions}
      position={position}
      onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
      onResizeStop={(e, direction, ref, delta, newPosition) => {
        setDimensions({ 
          width: ref.offsetWidth, 
          height: ref.offsetHeight 
        });
        setPosition(newPosition);
      }}
      minWidth={300}
      minHeight={400}
      bounds="window"
      className="floating-vocab-list-rnd"
      cancel=".vocab-search-wrapper, .vocab-content"
    >
      <div className={`floating-vocab-list-inner ${isMounted ? 'mounted' : ''}`}>
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
    </Rnd>
  );
};

export default FloatingVocabList;