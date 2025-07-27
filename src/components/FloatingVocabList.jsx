import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import CustomLoader from './CustomLoader';
import './FloatingVocabList.css';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';
import FeatureDiscoveryTooltip from './FeatureDiscoveryTooltip'; // [복원] 툴팁 컴포넌트 import

const PAGE_SIZE = 15;

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

const FloatingVocabList = ({ isVisible, onClose, initialAnchorRect, onNewWordAdded }) => {
  const { theme } = useTheme();
  
  const [vocab, setVocab] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [deletingId, setDeletingId] = useState(null);
  const [wordToDelete, setWordToDelete] = useState(null);

  const [dimensions, setDimensions] = useState({ width: 380, height: 520 });
  const [position, setPosition] = useState({ x: -9999, y: -9999 });
  const [isMounted, setIsMounted] = useState(false);
  
  // [복원] 툴팁을 위한 상태
  const [showTooltip, setShowTooltip] = useState(false);
  
  const observer = useRef();
  const lastVocabElementRef = useCallback(node => {
    if (loadingMore || loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, loading, hasNextPage]);

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedSearchTerm(searchTerm); }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setPage(0);
    setVocab([]);
    setHasNextPage(true);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (!isVisible || (!hasNextPage && page > 0)) {
      return;
    }
    const fetchVocab = async () => {
      if (page === 0) setLoading(true); else setLoadingMore(true);
      try {
        const response = await api.get('/api/vocabulary', {
          params: { page, size: PAGE_SIZE, searchTerm: debouncedSearchTerm || null }
        });
        const { content, last } = response.data;
        setVocab(prev => (page === 0 ? content : [...prev, ...content]));
        setHasNextPage(!last);
      } catch (err) {
        console.error("Error fetching vocabulary in FloatingList:", err);
      } finally {
        if (page === 0) setLoading(false); else setLoadingMore(false);
      }
    };
    fetchVocab();
  }, [page, debouncedSearchTerm, isVisible]);

  useEffect(() => {
    if (isVisible && !isMounted) { setSearchTerm(''); }
  }, [isVisible, isMounted]);

  useEffect(() => {
    if (onNewWordAdded && isVisible) { setSearchTerm(''); }
  }, [onNewWordAdded, isVisible]);

  // [복원] 툴팁을 띄우는 useEffect
  useEffect(() => {
    if (isVisible && isMounted) {
      const hasSeenTooltip = localStorage.getItem('hasSeenVocabTooltip');
      if (!hasSeenTooltip) {
        const timer = setTimeout(() => setShowTooltip(true), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, isMounted]);

  // [복원] 툴팁 관련 핸들러
  const handleTooltipClose = () => {
    setShowTooltip(false);
    localStorage.setItem('hasSeenVocabTooltip', 'true');
  };

  const handleInteraction = () => {
    if (showTooltip) {
      handleTooltipClose();
    }
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
      await api.delete(`/api/vocabulary/${wordToDelete.id}`);
      setVocab(prev => prev.filter(w => w.id !== wordToDelete.id));
    } catch (error) {
      console.error("Failed to delete word:", error);
      alert("단어 삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (!isVisible) {
      setIsMounted(false);
      return;
    }
    const savedDimensions = JSON.parse(localStorage.getItem('vocabListDimensions'));
    const savedPosition = JSON.parse(localStorage.getItem('vocabListPosition'));
    setDimensions(savedDimensions || { width: 380, height: 520 });
    
    let finalX, finalY;
    const initialWidth = (savedDimensions && savedDimensions.width) || 380;
    const initialHeight = (savedDimensions && savedDimensions.height) || 520;
    
    if (savedPosition) {
      finalX = savedPosition.x; finalY = savedPosition.y;
    } else if (initialAnchorRect) {
      const margin = 20;
      finalX = Math.max(margin, initialAnchorRect.right - initialWidth);
      finalY = Math.max(margin, initialAnchorRect.top - initialHeight - margin);
    } else {
      finalX = (window.innerWidth - initialWidth) / 2;
      finalY = (window.innerHeight - initialHeight) / 2;
    }
    setPosition({ x: finalX, y: finalY });
    
    const animationFrame = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, initialAnchorRect]);

  if (!isVisible) return null;
  
  return (
    <Rnd
      size={dimensions}
      position={position}
      onDragStart={handleInteraction} // [복원] 핸들러 연결
      onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
      onResizeStart={handleInteraction} // [복원] 핸들러 연결
      onResizeStop={(e, direction, ref, delta, newPosition) => {
        setDimensions({ width: ref.offsetWidth, height: ref.offsetHeight });
        setPosition(newPosition);
      }}
      minWidth={320} minHeight={390} bounds="window" className="floating-vocab-list-rnd" data-theme={theme}
      cancel=".vocab-search-input, .vocab-content, .close-btn, .delete-btn, .confirmation-dialog"
      dragHandleClassName="vocab-header"
      resizeHandleComponent={{ bottomLeft: <ResizeCornerHandle position="bottom-left" />, bottomRight: <ResizeCornerHandle position="bottom-right" />, }} >
      <div className={`floating-vocab-list-inner ${isMounted ? 'mounted' : ''}`}>
        <FeatureDiscoveryTooltip
          isVisible={showTooltip}
          onClose={handleTooltipClose}
          title="단어장 사용법"
          content="단어장을 드래그하여 움직이거나,<br/>모서리를 당겨 크기를 조절할 수 있어요."
          positioning="center"
          arrowDirection="up"
        />

        <header className="vocab-header" onMouseDown={handleInteraction}> {/* [복원] 핸들러 연결 */}
          <h3>Mini 내 단어장 📝</h3>
          <button onClick={onClose} className="close-btn" aria-label="Close vocabulary list">×</button>
        </header>
        <div className="vocab-search-wrapper">
          <input type="text" placeholder="찾고자 하는 단어를 입력하세요." className="vocab-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <main className="vocab-content">
          {loading ? (
            <div className="loader-container"><CustomLoader /></div>
          ) : vocab.length > 0 ? (
            <ul>
              {vocab.map((word, index) => (
                <li key={word.id} ref={vocab.length === index + 1 ? lastVocabElementRef : null} className={`vocab-item ${deletingId === word.id ? 'is-deleting' : ''}`}>
                  {deletingId === word.id ? <div className="loader-container"><CustomLoader size="small" /></div> : (
                    <>
                      <div className="word-details">
                        <span className="expression">{word.englishExpression}</span>
                        <span className="meaning">{word.koreanMeaning}</span>
                      </div>
                      <button onClick={() => requestDelete(word)} className="delete-btn" disabled={!!deletingId}>🗑️</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-message"><p>{debouncedSearchTerm ? `"${debouncedSearchTerm}"에 대한 검색 결과가 없습니다.` : '저장된 단어가 없습니다.'}</p></div>
          )}
          {loadingMore && <div className="loader-container"><CustomLoader size="small" message="더 보기..."/></div>}
        </main>
        <ConfirmationDialog isOpen={!!wordToDelete} onClose={() => setWordToDelete(null)} onConfirm={handleConfirmDelete} word={wordToDelete} theme={theme} />
      </div>
    </Rnd>
  );
};

export default FloatingVocabList;