import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 백엔드에 현재 로그인된 사용자 정보를 요청하는 함수
    const fetchUser = async () => {
      try {
        // Spring Security가 세션 쿠키를 사용하므로 'credentials: include'가 필수입니다.
        const response = await fetch(`${API_BASE_URL}/api/user/me`, {
          credentials: 'include', 
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          // 401 Unauthorized 또는 다른 에러가 발생하면 user는 null로 유지됩니다.
          console.error('Failed to fetch user data. User might not be logged in.');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []); // 컴포넌트가 마운트될 때 한 번만 실행

  const handleLogout = () => {
    // Spring Security의 기본 로그아웃 URL은 /logout 입니다.
    // POST 요청을 보내는 것이 더 안전하지만, 간단하게 GET으로 리디렉션합니다.
    window.location.href = `${API_BASE_URL}/logout`;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome to the App!</h1>
      {user ? (
        <div>
          <p>Hello, {user.name}! ({user.email})</p>
          <img src={user.picture} alt="Profile" style={{ borderRadius: '50%', width: '50px' }} />
          <br />
          <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
        </div>
      ) : (
        <div>
          <p>You are not logged in.</p>
          <a href="/login">Go to Login Page</a>
        </div>
      )}
    </div>
  );
};

export default HomePage;