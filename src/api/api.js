// src/api/api.js

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// 요청 인터셉터는 이전에 메모리 방식으로 바꾸기로 했으므로,
// AuthContext에서 api.defaults.headers.common을 설정하는 것으로 충분합니다.
// 이 인터셉터는 삭제하거나 비워둬도 좋습니다. 지금은 그대로 두겠습니다.
api.interceptors.request.use(
  (config) => {
    // AuthContext가 api.defaults.headers.common['Authorization']을 관리하므로
    // 이 부분은 사실상 백업 역할만 합니다.
    return config;
  },
  (error) => Promise.reject(error)
);

// [수정됨] 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ [핵심 수정]
    // 401 에러이고, 재시도한 요청이 아니며, '실패한 요청이 토큰 재발급 요청이 아닐 때'만 실행합니다.
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/api/auth/refresh' // <--- 이 조건이 가장 중요합니다!
    ) {
      originalRequest._retry = true;

      try {
        console.log("Access Token 만료. 재발급을 시도합니다.");
        const response = await api.post('/api/auth/refresh');
        const newAccessToken = response.data.accessToken;

        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        console.log("Access Token 재발급 성공. 원래 요청을 다시 시도합니다.");
        return api(originalRequest);

      } catch (refreshError) {
        console.error("Refresh Token이 만료되었거나 유효하지 않습니다. 인증 실패.");
        return Promise.reject(refreshError);
      }
    }

    // 401 에러가 아니거나, 재시도 요청이거나, '/api/auth/refresh' 요청이 실패한 경우
    return Promise.reject(error);
  }
);

export default api;