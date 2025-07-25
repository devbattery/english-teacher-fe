// src/components/ChatPage.jsx

import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import CustomLoader from './CustomLoader';
import ChatPageSkeleton from './ChatPageSkeleton';
import ChatRoomSelection from './ChatRoomSelection';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ChatPage.css';
import { levelData } from '../data/levelData';

// --- 아이콘 컴포넌트들 ---
const MenuIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg> );
const CloseIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> );
const SendIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> );
const ImageIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg> );
const TrashIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> );
const PlusCircleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg> );
const ChatBubbleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> );

const MessageImage = ({ src, alt }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    return ( <div className="message-image-container">{!isLoaded && <div className="image-loading-placeholder"></div>}<img src={src} alt={alt} className={`message-image ${isLoaded ? 'loaded' : ''}`} onLoad={() => setIsLoaded(true)} /></div> );
};

const teacherLevels = levelData.map(level => ({ id: level.id, name: level.name }));


const ChatPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedLevel, setSelectedLevel] = useState(() => new URLSearchParams(location.search).get('level') || teacherLevels[0].id);
  const [chatRooms, setChatRooms] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isRoomsLoading, setIsRoomsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(null);

  const chatMessagesRef = useRef(null);
  const fileInputRef = useRef(null);
  const isInitialLoad = useRef(false);
  const isNewRoomFlow = useRef(false);

  useEffect(() => {
    if (!user || !selectedLevel) return;
    const fetchChatRooms = async () => {
      setIsRoomsLoading(true);
      setActiveConversationId(null);
      setMessages([]);
      try {
        const response = await api.get(`/api/chat/rooms/${selectedLevel}`);
        setChatRooms(response.data);
      } catch (error) { console.error('Error fetching chat rooms:', error); } 
      finally { setIsRoomsLoading(false); }
    };
    fetchChatRooms();
    navigate(`/chat?level=${selectedLevel}`, { replace: true });
  }, [selectedLevel, user, navigate]);

  useEffect(() => {
    if (!activeConversationId) {
        setMessages([]);
        setIsHistoryLoading(false);
        return;
    }

    if (isNewRoomFlow.current) {
        isNewRoomFlow.current = false; 
        return;
    }

    const fetchChatHistory = async () => {
        setIsHistoryLoading(true);
        setMessages([]);
        isInitialLoad.current = true;
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
  }, [activeConversationId]);

  useEffect(() => {
    if (chatMessagesRef.current) {
      const scrollBehavior = isInitialLoad.current ? 'auto' : 'smooth';
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: scrollBehavior
      });
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
      }
    }
  }, [messages]);

  const sendTextMessageAndGetResponse = async (messageText, convId, isOptimisticUpdate = false) => {
    if (!isOptimisticUpdate) {
      const userMessage = { sender: 'user', text: messageText, imageUrl: null };
      setMessages((prev) => [...prev, userMessage]);
    }
    setIsAiReplying(true);
    const formData = new FormData();
    const chatRequest = { level: selectedLevel, conversationId: convId, message: messageText };
    formData.append('request', new Blob([JSON.stringify(chatRequest)], { type: "application/json" }));
    try {
      const response = await api.post('/api/chat/send', formData);
      const aiMessage = { sender: 'ai', text: response.data.reply, imageUrl: null };
      setMessages((prev) => [...prev, aiMessage]);
      setChatRooms(prev => {
          const currentRoom = prev.find(r => r.conversationId === convId);
          const otherRooms = prev.filter(r => r.conversationId !== convId);
          if (currentRoom) {
              currentRoom.lastMessage = messageText.trim();
              currentRoom.lastModifiedAt = new Date().toISOString();
              return [currentRoom, ...otherRooms];
          }
          return prev;
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [...prev, { sender: 'ai', text: '메시지 전송에 실패했습니다.' }]);
    } finally {
      setIsAiReplying(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if ((!inputValue.trim() && !selectedFile) || isAiReplying || !activeConversationId) return;

    const messageToSend = inputValue;
    const imageToSend = selectedFile;
    const userMessage = { 
        sender: 'user', 
        text: messageToSend, 
        imageUrl: imageToSend ? URL.createObjectURL(imageToSend) : null 
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSelectedFile(null);
    setIsAiReplying(true);
    const formData = new FormData();
    const chatRequest = { level: selectedLevel, conversationId: activeConversationId, message: messageToSend };
    formData.append('request', new Blob([JSON.stringify(chatRequest)], { type: "application/json" }));
    if (imageToSend) formData.append('image', imageToSend);

    try {
      const response = await api.post('/api/chat/send', formData);
      const aiMessage = { sender: 'ai', text: response.data.reply, imageUrl: null };
      setMessages((prev) => [...prev, aiMessage]);
      setChatRooms(prev => {
          const currentRoom = prev.find(r => r.conversationId === activeConversationId);
          const otherRooms = prev.filter(r => r.conversationId !== activeConversationId);
          if (currentRoom) {
              currentRoom.lastMessage = messageToSend.trim() || "이미지 전송";
              currentRoom.lastModifiedAt = new Date().toISOString();
              return [currentRoom, ...otherRooms];
          }
          return prev;
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [...prev, { sender: 'ai', text: '메시지 전송에 실패했습니다. 다시 시도해 주세요.' }]);
    } finally {
      setIsAiReplying(false);
    }
  };

  const handleLevelSelect = (levelId) => {
    if (levelId !== selectedLevel) setSelectedLevel(levelId);
    setIsSidebarOpen(false);
  };
  
  const handleRoomSelect = (conversationId) => {
    if (conversationId !== activeConversationId) setActiveConversationId(conversationId);
    setIsSidebarOpen(false);
  }

  const handleNewChat = async () => {
    if (isCreatingRoom || chatRooms.length >= 10) {
        if(chatRooms.length >= 10) alert("한 레벨 당 최대 10개의 채팅방만 만들 수 있습니다.");
        return null;
    }
    setIsCreatingRoom(true);
    try {
        const response = await api.post('/api/chat/rooms', { level: selectedLevel });
        const newRoom = response.data;
        setChatRooms(prev => [newRoom, ...prev]);
        setActiveConversationId(newRoom.conversationId);
        setIsSidebarOpen(false);
        return newRoom;
    } catch (error) {
        console.error('Error creating new chat room:', error);
        alert('새로운 대화방을 만드는 데 실패했습니다.');
        return null;
    } finally {
        setIsCreatingRoom(false);
    }
  };

  const handleRecommendationClick = async (prompt) => {
    if(isCreatingRoom) return;
    isNewRoomFlow.current = true;
    const newRoom = await handleNewChat();
    if (newRoom && newRoom.conversationId) {
      setMessages([{ sender: 'user', text: prompt, imageUrl: null }]);
      await sendTextMessageAndGetResponse(prompt, newRoom.conversationId, true);
    } else {
      isNewRoomFlow.current = false;
    }
  };

  const handleDeleteRoom = async (conversationId) => {
    if (!conversationId) return;
    setIsDeleting(true);
    try {
        await api.delete(`/api/chat/room/${conversationId}`);
        setChatRooms(prev => prev.filter(room => room.conversationId !== conversationId));
        if (activeConversationId === conversationId) setActiveConversationId(null);
    } catch (error) {
        console.error('Error deleting chat room:', error);
        alert('채팅방 삭제에 실패했습니다.');
    } finally { 
      setIsDeleting(false);
      setConfirmingDelete(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) setSelectedFile(file);
    else setSelectedFile(null);
  };

  const isLoading = isRoomsLoading || isHistoryLoading;
  const currentLevelData = levelData.find(t => t.id === selectedLevel) || {};
  const currentLevelName = currentLevelData.name || 'Teacher';

  return (
    <div className="chat-page-container">
      {confirmingDelete && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-content">
            {isDeleting ? (
              <CustomLoader message="채팅방을 삭제하고 있습니다..." />
            ) : (
              <>
                <h4>채팅방 삭제</h4>
                <p>정말로 삭제하시겠습니까?</p>
                <div className="delete-modal-buttons">
                  <button onClick={() => setConfirmingDelete(null)} className="cancel-button">
                    취소
                  </button>
                  <button onClick={() => handleDeleteRoom(confirmingDelete)} className="delete-button">
                    삭제
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {isSidebarOpen && <div className="overlay" onClick={() => setIsSidebarOpen(false)}></div>}
      <aside className={`teacher-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-content-wrapper">
          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Teacher Level</h3>
            <div className="teacher-list">
              {teacherLevels.map((teacher) => (
                <button key={teacher.id} className={`teacher-button ${selectedLevel === teacher.id ? 'active' : ''}`} onClick={() => handleLevelSelect(teacher.id)} disabled={isLoading || isCreatingRoom}>{teacher.name}</button>
              ))}
            </div>
          </div>
          <div className="sidebar-section room-list-section">
            <div className="sidebar-section-header">
                <h3 className="sidebar-section-title">Chat Rooms ({chatRooms.length}/10)</h3>
                <button className={`new-chat-button ${isCreatingRoom ? 'creating' : ''}`} onClick={handleNewChat} disabled={isLoading || isCreatingRoom || chatRooms.length >= 10} title="새 대화 시작"><PlusCircleIcon /></button>
            </div>
            <div className="room-list">
                {isRoomsLoading ? (
                    [...Array(3)].map((_, i) => <div key={i} className="room-item-skeleton" />)
                ) : chatRooms.length > 0 ? (
                    chatRooms.map(room => (
                        <div key={room.conversationId} className={`room-item ${activeConversationId === room.conversationId ? 'active' : ''}`} onClick={() => handleRoomSelect(room.conversationId)}>
                            <div className="room-item-content"><span className="room-item-icon"><ChatBubbleIcon/></span><p className="room-item-text">{room.lastMessage}</p></div>
                            <button className="room-delete-button" onClick={(e) => { e.stopPropagation(); setConfirmingDelete(room.conversationId); }}><TrashIcon/></button>
                        </div>
                    ))
                ) : (
                    <div className="no-rooms-placeholder"><p>대화방이 없습니다.</p><p>새 대화를 시작해보세요!</p></div>
                )}
            </div>
          </div>
        </div>
      </aside>

      <main className={`chat-main chat-level-${selectedLevel}`}>
        <header className="chat-header">
          <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)}><MenuIcon /></button>
          <div className="chat-header-title"><span className="teacher-avatar">{currentLevelName.charAt(0)}</span><span>{currentLevelName}</span></div>
        </header>

        {!activeConversationId ? (
            <ChatRoomSelection
              levelName={currentLevelName}
              rooms={chatRooms}
              isLoading={isRoomsLoading}
              isCreating={isCreatingRoom}
              onRoomSelect={handleRoomSelect}
              onNewChat={handleNewChat}
              recommendations={currentLevelData.recommendations}
              onRecommendationClick={handleRecommendationClick}
            />
        ) : (
          <>
            <div className="chat-messages" ref={chatMessagesRef}>
              {isHistoryLoading ? <ChatPageSkeleton /> : messages.map((msg, index) => (
                <div key={index} className={`message-wrapper ${msg.sender}`}>
                  {msg.sender === 'ai' && (
                    <div className="message-avatar">{currentLevelName.charAt(0)}</div>
                  )}
                  <div className={`message-bubble ${msg.sender}`}>
                    {msg.imageUrl && <MessageImage src={msg.imageUrl} alt="uploaded" />}
                    {msg.text && (
                        <div className="markdown-content">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.sender === 'user' ? msg.text.replace(/\n/g, '  \n') : msg.text}
                            </ReactMarkdown>
                        </div>
                    )}
                  </div>
                </div>
              ))}
              {isAiReplying && (
                <div className="message-wrapper ai">
                  <div className="message-avatar">{currentLevelName.charAt(0)}</div>
                  <div className="message-bubble ai">
                    <div className="typing-indicator"><span></span><span></span><span></span></div>
                  </div>
                </div>
              )}
            </div>
            <form className="chat-input-form" onSubmit={handleFormSubmit}>
              {selectedFile && (<div className="image-preview-container"><img src={URL.createObjectURL(selectedFile)} alt="Preview" className="image-preview" /><button type="button" onClick={() => setSelectedFile(null)} className="remove-image-button"><CloseIcon /></button></div>)}
              <div className="input-controls">
                <button type="button" className="attach-file-button" onClick={() => fileInputRef.current.click()} disabled={isAiReplying || !!selectedFile}><ImageIcon /></button>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept="image/*"/>
                <div className="input-wrapper"><input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="메시지를 입력하세요..." disabled={isAiReplying} /></div>
                <button type="submit" disabled={(!inputValue.trim() && !selectedFile) || isAiReplying || !activeConversationId}><SendIcon /></button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
};

export default ChatPage;