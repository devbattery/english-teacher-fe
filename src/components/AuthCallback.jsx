import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    // URL의 'token' 쿼리 파라미터를 가져옴
    const accessToken = searchParams.get('token');

    if (accessToken) {
      // AuthContext의 login 함수를 호출하여 토큰을 전역 상태에 저장
      auth.login(accessToken);
      // 토큰 처리 후 홈페이지로 리디렉션
      navigate('/');
    } else {
      // 토큰이 없으면 로그인 페이지로 리디렉션
      alert('로그인에 실패했습니다.');
      navigate('/login');
    }
  }, [searchParams, navigate, auth]);

  return <div>로그인 처리 중...</div>;
};

export default AuthCallback;