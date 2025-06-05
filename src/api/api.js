import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  // Refresh Token 요청 시 쿠키를 포함시키기 위한 설정
  withCredentials: true, 
});

// 요청 인터셉터 (기존 코드)
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ------------------- ▼ 응답 인터셉터 추가 ▼ -------------------

// 응답 인터셉터 (API 응답을 받은 후 실행)
api.interceptors.response.use(
  // 2xx 범위의 상태 코드는 이 함수를 트리거합니다.
  (response) => response,
  
  // 2xx 외의 범위에 있는 상태 코드는 이 함수를 트리거합니다.
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고, 재시도한 요청이 아닐 경우
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 재시도 플래그 설정

      try {
        console.log("Access Token 만료. 재발급을 시도합니다.");
        
        // 토큰 재발급 API 호출
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, {
          withCredentials: true // refresh token 쿠키를 보내기 위해 필수
        });
        
        const newAccessToken = response.data.accessToken;
        
        // 새로운 Access Token을 로컬 스토리지와 axios 기본 헤더에 저장
        localStorage.setItem('accessToken', newAccessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        
        // 원래 요청의 헤더도 새로운 토큰으로 교체
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        console.log("Access Token 재발급 성공. 원래 요청을 다시 시도합니다.");
        // 원래 요청을 다시 실행
        return api(originalRequest);

      } catch (refreshError) {
        console.error("Refresh Token이 만료되었거나 유효하지 않습니다. 로그아웃 처리합니다.");
        // 재발급 실패 시, 로컬 스토리지의 토큰을 삭제하고 로그인 페이지로 리디렉션
        localStorage.removeItem('accessToken');
        // AuthContext의 logout 함수를 호출하면 더 좋지만, 여기서는 직접 처리
        window.location.href = '/login'; 
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


export default api;
