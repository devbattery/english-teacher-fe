// App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import AuthCallback from './components/AuthCallback';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ChatPage from './components/ChatPage';
import NavigationBar from './components/NavigationBar';
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
            
            {/* [핵심 수정] HomePage는 이제 모든 사용자가 접근할 수 있습니다. */}
            <Route path="/" element={<HomePage />} />
            
            {/* [유지] ChatPage는 여전히 로그인이 필요한 보호된 경로입니다. */}
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;