// src/components/HomePage.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Welcome to the App!</h1>
      {user ? (
        <div>
          <p>Hello, {user.name || user.email}!</p>
          {user.picture &&
            <img src={user.picture} alt="Profile" style={{ borderRadius: '50%', width: '50px' }} />
          }
          <br />

          {/* [추가] 채팅 페이지로 이동하는 링크 */}
          <Link to="/chat" style={{ display: 'inline-block', marginTop: '20px', marginRight: '10px', padding: '10px 15px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
            Start Learning English
          </Link>

          <button onClick={() => logout()} style={{ marginTop: '20px' }}>Logout</button>
        </div>
      ) : (
        // ProtectedRoute를 사용하면 이 부분은 사실상 보이지 않게 됩니다.
        // 하지만 혹시 모를 상황을 대비해 그대로 둡니다.
        <div>
          <p>You are not logged in.</p>
          <Link to="/login">Go to Login Page</Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;