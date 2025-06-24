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
    window.location.href = `${API_BASE_URL}/oauth2/authorization/${provider}`;
  };

  return (
    <div className="login-page">
      {/* 2단 레이아웃을 위한 메인 컨테이너 */}
      <div className="login-main-content">

        {/* 왼쪽: 브랜딩/소개 영역 */}
        <div className="login-branding">
          <div className="branding-content">
            <h1 className="branding-title">레벨별 AI 영어 선생님</h1>
            <p className="branding-description">
              4가지 레벨의 영어 선생님을 선택하여 효율적으로 공부해요.
            </p>
            <ul className="branding-features">
              <li>💬 일상 대화하기</li>
              <li>✍️ 영작문 피드백 받기</li>
              <li>📖 이해되지 않는 구문 물어보기</li>
            </ul>
          </div>
        </div>

        {/* 오른쪽: 로그인 폼 영역 */}
        <div className="login-form-area">
          <div className="login-box">
            <Link to="/" className="logo-in-box">📘 English Teacher</Link>
            <h2>Sign in to continue your learning journey</h2>
            <p></p>
            <div className="social-login-buttons">
              <button
                className="social-login-button google-login-button"
                onClick={() => handleSocialLogin('google')}
              >
                <img src={googleLogo} alt="Google logo" className="social-logo" />
                <span>Continue with Google</span>
              </button>
              <button
                className="social-login-button kakao-login-button"
                onClick={() => handleSocialLogin('kakao')}
              >
                <img src={kakaoLogo} alt="Kakao logo" className="social-logo" />
                <span>Continue with Kakao</span>
              </button>
              <button
                className="social-login-button naver-login-button"
                onClick={() => handleSocialLogin('naver')}
              >
                <img src={naverLogo} alt="Naver logo" className="social-logo" />
                <span>Continue with Naver</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;