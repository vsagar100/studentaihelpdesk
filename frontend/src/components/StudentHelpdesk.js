import React, { useState, useContext } from 'react';
import Modal from './Modal';
import FeedbackModal from './FeedbackModal';
import { GlobalContext } from '../GlobalState';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/StudentHelpdesk.css';  // Updated styling

const StudentHelpdesk = () => {
  const { BACKEND_API_URL } = useContext(GlobalContext);
  const [description, setDescription] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);  // Loading state for button animation

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResponse('');
    setIsLoading(true);

    try {
      const res = await fetch(`${BACKEND_API_URL}/api/faq/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(prevResponse => prevResponse + "\n\n" + data.answer);
        setDescription('');
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      setError('Failed to submit query');
    }
    setIsLoading(false);
  };

  return (
    <div className="helpdesk-container">
      <h2 className="helpdesk-header">Student AI Helpdesk</h2>
      <form onSubmit={handleSubmit} className="helpdesk-form">
        <textarea
          placeholder="Enter your query"
          className="form-control query-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <button type="submit" className={`btn btn-primary submit-btn ${isLoading ? 'loading' : ''}`}>
          {isLoading ? (
            <span className="loading-spinner"></span>
          ) : (
            <>
              <FontAwesomeIcon icon={faPaperPlane} /> Submit
            </>
          )}
        </button>
      </form>

      {/* Display response */}
      {response && (
        <div className="response-box">
          <FontAwesomeIcon icon={faCheckCircle} className="response-icon" />
          <h3>Response:</h3>
          <p className="response-text">{response}</p>
        </div>
      )}

      {/* Display error */}
      {error && (
        <div className="error-box">
          <FontAwesomeIcon icon={faTimesCircle} className="error-icon" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default StudentHelpdesk;
