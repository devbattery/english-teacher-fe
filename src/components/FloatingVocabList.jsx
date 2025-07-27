import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import CustomLoader from './CustomLoader';
import './FloatingVocabList.css';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';

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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  
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
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
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
      if (page === 0) setLoading(true);
      else setLoadingMore(true);

      try {
        // [핵심 수정] API 경로를 '/api/vocabulary'로 변경
        const response = await api.get('/api/vocabulary', {
          params: {
            page,
            size: PAGE_SIZE,
            searchTerm: debouncedSearchTerm || null,
          }
        });
        const { content, last } = response.data;
        
        setVocab(prev => (page === 0 ? content : [...prev, ...content]));
        setHasNextPage(!last);
      } catch (err) {
        console.error("Error fetching vocabulary in FloatingList:", err);
      } finally {
        if (page === 0) setLoading(false);
        else setLoadingMore(false);
      }
    };
    
    fetchVocab();
  }, [page, debouncedSearchTerm, isVisible]);

  useEffect(() => {
    if (isVisible && !isMounted) {
      setSearchTerm('');
    }
  }, [isVisible, isMounted]);

  useEffect(() => {
    if (onNewWordAdded && isVisible) {
      setSearchTerm('');
    }
  }, [onNewWordAdded, isVisible]);

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
    setIsMounted(true);
    const savedDimensions = JSON.parse(localStorage.getItem('vocabListDimensions'));
    const savedPosition = JSON.parse(localStorage.getItem('vocabListPosition'));

    setDimensions(savedDimensions || { width: 380, height: 520 });

    if (savedPosition) {
      setPosition(savedPosition);
    } else if (initialAnchorRect) {
      const initialWidth = (savedDimensions && savedDimensions.width) || 380;
      const initialHeight = (savedDimensions && savedDimensions.height) || 520;
      setPosition({
        x: Math.max(10, window.innerWidth - initialWidth - 20),
        y: Math.max(10, window.innerHeight - initialHeight - 20)
      });
    } else {
      setPosition({ x: (window.innerWidth - 380) / 2, y: (window.innerHeight - 520) / 2 });
    }
  }, [isVisible, initialAnchorRect]);

  if (!isVisible) return null;
  
  return (
    <Rnd
      size={dimensions}
      position={position}
      onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
      onResizeStop={(e, direction, ref, delta, newPosition) => {
        setDimensions({ width: ref.offsetWidth, height: ref.offsetHeight });
        setPosition(newPosition);
      }}
      minWidth={320} minHeight={390} bounds="window" className="floating-vocab-list-rnd" data-theme={theme}
      cancel=".vocab-search-input, .vocab-content, .close-btn, .delete-btn, .confirmation-dialog"
      dragHandleClassName="vocab-header"
      resizeHandleComponent={{ bottomLeft: <ResizeCornerHandle position="bottom-left" />, bottomRight: <ResizeCornerHandle position="bottom-right" />, }} >
      <div className={`floating-vocab-list-inner ${isMounted ? 'mounted' : ''}`}>
        <header className="vocab-header">
          <h3>내 단어장 📝</h3>
          <button onClick={onClose} className="close-btn" aria-label="Close vocabulary list">×</button>
        </header>

        <div className="vocab-search-wrapper">
          <input type="text" placeholder="단어 검색..." className="vocab-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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