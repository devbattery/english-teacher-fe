import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './ChatPage.css';
import { Link } from 'react-router-dom'; // Link 임포트

// 선생님 레벨 정의
const teacherLevels = [
  { id: 'beginner', name: '초급 선생님' },
  { id: 'intermediate', name: '중급 선생님' },
  { id: 'advanced', name: '고급 선생님' },
  { id: 'ielts', name: 'IELTS 전문가' },
];

// 홈 아이콘 SVG
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(teacherLevels[0].id);
  const chatEndRef = useRef(null);

  // 시작 메시지 설정
  useEffect(() => {
    if (user) {
        const teacherName = teacherLevels.find(t => t.id === selectedTeacher)?.name || 'Teacher';
        setMessages([
          {
            sender: 'ai',
            text: `Hello, ${user.name}! I'm your ${teacherName}. How can I help you practice English today?`,
          },
        ]);
    }
  }, [selectedTeacher, user]);

  // 메시지 목록이 업데이트될 때마다 맨 아래로 스크롤
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
      // 백엔드의 채팅 API 엔드포인트로 요청 전송
      const response = await api.post('/api/chat/send', {
        level: selectedTeacher,
        message: inputValue,
      });

      const aiMessage = { sender: 'ai', text: response.data.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        sender: 'ai',
        text: 'Sorry, something went wrong. Please try again.',
      };
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
      <aside className="teacher-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="home-link">
            <HomeIcon />
            <span>Home</span>
          </Link>
        </div>
        <h3>Your Teacher</h3>
        <p>Select a teacher that matches your learning goals.</p>
        <div className="teacher-list">
          {teacherLevels.map((teacher) => (
            <button
              key={teacher.id}
              className={`teacher-button ${selectedTeacher === teacher.id ? 'active' : ''}`}
              onClick={() => setSelectedTeacher(teacher.id)}
            >
              {teacher.name}
            </button>
          ))}
        </div>
      </aside>
      <main className="chat-main">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message-bubble ${msg.sender}`}>
              <p>{msg.text}</p>
            </div>
          ))}
          {isLoading && (
            <div className="message-bubble ai">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message in English..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            Send
          </button>
        </form>
      </main>
    </div>
  );
};

export default ChatPage;