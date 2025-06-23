// App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import AuthCallback from './components/AuthCallback';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ChatPage from './components/ChatPage';
import NavigationBar from './components/NavigationBar'; // [추가] NavigationBar 임포트
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* [추가] NavigationBar는 Routes 바깥에 위치하여 모든 페이지에 표시됩니다. */}
        <NavigationBar />
        
        {/* [추가] main-content 클래스를 추가하여 네비게이션 바 아래에 콘텐츠가 오도록 합니다. */}
        <div className="main-content">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;