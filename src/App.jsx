// App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavigationBar from './components/NavigationBar';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import AuthCallback from './components/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import ChatPage from './components/ChatPage';
import LearningPage from './components/LearningPage';
import LevelGuidePage from './components/LevelGuidePage'; // [추가] LevelGuidePage 임포트
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NavigationBar />
        
        <div className="main-content">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            <Route path="/" element={<HomePage />} />
            
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/learning" element={<ProtectedRoute><LearningPage /></ProtectedRoute>} />
            
            {/* --- [핵심 추가] --- */}
            {/* LevelGuidePage 경로 추가, 로그인이 필요 없는 공개 경로 */}
            <Route path="/level-guide" element={<LevelGuidePage />} />
            {/* -------------------- */}
            
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;