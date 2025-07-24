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
  onRecommendationClick // [추가] 부모로부터 클릭 핸들러 함수를 받습니다.
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
      {/* [핵심 수정] 레벨별 추천 대화 주제 섹션 */}
      {/* recommendations가 있을 때만 이 박스를 표시합니다. */}
      {recommendations.length > 0 && (
        <div className="recommendations-box">
          <h3>이런 대화는 어떠세요?</h3>
          <ul className="recommendations-list-chat">
            {/* 
              - recommendations 배열을 매핑하여 li 태그로 렌더링합니다.
              - 각 li 태그에 onClick 이벤트를 추가합니다.
              - 클릭 시 부모로부터 받은 onRecommendationClick 함수에 질문 텍스트를 전달합니다.
            */}
            {recommendations.map((rec, index) => (
              <li key={index} onClick={() => onRecommendationClick(rec)}>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}


      <div className="room-selection-grid">
        {/* 로딩 중일 때 스켈레톤 UI 표시 */}
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="room-card-skeleton"></div>
          ))
        ) : (
          <>
            {/* 새 대화 시작 카드를 맨 앞으로 이동하여 접근성을 높입니다. */}
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
            
            {/* 기존 대화방 목록 */}
            {rooms.map(room => (
              <div
                key={room.conversationId}
                className="room-card"
                onClick={() => onRoomSelect(room.conversationId)}
              >
                <div className="room-card-icon"><MessageSquareText size={28} /></div>
                <p className="room-card-content">
                  {room.lastMessage || '아직 대화가 없습니다.'}
                </p>
                <span className="room-card-date">
                  {formatDate(room.lastModifiedAt)}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatRoomSelection;