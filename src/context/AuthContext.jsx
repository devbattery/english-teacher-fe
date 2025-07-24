// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
// jwt-decode가 필요하다면 유지하고, 아니라면 이 줄은 삭제해도 됩니다.
import { jwtDecode } from 'jwt-decode'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate = useNavigate();
  
  // [추가] 로그인 모달 상태 관리
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 앱 처음 로드될 때: 세션에서 토큰을 가져오려는 시도
  useEffect(() => {
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
    // [수정] 로그인 성공 시 모달을 닫고 홈으로 이동
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
    
    // [수정] 로그아웃 시 로그인 페이지로 이동하는 대신, 홈으로 이동
    navigate("/");
    setLogoutLoading(false);
  };

  // [추가] 모달을 여는 함수
  const openLoginModal = () => setIsLoginModalOpen(true);

  // [추가] 모달을 닫는 함수
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const authContextValue = {
    accessToken,
    user,
    loading,
    userLoading,
    logoutLoading,
    login,
    logout,
    // [추가] 컨텍스트 값으로 제공
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