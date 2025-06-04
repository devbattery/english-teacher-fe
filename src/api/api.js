import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
});

// 요청 인터셉터 (요청을 보내기 전에 실행)
api.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 accessToken 가져오기
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      // 헤더에 'Authorization' 토큰 추가
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;