import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { GlobalContext } from '../GlobalState';
import FeedbackModal from './FeedbackModal';
import Modal from './Modal'; // Import the Modal component
import '../styles/AdminDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from './UserContext';

const AdminUserManagement = () => {
  const { BACKEND_API_URL } = useContext(GlobalContext);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);  
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  // Fetch USers from the backend API
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_API_URL}/api/auth/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Error fetching Users data:', err);
      alert(err);
    }
  };

  useEffect(() => {
    console.log(localStorage.getItem('token'));
    fetchUsers();
  }, []);

  const handleOpenUserModal = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const currentRecords = users.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this User?')) {
      // Call API to delete User
      console.log(`Deleting User with ID: ${userId}`);
      
      try {
      if (userId) {

        console.log("Inside If");
        const token = localStorage.getItem('token');
        const response = await fetch(`${BACKEND_API_URL}/api/auth/user/delete/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
            //'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          console.log('User deleted successfully');
          await fetchUsers(); // Refresh the User list
        } else {
          console.error('Failed to delete User');
          alert('Error deleting User. Please try again.');
        }
      }
      } catch (err) {
        console.log(err);
        console.error('Error deleting User:', err);
        alert('Error deleting User. Please try again.');
      }
    }
  };

  // Handle Save Button Click for both Add and Edit Scenarios
  const handleSaveUser = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);   
    //const question = formData.get('question');
    //const keywords = formData.get('keywords');
    //const answer = formData.get('answer');
 
    
    try {      
      if (selectedUser) {
        // Edit existing User
        const token = localStorage.getItem('token');
        const response = await fetch(`${BACKEND_API_URL}/api/auth/user/update/${selectedUser.user_id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            //'Content-Type': 'application/json',
          },
          body: formData,
        });

        if (response.ok) {
          console.log('User updated successfully');
          await fetchUsers(); // Refresh the FAQ list
          handleCloseUserModal(); // Close modal after saving
        } else {
          console.error('Failed to update User');
        }
      } else {
        // Add new User
        console.log(formData.get('question'));
        const response = await fetch(`${BACKEND_API_URL}/api/auth/user/add`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
           // 'Content-Type': 'application/json',
          },
          body: formData,
        });

        if (response.ok) {
          console.log('User added successfully');
          await fetchUsers(); // Refresh the User list
          handleCloseUserModal(); // Close modal after saving
        } else {
          console.error('Failed to add User');
        }
      }
    } catch (err) {
      console.log(err);
      console.error('Error saving User:', err);
      alert('Error saving User. Please try again.');
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Main Content */}
      <div className="main-content">
        {/* USers Management Section */}
        <div className="grievance-section">
          <div className="good-job-tile">
            <h3>User Management</h3>
          </div>
          <button className="btn btn-primary" onClick={() => handleOpenUserModal()}>
            Add User
          </button>
          <table className="grievance-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Hint</th>                
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords && currentRecords.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.user_id}</td>
                  <td>{user.username}</td>
                  <td>{user.hint}</td>                  
                  <td><button onClick={() => handleOpenUserModal(user)} className="status-button">
                    Edit
                  </button></td>
                  <td><button onClick={() => handleDeleteUser(user.user_id)} className="status-button">
                    Delete
                  </button></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            {[...Array(Math.ceil(users.length / recordsPerPage)).keys()].map((number) => (
              <button key={number} onClick={() => paginate(number + 1)}
                className={currentPage === number + 1 ? 'active' : ''}>
                {number + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* USer Modal */}
      <Modal show={showUserModal} handleClose={handleCloseUserModal} title={selectedUser ? "Edit User" : "Add User"}>
        <form onSubmit={handleSaveUser}>
          <div className="form-group">
            <label htmlFor="username">UserName:</label>
            <input type="text" id="username" name="username" defaultValue={selectedUser ? selectedUser.username : ""} className="form-control" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">New Password:</label>
            <input type="password" id="password" name="password" className="form-control" required 
            minLength={8}
            pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$"
            title="Password must be at least 8 characters long, contain a letter, a number, and a special character"
             />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password:</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              className="form-control" 
              required 
              onBlur={(e) => {
                const password = document.getElementById('password').value;
                const confirmPassword = e.target.value;
                console.log(password);
                console.log(confirmPassword);
                if (password != confirmPassword) {
                  e.target.setCustomValidity("Passwords do not match");
                } else {
                  e.target.setCustomValidity("");
                }
              }}
            />
            </div>
          <div className="form-group">
            <label htmlFor="hint">Password hint:</label>
            <input type="text" id="hint" name="hint" defaultValue={selectedUser ? selectedUser.hint : ""} className="form-control" required />
          </div>
          <button type="submit" className="btn btn-primary">Save User</button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminUserManagement;
 