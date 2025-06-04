import React from 'react';
import { useAuth } from '../context/AuthContext'; // useAuth 훅을 임포트
import { Link } from 'react-router-dom';

const HomePage = () => {
  // AuthContext에서 user 정보와 logout 함수를 가져옵니다.
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Welcome to the App!</h1>
      {user ? (
        <div>
          {/* user.email 은 토큰에서, 나머지는 /api/users/me 응답에서 가져올 수 있습니다. */}
          <p>Hello, {user.name || user.email}!</p>
          {user.picture &&
            <img src={user.picture} alt="Profile" style={{ borderRadius: '50%', width: '50px' }} />
          }
          <br />
          <button onClick={logout} style={{ marginTop: '20px' }}>Logout</button>
        </div>
      ) : (
        <div>
          <p>You are not logged in.</p>
          <Link to="/login">Go to Login Page</Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;