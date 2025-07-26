// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { jwtDecode } from 'jwt-decode'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate = useNavigate();
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 앱 처음 로드될 때: 세션에서 토큰을 가져오려는 시도
  useEffect(() => {
    // ✅ 수정된 부분: 현재 경로가 /auth/callback이면 세션 확인 로직을 실행하지 않습니다.
    // 이는 AuthCallback 컴포넌트가 토큰을 처리하는 동안 불필요한 API 호출(과 401 에러)을 방지합니다.
    if (window.location.pathname === '/auth/callback') {
      setLoading(false); // 로딩 상태만 false로 변경하여 앱이 멈추지 않도록 합니다.
      return;
    }

    const initializeAuth = async () => {
      try {
        console.log("앱 초기화: 세션 확인 시도...");
        const response = await api.post("/api/auth/refresh");
        const newAccessToken = response.data.accessToken;
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        setAccessToken(newAccessToken);
        console.log("access token 설정 완료.");
      } catch (error) {
        console.log("유효한 세션이 없습니다. 로그아웃 상태로 시작합니다.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  // AccessToken이 생기거나 변경될 때 사용자 정보를 가져오는 로직
  useEffect(() => {
    const fetchUser = async () => {
      if (accessToken) {
        setUserLoading(true);
        try {
          const response = await api.get("/api/users/me");
          setUser(response.data);
        } catch (error) {
          console.error("사용자 정보를 가져오는 데 실패했습니다. 토큰이 유효하지 않을 수 있습니다.", error);
          logout(false); // API 호출 없이 클라이언트 측 로그아웃만 수행
        } finally {
          setUserLoading(false);
        }
      }
    };
    
    if (!loading) {
      fetchUser();
    }
  }, [accessToken, loading]);

  const login = (token) => {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setAccessToken(token);
    closeLoginModal();
    navigate("/", { replace: true });
  };

  const logout = async (callApi = true) => {
    setLogoutLoading(true);
    if (callApi) {
      try {
        await api.post("/api/auth/logout");
      } catch (error) {
        console.error("서버 로그아웃 실패:", error);
      }
    }
    setAccessToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
    
    navigate("/");
    setLogoutLoading(false);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);

  const closeLoginModal = () => setIsLoginModalOpen(false);

  const authContextValue = {
    accessToken,
    user,
    loading,
    userLoading,
    logoutLoading,
    login,
    logout,
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};