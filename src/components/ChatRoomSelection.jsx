// src/components/ChatRoomSelection.jsx

import React from 'react';
import { MessageSquareText, MessageSquarePlus } from 'lucide-react';

const ChatRoomSelection = ({
  levelName,
  rooms,
  isLoading,
  isCreating,
  onRoomSelect,
  onNewChat,
  recommendations = [],
  onRecommendationClick // 부모로부터 클릭 핸들러 함수를 받습니다.
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="chat-room-selection-container">
      {/* [핵심 수정] 추천 질문 섹션 */}
      {recommendations.length > 0 && (
        <div className="recommendations-box">
          <h3>이렇게 시작해 보세요!</h3>
          <ul className="recommendations-list-chat">
            {recommendations.map((rec, index) => (
              // rec.label은 사용자에게 보여주고,
              // 클릭 시 rec.prompt를 핸들러에 전달합니다.
              <li key={index} onClick={() => onRecommendationClick(rec.prompt)}>
                {rec.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="room-selection-grid">
        <button
          className="room-card new-chat-card"
          onClick={onNewChat}
          disabled={isCreating || rooms.length >= 10}
        >
          {isCreating ? (
            <div className="loader-small"></div>
          ) : (
            <>
              <div className="new-chat-card-icon"><MessageSquarePlus size={32} /></div>
              새 대화 시작
            </>
          )}
        </button>
        
        {isLoading ? (
          [...Array(5)].map((_, i) => <div key={i} className="room-card-skeleton"></div>)
        ) : (
          rooms.map(room => (
            <div
              key={room.conversationId}
              className="room-card"
              onClick={() => onRoomSelect(room.conversationId)}
            >
              <div className="room-card-icon"><MessageSquareText size={28} /></div>
              <p className="room-card-content">{room.lastMessage || '아직 대화가 없습니다.'}</p>
              <span className="room-card-date">{formatDate(room.lastModifiedAt)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatRoomSelection;