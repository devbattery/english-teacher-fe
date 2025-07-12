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
          const { accessToken, isNewUser } = response.data;

          if (accessToken) {
            if (isNewUser) {
              console.log('신규 사용자입니다. 자동 재로그인을 시도합니다.');
              
              // [수정] sessionStorage에서 이전에 저장된 provider를 가져옵니다.
              const provider = sessionStorage.getItem('login_provider');
              
              // [수정] 무한 루프 방지를 위해 사용했던 provider 정보는 즉시 삭제합니다.
              sessionStorage.removeItem('login_provider');

              if (provider) {
                // [수정] 저장된 provider 정보로 다시 로그인 URL을 만들어 자동으로 리디렉션합니다.
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
                window.location.href = `${API_BASE_URL}/oauth2/authorization/${provider}`;
              } else {
                // provider 정보가 없으면, 수동 로그인을 위해 로그인 페이지로 보냅니다.
                console.error('자동 재로그인을 위한 provider 정보를 찾을 수 없습니다.');
                auth.logout();
                navigate('/login', { replace: true });
              }
            } else {
              // 기존 사용자는 정상적으로 로그인 처리
              auth.login(accessToken);
              // [수정] 기존 사용자의 경우에도 불필요한 sessionStorage 데이터를 정리합니다.
              sessionStorage.removeItem('login_provider');
              navigate('/', { replace: true });
            }
          } else {
            throw new Error('Access Token을 받지 못했습니다.');
          }
        })
        .catch(err => {
          console.error('토큰 교환 실패:', err);
          setError('로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
          sessionStorage.removeItem('login_provider'); // 에러 발생 시에도 정리
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