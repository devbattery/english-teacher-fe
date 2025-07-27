import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import api from '../api/api';
import CustomLoader from './CustomLoader';
import VocabListSkeleton from './VocabListSkeleton'; // 스켈레톤 컴포넌트 import
import './VocabularyPage.css';

const PAGE_SIZE = 20;

const VocabularyPage = () => {
  const [vocab, setVocab] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(true); // 초기 로딩 및 검색 시 스켈레톤 UI를 위한 상태
  const [loadingMore, setLoadingMore] = useState(false); // 무한 스크롤 로딩을 위한 상태
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [hideOption, setHideOption] = useState('none');
  const [sortBy, setSortBy] = useState('memorized');
  
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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

  // 검색어 디바운싱
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 검색어가 변경되면 페이지 상태를 리셋
  useEffect(() => {
    setPage(0);
    setVocab([]);
    setHasNextPage(true);
  }, [debouncedSearchTerm]);

  // 데이터 로딩 로직
  useEffect(() => {
    // 다음 페이지가 없으면(첫 페이지 로딩 제외) API 호출 중단
    if (!hasNextPage && page > 0) return;

    const fetchVocab = async () => {
      if (page === 0) setLoading(true); // 초기/검색 로딩 시작
      else setLoadingMore(true); // 추가 로딩 시작
      
      setError(null);

      try {
        const response = await api.get('/api/vocabulary', {
          params: { page, size: PAGE_SIZE, searchTerm: debouncedSearchTerm || null }
        });
        const { content, last } = response.data;
        
        setVocab(prev => (page === 0 ? content : [...prev, ...content]));
        setHasNextPage(!last);
      } catch (err) {
        setError('단어장을 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        if (page === 0) setLoading(false); // 초기/검색 로딩 종료
        else setLoadingMore(false); // 추가 로딩 종료
      }
    };
    
    fetchVocab();
  }, [page, debouncedSearchTerm]);

  // 단어 상태 변경 및 삭제 핸들러 (이전과 동일)
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
      setVocab(prev => prev.filter(word => word.id !== id));
      try {
        await api.delete(`/api/vocabulary/${id}`);
      } catch (err) {
        console.error('Failed to delete word:', err);
        alert('단어 삭제에 실패했습니다.');
        setVocab(prev => [...prev, vocab.find(v => v.id === id)].sort((a,b) => b.id - a.id));
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleHideToggle = (option) => {
    if (hideOption === option) setHideOption('none');
    else setHideOption(option);
  };

  // 정렬 로직 (이전과 동일)
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
  
  // 에러 발생 시 (로딩 중이 아닐 때만) 에러 메시지 표시
  if (error && vocab.length === 0 && !loading) return <div className="error-message">{error}</div>;

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

      {/* [핵심] 스켈레톤 로딩 로직 적용 */}
      {loading ? (
        <VocabListSkeleton count={PAGE_SIZE / 4} /> // 스켈레톤 UI를 5개(20/4) 정도 표시
      ) : vocab.length > 0 ? (
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
                <button className="delete-btn" onClick={() => handleDelete(word.id)} disabled={updatingId === word.id || deletingId} aria-label="Delete word">×</button>
              </div>
            );

            // 마지막 요소에 무한 스크롤을 위한 ref 연결
            if (sortedVocab.length === index + 1) {
              return <li ref={lastVocabElementRef} key={word.id} className={`vocab-card ${word.isMemorized ? 'memorized' : ''} ${deletingId === word.id ? 'deleting' : ''}`} style={{ animationDelay: `${index % PAGE_SIZE * 30}ms` }}>{cardContent}</li>;
            } else {
              return <li key={word.id} className={`vocab-card ${word.isMemorized ? 'memorized' : ''} ${deletingId === word.id ? 'deleting' : ''}`} style={{ animationDelay: `${index % PAGE_SIZE * 30}ms` }}>{cardContent}</li>;
            }
          })}
        </ul>
      ) : (
        <div className="empty-vocab">
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