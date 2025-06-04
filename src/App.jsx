import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import AuthCallback from './components/AuthCallback'; // 새로 추가
import { AuthProvider } from './context/AuthContext'; // 새로 추가
import './App.css';

function App() {
  return (
    // AuthProvider로 전체 앱을 감싸줍니다.
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* 로그인 콜백을 처리할 라우트를 추가합니다. */}
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;