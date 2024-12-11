import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminCreateAnnouncement = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [isExpired, setIsExpired] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('is_expired', isExpired);
    if (attachment) {
      formData.append('file', attachment);
    }

    try {
      const response = await fetch('/api/announcements/create', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setFeedback({ show: true, type: 'success', message: 'Announcement created successfully!' });
        navigate('/admin/dashboard');
      } else {
        throw new Error('Failed to create announcement');
      }
    } catch (err) {
      setFeedback({ show: true, type: 'error', message: err.message });
    }
  };

  return (
    <div>
      <h2>Create Announcement</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="General">General</option>
            <option value="Events">Events</option>
            <option value="Facilities">Facilities</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="isExpired">Expired</label>
          <input
            type="checkbox"
            id="isExpired"
            checked={isExpired}
            onChange={(e) => setIsExpired(e.target.checked)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="file">Attachment</label>
          <input type="file" id="file" onChange={(e) => setAttachment(e.target.files[0])} />
        </div>
        <button type="submit">Create Announcement</button>
      </form>
    </div>
  );
};

export default AdminCreateAnnouncement;
