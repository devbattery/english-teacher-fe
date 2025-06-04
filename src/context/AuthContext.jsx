import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/api';
import { jwtDecode } from 'jwt-decode'; // npm install jwt-decode

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (accessToken) {
      // 토큰이 있으면 로컬 스토리지에 저장하고, 사용자 정보를 가져옴
      localStorage.setItem('accessToken', accessToken);
      api.get('/api/users/me')
        .then(response => {
          // 토큰에서 이메일 추출하여 사용자 정보로 설정 (또는 백엔드 응답 사용)
          const decodedToken = jwtDecode(accessToken);
          setUser({ email: decodedToken.sub, ...response.data });
        })
        .catch(() => {
          // 토큰이 유효하지 않으면 로그아웃 처리
          logout();
        });
    } else {
      // 토큰이 없으면 모든 정보 초기화
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  }, [accessToken]);

  const login = (token) => {
    setAccessToken(token);
  };

  const logout = () => {
    // TODO: 백엔드에 /api/auth/logout 엔드포인트를 만들어 Redis의 Refresh Token을 삭제하도록 요청하면 더 안전함
    setAccessToken(null);
  };

  const authContextValue = {
    accessToken,
    user,
    login,
    logout,
  };

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