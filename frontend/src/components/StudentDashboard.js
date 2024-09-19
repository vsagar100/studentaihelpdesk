import React, { useState, useEffect, useContext } from 'react';
import { GlobalContext } from '../GlobalState';
import SubmitGrievance from './SubmitGrievance';
import Modal from './Modal';
import FeedbackModal from './FeedbackModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/StudentDashboard.css';

const StudentDashboard = () => {
  const { BACKEND_API_URL } = useContext(GlobalContext);
  const [grievances, setGrievances] = useState([]);
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [showViewGrievanceModal, setShowViewGrievanceModal] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  // Function to close feedback modal
  const handleCloseFeedback = () => {
    setFeedback({ show: false, type: '', message: '' });
  };

  // Fetch grievances from the backend API
  const fetchGrievances = async () => {
    try {
      // Get the JWT token from localStorage
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_API_URL}/api/grievances/get/all_cur_user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Send token in Authorization header
                'Content-Type': 'application/json',
            },
        });
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      const data = await response.json();
      setGrievances(data);
    } catch (err) {
      console.error('Error fetching grievances:', err);
      setError('Error fetching grievances: ' + err.message);
      showFeedback('error', 'Error fetching grievances: ' + err.message);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, [BACKEND_API_URL]);

  // Handle grievance submission
  const handleGrievanceSubmit = async (formData) => {
    console.log("handleGrievanceSubmit");
    setError(null);
    setMessage('');
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/grievance/submit`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Grievance submitted successfully!');
        setShowGrievanceModal(false);
        fetchGrievances();
        showFeedback('success', 'Grievance submitted successfully!');
      } else {
        throw new Error(result.message || 'An error occurred while submitting the grievance');
      }
    } catch (err) {
      setError('An error occurred: ' + err.message);
      showFeedback('error', 'An error occurred: ' + err.message);
    }
  };

   const handleViewGrievance = async (grievanceId) => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    const grievance = grievances.find(g => g.id === grievanceId); // Find the selected grievance
    console.log('Selected Grievance:', grievance);
    if (grievance) {
      setSelectedGrievance(grievance); // Set the selected grievance
      setShowViewGrievanceModal(true); // Show the modal
    } else {
      setError('Grievance not found');
      showFeedback('error', 'Grievance not found.'); // Show error feedback
    }

    setIsLoading(false); // Stop loading
  };
  
  // Close modal handleCloseViewGrievanceModal
  const handleCloseViewGrievanceModal = () => {
    setShowViewGrievanceModal(false); // Close the modal
    setSelectedGrievance(null); // Reset selected grievance
  };

  const showFeedback = (type, message) => {
    setFeedback({ show: true, type, message });
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const currentRecords = grievances.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  return (
    <div className="dashboard-container">
      <div className="main-section">
        <div className="good-job-tile">
          <h3>Good Job, Sarah. Keep Going!!</h3>
          <p>Your tasks are 80% completed this week. Progress is very good!!!</p>
          <button className="submit-grievance-button" onClick={() => setShowGrievanceModal(true)}>
            Submit Grievance
          </button>

          <Modal show={showGrievanceModal} handleClose={() => setShowGrievanceModal(false)} title="Submit Grievance">
            <SubmitGrievance onSubmit={handleGrievanceSubmit} handleClose={() => setShowGrievanceModal(false)} />
          </Modal>

          <table className="grievance-table">
            <thead>
              <tr>
                <th>Grievance ID</th>
                <th>Category</th>
                <th>Description</th>
                <th>Status</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5">
                    <div className="spinner"></div>
                  </td>
                </tr>
              ) : (
                currentRecords.map((grievance) => (
                  <tr key={grievance.id}>
                    <td>{grievance.id}</td>
                    <td>{grievance.category}</td>
                    <td>{grievance.description}</td>
                    <td>
                      <FontAwesomeIcon
                        icon={grievance.status === 'submitted' ? faCheckCircle : faTimesCircle}
                        className={`status-icon ${grievance.status === 'submitted' ? 'status-open' : 'status-closed'}`}
                      />
                      {grievance.status}
                    </td>
                    <td>
                      <button onClick={() => handleViewGrievance(grievance.id)}>
                        <FontAwesomeIcon icon={faEye} className="view-icon" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="pagination">
            {[...Array(Math.ceil(grievances.length / recordsPerPage)).keys()].map((number) => (
              <button key={number} onClick={() => paginate(number + 1)}>
                {number + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Section */}
      <div className="sidebar-section">
        <div className="announcements-tile">
          <h3>Announcements & Notifications</h3>
          <ul className="announcements-list">
            <li>New grading policy effective next semester.</li>
            <li>Library will be closed for maintenance on 5th July.</li>
            <li>Submit your assignments by the end of this month.</li>
          </ul>
        </div>

        {/* Re-added Upcoming Events */}
        <div className="events-tile">
          <h3>Upcoming Events</h3>
          <ul className="events-list">
            <li>Student Workshop on AI - 12th July</li>
            <li>Career Counseling Session - 15th July</li>
            <li>Annual Sports Meet - 20th July</li>
          </ul>
        </div>
      </div>
      
      <Modal show={showViewGrievanceModal} handleClose={handleCloseViewGrievanceModal} title="View Grievance">
      {selectedGrievance ? (
        <div className="grievance-details">
          <p><strong>ID:</strong> {selectedGrievance.id}</p>
          <p><strong>Category:</strong> {selectedGrievance.category}</p>
          <p><strong>Description:</strong> {selectedGrievance.description}</p>
          <p><strong>Status:</strong> {selectedGrievance.status}</p>
          {/* Display the uploaded file */}
          
          {selectedGrievance.file_path && (
            <div className="grievance-file">
            <p><strong>File:</strong> </p>
              <a href={BACKEND_API_URL+selectedGrievance.file_path} target="_blank" rel="noopener noreferrer">
                {selectedGrievance.file_path.split('/').pop()}  {/* Extracts and displays the file name */}
              </a>
          </div>
          )}
        </div>
      ) : (
        <p>Loading grievance details...</p>
      )}
    </Modal>

      <FeedbackModal
        show={feedback.show}
        handleClose={handleCloseFeedback}
        type={feedback.type}
        message={feedback.message}
      />
    </div>
  );
};

export default StudentDashboard;
