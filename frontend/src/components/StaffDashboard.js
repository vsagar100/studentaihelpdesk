import React, { useState, useEffect, useContext } from 'react';
import Modal from './Modal'; // Import the Modal component
import { GlobalContext } from '../GlobalState';
import FeedbackModal from './FeedbackModal';
import UpdateGrievance from './UpdateGrievance';
import '../styles/StaffDashboard.css';

const StaffDashboard = () => {
  const [grievances, setGrievances] = useState([]);
  const { BACKEND_API_URL } = useContext(GlobalContext);
  const [showGrievanceModal, setShowGrievanceModal] = useState(false); // State for modal visibility
  const [selectedGrievance, setSelectedGrievance] = useState(null); // State for selected grievance
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
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
      const response = await fetch(`${BACKEND_API_URL}/api/grievances/get/grv_staff`, {
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
/*  
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
*/
   const handleGrievanceSubmit = async (formData) => {
    try {          
        //  const formData = new FormData();
        //  formData.append('status', status);
        //  formData.append('update_text', updateText); 
        //  formData.append('grievance_id', grievance.grievance_id);  // Assuming grievance contains student_id
        console.log("test");
        for (let [key, value] of formData.entries()) {
          console.log(`${key}: ${value}`);
        }
         // console.log(formData.);
    
          const response = await fetch(`${BACKEND_API_URL}/api/grievanceupdates/update`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,  // Pass JWT if necessary
          //  'Content-Type': 'application/json',
          },
          
      });
      alert("Error");
      const result = await response.json();
      if (response.ok) {
        showFeedback('success', 'Grievance updated successfully.');
        fetchGrievances();  // Reload the grievances after a successful update
      } else {
        throw new Error(result.message || 'An error occurred');
      }
      alert("Error3");
    } catch (error) {
      console.error('Error updating grievance:', error);
      //alert('Failed to update grievance');
      //setError('Grievance not found');
      showFeedback('error', 'Failed to update grievance.'); // Show error feedback
      alert("Error2");
    }
  };

  const handleOpenGrievanceModal = (grievanceId) => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    const grievance = grievances.find(g => g.id === grievanceId); // Find the selected grievance
    console.log('Selected Grievance:', grievance);
    if (grievance) {
      setSelectedGrievance(grievance); // Set the selected grievance
      setShowGrievanceModal(true); // Show the modal
    } else {
      setError('Grievance not found');
      showFeedback('error', 'Grievance not found.'); // Show error feedback
    }

    setIsLoading(false); // Stop loading
  };

  const handleCloseGrievanceModal = () => {
    setShowGrievanceModal(false); // Close the modal
    setSelectedGrievance(null); // Clear the selected grievance
  };
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const currentRecords = grievances.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);
  
  const showFeedback = (type, message) => {
    setFeedback({ show: true, type, message });
  };

  return (
    <div className="dashboard-container">
      <div className="main-section">
        <div className="staff-overview-tile">
          <h3>Welcome to the Staff Dashboard</h3>
          <p>Manage and address grievances efficiently to maintain a positive educational environment.</p>
        </div>
        
        <Modal show={showGrievanceModal} handleClose={() => setShowGrievanceModal(false)} title="Update Grievance">
          {selectedGrievance && (
              <UpdateGrievance
                  grievance={selectedGrievance} // Pass selectedGrievance to UpdateGrievance component
                  onSubmit={handleGrievanceSubmit}
                  handleClose={() => setShowGrievanceModal(false)}
              />
          )}
        </Modal>
        
        {/* Grievance Management Table */}
        <table className="grievance-table">
          <thead>
            <tr>
              <th>Grievance ID</th>
              <th>Category</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {grievances.map((grievance) => (
              <tr key={grievance.id}>
                <td>{grievance.id}</td>
                <td>{grievance.category}</td>
                <td>{grievance.description}</td>
                {/* Add hyperlink to open modal */}
                <td>
                  <button onClick={() => handleOpenGrievanceModal(grievance.id)} className="status-button">
                    {grievance.status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
            {[...Array(Math.ceil(grievances.length / recordsPerPage)).keys()].map((number) => (
              <button key={number} onClick={() => paginate(number + 1)}>
                {number + 1}
              </button>
            ))}
          </div>
        
        {/* Grievance Modal */}
        {/*selectedGrievance && (
          <Modal show={showGrievanceModal} handleClose={handleCloseGrievanceModal} title="Manage Grievance">
            <form onSubmit={handleGrievanceSubmit}>
              <div className="form-group">
                <label htmlFor="status">Update Status:</label>
                <select id="status" className="form-control" defaultValue={selectedGrievance.status}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="notes">Notes:</label>
                <textarea
                  id="notes"
                  className="form-control"
                  rows="4"
                  placeholder="Add any notes or comments"
                  defaultValue={selectedGrievance.description}
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Update</button>
            </form>
          </Modal>
        )*/}
      </div>
      
      <div className="sidebar-section">
        {/* Announcements Section */}
        <div className="announcements-tile">
          <h3>Announcements & Notifications</h3>
          <ul className="announcements-list">
            <li>Staff meeting scheduled for 10th July.</li>
            <li>New guidelines for student grievances handling are now available.</li>
            <li>Update your profiles with the latest contact details.</li>
          </ul>
        </div>
        
        {/* Task Section */}
        <div className="tasks-tile">
          <h3>Assigned Tasks</h3>
          <ul className="tasks-list">
            <li>Review new grievances from students.</li>
            <li>Prepare monthly report on resolved grievances.</li>
            <li>Update the admin team on recent issues.</li>
          </ul>
        </div>
      </div>
      <FeedbackModal
        show={feedback.show}
        handleClose={handleCloseFeedback}
        type={feedback.type}
        message={feedback.message}
      />
    </div>
  );
};

export default StaffDashboard;
