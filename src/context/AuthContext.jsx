// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 페이지 로드 시 localStorage에서 토큰을 가져와 초기 상태로 설정
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    const fetchUser = async () => {
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        // axios 인스턴스의 기본 헤더 설정 (새로고침 시에도 유지되도록)
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        try {
          const response = await api.get('/api/users/me');
          setUser(response.data);
        } catch (error) {
          console.error('사용자 정보 조회 실패:', error);
          // 토큰이 유효하지 않은 경우 (ex: 401 에러) 로그아웃 처리
          if (error.response && error.response.status === 401) {
            logout(false); // 서버에 요청할 필요 없이 프론트에서만 로그아웃
          }
        }
      } else {
        localStorage.removeItem('accessToken');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      }
      setLoading(false); // 사용자 정보 로딩 완료
    };

    fetchUser();
  }, [accessToken]);

  const login = (token) => {
    setAccessToken(token);
  };

  const logout = async (callApi = true) => {
    if (callApi) {
        try {
            // 백엔드에 로그아웃 요청을 보내 Redis의 Refresh Token을 삭제
            await api.post('/api/auth/logout');
            console.log('서버 로그아웃 성공');
        } catch (error) {
            console.error('서버 로그아웃 실패:', error);
        }
    }
    // 프론트엔드 상태와 로컬 스토리지를 정리
    setAccessToken(null);
  };

  const authContextValue = {
    accessToken,
    user,
    loading, // 로딩 상태를 컨텍스트 값에 포함
    login,
    logout,
  };

  // 로딩 중에는 아무것도 렌더링하지 않거나 로딩 스피너를 보여줌
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 커스텀 훅
export const useAuth = () => {
  return useContext(AuthContext);
};