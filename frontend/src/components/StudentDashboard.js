import React, { useState, useEffect, useContext } from 'react';
import { GlobalContext } from '../GlobalState';
import SubmitGrievance from './SubmitGrievance';
import Modal from './Modal';
import FeedbackModal from './FeedbackModal';
import AnnouncementsModal from './AnnouncementsModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import '../styles/StudentDashboard.css';
import { UserContext } from './UserContext';

const StudentDashboard = () => {
  const { BACKEND_API_URL } = useContext(GlobalContext);
  const [grievances, setGrievances] = useState([]);
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [showViewGrievanceModal, setShowViewGrievanceModal] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const { user } = useContext(UserContext);

  // Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);

  // Fetch grievances from the backend API
  const fetchGrievances = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_API_URL}/api/grievances/get/all_cur_user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (Array.isArray(data)) {
        setGrievances(data);
      } else {
        setGrievances([]);  // Fallback to empty array if data is not an array
      }
    } catch (err) {
      console.error('Error fetching grievances:', err);
      setError('Error fetching grievances: ' + err.message);
    }
  };

  // Fetch announcements from the backend API
  const fetchAnnouncements = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BACKEND_API_URL}/api/announcements/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        //  'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setAnnouncements(data.filter(announcement => !announcement.is_expired));
      } else {
        setAnnouncements([]);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Error fetching announcements: ' + err.message);
    }
  };

  useEffect(() => {
    fetchGrievances();
    fetchAnnouncements();
  }, []);
  
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
  
  const showFeedback = (type, message) => {
    setFeedback({ show: true, type, message });
  };

  const handleViewAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    console.log(announcement);
    setShowAnnouncementsModal(true);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const currentRecords = grievances.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);
  
  const toCamelCase = (str) => {
  return str
    .toLowerCase() // Convert the whole string to lower case
    .split(' ')    // Split the string by spaces
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(' ');    // Join the words back together
};

  return (
    <div className="dashboard-container">
      <div className="main-section">
        <div className="good-job-tile">
          {user ? <h3>Welcome, {user?.username ? toCamelCase(user.username) : 'Guest'}!</h3> : <h3>No user logged in</h3>}
          <button className="submit-grievance-button" onClick={() => setShowGrievanceModal(true)}>
            Submit Grievance
          </button>

          <Modal show={showGrievanceModal} handleClose={() => setShowGrievanceModal(false)} title="Submit Grievance">
            <SubmitGrievance handleClose={() => setShowViewGrievanceModal(false)} />
          </Modal>
          <Modal show={showViewGrievanceModal} handleClose={() => setShowViewGrievanceModal(false)} title="View Grievance">
            {selectedGrievance ? (
              <div className="grievance-details">
                <p><strong>ID:</strong> {selectedGrievance.id}</p>
                <p><strong>Category:</strong> {selectedGrievance.category}</p>
                <p><strong>Description:</strong> {selectedGrievance.description}</p>
                <p><strong>Status:</strong> {selectedGrievance.status}</p>
              </div>
            ) : (
              <p>Loading grievance details...</p>
            )}
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
                    <td>{grievance.category || 'N/A'}</td>
                    <td>{grievance.description}</td>
                    <td>{grievance?.status ? toCamelCase(grievance.status) : 'N/A'}</td>
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
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <li key={announcement.id}>
                  <a href="#" onClick={() => handleViewAnnouncement(announcement)}>
                    {announcement.title}
                  </a>
                </li>
              ))
            ) : (
              <li>No Announcements yet!</li>
            )}
          </ul>
          
          <Modal show={showAnnouncementsModal} handleClose={() => setShowAnnouncementsModal(false)} title="Announcements Details">
            {selectedAnnouncement && (
                <AnnouncementsModal
                    announcements={selectedAnnouncement}
                    handleClose={() => setShowAnnouncementsModal(false)}
                />
            )}
          </Modal>
        </div>

        {/* Upcoming Events */}
        <div className="events-tile">
          <h3>Upcoming Events</h3>
          <ul className="events-list">
            <li>Student Workshop on AI - 12th July</li>
            <li>Career Counseling Session - 15th July</li>
            <li>Annual Sports Meet - 20th July</li>
          </ul>
        </div>
      </div>

      <FeedbackModal
        show={feedback.show}
        handleClose={() => setFeedback({ show: false, type: '', message: '' })}
        type={feedback.type}
        message={feedback.message}
      />
    </div>
  );
};

export default StudentDashboard;
