// src/components/AuthCallback.jsx

import React, { useEffect, useState, useRef } from 'react'; // useRef 임포트
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const [error, setError] = useState(null);

  // ★★★ API 호출이 이미 시작되었는지 추적하기 위한 ref ★★★
  const isProcessing = useRef(false);

  useEffect(() => {
    // ★★★ 이미 처리 중이면, 두 번째 호출을 무시하고 즉시 종료 ★★★
    if (isProcessing.current) {
      return;
    }

    const code = searchParams.get('code');

    if (code) {
      // ★★★ 처리 시작 플래그를 true로 설정 ★★★
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

    // useEffect 클린업 함수는 필요하지 않습니다.
  }, [searchParams, navigate, auth]); // 의존성 배열은 그대로 둡니다.

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={() => navigate('/login')}>로그인 페이지로 이동</button>
      </div>
    );
  }

  return <div>로그인 처리 중...</div>;
};

export default AuthCallback;