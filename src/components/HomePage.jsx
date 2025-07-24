import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HomePageSkeleton from "./HomePageSkeleton";
import "./HomePage.css";
import geminiLogo from "../assets/gemini.png";
import { ArrowRight } from "lucide-react"; // [추가] 아이콘 라이브러리에서 화살표 가져오기

const ChatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const BookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

// [핵심 수정] LevelButton 컴포넌트 구조 변경
const LevelButton = ({ to, label }) => (
  <Link to={to} className="level-button">
    <span>{label}</span>
  </Link>
);

const HomePage = () => {
  const { user, accessToken, loading } = useAuth();

  if (loading || (accessToken && !user)) {
    return <HomePageSkeleton />;
  }

  const chatLevels = [
    { label: "왕초보", path: "/chat?level=elementary" },
    { label: "고등학생", path: "/chat?level=highschool" },
    { label: "원어민", path: "/chat?level=native" },
    { label: "TOEIC", path: "/chat?level=toeic" },
  ];

  const contentLevels = [
    { label: "왕초보", path: "/learning/elementary" },
    { label: "고등학생", path: "/learning/highschool" },
    { label: "원어민", path: "/learning/native" },
    { label: "TOEIC", path: "/learning/toeic" },
  ];

  return (
    <div className="home-page">
      <div className="top-section">
        <div className="hero-section">
          <h1 className="hero-title">
            English Teacher는{" "}
            <span className="highlight-text">Google의 최신 Gemini API</span>와
            함께합니다.
          </h1>
          <div className="partner-logos">
            <img src={geminiLogo} alt="Google Gemini Logo" />
          </div>
        </div>
      </div>

      <div className="bottom-section">
        <main className="home-main">
          <div className="level-guide-link-wrapper">
            <Link to="/level-guide" className="level-guide-link">
              레벨 가이드 보기 👈
            </Link>
          </div>

          <div className="section-container">
            {/* ▼▼▼ [핵심 수정] English Chat 섹션 ▼▼▼ */}
            <div className="home-section chat-section">
              <div className="section-header">
                <div className="card-icon">
                  <ChatIcon />
                </div>
                <h2>Messenger</h2>
              </div>

              {/* 기존 <p> 태그를 아래 구조로 교체 */}
              <div className="section-description">
                <p className="section-tagline">실전처럼 채팅하며 배우는 영어</p>
                <ul className="feature-list">
                  <li className="feature-item">실시간 문법 및 어휘 교정</li>
                  <li className="feature-item">
                    자유로운 주제로 나누는 프리토킹
                  </li>
                  <li className="feature-item">레벨별 다양한 AI와 함께</li>
                </ul>
              </div>

              <div className="level-buttons-container">
                {chatLevels.map((level, index) => (
                  <LevelButton
                    key={index}
                    to={level.path}
                    label={level.label}
                  />
                ))}
              </div>
            </div>

            {/* ▼▼▼ [핵심 수정] Today's Contents 섹션 ▼▼▼ */}
            <div className="home-section content-section">
              <div className="section-header">
                <div className="card-icon">
                  <BookIcon />
                </div>
                <h2>Daily Contents</h2>
              </div>

              {/* 기존 <p> 태그를 아래 구조로 교체 */}
              <div className="section-description">
                <p className="section-tagline">
                  매일 새롭게 만나는 맞춤 학습 자료
                </p>
                <ul className="feature-list">
                  <li className="feature-item">레벨별 다양한 AI가 생성하는 고품질 글</li>
                  <li className="feature-item">핵심 표현 및 단어 자동 정리</li>
                  <li className="feature-item">독해력과 어휘력 동시 향상</li>
                </ul>
              </div>

              <div className="level-buttons-container">
                {contentLevels.map((level, index) => (
                  <LevelButton
                    key={index}
                    to={level.path}
                    label={level.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
