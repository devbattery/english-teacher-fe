// App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import NavigationBar from './components/NavigationBar';
import HomePage from './components/HomePage';
// import LoginPage from './components/LoginPage'; // 삭제
import AuthCallback from './components/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import ChatPage from './components/ChatPage';
import LearningPage from './components/LearningPage';
import LevelGuidePage from './components/LevelGuidePage';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal'; // 추가
import './App.css';

// AppContent 컴포넌트를 분리하여 useAuth를 안전하게 사용
function AppContent() {
  const { isLoginModalOpen, closeLoginModal } = useAuth();

  return (
    <div className="app-container">
      <NavigationBar />
      
      <div className="main-content">
        <Routes>
          {/* <Route path="/login" element={<LoginPage />} />  <- 삭제 */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          <Route path="/" element={<HomePage />} />
          
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/chat/:level" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/learning" element={<ProtectedRoute><LearningPage /></ProtectedRoute>} />
          <Route path="/learning/:level" element={<ProtectedRoute><LearningPage /></ProtectedRoute>} />
          
          <Route path="/level-guide" element={<LevelGuidePage />} />
        </Routes>
      </div>
      <Footer />
      {/* 모달 렌더링 */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </div>
  );
}

// 최상위 App 컴포넌트에서는 AuthProvider만 렌더링
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;