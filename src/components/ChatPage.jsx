// src/components/ChatPage.jsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import CustomLoader from './CustomLoader';
import ChatPageSkeleton from './ChatPageSkeleton';
import './ChatPage.css';

// --- 아이콘 SVG 컴포넌트들 (신규 아이콘 추가) ---
const MenuIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg> );
const CloseIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> );
const SendIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> );
const ImageIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg> );
const TrashIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> );
const PlusCircleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg> );
const ChatBubbleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> );
// --- 아이콘 SVG 정의 끝 ---


// [신규] 메시지 이미지 컴포넌트
const MessageImage = ({ src, alt }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    return (
        <div className="message-image-container">
            {!isLoaded && <div className="image-loading-placeholder"></div>}
            <img src={src} alt={alt} className={`message-image ${isLoaded ? 'loaded' : ''}`} onLoad={() => setIsLoaded(true)} />
        </div>
    );
};

const teacherLevels = [
  { id: 'beginner', name: '초급 (Beginner)' },
  { id: 'intermediate', name: '중급 (Intermediate)' },
  { id: 'advanced', name: '고급 (Advanced)' },
  { id: 'ielts', name: 'IELTS 전문가' },
];

const ChatPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // --- [핵심] 상태 관리 재구성 ---
  const [selectedLevel, setSelectedLevel] = useState(() => {
    const params = new URLSearchParams(location.search);
    return teacherLevels.find(t => t.id === params.get('level'))?.id || teacherLevels[0].id;
  });
  
  const [chatRooms, setChatRooms] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null); // 현재 활성화된 채팅방 ID
  const [messages, setMessages] = useState([]);
  
  // 로딩 상태 세분화
  const [isRoomsLoading, setIsRoomsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isAiReplying, setIsAiReplying] = useState(false);
  
  // UI 상태
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(null); // 삭제 확인할 채팅방 ID

  const chatMessagesRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- API 연동 로직 재구성 ---

  // 1. 레벨이 변경되면 해당 레벨의 채팅방 목록을 불러옵니다.
  useEffect(() => {
    if (!user || !selectedLevel) return;

    const fetchChatRooms = async () => {
      setIsRoomsLoading(true);
      setChatRooms([]);
      setActiveConversationId(null); // 방 목록 다시 부를때 활성화된 방 초기화
      setMessages([]);
      try {
        const response = await api.get(`/api/chat/rooms/${selectedLevel}`);
        setChatRooms(response.data);
      } catch (error) {
        console.error('Error fetching chat rooms:', error);
      } finally {
        setIsRoomsLoading(false);
      }
    };

    fetchChatRooms();
    // URL 쿼리 파라미터도 업데이트하여 새로고침 시 상태 유지
    navigate(`/chat?level=${selectedLevel}`, { replace: true });
  }, [selectedLevel, user, navigate]);

  // 2. 활성화된 채팅방 ID가 변경되면 해당 방의 대화 기록을 불러옵니다.
  useEffect(() => {
    if (!activeConversationId) {
        // 새 대화 시작 상태: 기본 안내 메시지 설정
        const firstMessage = {
            sender: 'ai',
            text: `안녕하세요, ${user?.name || '사용자'}님! 새로운 대화를 시작해 보세요.`,
            imageUrl: null
        };
        setMessages([firstMessage]);
        setIsHistoryLoading(false);
        return;
    }
    
    const fetchChatHistory = async () => {
        setIsHistoryLoading(true);
        setMessages([]);
        try {
            const response = await api.get(`/api/chat/history/${activeConversationId}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching chat history:', error);
            setMessages([{ sender: 'ai', text: '대화 기록을 불러오는 데 실패했습니다.' }]);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    fetchChatHistory();
  }, [activeConversationId, user?.name]);

  // 3. 메시지 목록이 업데이트될 때마다 스크롤을 맨 아래로 이동합니다.
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // --- 핸들러 함수 재구성 ---

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputValue.trim() && !selectedFile) || isAiReplying) return;

    const userMessage = { 
      sender: 'user', 
      text: inputValue,
      imageUrl: selectedFile ? URL.createObjectURL(selectedFile) : null 
    };
    // 새 대화일 경우, 첫 AI 메시지를 사용자 메시지로 대체
    if (!activeConversationId && messages.length === 1 && messages[0].sender === 'ai') {
        setMessages([userMessage]);
    } else {
        setMessages((prev) => [...prev, userMessage]);
    }
    
    const formData = new FormData();
    const chatRequest = {
        level: selectedLevel,
        conversationId: activeConversationId, // [핵심] 활성화된 채팅방 ID 전송
        message: inputValue
    };
    formData.append('request', new Blob([JSON.stringify(chatRequest)], { type: "application/json" }));

    if (selectedFile) formData.append('image', selectedFile);
    
    setInputValue('');
    setSelectedFile(null); 
    setIsAiReplying(true);

    try {
      const response = await api.post('/api/chat/send', formData);
      const { reply, conversationId: newConversationId } = response.data;
      const aiMessage = { sender: 'ai', text: reply, imageUrl: null };
      setMessages((prev) => [...prev, aiMessage]);

      // [핵심] 메시지 전송 후 상태 업데이트
      if (!activeConversationId) { 
        // 새 대화였을 경우
        setActiveConversationId(newConversationId); // 새로 받은 ID를 활성 ID로 설정
        // 채팅방 목록에 새 방 추가 (API 다시 부르지 않고 UI 즉시 업데이트)
        setChatRooms(prev => [{
            conversationId: newConversationId,
            lastMessage: inputValue.trim() || "이미지 전송",
            lastModifiedAt: new Date().toISOString()
        }, ...prev]);
      } else {
        // 기존 대화였을 경우, 해당 방을 목록 맨 위로 올리고 마지막 메시지 업데이트
        setChatRooms(prev => {
            const currentRoom = prev.find(r => r.conversationId === activeConversationId);
            const otherRooms = prev.filter(r => r.conversationId !== activeConversationId);
            if (currentRoom) {
                currentRoom.lastMessage = inputValue.trim() || "이미지 전송";
                currentRoom.lastModifiedAt = new Date().toISOString();
                return [currentRoom, ...otherRooms];
            }
            return prev;
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { sender: 'ai', text: '메시지 전송에 실패했습니다. 다시 시도해 주세요.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAiReplying(false);
    }
  };

  const handleLevelSelect = (levelId) => {
    if (levelId !== selectedLevel) {
      setSelectedLevel(levelId);
    }
    setIsSidebarOpen(false);
  };
  
  const handleRoomSelect = (conversationId) => {
    if (conversationId !== activeConversationId) {
        setActiveConversationId(conversationId);
    }
    setIsSidebarOpen(false);
  }

  const handleNewChat = () => {
    if (chatRooms.length >= 10) {
        alert("한 레벨 당 최대 10개의 채팅방만 만들 수 있습니다.");
        return;
    }
    setActiveConversationId(null); // 활성 ID를 null로 설정하여 '새 대화' 모드로 전환
    setIsSidebarOpen(false);
  }

  const handleDeleteRoom = async (conversationId) => {
    if (!conversationId) return;

    try {
        await api.delete(`/api/chat/room/${conversationId}`);
        // UI에서 즉시 해당 방 제거
        setChatRooms(prev => prev.filter(room => room.conversationId !== conversationId));
        
        // 삭제한 방이 현재 활성화된 방이었다면, 뷰를 초기 상태로 리셋
        if (activeConversationId === conversationId) {
            setActiveConversationId(null);
        }
    } catch (error) {
        console.error('Error deleting chat room:', error);
        alert('채팅방 삭제에 실패했습니다.');
    } finally {
        setConfirmingDelete(null); // 확인 모달 닫기
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) setSelectedFile(file);
    else setSelectedFile(null);
  };

  const isLoading = isRoomsLoading || isHistoryLoading;
  const currentLevelName = teacherLevels.find(t => t.id === selectedLevel)?.name || 'Teacher';

  return (
    <div className="chat-page-container">
      {/* [신규] 삭제 확인 모달 */}
      {confirmingDelete && (
        <div className="reset-confirm-overlay">
          <div className="reset-confirm-modal">
            <h4>채팅방 삭제</h4>
            <p>이 대화 기록을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
            <div className="reset-confirm-actions">
              <button onClick={() => setConfirmingDelete(null)} className="cancel-btn">취소</button>
              <button onClick={() => handleDeleteRoom(confirmingDelete)} className="confirm-btn">삭제</button>
            </div>
          </div>
        </div>
      )}

      {isSidebarOpen && <div className="overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* --- 사이드바 전면 개편 --- */}
      <aside className={`teacher-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-content-wrapper">
          {/* 레벨 선택 영역 */}
          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Teacher Level</h3>
            <div className="teacher-list">
              {teacherLevels.map((teacher) => (
                <button
                  key={teacher.id}
                  className={`teacher-button ${selectedLevel === teacher.id ? 'active' : ''}`}
                  onClick={() => handleLevelSelect(teacher.id)}
                  disabled={isLoading}
                >
                  {teacher.name}
                </button>
              ))}
            </div>
          </div>

          {/* 채팅방 목록 영역 */}
          <div className="sidebar-section room-list-section">
            <div className="sidebar-section-header">
                <h3 className="sidebar-section-title">Chat Rooms ({chatRooms.length}/10)</h3>
                <button 
                  className="new-chat-button" 
                  onClick={handleNewChat}
                  disabled={isLoading || chatRooms.length >= 10}
                  title="새 대화 시작"
                >
                    <PlusCircleIcon />
                </button>
            </div>
            <div className="room-list">
                {isRoomsLoading ? (
                    [...Array(3)].map((_, i) => <div key={i} className="room-item-skeleton" />)
                ) : chatRooms.length > 0 ? (
                    chatRooms.map(room => (
                        <div 
                            key={room.conversationId} 
                            className={`room-item ${activeConversationId === room.conversationId ? 'active' : ''}`}
                            onClick={() => handleRoomSelect(room.conversationId)}
                        >
                            <div className="room-item-content">
                                <span className="room-item-icon"><ChatBubbleIcon/></span>
                                <p className="room-item-text">{room.lastMessage}</p>
                            </div>
                            <button className="room-delete-button" onClick={(e) => {
                                e.stopPropagation();
                                setConfirmingDelete(room.conversationId);
                            }}>
                                <TrashIcon/>
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="no-rooms-placeholder">
                        <p>대화방이 없습니다.</p>
                        <p>새 대화를 시작해보세요!</p>
                    </div>
                )}
            </div>
          </div>
        </div>
      </aside>
      
      {/* --- 메인 채팅창 --- */}
      <main className={`chat-main chat-level-${selectedLevel}`}>
        <header className="chat-header">
          <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)}><MenuIcon /></button>
          <div className="chat-header-title">
            <span className="teacher-avatar">{currentLevelName.charAt(0)}</span>
            <span>{currentLevelName}</span>
          </div>
        </header>

        {activeConversationId === undefined || activeConversationId === null && chatRooms.length > 0 ? (
            <div className="chat-placeholder">
                <ChatBubbleIcon/>
                <h3>대화를 시작해 보세요</h3>
                <p>왼쪽 사이드바에서 채팅방을 선택하거나<br/>새로운 대화를 시작해 주세요.</p>
            </div>
        ) : (
          <>
            <div className="chat-messages" ref={chatMessagesRef}>
              {isHistoryLoading ? (
                <ChatPageSkeleton />
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`message-bubble ${msg.sender}`}>
                    {msg.imageUrl && <MessageImage src={msg.imageUrl} alt="uploaded" />}
                    {msg.text && <p>{msg.text}</p>}
                  </div>
                ))
              )}
              {isAiReplying && (
                <div className="message-bubble ai"><div className="typing-indicator"><span></span><span></span><span></span></div></div>
              )}
            </div>

            <form className="chat-input-form" onSubmit={handleSendMessage}>
              {selectedFile && (
                <div className="image-preview-container">
                  <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="image-preview" />
                  <button type="button" onClick={() => setSelectedFile(null)} className="remove-image-button"><CloseIcon /></button>
                </div>
              )}
              <div className="input-controls">
                <button type="button" className="attach-file-button" onClick={() => fileInputRef.current.click()} disabled={isAiReplying || !!selectedFile}><ImageIcon /></button>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept="image/*"/>
                <div className="input-wrapper">
                  <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="메시지를 입력하세요..." disabled={isAiReplying} />
                </div>
                <button type="submit" disabled={(!inputValue.trim() && !selectedFile) || isAiReplying}><SendIcon /></button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
};

export default ChatPage;