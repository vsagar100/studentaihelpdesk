import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Modal from './Modal'; // Import the Modal component
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [grievances, setGrievances] = useState([]);

  useEffect(() => {
    const fetchDashboardData = () => {
      // Dummy data for users, tasks, and grievances
      const dummyUsers = [
        { id: 1, name: 'John Doe', role: 'Student', email: 'john.doe@example.com' },
        { id: 2, name: 'Jane Smith', role: 'Staff', email: 'jane.smith@example.com' }
      ];
      const dummyTasks = [
        { id: 1, description: 'Review new student grievances', status: 'Pending' },
        { id: 2, description: 'Approve faculty requests', status: 'In Progress' }
      ];
      const dummyGrievances = [
        { id: 1, category: 'Academic', description: 'Issue with syllabus', status: 'Resolved' },
        { id: 2, category: 'Facilities', description: 'Maintenance required in library', status: 'Pending' }
      ];

      setUsers(dummyUsers);
      setTasks(dummyTasks);
      setGrievances(dummyGrievances);
    };

    fetchDashboardData();
  }, []);

  const handleOpenUserModal = () => setShowUserModal(true);
  const handleCloseUserModal = () => setShowUserModal(false);

  const handleOpenGrievanceModal = (grievance) => {
    setSelectedGrievance(grievance);
    setShowGrievanceModal(true);
  };

  const handleCloseGrievanceModal = () => {
    setShowGrievanceModal(false);
    setSelectedGrievance(null);
  };

  return (
    <div className="admin-dashboard-container">
      {/* Header with statistics */}
      <div className="header-stats">
        <div className="stat-card">
          <h3>Total Students</h3>
          <p>200</p>
        </div>
        <div className="stat-card">
          <h3>Total Staff</h3>
          <p>50</p>
        </div>
        <div className="stat-card">
          <h3>Total Grievances</h3>
          <p>75</p>
        </div>
        <div className="stat-card">
          <h3>Pending Tasks</h3>
          <p>10</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Grievance Management Section */}
        <div className="grievance-section">
          <h3>Recent Grievances</h3>
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
                  {/* Make Description clickable */}
                  <td>
                    <a href="#" onClick={() => handleOpenGrievanceModal(grievance)}>
                      {grievance.description}
                    </a>
                  </td>
                  {/* Make Status clickable */}
                  <td>
                    <a href="#" onClick={() => handleOpenGrievanceModal(grievance)}>
                      {grievance.status}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User Management Section */}
        <div className="user-management-section">
          <h3>User Management</h3>
          <button className="btn btn-primary" onClick={handleOpenUserModal}>
            Add User
          </button>
          <table className="user-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.role}</td>
                  <td>{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Task Management Section */}
        <div className="task-section">
          <h3>Task Management</h3>
          <table className="task-table">
            <thead>
              <tr>
                <th>Task ID</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.id}</td>
                  <td>{task.description}</td>
                  <td>{task.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grievance Modal */}
      {selectedGrievance && (
        <Modal show={showGrievanceModal} handleClose={handleCloseGrievanceModal} title="Manage Grievance">
          <form>
            <div className="form-group">
              <label htmlFor="category">Category:</label>
              <input type="text" id="category" className="form-control" defaultValue={selectedGrievance.category} readOnly />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                className="form-control"
                rows="4"
                defaultValue={selectedGrievance.description}
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="status">Update Status:</label>
              <select id="status" className="form-control" defaultValue={selectedGrievance.status}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Update</button>
          </form>
        </Modal>
      )}

      {/* User Modal */}
      <Modal show={showUserModal} handleClose={handleCloseUserModal} title="Add User">
        <form>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" className="form-control" />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role:</label>
            <select id="role" className="form-control">
              <option value="Student">Student</option>
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" className="form-control" />
          </div>
          <button type="submit" className="btn btn-primary">Add User</button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
