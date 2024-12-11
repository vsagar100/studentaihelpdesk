import React, { useState, useEffect } from 'react';
import FeedbackModal from './FeedbackModal'; 
import '../styles/Modal.css';

const AnnouncementsModal = ({ announcements, handleClose  }) => {
  const [title, setTitle] = useState(null);
  const [description, setDescription] = useState('');
  const [file_path, setFilePath] = useState(null);
  
   // Populate form fields when grievance is loaded
  useEffect(() => {
  console.log("test");
    if (announcements) {
      console.log(announcements);
      setTitle(announcements.title || '');
      setDescription(announcements.description || '');
      setFilePath(announcements.file_path || '');
    }
  }, [announcements]);
  
  return (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal">
            <button className="modal-close" onClick={handleClose}>X</button>
            <h4>{title}</h4>
            <p>{description}</p>
            {file_path && (
              <a
                href={`${file_path}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Attachment
              </a>
            )}
          </div>
        </div>
  );
};

export default AnnouncementsModal;