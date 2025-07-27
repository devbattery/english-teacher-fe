import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import api from '../api/api';
import CustomLoader from './CustomLoader';
import './VocabularyPage.css';

// 페이지 당 불러올 단어 개수
const PAGE_SIZE = 20;

const VocabularyPage = () => {
  // 데이터 및 페이지네이션 상태
  const [vocab, setVocab] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // 검색 관련 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // UI 옵션 상태
  const [hideOption, setHideOption] = useState('none');
  const [sortBy, setSortBy] = useState('memorized');
  
  // 개별 아이템 API 통신 상태
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // --- 무한 스크롤 Intersection Observer 설정 ---
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

  // --- 검색어 디바운싱 useEffect ---
  useEffect(() => {
    const handler = setTimeout(() => {
      if (debouncedSearchTerm !== searchTerm) {
        setDebouncedSearchTerm(searchTerm);
        setPage(0); // 검색어가 바뀌면 첫 페이지부터 다시 로드
        setVocab([]); // 기존 단어 목록 초기화
        setHasNextPage(true); // 다음 페이지가 있을 수 있으므로 리셋
      }
    }, 500); // 500ms 동안 타이핑 없으면 검색

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, debouncedSearchTerm]);

  // --- 데이터 로딩 useEffect ---
  useEffect(() => {
    // 검색어가 변경되어 page가 0으로 리셋된 경우,
    // 또는 page가 1 이상으로 증가한 경우에만 데이터를 불러옴
    if (page === 0 && vocab.length > 0 && debouncedSearchTerm === '') return;

    const fetchVocab = async () => {
      if (page === 0) setLoading(true);
      else setLoadingMore(true);
      
      setError(null);

      try {
        const response = await api.get('/api/vocabulary', {
          params: {
            page: page,
            size: PAGE_SIZE,
            searchTerm: debouncedSearchTerm || null,
          }
        });
        const { content, last } = response.data;
        
        setVocab(prev => (page === 0 ? content : [...prev, ...content]));
        setHasNextPage(!last);

      } catch (err) {
        setError('단어장을 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        if (page === 0) setLoading(false);
        else setLoadingMore(false);
      }
    };

    // 더 불러올 페이지가 있거나, 첫 로딩일 때만 함수 실행
    if (hasNextPage || page === 0) {
        fetchVocab();
    }
  }, [page, debouncedSearchTerm]);


  // --- CRUD 및 UI 옵션 핸들러 ---
  const handleToggleMemorized = async (id) => {
    if (updatingId || deletingId) return;
    setUpdatingId(id);
    const originalVocab = [...vocab];
    setVocab(prev => prev.map(word => 
      word.id === id ? { ...word, isMemorized: !word.isMemorized } : word
    ));
    try {
      await api.patch(`/api/vocabulary/${id}/toggle-memorized`);
    } catch (err) {
      console.error('Failed to update memorized status:', err);
      alert('상태 업데이트에 실패했습니다.');
      setVocab(originalVocab);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (updatingId || deletingId) return;
    if (window.confirm("정말로 이 단어를 삭제하시겠습니까?")) {
      setDeletingId(id);
      setVocab(prev => prev.filter(word => word.id !== id)); // Optimistic delete
      try {
        await api.delete(`/api/vocabulary/${id}`);
      } catch (err) {
        console.error('Failed to delete word:', err);
        alert('단어 삭제에 실패했습니다.');
        setVocab(prev => [...prev, vocab.find(v => v.id === id)].sort((a,b) => b.id - a.id)); // Revert
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleHideToggle = (option) => {
    if (hideOption === option) setHideOption('none');
    else setHideOption(option);
  };

  // --- 정렬 로직 (프론트엔드에서 현재 로드된 데이터만 정렬) ---
  const sortedVocab = useMemo(() => {
    const safeVocab = vocab.map(v => ({
      ...v,
      isMemorized: v.isMemorized || false,
      createdAt: v.createdAt || '1970-01-01T00:00:00Z',
    }));
    return [...safeVocab].sort((a, b) => {
      if (sortBy === 'memorized') {
        if (a.isMemorized !== b.isMemorized) return a.isMemorized ? 1 : -1;
      }
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [vocab, sortBy]);

  if (loading) return <div className="page-loader"><CustomLoader message="단어장을 불러오는 중..." /></div>;
  if (error && vocab.length === 0) return <div className="error-message">{error}</div>;

  return (
    <div className="vocabulary-page">
      <header className="vocab-header">
        <h1>내 단어장</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="영어 또는 한글로 검색..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="vocab-controls">
          <div className="control-group">
            <span className="control-label">정렬:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="memorized">외운단어 뒤로</option>
              <option value="newest">최신순</option>
              <option value="oldest">오래된순</option>
            </select>
          </div>
          <div className="control-group">
            <span className="control-label">가리기:</span>
            <button className={`toggle-btn ${hideOption === 'english' ? 'active' : ''}`} onClick={() => handleHideToggle('english')}>영어</button>
            <button className={`toggle-btn ${hideOption === 'korean' ? 'active' : ''}`} onClick={() => handleHideToggle('korean')}>한글</button>
          </div>
        </div>
      </header>

      {vocab.length > 0 ? (
        <ul className="vocab-list">
          {sortedVocab.map((word, index) => {
            const cardContent = (
              <div className="card-content">
                <label className="checkbox-container">
                  <input type="checkbox" checked={!!word.isMemorized} onChange={() => handleToggleMemorized(word.id)} disabled={updatingId === word.id || deletingId} />
                  <span className="checkmark"></span>
                  {updatingId === word.id && <div className="updating-spinner"></div>}
                </label>
                <div className={`expression ${hideOption === 'english' ? 'hidden' : ''}`}>{word.englishExpression}</div>
                <div className={`meaning ${hideOption === 'korean' ? 'hidden' : ''}`}>{word.koreanMeaning}</div>
                <button className="delete-btn" onClick={() => handleDelete(word.id)} disabled={deletingId === word.id || updatingId} aria-label="Delete word">×</button>
              </div>
            );

            if (sortedVocab.length === index + 1) {
              return <li ref={lastVocabElementRef} key={word.id} className={`vocab-card ${word.isMemorized ? 'memorized' : ''} ${deletingId === word.id ? 'deleting' : ''}`} style={{ animationDelay: `${index % PAGE_SIZE * 30}ms` }}>{cardContent}</li>;
            } else {
              return <li key={word.id} className={`vocab-card ${word.isMemorized ? 'memorized' : ''} ${deletingId === word.id ? 'deleting' : ''}`} style={{ animationDelay: `${index % PAGE_SIZE * 30}ms` }}>{cardContent}</li>;
            }
          })}
        </ul>
      ) : (
        !loading && <div className="empty-vocab">
          <p>{debouncedSearchTerm ? `"${debouncedSearchTerm}"에 대한 검색 결과가 없습니다.` : "저장된 단어가 없습니다."}</p>
          <span>학습 페이지에서 단어를 추가해 보세요!</span>
        </div>
      )}

      {loadingMore && <div className="loading-more-spinner"><CustomLoader size="small" message="불러오는 중..." /></div>}
      {!hasNextPage && vocab.length > 0 && <div className="end-of-list-message">모든 단어를 불러왔습니다.</div>}
    </div>
  );
};

export default VocabularyPage;