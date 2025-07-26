import React from 'react';
import './ImageModal.css';

const ImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content">
        <img src={imageUrl} alt="Full screen" />
      </div>
    </div>
  );
};

export default ImageModal;