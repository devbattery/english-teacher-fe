// src/components/ChatRoomSelection.jsx

import React from 'react';
import { MessageSquareText, MessageSquarePlus } from 'lucide-react';

// [추가] 스켈레톤 컴포넌트 분리
const RecommendationsSkeleton = () => (
  <div className="recommendations-box-skeleton">
    <div className="skeleton-line title-skeleton"></div>
    <div className="skeleton-line item-skeleton"></div>
    <div className="skeleton-line item-skeleton"></div>
    <div className="skeleton-line item-skeleton" style={{ width: '70%' }}></div>
  </div>
);

const ChatRoomSelection = ({
  levelName,
  rooms,
  isLoading,
  isCreating,
  onRoomSelect,
  onNewChat,
  recommendations = [],
  onRecommendationClick
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="chat-room-selection-container">
      {/* ▼▼▼ [핵심 수정] 3단계 렌더링 로직 적용 ▼▼▼ */}
      {
        isLoading ? (
          // 1. 로딩 중일 때는 스켈레톤을 보여줍니다.
          <RecommendationsSkeleton />
        ) : (
          // 2. 로딩 완료 후, 채팅방이 없고 추천 질문이 있을 때만 실제 내용을 보여줍니다.
          rooms.length === 0 && recommendations.length > 0 && (
            <div className="recommendations-box">
              <h3>첫 메시지를 추천해 드려요!</h3>
              <ul className="recommendations-list-chat">
                {recommendations.map((rec, index) => (
                  <li key={index} onClick={() => onRecommendationClick(rec.prompt)}>
                    {rec.label}
                  </li>
                ))}
              </ul>
            </div>
          )
          // 3. 로딩 완료 후, 채팅방이 있으면 아무것도 보여주지 않습니다.
        )
      }

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