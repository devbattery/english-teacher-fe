// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  // ✅ accessToken도 가져옵니다.
  const { user, accessToken, loading } = useAuth();
  const location = useLocation();

  // 1. 초기 인증 상태를 확인하는 중일 때 (AuthContext의 첫 번째 useEffect)
  //    "Initializing Session..." 또는 로딩 스피너를 보여줍니다.
  if (loading) {
    return <div>Initializing Session...</div>;
  }

  // 2. 로딩이 끝났고, 토큰은 있지만 아직 user 객체가 없는 경우
  //    (로그인 직후 사용자 정보를 가져오는 중간 상태)
  //    이 경우에도 로딩 화면을 보여주어 리디렉션을 방지합니다.
  if (accessToken && !user) {
    return <div>Loading User Profile...</div>;
  }

  // 3. 로딩이 끝났고, 토큰도 없고 user 객체도 없는 경우
  //    완전히 비로그인 상태이므로 로그인 페이지로 리디렉션합니다.
  if (!accessToken && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 4. 위 모든 검사를 통과한 경우 (user 객체가 존재함)
  //    요청한 페이지를 정상적으로 보여줍니다.
  return children;
};

export default ProtectedRoute;