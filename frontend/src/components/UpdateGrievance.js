import React, { useState, useEffect, useContext } from 'react';
import { GlobalContext } from '../GlobalState';
import '../styles/Update_Grievance.css';
import FeedbackModal from './FeedbackModal'; 

  
  const UpdateGrievance = ({ grievance, onSubmit, handleClose }) => {
  const { BACKEND_API_URL } = useContext(GlobalContext);
  const [grievanceId, setGrievanceId] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [file_path, setFilePath] = useState('');
  const [file, setFile] = useState(null);
  const [updateText, setUpdateText] = useState('');
  const [error, setError] = useState('');
  const [updates, setUpdates] = useState([]);  // State for grievance updates
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });


  // Populate form fields when grievance is loaded
  useEffect(() => {
    if (grievance) {
      console.log(grievance);
      setGrievanceId(grievance.id || '');
      setCategory(grievance.category || '');
      setDescription(grievance.description || '');
      setStatus(grievance.status || '');
      setFilePath(grievance.file_path || '');
      fetchGrievanceUpdates();
    }
  }, [grievance]);

  // Fetch grievance updates
  const fetchGrievanceUpdates = async (grievanceId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_API_URL}/api/grievanceupdates/get/${grievance.id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Send token in Authorization header
                'Content-Type': 'application/json',
            },
        });
      const data = await response.json();
     // console.log("got data");
     // console.log(data);
      setUpdates(data);
      setUpdateText(data.update_text || '');
    } catch (error) {
      console.error('Error fetching grievance updates:', error);
      setError('Failed to fetch updates');
      showFeedback('error', 'Failed to fetch updates.'); // Show error feedback
    }
  };
  
  const handleSubmit = async (e) => {
    try {
          e.preventDefault();
          const formData = new FormData();
          console.log(status);
          formData.append('status', status);
          formData.append('update_text', updateText); 
          formData.append('grievance_id', grievance.id);
          console.log(formData);
    
          
          try 
          {
              await onSubmit(formData);
              handleClose(); // Close modal if submission is successful
              alert("Error1");
          } 
          catch (error) {
            setError('Failed to submit grievance');
            showFeedback('error', 'Failed to submit grievance.'); // Show error feedback
          }
      } catch (error) {
        console.error('Error updating grievance:', error);
        //alert('Failed to update grievance');
        //setError('Grievance not found');
        showFeedback('error', 'Failed to update grievance.'); // Show error feedback
      }
  };
  

  
  const showFeedback = (type, message) => {
    setFeedback({ show: true, type, message });
  };
  
  const handleCloseFeedback = () => {
    setFeedback({ show: false, type: '', message: '' });
  };

  return (
    <div>
      {/* Feedback modal */}
      <FeedbackModal
        show={feedback.show}
        type={feedback.type}
        message={feedback.message}
        handleClose={handleCloseFeedback}  // Close the modal on user action
      />
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>      
        <div className="form-group">
          <p><strong>Description:</strong> {description}</p>
        </div>
        <div className="form-group">
          <p><strong>Status:</strong> {status}</p>
        </div>
        
        <div className="form-group">
          {file_path && (
            <div className="grievance-file">
            <p><strong>File:</strong> </p>
              <a href={BACKEND_API_URL+file_path} target="_blank" rel="noopener noreferrer">
                {file_path.split('/').pop()}  {/* Extracts and displays the file name */}
             </a>
            </div>
          )}
        </div>
         {/* Display grievance updates */}
        {updates.length > 0 && (
          <div className="grievance-updates">
            <h4>Updates</h4>
            {updates.map((update) => (
              <div key={update.update_id} className="update-entry">
                <p><strong>{update.user_id}</strong> ({new Date(update.update_date).toLocaleString()})</p>
                <p>{update.update_text}</p>
              </div>
            ))}
          </div>
        )}
        <div className="form-group">
          <label htmlFor="update_text">Grievance Updates:</label>
          <textarea
            id="update_text"
            className="form-control"
            rows="4"
            value={updateText}
            onChange={(e) => setUpdateText(e.target.value)}            
            placeholder="Update grievance resolution here..."
          />
        </div>
         <div className="form-group">
          <label htmlFor="status">Update Status:</label>
          <select
            id="status"
            className="form-control"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >            
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
          

        <button type="submit" className="btn btn-primary">Update</button>
      </form>
    </div>
  );
};

export default UpdateGrievance;
