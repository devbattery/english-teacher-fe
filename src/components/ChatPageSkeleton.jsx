// src/components/ChatPageSkeleton.jsx

import React from 'react';
import './ChatPageSkeleton.css';

const ChatPageSkeleton = () => {
  return (
    <div className="skeleton-chat-container">
      <div className="skeleton-message-bubble-wrapper">
        <div className="skeleton-message-bubble ai">
          <div className="skeleton-line short"></div>
          <div className="skeleton-line"></div>
        </div>
      </div>
      <div className="skeleton-message-bubble-wrapper user">
        <div className="skeleton-message-bubble user">
          <div className="skeleton-line medium"></div>
        </div>
      </div>
      <div className="skeleton-message-bubble-wrapper">
        <div className="skeleton-message-bubble ai">
          <div className="skeleton-line"></div>
          <div className="skeleton-line medium"></div>
          <div className="skeleton-line short"></div>
        </div>
      </div>
       <div className="skeleton-message-bubble-wrapper user">
        <div className="skeleton-message-bubble user">
          <div className="skeleton-line short"></div>
        </div>
      </div>
    </div>
  );
};

export default ChatPageSkeleton;
