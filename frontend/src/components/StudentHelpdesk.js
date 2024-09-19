import React, { useState, useEffect, useContext } from 'react';
import { GlobalContext } from '../GlobalState';
import SubmitGrievance from './SubmitGrievance';
import Modal from './Modal';
import FeedbackModal from './FeedbackModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/StudentDashboard.css';

const StudentHelpdesk = () => {
  const { BACKEND_API_URL } = useContext(GlobalContext);
  const [description, setDescription] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset error and response
    setError('');
    setResponse('');

    try {
          const res = await fetch(`${BACKEND_API_URL}/api/faq/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description })
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(response+"%%"+data.answer);
        setDescription('');
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      setError('Failed to submit query');
    }
  };

  return (
    <div className="helpdesk-container">
      <h2>Ask your query</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Enter your query"
          className="form-control"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>

      {response && (
        <div className="response">
          <h3>Response:</h3>
          <p>{response}</p>
        </div>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default StudentHelpdesk;
