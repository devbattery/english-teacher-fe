import React from 'react';
import { MessageSquareText, MessageSquarePlus } from 'lucide-react';

const ChatRoomSelection = ({
  levelName,
  rooms,
  isLoading,
  isCreating,
  onRoomSelect,
  onNewChat,
  recommendations = [] // recommendations prop 추가 및 기본값 설정
}) => {
  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="chat-room-selection-container">
      <div className="room-selection-header">
        {/* [핵심] 레벨별 추천 대화 주제 섹션 */}
        <div className="recommendations-box">
          <h3>이런 대화를 나눠보세요!</h3>
          <ul className="recommendations-list-chat">
            {recommendations.map((rec, index) => (
              <li key={index}>✨ {rec}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="room-selection-grid">
        {/* 로딩 중일 때 스켈레톤 UI 표시 */}
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="room-card-skeleton"></div>
          ))
        ) : (
          <>
            {/* 기존 대화방 목록 */}
            {rooms.map(room => (
              <div
                key={room.conversationId}
                className="room-card"
                onClick={() => onRoomSelect(room.conversationId)}
              >
                <div className="room-card-icon"><MessageSquareText size={28} /></div>
                <p className="room-card-content">
                  {room.lastMessage || '새로운 대화'}
                </p>
                <span className="room-card-date">
                  {formatDate(room.lastModifiedAt)}
                </span>
              </div>
            ))}

            {/* 새 대화 시작 카드 */}
            <button
              className="room-card new-chat-card"
              onClick={onNewChat}
              disabled={isCreating || rooms.length >= 10}
            >
              {isCreating ? (
                <div className="loader-small"></div>
              ) : (
                <>
                  <div className="new-chat-card-icon">
                    <MessageSquarePlus size={32} />
                  </div>
                  새 대화 시작
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatRoomSelection;