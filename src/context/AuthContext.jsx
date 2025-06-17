// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate 임포트
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // 프로그래매틱 네비게이션을 위해 훅 사용

  // 앱이 처음 로드될 때 실행
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('앱 초기화: 세션 확인 시도...');
        const response = await api.post('/api/auth/refresh');
        const newAccessToken = response.data.accessToken;
        
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        // AccessToken이 설정되면 아래의 다른 useEffect가 사용자 정보를 가져옵니다.
        setAccessToken(newAccessToken);
        console.log('access token 설정 완료.')
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
        try {
          const response = await api.get('/api/users/me');
          setUser(response.data);
        } catch (error) {
          console.error('사용자 정보를 가져오는 데 실패했습니다. 로그아웃 처리합니다.', error);
          // 여기서 에러가 발생했다는 것은 AccessToken이 유효하지 않다는 뜻.
          // 인터셉터가 재발급에도 실패했으므로 로그아웃 시켜야 합니다.
          logout(false); // 서버에 또 요청할 필요 없이 프론트에서만 로그아웃
        }
      }
    };
    fetchUser();
  }, [accessToken]);


  const login = (token) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setAccessToken(token);
    // 로그인 성공 후 홈페이지로 이동
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
    // 로그아웃 시 로그인 페이지로 이동
    navigate('/login');
  };

  const authContextValue = {
    accessToken,
    user,
    loading,
    login,
    logout,
  };

  if (loading) {
    return <div>Loading...</div>; // 초기 세션 확인 중에는 로딩 표시
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// AuthProvider는 Router 안에서 사용되어야 하므로 App.jsx 구조 확인 필요
export const useAuth = () => {
  return useContext(AuthContext);
};