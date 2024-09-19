import React from 'react';
import '../styles/Modal.css'; // Add custom styles for modal

const Modal = ({ show, handleClose, title, children }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-header">{title}</h2>
        <button className="modal-close" onClick={handleClose}>X</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
