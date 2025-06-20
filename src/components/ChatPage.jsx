// src/components/ChatPage.jsx

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api'; // 백엔드와 통신할 axios 인스턴스
import './ChatPage.css'; // 채팅 페이지 스타일

// 선생님 레벨 정의
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

  // 시작 메시지 설정
  useEffect(() => {
    const teacherName = teacherLevels.find(t => t.id === selectedTeacher)?.name;
    setMessages([
      {
        sender: 'ai',
        text: `Hello, ${user.name}! I'm your ${teacherName}. How can I help you practice English today?`,
      },
    ]);
  }, [selectedTeacher, user.name]);

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

  return (
    <div className="chat-page-container">
      <aside className="teacher-sidebar">
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