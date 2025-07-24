// src/components/ChatPageSkeleton.jsx

import React from 'react';
import './ChatPageSkeleton.css';

const ChatPageSkeleton = () => {
  return (
    <div className="skeleton-chat-container">
      {/* [수정] AI 메시지 스켈레톤에 아바타 추가 */}
      <div className="skeleton-message-wrapper ai">
        <div className="skeleton-avatar"></div>
        <div className="skeleton-message-bubble ai">
          <div className="skeleton-line short"></div>
          <div className="skeleton-line"></div>
        </div>
      </div>

      {/* [수정] 사용자 메시지 스켈레톤은 wrapper만 사용 */}
      <div className="skeleton-message-wrapper user">
        <div className="skeleton-message-bubble user">
          <div className="skeleton-line medium"></div>
        </div>
      </div>

      {/* [수정] AI 메시지 스켈레톤에 아바타 추가 */}
      <div className="skeleton-message-wrapper ai">
        <div className="skeleton-avatar"></div>
        <div className="skeleton-message-bubble ai">
          <div className="skeleton-line"></div>
          <div className="skeleton-line medium"></div>
          <div className="skeleton-line short"></div>
        </div>
      </div>

      {/* [수정] 사용자 메시지 스켈레톤은 wrapper만 사용 */}
       <div className="skeleton-message-wrapper user">
        <div className="skeleton-message-bubble user">
          <div className="skeleton-line short"></div>
        </div>
      </div>
    </div>
  );
};

export default ChatPageSkeleton;