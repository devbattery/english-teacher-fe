// src/components/ChatPage.jsx

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './ChatPage.css';

// 아이콘 SVG 컴포넌트 추가
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);


const teacherLevels = [
  { id: 'beginner', name: '초급 선생님' },
  { id: 'intermediate', name: '중급 선생님' },
  { id: 'advanced', name: '고급 선생님' },
  { id: 'ielts', name: 'IELTS 전문가' },
];

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(teacherLevels[0].id);
  const chatEndRef = useRef(null);

  // [추가] 모바일 사이드바 표시 상태를 관리
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 시작 메시지 설정
  useEffect(() => {
    if (user) {
      const teacherName = teacherLevels.find(t => t.id === selectedTeacher)?.name || 'Teacher';
      setMessages([
        { sender: 'ai', text: `Hello, ${user.name}! I'm your ${teacherName}. How can I help you practice English today?` },
      ]);
    }
  }, [selectedTeacher, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await api.post('/api/chat/send', { level: selectedTeacher, message: inputValue });
      const aiMessage = { sender: 'ai', text: response.data.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { sender: 'ai', text: 'Sorry, something went wrong. Please try again.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading user...</div>;
  }

  return (
    <div className="chat-page-container">
      {/* [추가] 사이드바가 열렸을 때 어두운 배경 오버레이 */}
      {isSidebarOpen && <div className="overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* [수정] 사이드바에 'open' 클래스를 조건부로 추가 */}
      <aside className={`teacher-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Your Teacher</h3>
           {/* [추가] 모바일용 닫기 버튼 */}
          <button className="sidebar-close-button" onClick={() => setIsSidebarOpen(false)}>
            <CloseIcon />
          </button>
        </div>
        <p>Select a teacher that matches your learning goals.</p>
        <div className="teacher-list">
          {teacherLevels.map((teacher) => (
            <button
              key={teacher.id}
              className={`teacher-button ${selectedTeacher === teacher.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedTeacher(teacher.id);
                setIsSidebarOpen(false); // 선생님 선택 시 사이드바 닫기
              }}
            >
              {teacher.name}
            </button>
          ))}
        </div>
      </aside>
      
      <main className="chat-main">
        {/* [추가] 모바일용 헤더와 메뉴 버튼 */}
        <header className="chat-header">
          <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)}>
            <MenuIcon />
          </button>
          <div className="chat-header-title">
            {teacherLevels.find(t => t.id === selectedTeacher)?.name || 'Teacher'}
          </div>
        </header>

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message-bubble ${msg.sender}`}><p>{msg.text}</p></div>
          ))}
          {isLoading && (
            <div className="message-bubble ai"><div className="typing-indicator"><span></span><span></span><span></span></div></div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Type your message in English..." disabled={isLoading} />
          <button type="submit" disabled={isLoading}>Send</button>
        </form>
      </main>
    </div>
  );
};

export default ChatPage;