import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import NavigationBar from './components/NavigationBar';
import HomePage from './components/HomePage';
import AuthCallback from './components/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import LevelGuidePage from './components/LevelGuidePage';
import LoginModal from './components/LoginModal';
import LoginTriggerPage from './components/LoginTriggerPage';
import './App.css';

const ChatPage = React.lazy(() => import('./components/ChatPage'));
const LearningPage = React.lazy(() => import('./components/LearningPage'));
const VocabularyPage = React.lazy(() => import('./components/VocabularyPage'));

function AppContent() {
  const { isLoginModalOpen, closeLoginModal } = useAuth();

  return (
    <div className="app-container">
      <NavigationBar />
      <Suspense fallback={<div className="main-content"><div style={{ paddingTop: '50px', textAlign: 'center' }}>Loading page...</div></div>}>
        <div className="main-content">
          <Routes>
            <Route path="/login" element={<LoginTriggerPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/chat/:level" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/learning" element={<ProtectedRoute><LearningPage /></ProtectedRoute>} />
            <Route path="/learning/:level" element={<ProtectedRoute><LearningPage /></ProtectedRoute>} />
            <Route path="/level-guide" element={<LevelGuidePage />} />
            <Route path="/vocabulary" element={<ProtectedRoute><VocabularyPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </Suspense>
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
