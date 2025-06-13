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
          {/* Spring Security의 OAuth2User.getAttributes()가 반환하는 기본 필드를 사용합니다. */}
          {/* Google의 경우 name, picture, email 필드가 있습니다. */}
          <p>Hello, {user.name || user.email}!</p>
          {user.picture &&
            <img src={user.picture} alt="Profile" style={{ borderRadius: '50%', width: '50px' }} />
          }
          <br />
          <button onClick={() => logout()} style={{ marginTop: '20px' }}>Logout</button>
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