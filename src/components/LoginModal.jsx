import React from 'react';
import { createPortal } from 'react-dom';
import './LoginModal.css';
import googleLogo from "../assets/google-logo.svg";
import kakaoLogo from "../assets/kakao-logo.png";
import naverLogo from "../assets/naver-logo.png";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const LoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleSocialLogin = (provider) => {
    sessionStorage.setItem('login_provider', provider);
    window.location.href = `${API_BASE_URL}/oauth2/authorization/${provider}`;
  };
  
  // 모달 외부 클릭 시 닫기 (모달 콘텐츠 클릭 시에는 닫히지 않도록 stopPropagation)
  const handleOverlayClick = () => {
    onClose();
  };

  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return createPortal(
    <div className="login-modal-overlay" onClick={handleOverlayClick}>
      <div className="login-modal-content" onClick={handleModalContentClick}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <CloseIcon />
        </button>
        <div className="modal-login-body">
          <h2 className="modal-login-title">환영합니다!</h2>
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
    </div>,
    document.body // 포탈의 타겟을 document.body로 설정
  );
};

export default LoginModal;