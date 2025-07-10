// src/components/AuthCallback.jsx

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import CustomLoader from './CustomLoader';
import './AuthCallback.css';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const [error, setError] = useState(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    if (isProcessing.current) {
      return;
    }

    const code = searchParams.get('code');

    if (code) {
      isProcessing.current = true;

      api.post('/api/auth/token', { code })
        .then(response => {
          const { accessToken } = response.data;
          if (accessToken) {
            auth.login(accessToken);
            navigate('/', { replace: true });
          } else {
            throw new Error('Access Token을 받지 못했습니다.');
          }
        })
        .catch(err => {
          console.error('토큰 교환 실패:', err);
          setError('로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        });
    } else {
      setError('인증 코드가 없습니다. 로그인 페이지로 돌아갑니다.');
    }
  }, [searchParams, navigate, auth]);

  if (error) {
    return (
      <div className="callback-container">
        <div className="loading-box">
          <p className="error-text">{error}</p>
          <button className="login-redirect-btn" onClick={() => navigate('/login')}>로그인 페이지로 이동</button>
        </div>
      </div>
    );
  }

  return (
    <div className="callback-container">
      <div className="loading-box">
        <CustomLoader />
        <p className="loading-text">로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default AuthCallback;