import React, { useState, useMemo, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import CustomLoader from './CustomLoader';
import './FloatingVocabList.css';
import FeatureDiscoveryTooltip from './FeatureDiscoveryTooltip';
import { useTheme } from '../context/ThemeContext';

// 확인 창을 위한 별도 컴포넌트
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, word, theme }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="confirmation-overlay" onClick={onClose}>
      <div 
        className="confirmation-dialog" 
        data-theme={theme}
        onClick={(e) => e.stopPropagation()} // 오버레이 클릭 시 닫히지 않도록
      >
        <h4>단어 삭제</h4>
        <p>
          <span className="highlight-word">{word?.englishExpression}</span> 단어를 삭제하시겠습니까?
        </p>
        <div className="dialog-actions">
          <button className="cancel-btn" onClick={onClose}>
            취소
          </button>
          <button className="confirm-delete-btn" onClick={onConfirm}>
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};


const FloatingVocabList = ({ words, isVisible, onClose, onDelete, initialAnchorRect }) => {
  const { theme } = useTheme();

  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  
  // 삭제 확인을 위한 상태. 삭제할 word 객체를 저장합니다.
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
    let initialWidth = 380, initialHeight = 520;
    if (savedDimensions) {
      initialWidth = savedDimensions.width;
      initialHeight = savedDimensions.height;
    }
    setDimensions({ width: initialWidth, height: initialHeight });
    if (savedPosition) {
      setPosition(savedPosition);
    } else if (initialAnchorRect) {
      const margin = 15;
      let newX = initialAnchorRect.left + (initialAnchorRect.width / 2) - (initialWidth / 2);
      let newY = initialAnchorRect.top - initialHeight - margin;
      newX = Math.max(10, Math.min(newX, window.innerWidth - initialWidth - 10));
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

  // 쓰레기통 클릭 시 바로 삭제하는 대신, 확인 창을 띄우도록 변경
  const requestDelete = (word) => {
    if (deletingId) return; // 다른 단어 삭제 중이면 무시
    setWordToDelete(word);
  };

  // 확인 창에서 '삭제' 버튼을 눌렀을 때 실행될 함수
  const handleConfirmDelete = async () => {
    if (!wordToDelete) return;

    setDeletingId(wordToDelete.id);
    setWordToDelete(null); // 확인 창 닫기

    try {
      await onDelete(wordToDelete.id);
    } catch (error) {
      console.error("Failed to delete word:", error);
      alert("단어 삭제에 실패했습니다.");
    } finally {
      // API 호출이 끝나면 로딩 상태 해제
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
      minHeight={400}
      bounds="window"
      className="floating-vocab-list-rnd"
      data-theme={theme}
      cancel=".vocab-search-input, .vocab-content ul, .close-btn, .delete-btn, .feature-discovery-tooltip"
    >
      <div className={`floating-vocab-list-inner ${isMounted ? 'mounted' : ''}`}>
        
        {showTooltip && (
          <FeatureDiscoveryTooltip
            onDismiss={handleTooltipClose}
            title="새로운 단어장"
            content="이 창은 드래그하여 옮기거나, 우측 하단 모서리를 드래그하여 크기를 조절할 수 있습니다."
          />
        )}
        
        <header className="vocab-header" onMouseDown={handleInteraction}>
          <h3>단어장 📝</h3>
          <button onClick={onClose} className="close-btn" aria-label="Close vocabulary list">×</button>
        </header>

        <div className="vocab-search-wrapper">
          <input
            type="text"
            placeholder="Search words..."
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
        
        {/* 확인 창 렌더링 */}
        <ConfirmationDialog 
          isOpen={!!wordToDelete}
          onClose={() => setWordToDelete(null)}
          onConfirm={handleConfirmDelete}
          word={wordToDelete}
          theme={theme}
        />
      </div>
      
      <div className="resize-handle" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 5L5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M13 9L9 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </Rnd>
  );
};

export default FloatingVocabList;