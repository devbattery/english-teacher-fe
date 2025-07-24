// src/components/ChatRoomSelection.jsx

import React from 'react';
import './ChatPage.css';

// 아이콘 정의
const PlusCircleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg> );
const ChatBubbleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> );

// [핵심] 안전한 날짜 포매팅 함수
const formatDate = (dateString) => {
  // 1. dateString이 null, undefined, 빈 문자열 등 falsy 값이면 대체 텍스트를 반환
  if (!dateString) {
    return '날짜 정보 없음';
  }

  const date = new Date(dateString);
  
  // 2. new Date()로 변환한 결과가 유효하지 않은 날짜(Invalid Date)인지 확인
  // isNaN(date.getTime()) 은 "Invalid Date"를 감지하는 가장 확실한 방법입니다.
  if (isNaN(date.getTime())) {
    return '유효하지 않은 날짜';
  }

  // 3. 유효한 경우에만 원하는 형식으로 포매팅하여 반환
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }); // 예: "2023년 10월 27일"
};

const ChatRoomSelection = ({ levelName, rooms, isLoading, isCreating, onRoomSelect, onNewChat }) => {
  const canCreateNewChat = !isCreating && !isLoading && rooms.length < 10;

  return (
    <div className="chat-room-selection-container">
      <div className="room-selection-header">
        <h2>{levelName} 선생님과의 대화</h2>
        <p>기존 대화를 선택하거나, 새로운 대화를 시작하여 영어 실력을 향상시켜 보세요.</p>
      </div>
      <div className="room-selection-grid">
        {/* 새 대화 시작 카드 */}
        <button 
          className="room-card new-chat-card" 
          onClick={onNewChat} 
          disabled={!canCreateNewChat}
        >
          {isCreating ? (
            <div className="loader-small"></div>
          ) : (
            <>
              <div className="new-chat-card-icon"><PlusCircleIcon /></div>
              <span>새 대화 시작</span>
            </>
          )}
        </button>

        {/* 채팅방 목록 카드 또는 스켈레톤 */}
        {isLoading 
          ? [...Array(3)].map((_, i) => <div key={i} className="room-card-skeleton" />)
          : rooms.map(room => (
              <div key={room.conversationId} className="room-card" onClick={() => onRoomSelect(room.conversationId)}>
                <div className="room-card-icon"><ChatBubbleIcon /></div>
                <p className="room-card-content">{room.lastMessage || '대화를 시작해 보세요...'}</p>
                {/* [수정] 직접 변환하는 대신, 안전한 포매팅 함수를 사용 */}
                <span className="room-card-date">{formatDate(room.lastModifiedAt)}</span>
              </div>
            ))
        }
      </div>
    </div>
  );
};

export default ChatRoomSelection;