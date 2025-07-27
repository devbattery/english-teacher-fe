// src/components/FloatingVocabList.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import CustomLoader from './CustomLoader';
import './FloatingVocabList.css';
import FeatureDiscoveryTooltip from './FeatureDiscoveryTooltip';
import { useTheme } from '../context/ThemeContext';

const ResizeCornerHandle = ({ position }) => (
  <div className={`resize-corner-handle resize-corner-handle--${position}`}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 12C20 16.4183 16.4183 20 12 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  </div>
);

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, word, theme }) => {
  if (!isOpen) return null;
  return (
    <div className="confirmation-overlay" onClick={onClose}>
      <div className="confirmation-dialog" data-theme={theme} onClick={(e) => e.stopPropagation()}>
        <h4>단어 삭제</h4>
        <p><span className="highlight-word">{word?.englishExpression}</span> 단어를 삭제하시겠습니까?</p>
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
  
  const [minHeight, setMinHeight] = useState(390); // 동적 계산을 위한 state, 초기값은 fallback

  // 높이 측정을 위한 ref
  const headerRef = useRef(null);
  const searchRef = useRef(null);
  const itemRef = useRef(null);

  const filteredWords = useMemo(() => {
    if (!searchTerm.trim()) return words;
    const lowercasedTerm = searchTerm.toLowerCase();
    return words.filter(word =>
      (word.englishExpression && word.englishExpression.toLowerCase().includes(lowercasedTerm)) ||
      (word.koreanMeaning && word.koreanMeaning.toLowerCase().includes(lowercasedTerm))
    );
  }, [words, searchTerm]);
  
  // 1. 최소 높이를 계산하는 useEffect
  useEffect(() => {
    if (isVisible && filteredWords.length > 0) {
      const animationFrameId = requestAnimationFrame(() => {
        const header = headerRef.current;
        const search = searchRef.current;
        const item = itemRef.current;

        if (header && search && item) {
          const headerHeight = header.offsetHeight;
          const searchHeight = search.offsetHeight;
          const itemHeight = item.offsetHeight;
          
          const NUM_VISIBLE_ITEMS = 4;
          const CONTENT_PADDING = 16;

          const calculatedMinHeight = headerHeight + searchHeight + (itemHeight * NUM_VISIBLE_ITEMS) + CONTENT_PADDING;
          
          setMinHeight(calculatedMinHeight);
        }
      });
      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [isVisible, filteredWords.length]);

  // 2. localStorage에서 위치/크기를 불러오는 useEffect
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

    let initialWidth, initialHeight;

    if (savedDimensions) {
      initialWidth = savedDimensions.width;
      initialHeight = savedDimensions.height;
    } else {
      initialWidth = minWidth;
      initialHeight = 520; // 임시 초기값
    }
    setDimensions({ width: initialWidth, height: initialHeight });

    if (savedPosition) {
      setPosition(savedPosition);
    } else if (initialAnchorRect) {
      const margin = 15;
      let newX = initialAnchorRect.right - initialWidth;
      let newY = initialAnchorRect.top - initialHeight - margin;
      
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
  
  // 3. 첫 실행 시, 초기 높이를 minHeight로 설정하는 useEffect
  useEffect(() => {
    const hasSavedDimensions = localStorage.getItem('vocabListDimensions');
    if (minHeight > 390 && !hasSavedDimensions) {
      setDimensions(prevDimensions => ({
        ...prevDimensions,
        height: minHeight
      }));
    }
  }, [minHeight]);

  // 4. localStorage에 위치/크기를 저장하는 useEffect
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
      minHeight={minHeight}
      bounds="window"
      className="floating-vocab-list-rnd"
      data-theme={theme}
      cancel=".vocab-search-input, .vocab-content, .close-btn, .delete-btn, .feature-discovery-tooltip, .confirmation-dialog"
      dragHandleClassName="vocab-header"
      resizeHandleComponent={{
        bottomLeft: <ResizeCornerHandle position="bottom-left" />,
        bottomRight: <ResizeCornerHandle position="bottom-right" />,
      }}
    >
      <div className={`floating-vocab-list-inner ${isMounted ? 'mounted' : ''}`}>
        <FeatureDiscoveryTooltip
          isVisible={showTooltip}
          onClose={handleTooltipClose}
          title="모르는 단어 추가하기"
          content="단어장을 움직여 보세요!</br>표시된 모서리를 드래그하여 크기를 조절할 수도 있어요."
          positioning="center"
          arrowDirection="up"
        />
        
        <header className="vocab-header" onMouseDown={handleInteraction} ref={headerRef}>
          <h3>내 단어장 📝</h3>
          <button onClick={onClose} className="close-btn" aria-label="Close vocabulary list">×</button>
        </header>

        <div className="vocab-search-wrapper" ref={searchRef}>
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
              {filteredWords.map((word, index) => (
                <li
                  key={word.id}
                  className={`vocab-item ${deletingId === word.id ? 'is-deleting' : ''}`}
                  ref={index === 0 ? itemRef : null}
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