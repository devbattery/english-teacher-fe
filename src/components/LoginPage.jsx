// src/components/LoginPage.jsx

import React from "react";
import "./LoginPage.css";
import { Link } from 'react-router-dom';
import googleLogo from "../assets/google-logo.png";
import kakaoLogo from "../assets/kakao-logo.png";
import naverLogo from "../assets/naver-logo.jpg";

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
            <h1 className="branding-title">Your Personal AI English Tutor</h1>
            <p className="branding-description">
              Practice speaking, writing, and reading with AI teachers tailored to your level. 24/7.
            </p>
            <ul className="branding-features">
              <li>💬 Chat with AI friends</li>
              <li>✍️ Get expert writing feedback</li>
              <li>📖 Read personalized stories</li>
            </ul>
          </div>
        </div>

        {/* 오른쪽: 로그인 폼 영역 */}
        <div className="login-form-area">
          <div className="login-box">
            <Link to="/" className="logo-in-box">English Trainer</Link>
            <h2>Welcome Back!</h2>
            <p>Sign in to continue your learning journey.</p>
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
            <div className="login-footer">
              <p>By continuing, you agree to our <a href="/terms">Terms of Service</a>.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;