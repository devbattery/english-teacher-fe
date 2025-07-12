// src/components/LoginPage.jsx

import React from "react";
import "./LoginPage.css";
import { Link } from 'react-router-dom';
import googleLogo from "../assets/google-logo.svg";
import kakaoLogo from "../assets/kakao-logo.png";
import naverLogo from "../assets/naver-logo.png";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LoginPage = () => {
  const handleSocialLogin = (provider) => {
    // [수정] 자동 재로그인을 위해 선택한 provider를 sessionStorage에 저장합니다.
    sessionStorage.setItem('login_provider', provider);
    window.location.href = `${API_BASE_URL}/oauth2/authorization/${provider}`;
  };

  return (
    <div className="login-page">
      {/* 브랜딩 섹션 */}
      <div className="branding-section">
        <div className="branding-logo">📘 English Teacher</div>
        <h1 className="branding-title">레벨별 AI 영어 선생님</h1>
        <p className="branding-description">
          4가지 레벨의 영어 선생님을 선택하여 효율적으로 공부해요. 일상 대화부터 영작문 피드백, 구문 질문까지 모두 가능합니다.
        </p>
      </div>

      {/* 로그인 섹션 */}
      <div className="login-section">
        <div className="login-container">
          <h2 className="login-title">Welcome Back!</h2>
          <p className="login-subtitle">Sign in to continue your learning journey</p>
          <div className="social-login-buttons">
            <button
              className="social-login-btn"
              onClick={() => handleSocialLogin('google')}
            >
              <img src={googleLogo} alt="Google logo" className="social-logo" />
              <span>Continue with Google</span>
            </button>
            <button
              className="social-login-btn kakao-login-btn"
              onClick={() => handleSocialLogin('kakao')}
            >
              <img src={kakaoLogo} alt="Kakao logo" className="social-logo" />
              <span>Continue with Kakao</span>
            </button>
            <button
              className="social-login-btn naver-login-btn"
              onClick={() => handleSocialLogin('naver')}
            >
              <img src={naverLogo} alt="Naver logo" className="social-logo" />
              <span>Continue with Naver</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;