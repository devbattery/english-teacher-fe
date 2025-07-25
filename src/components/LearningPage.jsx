import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link, useParams } from "react-router-dom";
import api from "../api/api";
import "./LearningPage.css";
import CustomLoader from "./CustomLoader";
import FloatingVocabList from "./FloatingVocabList";
import useWindowWidth from "../hooks/useWindowWidth";
import FeatureDiscoveryTooltip from "./FeatureDiscoveryTooltip";
import { levelData } from '../data/levelData';

const teacherLevels = levelData.map(level => ({ id: level.id, name: level.name }));

const MOBILE_BREAKPOINT = 768;

const LearningPage = () => {
  const { level: levelParam } = useParams();
  const [level, setLevel] = useState(() => {
    const initialLevel = teacherLevels.find((t) => t.id === levelParam);
    return initialLevel ? initialLevel.id : teacherLevels[0].id;
  });
  const [learningContent, setLearningContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const [popover, setPopover] = useState({ show: false, x: 0, y: 0, text: "" });
  const [vocabulary, setVocabulary] = useState([]);
  const [isVocabVisible, setIsVocabVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const contentRef = useRef(null);
  const [wordsArray, setWordsArray] = useState([]);

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth <= MOBILE_BREAKPOINT;

  const [isWordSelectMode, setIsWordSelectMode] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [showGuide, setShowGuide] = useState(false);

  const [showFeatureGuide, setShowFeatureGuide] = useState(false);

  // [추가] 단어장 토글 버튼을 위한 ref와 위치 정보 state
  const vocabToggleBtnRef = useRef(null);
  const [vocabListAnchorRect, setVocabListAnchorRect] = useState(null);

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem("hasSeenVocabFeatureGuide");
    if (!hasSeenGuide) {
      const timer = setTimeout(() => {
        setShowFeatureGuide(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismissFeatureGuide = () => {
    setShowFeatureGuide(false);
    localStorage.setItem("hasSeenVocabFeatureGuide", "true");
  };

  useEffect(() => {
    if (learningContent) {
      setWordsArray(learningContent.content.split(/(\s+)/));
    }
  }, [learningContent]);

  useEffect(() => {
    const fetchVocabulary = async () => {
      try {
        const response = await api.get("/api/vocabulary");
        setVocabulary(response.data);
      } catch (err) {
        console.error("Error fetching vocabulary:", err);
      }
    };
    fetchVocabulary();
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setIsGenerating(false);
      setError(null);
      setLearningContent(null);
      setPopover({ show: false, x: 0, y: 0, text: "" });
      clearSelection();
      setIsWordSelectMode(false);

      const timer = setTimeout(() => setIsGenerating(true), 500);

      try {
        const response = await api.get(`/api/learning/today/${level}`);
        clearTimeout(timer);
        const { status, content } = response.data;
        setIsGenerating(status === "GENERATED_NEW");
        setLearningContent(content);
      } catch (err) {
        clearTimeout(timer);
        console.error("Error fetching learning content:", err);
        setError("콘텐츠를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [level]);

  const handleTextSelection = () => {
    if (isMobile || isWordSelectMode) return;
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText.length > 0 && selectedText.length < 100) {
      const range = selection.getRangeAt(0);
      if (
        contentRef.current &&
        contentRef.current.contains(range.startContainer)
      ) {
        const rect = range.getBoundingClientRect();
        setPopover({
          show: true,
          x: rect.left + rect.width / 2,
          y: rect.top + window.scrollY - 45,
          text: selectedText,
        });
      }
    } else {
      if (!popover.show) setPopover({ ...popover, show: false });
    }
  };

  const handleWordTap = (e, tappedIndex) => {
    e.preventDefault();
    if (!isWordSelectMode || !e.target.matches(".selectable-word")) return;
    const lastIndex =
      selectedIndices.length > 0
        ? selectedIndices[selectedIndices.length - 1]
        : -2;
    if (selectedIndices.length === 0 || tappedIndex === lastIndex + 2) {
      setSelectedIndices((prev) => [...prev, tappedIndex]);
    } else {
      setSelectedIndices([tappedIndex]);
    }
  };

  const clearSelection = () => setSelectedIndices([]);

  const toggleWordSelectMode = () => {
    const nextMode = !isWordSelectMode;
    setIsWordSelectMode(nextMode);
    clearSelection();
    if (nextMode) {
      setShowGuide(true);
      const timer = setTimeout(() => setShowGuide(false), 2500);
      return () => clearTimeout(timer);
    } else {
      setShowGuide(false);
    }
  };

  const selectedPhrase = useMemo(() => {
    if (selectedIndices.length === 0) return "";
    const firstIndex = selectedIndices[0];
    const lastIndex = selectedIndices[selectedIndices.length - 1];
    return wordsArray.slice(firstIndex, lastIndex + 1).join("");
  }, [selectedIndices, wordsArray]);

  const handleSaveWord = async () => {
    const textToSave = isMobile ? selectedPhrase : popover.text;
    if (isSaving || !textToSave) return;
    setIsSaving(true);
    try {
      const response = await api.post("/api/vocabulary", {
        expression: textToSave,
      });
      const newWord = response.data;
      if (!vocabulary.some((v) => v.id === newWord.id)) {
        setVocabulary((prev) => [newWord, ...prev]);
      }
      setIsVocabVisible(true);
    } catch (err) {
      console.error("Error saving word:", err);
      alert("단어 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
      setPopover({ show: false, x: 0, y: 0, text: "" });
      clearSelection();
      setIsWordSelectMode(false);
    }
  };

  const handleDeleteWord = async (wordId) => {
    try {
      await api.delete(`/api/vocabulary/${wordId}`);
      setVocabulary((prev) => prev.filter((word) => word.id !== wordId));
    } catch (err) {
      console.error("Error deleting word:", err);
      alert("단어 삭제에 실패했습니다.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popover.show && !event.target.closest(".save-popover")) {
        setPopover({ ...popover, show: false });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popover]);

  // [추가] 단어장 가시성을 토글하는 함수
  const handleToggleVocabList = () => {
    // 단어장을 띄울 때 (isVocabVisible가 false일 때)
    if (!isVocabVisible && vocabToggleBtnRef.current) {
      // 버튼의 위치와 크기 정보를 가져와 state에 저장
      setVocabListAnchorRect(vocabToggleBtnRef.current.getBoundingClientRect());
    }
    setIsVocabVisible(prev => !prev);
  };

  const loadingMessage = isGenerating
    ? "오늘의 맞춤 콘텐츠를 만들고 있어요..."
    : "오늘의 콘텐츠를 불러오는 중입니다...";

  return (
    <div className="learning-page" onMouseUp={handleTextSelection}>
      {!isMobile &&
        popover.show &&
        createPortal(
          <div
            className="save-popover"
            style={{ top: `${popover.y}px`, left: `${popover.x}px` }}
          >
            <button onClick={handleSaveWord} disabled={isSaving}>
              {isSaving ? <CustomLoader size="small" /> : "✍🏻"}
            </button>
          </div>,
          document.body
        )}

      {showGuide && (
        <div className="guide-tooltip">
          저장하고 싶은 단어를 순서대로 탭하세요!
        </div>
      )}

      {showFeatureGuide && (
        <FeatureDiscoveryTooltip onDismiss={handleDismissFeatureGuide} />
      )}

      {/* [수정] FloatingVocabList에 initialAnchorRect prop 전달 */}
      <FloatingVocabList
        words={vocabulary}
        isVisible={isVocabVisible}
        onClose={() => setIsVocabVisible(false)}
        onDelete={handleDeleteWord}
        initialAnchorRect={vocabListAnchorRect}
      />

      <header className="learning-header">
        <h1>Daily Contents</h1>
      </header>

      <nav className="level-selector">
        {teacherLevels.map((teacher) => (
          <button
            key={teacher.id}
            className={`level-btn ${level === teacher.id ? "active" : ""}`}
            onClick={() => setLevel(teacher.id)}
            disabled={loading}
          >
            {teacher.name}
          </button>
        ))}
      </nav>

      <main className={`content-area ${loading ? "loading" : ""}`}>
        {loading && <CustomLoader message={loadingMessage} />}
        {error && <div className="error-message">{error}</div>}

        {!loading && learningContent && (
          <>
            <article className="learning-article" ref={contentRef}>
              <h2 className="article-title">{learningContent.title}</h2>
              <div
                className={`article-content ${
                  isWordSelectMode ? "selectable" : ""
                }`}
              >
                {isMobile && isWordSelectMode
                  ? wordsArray.map((word, index) =>
                      word.trim() ? (
                        <span
                          key={index}
                          className={`selectable-word ${
                            selectedIndices.includes(index) ? "selected" : ""
                          }`}
                          onMouseDown={(e) => handleWordTap(e, index)}
                        >
                          {word}
                        </span>
                      ) : (
                        <React.Fragment key={index}>{word}</React.Fragment>
                      )
                    )
                  : learningContent.content.split("\n").map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
              </div>
            </article>

            {learningContent.keyExpressions &&
              learningContent.keyExpressions.length > 0 && (
                <section className="key-expressions-section">
                  <h3 className="expressions-title">Key Expressions ✨</h3>
                  <ul className="expressions-list">
                    {learningContent.keyExpressions.map((item, index) => (
                      <li key={index} className="expression-item">
                        <p className="expression-en">{item.expression}</p>
                        <p className="expression-kr">{item.meaning}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
          </>
        )}
      </main>

      <div className="fixed-bottom-controls">
        {isWordSelectMode && (
          <div
            className={`selection-bar ${
              selectedIndices.length > 0 ? "visible" : ""
            }`}
          >
            <span className="selected-text" title={selectedPhrase}>
              {selectedIndices.length > 0
                ? `"${selectedPhrase}"`
                : "단어를 탭하여 선택"}
            </span>
            {selectedIndices.length > 0 && (
              <div className="selection-actions">
                <button
                  onClick={handleSaveWord}
                  disabled={isSaving}
                  className="save-btn"
                >
                  {isSaving ? "..." : "저장"}
                </button>
                <button onClick={clearSelection} className="cancel-btn">
                  ×
                </button>
              </div>
            )}
          </div>
        )}

        {isMobile && !loading && !isWordSelectMode && (
          <button
            onClick={toggleWordSelectMode}
            className="select-mode-fab"
            aria-label="단어 선택 모드 시작"
          >
            ✍🏻
          </button>
        )}

        {isWordSelectMode && (
          <button
            onClick={toggleWordSelectMode}
            className="select-mode-fab active"
            aria-label="단어 선택 모드 종료"
          >
            ✅
          </button>
        )}

        {/* [수정] 단어장 토글 버튼에 ref와 새로운 onClick 핸들러 연결 */}
        {!isWordSelectMode && !isVocabVisible && (
          <button
            ref={vocabToggleBtnRef}
            className="vocab-toggle-btn"
            onClick={handleToggleVocabList}
          >
            📖
          </button>
        )}
      </div>
    </div>
  );
};

export default LearningPage;