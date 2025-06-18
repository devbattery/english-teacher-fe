// src/components/LoginPage.jsx

import React from "react";
import "./LoginPage.css";
// [수정] 각 소셜 로그인 로고를 임포트합니다.
import googleLogo from "../assets/google-logo.png";
import kakaoLogo from "../assets/kakao-logo.png";
import naverLogo from "../assets/naver-logo.jpg";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LoginPage = () => {
  // [공통] 로그인 핸들러를 일반화하여 중복을 줄일 수 있습니다.
  const handleSocialLogin = (provider) => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/${provider}`;
  };

  return (
    <div className="login-page-container">
      <div className="login-box">
        <h2>로그인</h2>
        <p>소셜 계정으로 간편하게 시작하세요.</p>
        <div className="social-login-buttons">
          {/* Google 로그인 버튼 */}
          <button
            className="social-login-button google-login-button"
            onClick={() => handleSocialLogin('google')}
          >
            <img src={googleLogo} alt="Google logo" className="social-logo" />
            <span>Google 계정으로 로그인</span>
          </button>

          {/* [추가] Kakao 로그인 버튼 */}
          <button
            className="social-login-button kakao-login-button"
            onClick={() => handleSocialLogin('kakao')}
          >
            <img src={kakaoLogo} alt="Kakao logo" className="social-logo" />
            <span>Kakao 계정으로 로그인</span>
          </button>

          {/* [추가] Naver 로그인 버튼 */}
          <button
            className="social-login-button naver-login-button"
            onClick={() => handleSocialLogin('naver')}
          >
            <img src={naverLogo} alt="Naver logo" className="social-logo" />
            <span>Naver 계정으로 로그인</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;