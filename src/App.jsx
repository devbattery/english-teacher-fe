// App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import NavigationBar from './components/NavigationBar';
import HomePage from './components/HomePage';
import AuthCallback from './components/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import ChatPage from './components/ChatPage';
import LearningPage from './components/LearningPage';
import LevelGuidePage from './components/LevelGuidePage';
import LoginModal from './components/LoginModal';
import LoginTriggerPage from './components/LoginTriggerPage'; // [추가] 새로 만든 컴포넌트 임포트
import './App.css';

// AppContent 컴포넌트는 이전과 동일합니다.
function AppContent() {
  const { isLoginModalOpen, closeLoginModal } = useAuth();

  return (
    <div className="app-container">
      <NavigationBar />
      
      <div className="main-content">
        <Routes>
          {/* ▼▼▼ [핵심 수정] ▼▼▼ */}
          {/* /login 경로를 다시 추가하고 LoginTriggerPage를 연결합니다. */}
          <Route path="/login" element={<LoginTriggerPage />} />
          {/* ▲▲▲ [핵심 수정] ▲▲▲ */}

          <Route path="/auth/callback" element={<AuthCallback />} />
          
          <Route path="/" element={<HomePage />} />
          
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/chat/:level" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/learning" element={<ProtectedRoute><LearningPage /></ProtectedRoute>} />
          <Route path="/learning/:level" element={<ProtectedRoute><LearningPage /></ProtectedRoute>} />
          
          <Route path="/level-guide" element={<LevelGuidePage />} />
        </Routes>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </div>
  );
}

// App 컴포넌트는 이전과 동일합니다.
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;