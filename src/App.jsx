// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import AuthCallback from './components/AuthCallback';
import { AuthProvider } from './context/AuthContext';
// [추가] 새로 만든 컴포넌트 임포트
import ProtectedRoute from './components/ProtectedRoute';
import ChatPage from './components/ChatPage';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* [수정] 홈페이지와 채팅 페이지를 ProtectedRoute로 감쌉니다. */}
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;