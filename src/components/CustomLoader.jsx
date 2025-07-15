// src/components/CustomLoader.jsx
import React from 'react';
import './CustomLoader.css';

const CustomLoader = ({ message, size = 'default' }) => {
  return (
    <div className={`loader-container ${size}`}>
      <div className="bouncing-loader">
        <div></div>
      </div>
      {message && <p className="loader-message">{message}</p>}
    </div>
  );
};

export default CustomLoader;