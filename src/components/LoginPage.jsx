import React from "react";
import "./LoginPage.css"; // 스타일링을 위한 CSS 파일
import googleLogo from "../assets/google-logo.svg"; // Google 로고 이미지

// 백엔드 서버의 기본 URL을 환경 변수에서 가져옵니다.
// .env.local 파일에 VITE_API_BASE_URL=http://localhost:8080 와 같이 설정합니다.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LoginPage = () => {
  const handleGoogleLogin = () => {
    // 백엔드의 Google OAuth2 로그인 URL로 리디렉션합니다.
    // Spring Security의 기본 URL 형식은 /oauth2/authorization/{providerId} 입니다.
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  };

  return (
    <div className="login-page-container">
      <div className="login-box">
        <h2>로그인</h2>
        <p>소셜 계정으로 간편하게 시작하세요.</p>
        <button className="google-login-button" onClick={handleGoogleLogin}>
          <img src={googleLogo} alt="Google logo" className="google-logo" />
          <span>Google 계정으로 로그인</span>
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
