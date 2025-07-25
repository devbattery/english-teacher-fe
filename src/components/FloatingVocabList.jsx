import React, { useState, useMemo, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import CustomLoader from './CustomLoader';
import FeatureDiscoveryTooltip from './FeatureDiscoveryTooltip';
import './FloatingVocabList.css';

const FloatingVocabList = ({ words, isVisible, onClose, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const [dimensions, setDimensions] = useState({ width: 400, height: 500 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('hasSeenVocabTooltip');
    if (!hasSeenTooltip) {
      setShowTooltip(true);
    }

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

    const animationFrame = requestAnimationFrame(() => {
      setIsMounted(true);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('vocabListDimensions', JSON.stringify(dimensions));
      localStorage.setItem('vocabListPosition', JSON.stringify(position));
    }
  }, [dimensions, position, isMounted]);

  const handleTooltipClose = () => {
    setShowTooltip(false);
    localStorage.setItem('hasSeenVocabTooltip', 'true');
  };

  const handleInteraction = () => {
    if (showTooltip) {
      handleTooltipClose();
    }
  };

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
      onDragStart={handleInteraction}
      onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
      onResizeStart={handleInteraction}
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
      cancel=".vocab-search-input, .vocab-content ul, .close-btn, .delete-btn"
    >
      <div className={`floating-vocab-list-inner ${isMounted ? 'mounted' : ''}`}>
        <FeatureDiscoveryTooltip isVisible={showTooltip} onClose={handleTooltipClose} />
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
      
      {/* [추가된 부분] 리사이즈 핸들 아이콘 */}
      <div className="resize-handle" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 5L5 13" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M13 9L9 13" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </Rnd>
  );
};

export default FloatingVocabList;