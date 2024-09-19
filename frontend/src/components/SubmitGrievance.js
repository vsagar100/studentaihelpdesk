import React, { useState } from 'react';
import FeedbackModal from './FeedbackModal'; 

const SubmitGrievance = ({ onSubmit, handleClose }) => {
  const [student_id, setStudentId] = useState(null);
  const [category, setCategory] = useState('Academic');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit");
    const formData = new FormData();
    formData.append('category', category);
    formData.append('description', description);
    formData.append('student_id', 1);  // Set student ID dynamically
    if (file) {
      formData.append('file', file);
    }

    try {
      await onSubmit(formData);
      handleClose(); // Close modal if submission is successful
    } catch (error) {
      setError('Failed to submit grievance');
      showFeedback('error', 'Failed to submit grievance.'); // Show error feedback
    }
  };

  return (
    <div>
      <h3>Submit Grievance</h3>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
      
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            className="form-control"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your grievance"
          />
        </div>
        <div className="form-group">
          <label htmlFor="fileUpload">Attach File:</label>
          <input
            type="file"
            id="fileUpload"
            className="form-control-file"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default SubmitGrievance;
