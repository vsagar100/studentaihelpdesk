import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { GlobalContext } from '../GlobalState';
import FeedbackModal from './FeedbackModal';
import Modal from './Modal'; // Import the Modal component
import '../styles/AdminDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from './UserContext';

const AdminDashboard = () => {
  const { BACKEND_API_URL } = useContext(GlobalContext);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState(null);  
  const [faqs, setFAQs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;

  // Fetch FAQs from the backend API
  const fetchFAQs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_API_URL}/api/faq/get_all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (Array.isArray(data)) {
        setFAQs(data);
      } else {
        setFAQs([]);
      }
    } catch (err) {
      console.error('Error fetching FAQs:', err);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const handleOpenFAQModal = (faq) => {
    setSelectedFAQ(faq);
    setShowFAQModal(true);
  };

  const handleCloseFAQModal = () => {
    setShowFAQModal(false);
    setSelectedFAQ(null);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const currentRecords = faqs.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const handleDeleteFAQ = async (faqId) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      // Call API to delete FAQ
      console.log(`Deleting FAQ with ID: ${faqId}`);
      
      try {
      if (faqId) {
        // Edit existing FAQ
        console.log("Inside If");
        const token = localStorage.getItem('token');
        const response = await fetch(`${BACKEND_API_URL}/api/faq/delete/${faqId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
            //'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          console.log('FAQ deleted successfully');
          await fetchFAQs(); // Refresh the FAQ list
        } else {
          console.error('Failed to delete FAQ');
        }
      }
      } catch (err) {
        console.log(err);
        console.error('Error deleting FAQ:', err);
        alert('Error deleting FAQ. Please try again.');
      }
    }
  };

  // Handle Save Button Click for both Add and Edit Scenarios
  const handleSaveFAQ = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);   
    //const question = formData.get('question');
    //const keywords = formData.get('keywords');
    //const answer = formData.get('answer');
 
    
    try {      
      if (selectedFAQ) {
        console.log(selectedFAQ);
        // Edit existing FAQ
        const token = localStorage.getItem('token');
        const response = await fetch(`${BACKEND_API_URL}/api/faq/update/${selectedFAQ.faq_id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
            //'Content-Type': 'application/json',
          },
          body: formData,
        });

        if (response.ok) {
          console.log('FAQ updated successfully');
          await fetchFAQs(); // Refresh the FAQ list
          handleCloseFAQModal(); // Close modal after saving
        } else {
          console.error('Failed to update FAQ');
        }
      } else {
        // Add new FAQ
        console.log(formData.get('question'));
        const response = await fetch(`${BACKEND_API_URL}/api/faq/add`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
           // 'Content-Type': 'application/json',
          },
          body: formData,
        });

        if (response.ok) {
          console.log('FAQ added successfully');
          await fetchFAQs(); // Refresh the FAQ list
          handleCloseFAQModal(); // Close modal after saving
        } else {
          console.error('Failed to add FAQ');
        }
      }
    } catch (err) {
      console.log(err);
      console.error('Error saving FAQ:', err);
      alert('Error saving FAQ. Please try again.');
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Main Content */}
      <div className="main-content">
        {/* FAQ Management Section */}
        <div className="grievance-section">
          <div className="good-job-tile">
            <h3>FAQs</h3>
          </div>
          <button className="btn btn-primary" onClick={() => handleOpenFAQModal()}>
            Add FAQ
          </button>
          <table className="grievance-table">
            <thead>
              <tr>
                <th>FAQ ID</th>
                <th>Question</th>
                <th>Keywords</th>
                <th>Answer</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords && currentRecords.map((faq) => (
                <tr key={faq.faq_id}>
                  <td>{faq.faq_id}</td>
                  <td>{faq.question}</td>
                  <td>{faq.keywords}</td>
                  <td>{faq.answer}</td>
                  <td><button onClick={() => handleOpenFAQModal(faq)} className="status-button">
                    Edit
                  </button></td>
                  <td><button onClick={() => handleDeleteFAQ(faq.faq_id)} className="status-button">
                    Delete
                  </button></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            {[...Array(Math.ceil(faqs.length / recordsPerPage)).keys()].map((number) => (
              <button key={number} onClick={() => paginate(number + 1)}
                className={currentPage === number + 1 ? 'active' : ''}>
                {number + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Modal */}
      <Modal show={showFAQModal} handleClose={handleCloseFAQModal} title={selectedFAQ ? "Edit FAQ" : "Add FAQ"}>
        <form onSubmit={handleSaveFAQ}>
          <div className="form-group">
            <label htmlFor="question">Question:</label>
            <input type="text" id="question" name="question" defaultValue={selectedFAQ ? selectedFAQ.question : ""} className="form-control" required />
          </div>
          <div className="form-group">
            <label htmlFor="keywords">Keywords:</label>
            <input type="text" id="keywords" name="keywords" defaultValue={selectedFAQ ? selectedFAQ.keywords : ""} className="form-control" required />
          </div>
          <div className="form-group">
            <label htmlFor="answer">Answer:</label>
            <textarea id="answer" name="answer" className="form-control" rows="4" defaultValue={selectedFAQ ? selectedFAQ.answer : ""} required></textarea>
          </div>
          <button type="submit" className="btn btn-primary">Save FAQ</button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
 