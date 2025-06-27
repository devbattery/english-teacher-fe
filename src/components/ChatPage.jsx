// src/components/ChatPage.jsx

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './ChatPage.css';

// 아이콘 SVG 컴포넌트
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
  // 2가지 로딩 상태를 관리:
  // 1. isHistoryLoading: 페이지/선생님 첫 로딩
  // 2. isAiReplying: AI 응답을 기다리는 중
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(teacherLevels[0].id);
  const chatEndRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // [핵심] 선생님(level) 또는 유저가 변경될 때마다 채팅 내역을 다시 불러옴
  useEffect(() => {
    if (!user || !selectedTeacher) return;

    const fetchChatHistory = async () => {
      setIsHistoryLoading(true);
      setMessages([]); // 이전 선생님의 메시지를 지워 깔끔하게 시작
      try {
        const response = await api.get(`/api/chat/history/${selectedTeacher}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching chat history:', error);
        setMessages([{ sender: 'ai', text: 'Sorry, I could not load our previous conversation. Please try again.' }]);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    fetchChatHistory();
  }, [selectedTeacher, user]); // user나 selectedTeacher가 바뀔 때마다 재실행

  // 메시지 목록이 업데이트될 때마다 자동으로 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isAiReplying || isHistoryLoading) return;

    const userMessage = { sender: 'user', text: inputValue };
    // 낙관적 업데이트: 서버 응답 전에 사용자 메시지를 화면에 먼저 보여줌
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsAiReplying(true);

    try {
      const response = await api.post('/api/chat/send', { 
        level: selectedTeacher, 
        message: inputValue 
      });
      const aiMessage = { sender: 'ai', text: response.data.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { sender: 'ai', text: 'Sorry, something went wrong. Please try again.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAiReplying(false);
    }
  };
  
  const handleTeacherSelect = (teacherId) => {
    if (teacherId !== selectedTeacher) {
      setSelectedTeacher(teacherId);
    }
    setIsSidebarOpen(false); // 선생님 선택 시 사이드바 닫기
  };

  if (!user) {
    return <div>Loading user information...</div>;
  }

  return (
    <div className="chat-page-container">
      {isSidebarOpen && <div className="overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      <aside className={`teacher-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Your Teacher</h3>
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
              onClick={() => handleTeacherSelect(teacher.id)}
              disabled={isHistoryLoading} // 다른 선생님 내역 로딩 중에는 클릭 방지
            >
              {teacher.name}
            </button>
          ))}
        </div>
      </aside>
      
      <main className="chat-main">
        <header className="chat-header">
          <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)}>
            <MenuIcon />
          </button>
          <div className="chat-header-title">
            {teacherLevels.find(t => t.id === selectedTeacher)?.name || 'Teacher'}
          </div>
        </header>

        <div className="chat-messages">
          {/* 히스토리 로딩 중일 때 표시 */}
          {isHistoryLoading && (
             <div className="message-bubble ai"><div className="typing-indicator"><span></span><span></span><span></span></div></div>
          )}

          {/* 히스토리 로딩 완료 후 메시지 렌더링 */}
          {!isHistoryLoading && messages.map((msg, index) => (
            <div key={index} className={`message-bubble ${msg.sender}`}><p>{msg.text}</p></div>
          ))}

          {/* AI가 응답 중일 때 타이핑 인디케이터 표시 */}
          {isAiReplying && (
            <div className="message-bubble ai"><div className="typing-indicator"><span></span><span></span><span></span></div></div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input 
            type="text" 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            placeholder="Type your message in English..." 
            // 히스토리 로딩 중이거나, AI가 응답 중일 때 입력창 비활성화
            disabled={isHistoryLoading || isAiReplying} 
          />
          <button type="submit" disabled={isHistoryLoading || isAiReplying}>Send</button>
        </form>
      </main>
    </div>
  );
};

export default ChatPage;