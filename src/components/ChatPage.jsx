// src/components/ChatPage.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './ChatPage.css';

// 아이콘 SVG 컴포넌트들
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const ResetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

// [신규] 이미지 업로드 아이콘 (Feather Icons: paperclip)
const PaperclipIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
    </svg>
);


const teacherLevels = [
  { id: 'beginner', name: '초급 (Beginner)' },
  { id: 'intermediate', name: '중급 (Intermediate)' },
  { id: 'advanced', name: '고급 (Advanced)' },
  { id: 'ielts', name: 'IELTS 전문가' },
];

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(teacherLevels[0].id);
  const chatEndRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // [신규] 선택된 이미지 파일 상태
  const fileInputRef = useRef(null); // [신규] 숨겨진 file input 참조

  useEffect(() => {
    if (!user || !selectedTeacher) return;

    const fetchChatHistory = async () => {
      setIsHistoryLoading(true);
      setMessages([]);
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
  }, [selectedTeacher, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputValue.trim() && !selectedFile) || isAiReplying || isHistoryLoading) return;

    // 사용자 메시지 객체에 이미지 미리보기 URL 추가
    const userMessage = { 
      sender: 'user', 
      text: inputValue,
      imageUrl: selectedFile ? URL.createObjectURL(selectedFile) : null 
    };
    setMessages((prev) => [...prev, userMessage]);
    
    // FormData를 사용하여 텍스트와 이미지 함께 전송
    const formData = new FormData();
    
    const chatRequest = {
        level: selectedTeacher,
        message: inputValue
    };
    formData.append('request', new Blob([JSON.stringify(chatRequest)], { type: "application/json" }));

    if (selectedFile) {
        formData.append('image', selectedFile);
    }
    
    setInputValue('');
    setSelectedFile(null); // 전송 후 파일 선택 초기화
    setIsAiReplying(true);

    try {
      const response = await api.post('/api/chat/send', formData);
      const aiMessage = { sender: 'ai', text: response.data.reply, imageUrl: null };
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
    setIsSidebarOpen(false);
  };

  const handleResetChat = async () => {
    const teacherName = teacherLevels.find(t => t.id === selectedTeacher)?.name || '이 선생님';
    if (!window.confirm(`'${teacherName}' 선생님과의 대화 기록을 모두 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
        return;
    }

    try {
        await api.delete(`/api/chat/history/${selectedTeacher}`);
        setIsHistoryLoading(true);
        setMessages([]);

        const response = await api.get(`/api/chat/history/${selectedTeacher}`);
        setMessages(response.data);

    } catch (error) {
        console.error('Error resetting chat history:', error);
        alert('채팅 기록을 초기화하는 데 실패했습니다. 다시 시도해 주세요.');
    } finally {
        setIsHistoryLoading(false);
    }
  };

  const handleFileSelectClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        setSelectedFile(file);
    } else {
        setSelectedFile(null);
        // 사용자에게 이미지 파일만 업로드 가능하다는 알림을 줄 수 있습니다.
        // alert("Please select an image file (e.g., png, jpg, gif).");
    }
  };

  if (!user) {
    return <div>Loading user information...</div>;
  }

  return (
    <div className="chat-page-container">
      {isSidebarOpen && <div className="overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      <aside className={`teacher-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Your AI Teachers</h3>
          <button className="sidebar-close-button" onClick={() => setIsSidebarOpen(false)}>
            <CloseIcon />
          </button>
        </div>
        
        <div className="sidebar-user-profile">
          <img src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name}&background=random`} alt={user?.name} className="profile-pic" />
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
          </div>
        </div>
        
        <p className="sidebar-instruction">학습 목표에 따라 AI 선생님을 선택하세요!</p>
        
        <div className="page-guide-link-wrapper">
          <Link to="/level-guide" className="page-guide-link">
            레벨 가이드 보기 👈
          </Link>
        </div>

        <div className="teacher-list">
          {teacherLevels.map((teacher) => (
            <button
              key={teacher.id}
              className={`teacher-button ${selectedTeacher === teacher.id ? 'active' : ''}`}
              onClick={() => handleTeacherSelect(teacher.id)}
              disabled={isHistoryLoading}
            >
              {teacher.name}
            </button>
          ))}
        </div>
      </aside>
      
      <main className={`chat-main chat-level-${selectedTeacher}`}>
        <header className="chat-header">
          <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)}>
            <MenuIcon />
          </button>
          <div className="chat-header-title">
            <span className="teacher-avatar">{teacherLevels.find(t => t.id === selectedTeacher)?.name.charAt(0)}</span>
            <span>{teacherLevels.find(t => t.id === selectedTeacher)?.name || 'Teacher'}</span>
          </div>
          <button
              className="chat-reset-button"
              onClick={handleResetChat}
              title="대화 내용 초기화"
              disabled={isHistoryLoading || isAiReplying}
          >
              <ResetIcon />
          </button>
        </header>

        <div className="chat-messages">
          {isHistoryLoading && (
             <div className="message-bubble ai"><div className="typing-indicator"><span></span><span></span><span></span></div></div>
          )}

          {!isHistoryLoading && messages.map((msg, index) => (
            <div key={index} className={`message-bubble ${msg.sender}`}>
              {msg.imageUrl && (
                <img src={msg.imageUrl} alt="uploaded content" className="message-image" />
              )}
              {msg.text && <p>{msg.text}</p>}
            </div>
          ))}

          {isAiReplying && (
            <div className="message-bubble ai"><div className="typing-indicator"><span></span><span></span><span></span></div></div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          {selectedFile && (
            <div className="image-preview-container">
              <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="image-preview" />
              <button type="button" onClick={() => setSelectedFile(null)} className="remove-image-button">
                <CloseIcon />
              </button>
            </div>
          )}
          <div className="input-controls">
            <button type="button" className="attach-file-button" onClick={handleFileSelectClick} disabled={isHistoryLoading || isAiReplying || !!selectedFile}>
              <PaperclipIcon />
            </button>
            <input 
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/gif, image/webp"
            />
            <div className="input-wrapper">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message or upload an image..."
                disabled={isHistoryLoading || isAiReplying}
              />
            </div>
            <button type="submit" disabled={(!inputValue.trim() && !selectedFile) || isHistoryLoading || isAiReplying}>
              <SendIcon />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ChatPage;