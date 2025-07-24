import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/api";
import "./LearningPage.css";
import CustomLoader from "./CustomLoader";
import FloatingVocabList from "./FloatingVocabList";
import useWindowWidth from "../hooks/useWindowWidth";
import FeatureDiscoveryTooltip from "./FeatureDiscoveryTooltip"; // 새로 만든 툴팁 컴포넌트 임포트

const teacherLevels = [
  { id: "beginner", name: "초급 (Beginner)" },
  { id: "intermediate", name: "중급 (Intermediate)" },
  { id: "advanced", name: "고급 (Advanced)" },
  { id: "ielts", name: "IELTS 전문가" },
];

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

  // 기능 안내 툴팁을 위한 state
  const [showFeatureGuide, setShowFeatureGuide] = useState(false);

  // 컴포넌트가 처음 마운트될 때 한 번만 실행
  useEffect(() => {
    // localStorage에서 사용자가 이미 가이드를 봤는지 확인
    const hasSeenGuide = localStorage.getItem("hasSeenVocabFeatureGuide");
    if (!hasSeenGuide) {
      // 1.5초 후에 툴팁을 보여줘서 사용자가 콘텐츠에 먼저 집중하게 함
      const timer = setTimeout(() => {
        setShowFeatureGuide(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // 툴팁 닫기 핸들러
  const handleDismissFeatureGuide = () => {
    setShowFeatureGuide(false);
    // 다시 보지 않도록 localStorage에 기록
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

  const loadingMessage = isGenerating
    ? "오늘의 맞춤 콘텐츠를 만들고 있어요..."
    : "오늘의 콘텐츠를 불러오는 중입니다...";

  return (
    <div className="learning-page" onMouseUp={handleTextSelection}>
      {!isMobile && popover.show && (
        <div
          className="save-popover"
          style={{ top: `${popover.y}px`, left: `${popover.x}px` }}
        >
          <button onClick={handleSaveWord} disabled={isSaving}>
            {isSaving ? "저장중..." : "✍🏻 내 단어장에 저장"}
          </button>
        </div>
      )}

      {showGuide && (
        <div className="guide-tooltip">
          저장하고 싶은 단어를 순서대로 탭하세요!
        </div>
      )}

      {showFeatureGuide && (
        <FeatureDiscoveryTooltip onDismiss={handleDismissFeatureGuide} />
      )}

      <FloatingVocabList
        words={vocabulary}
        isVisible={isVocabVisible}
        onClose={() => setIsVocabVisible(false)}
        onDelete={handleDeleteWord}
      />

      <header className="learning-header">
        <h1>Today's Contents</h1>
        <p>AI 선생님이 매일 제공하는 오늘의 학습 콘텐츠입니다.</p>
      </header>

      <div className="page-guide-link-wrapper">
        <Link to="/level-guide" className="page-guide-link">
          레벨 가이드 보기 👈
        </Link>
      </div>

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

        {!isWordSelectMode && !isVocabVisible && (
          <button
            className="vocab-toggle-btn"
            onClick={() => setIsVocabVisible(true)}
          >
            📖
          </button>
        )}
      </div>
    </div>
  );
};

export default LearningPage;
