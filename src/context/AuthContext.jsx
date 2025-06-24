// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 초기화 로딩
  const [userLoading, setUserLoading] = useState(false); // 사용자 정보 로딩 상태 추가
  const navigate = useNavigate();

  // 앱 처음 로드될 때
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('앱 초기화: 세션 확인 시도...');
        const response = await api.post('/api/auth/refresh');
        const newAccessToken = response.data.accessToken;
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        setAccessToken(newAccessToken);
        console.log('access token 설정 완료.');
      } catch (error) {
        console.log('유효한 세션이 없습니다. 로그아웃 상태로 시작합니다.');
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  // AccessToken이 변경될 때 사용자 정보를 가져오는 로직
  useEffect(() => {
    const fetchUser = async () => {
      if (accessToken) {
        setUserLoading(true); // 사용자 정보 로딩 시작
        try {
          const response = await api.get('/api/users/me');
          setUser(response.data);
        } catch (error) {
          console.error('사용자 정보를 가져오는 데 실패했습니다. 로그아웃 처리합니다.', error);
          logout(false);
        } finally {
          setUserLoading(false); // 사용자 정보 로딩 종료
        }
      }
    };
    fetchUser();
  }, [accessToken]);

  const login = (token) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setAccessToken(token); 
    navigate('/', { replace: true });
  };

  const logout = async (callApi = true) => {
    if (callApi) {
      try {
        await api.post('/api/auth/logout');
      } catch (error) {
        console.error('서버 로그아웃 실패:', error);
      }
    }
    setAccessToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const authContextValue = {
    accessToken,
    user,
    loading,
    userLoading, // 컨텍스트 값으로 전달
    login,
    logout,
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};