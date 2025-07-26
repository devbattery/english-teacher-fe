// src/components/FloatingVocabList.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import CustomLoader from './CustomLoader';
import './FloatingVocabList.css';
import FeatureDiscoveryTooltip from './FeatureDiscoveryTooltip';
import { useTheme } from '../context/ThemeContext';

// 우측 하단 모서리 핸들
const CornerResizeHandle = () => (
  <div className="corner-resize-handle">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 5L5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M13 9L9 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  </div>
);

// 하단 전체 핸들
const BottomResizeHandle = () => <div className="bottom-resize-handle"></div>;

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, word, theme }) => {
  if (!isOpen) return null;
  return (
    <div className="confirmation-overlay" onClick={onClose}>
      <div className="confirmation-dialog" data-theme={theme} onClick={(e) => e.stopPropagation()}>
        <h4>단어 삭제</h4>
        <p>정말로 '<span className="highlight-word">{word?.englishExpression}</span>' 단어를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
        <div className="dialog-actions">
          <button className="cancel-btn" onClick={onClose}>취소</button>
          <button className="confirm-delete-btn" onClick={onConfirm}>삭제</button>
        </div>
      </div>
    </div>
  );
};

const FloatingVocabList = ({ words, isVisible, onClose, onDelete, initialAnchorRect }) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [wordToDelete, setWordToDelete] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 380, height: 520 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  useEffect(() => {
    if (!isVisible) {
      setIsMounted(false);
      return;
    }
    const hasSeenTooltip = localStorage.getItem('hasSeenVocabTooltip');
    if (!hasSeenTooltip) setShowTooltip(true);

    const savedDimensions = JSON.parse(localStorage.getItem('vocabListDimensions'));
    const savedPosition = JSON.parse(localStorage.getItem('vocabListPosition'));

    const minWidth = 320;
    const minHeight = 390;

    let initialWidth, initialHeight;

    if (savedDimensions) {
      initialWidth = savedDimensions.width;
      initialHeight = savedDimensions.height;
    } else {
      initialWidth = minWidth;
      initialHeight = minHeight;
    }
    setDimensions({ width: initialWidth, height: initialHeight });

    if (savedPosition) {
      setPosition(savedPosition);
    } else if (initialAnchorRect) {
      const margin = 15;
      // [핵심 수정] 단어장 오른쪽 끝을 버튼 오른쪽 끝에 맞추도록 변경
      let newX = initialAnchorRect.right - initialWidth;
      let newY = initialAnchorRect.top - initialHeight - margin;
      
      // 화면 왼쪽 경계를 벗어나지 않도록 보정
      newX = Math.max(10, newX);
      newY = Math.max(10, newY);
      setPosition({ x: newX, y: newY });
    } else {
      const defaultX = (window.innerWidth - initialWidth) / 2;
      const defaultY = (window.innerHeight - initialHeight) / 2;
      setPosition({ x: defaultX, y: defaultY });
    }

    const animationFrame = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, initialAnchorRect]);
  
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
    if (showTooltip) handleTooltipClose();
  };

  const filteredWords = useMemo(() => {
    if (!searchTerm.trim()) return words;
    const lowercasedTerm = searchTerm.toLowerCase();
    return words.filter(word =>
      (word.englishExpression && word.englishExpression.toLowerCase().includes(lowercasedTerm)) ||
      (word.koreanMeaning && word.koreanMeaning.toLowerCase().includes(lowercasedTerm))
    );
  }, [words, searchTerm]);

  const requestDelete = (word) => {
    if (deletingId) return;
    setWordToDelete(word);
  };

  const handleConfirmDelete = async () => {
    if (!wordToDelete) return;
    setDeletingId(wordToDelete.id);
    setWordToDelete(null); 

    try {
      await onDelete(wordToDelete.id);
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
        setDimensions({ width: ref.offsetWidth, height: ref.offsetHeight });
        setPosition(newPosition);
      }}
      minWidth={320}
      minHeight={390}
      bounds="window"
      className="floating-vocab-list-rnd"
      data-theme={theme}
      cancel=".vocab-search-input, .vocab-content, .close-btn, .delete-btn, .feature-discovery-tooltip, .confirmation-dialog"
      dragHandleClassName="vocab-header"
      resizeHandleComponent={{
        bottom: <BottomResizeHandle />,
        bottomRight: <CornerResizeHandle />,
      }}
    >
      <div className={`floating-vocab-list-inner ${isMounted ? 'mounted' : ''}`}>
        <FeatureDiscoveryTooltip
          isVisible={showTooltip}
          onClose={handleTooltipClose}
          title="모르는 단어 추가하기"
          content="이 창은 헤더를 드래그하여 옮기거나,<br />테두리나 모서리를 드래그하여 크기를 조절할 수 있습니다."
          positioning="center"
          arrowDirection="up"
        />
        
        <header className="vocab-header" onMouseDown={handleInteraction}>
          <h3>내 단어장 📝</h3>
          <button onClick={onClose} className="close-btn" aria-label="Close vocabulary list">×</button>
        </header>

        <div className="vocab-search-wrapper">
          <input
            type="text"
            placeholder="찾고자 하는 단어를 입력하세요."
            className="vocab-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search Vocabulary"
          />
        </div>

        <main className="vocab-content">
          {filteredWords.length > 0 ? (
            <ul>
              {filteredWords.map(word => (
                <li
                  key={word.id}
                  className={`vocab-item ${deletingId === word.id ? 'is-deleting' : ''}`}
                >
                  {deletingId === word.id ? (
                    <div className="loader-container">
                      <CustomLoader size="small" />
                    </div>
                  ) : (
                    <>
                      <div className="word-details">
                        <span className="expression">{word.englishExpression}</span>
                        <span className="meaning">{word.koreanMeaning}</span>
                      </div>
                      <button
                        onClick={() => requestDelete(word)}
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
             <div className="empty-message">
              <p>{words.length > 0 ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : '저장된 단어가 없습니다.'}</p>
              <span>본문에서 단어를 선택하여 추가해 보세요!</span>
            </div>
          )}
        </main>
        
        <ConfirmationDialog 
          isOpen={!!wordToDelete}
          onClose={() => setWordToDelete(null)}
          onConfirm={handleConfirmDelete}
          word={wordToDelete}
          theme={theme}
        />
      </div>
    </Rnd>
  );
};

export default FloatingVocabList;