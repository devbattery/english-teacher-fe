// src/components/CustomLoader.jsx
import React from 'react';
import './CustomLoader.css';

const CustomLoader = ({ message }) => {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p className="loader-message">{message}</p>
    </div>
  );
};

export default CustomLoader;