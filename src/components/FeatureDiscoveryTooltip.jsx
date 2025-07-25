import React, { useState, useEffect } from 'react';
import './FeatureDiscoveryTooltip.css';

const FeatureDiscoveryTooltip = ({ isVisible, onClose }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setIsFadingOut(false);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsFadingOut(true);
    setTimeout(onClose, 300); // 애니메이션 시간과 동일하게 설정
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`feature-discovery-tooltip ${isFadingOut ? 'fade-out' : 'fade-in'}`}>
      <div className="tooltip-content">
        <p>
          <strong>✨ 새로운 기능!</strong><br />
          이제 단어장을 원하는 곳으로 옮기거나<br />
          모서리를 드래그하여 크기를 조절할 수 있어요.
        </p>
        <button onClick={handleClose} className="tooltip-close-btn">
          알겠어요!
        </button>
      </div>
      <div className="tooltip-arrow"></div>
    </div>
  );
};

export default FeatureDiscoveryTooltip;