// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 초기 토큰/세션 확인 로딩
  // [수정] userLoading의 초기값은 false로 둡니다.
  const [userLoading, setUserLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate = useNavigate();

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
        // 토큰이 없으므로 user도 null로 확실히 설정
        setUser(null);
      } finally {
        // 초기화 로딩 완료
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  // AccessToken이 생기거나 변경될 때 사용자 정보를 가져오는 로직
  useEffect(() => {
    const fetchUser = async () => {
      // accessToken이 존재할 때만 사용자 정보를 가져옵니다.
      if (accessToken) {
        setUserLoading(true);
        try {
          const response = await api.get("/api/users/me");
          setUser(response.data);
        } catch (error) {
          console.error("사용자 정보를 가져오는 데 실패했습니다. 토큰이 유효하지 않을 수 있습니다.", error);
          // 토큰이 유효하지 않아 사용자 정보를 가져오지 못했으므로 로그아웃 처리
          logout(false); // API 호출 없이 클라이언트 측 로그아웃만 수행
        } finally {
          setUserLoading(false);
        }
      }
    };
    
    // 초기화 로딩(loading)이 끝난 후에 사용자 정보를 가져오도록 합니다.
    if (!loading) {
      fetchUser();
    }
  }, [accessToken, loading]); // loading을 의존성 배열에 추가

  const login = (token) => {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setAccessToken(token);
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
    
    // [수정] 현재 경로가 /login이 아닐 때만 navigate를 호출하여 불필요한 이동을 방지
    if (window.location.pathname !== '/login') {
      navigate("/login");
    }
    setLogoutLoading(false);
  };

  const authContextValue = {
    accessToken,
    user,
    loading,      // 초기 세션 확인 로딩
    userLoading,  // 사용자 정보 조회 로딩
    logoutLoading, // 로그아웃 로딩
    login,
    logout,
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