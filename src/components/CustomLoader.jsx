// src/components/CustomLoader.jsx
import React from 'react';
import './CustomLoader.css';

const CustomLoader = ({ message }) => {
  return (
    <div className="loader-container">
      <div className="bouncing-loader">
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p className="loader-message">{message}</p>
    </div>
  );
};

export default CustomLoader;