// src/components/FeatureDiscoveryTooltip.jsx
import React, { useState, useEffect } from 'react';
import './FeatureDiscoveryTooltip.css';

const FeatureDiscoveryTooltip = ({
  isVisible,
  onClose,
  title,
  content,
  style = {},
  arrowDirection = 'up',
  positioning = 'dynamic',
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setIsFadingOut(false);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsFadingOut(true);
    setTimeout(() => onClose?.(), 300);
  };

  if (!isVisible) {
    return null;
  }

  const tooltipClasses = `feature-discovery-tooltip ${positioning} ${isFadingOut ? 'fade-out' : 'fade-in'} arrow-${arrowDirection}`;

  return (
    <div className={tooltipClasses} style={style}>
      <div className="tooltip-content">
        <p>
          <strong>{title}</strong><br />
          <span dangerouslySetInnerHTML={{ __html: content }} />
        </p>
        <button onClick={handleClose} className="tooltip-close-btn">
          알겠어요!
        </button>
      </div>
      <div className="tooltip-arrow" style={style.arrowStyle}></div>
    </div>
  );
};

export default FeatureDiscoveryTooltip;