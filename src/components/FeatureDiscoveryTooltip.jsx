import React from "react";
import "./FeatureDiscoveryTooltip.css";

const FeatureDiscoveryTooltip = ({ onDismiss }) => {
  return (
    <div className="feature-tooltip-container">
      <div className="tooltip-bubble">
        <button
          className="dismiss-btn"
          onClick={onDismiss}
          aria-label="도움말 닫기"
        >
          ×
        </button>
        <div className="tooltip-header">✨ 새로운 '나의 단어장' 기능!</div>
        <div className="tooltip-content">
          <p>
            이제 본문에서 모르는 단어나 숙어를 저장하고, 언제든지{" "}
            <strong>📖 버튼</strong>을 눌러 복습할 수 있어요.
          </p>
          <ul>
            <li>
              <strong>PC:</strong> 단어를 드래그하여 저장하세요.
            </li>
            <li>
              <strong>모바일:</strong> <strong>✍🏻 버튼</strong>을 눌러 선택
              모드를 켜고 단어를 탭하여 저장하세요.
            </li>
          </ul>
        </div>
        <button className="confirm-btn" onClick={onDismiss}>
          알겠어요!
        </button>
      </div>
      <div className="tooltip-pointer"></div>
    </div>
  );
};

export default FeatureDiscoveryTooltip;
