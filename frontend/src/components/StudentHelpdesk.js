import React, { useState, useContext } from 'react';
import { GlobalContext } from '../GlobalState';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/StudentHelpdesk.css';  // Your CSS file with improved styles

const StudentHelpdesk = () => {
  const { BACKEND_API_URL } = useContext(GlobalContext);
  const [description, setDescription] = useState('');
  const [chatHistory, setChatHistory] = useState([]);  // Array to keep track of all messages
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);  // Loading state for button animation

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;  // Prevent submitting empty queries

    // Add user's message to chat history
    setChatHistory([...chatHistory, { role: 'user', content: description }]);
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${BACKEND_API_URL}/api/faq/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });

      const data = await res.json();

      if (res.ok) {
        // Append ChatGPT/FAQ response to chat history
        setChatHistory([...chatHistory, { role: 'user', content: description }, { role: 'assistant', content: data.answer }]);
        setDescription('');  // Clear input field
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
      
      {/* Chat history */}
      <div className="chat-history">
        {chatHistory.map((message, index) => (
          <div key={index} className={`chat-message ${message.role}`}>
            <strong>{message.role === 'user' ? 'You' : 'AI Assistant'}:</strong>
            <p>{message.content}</p>
          </div>
        ))}
        {isLoading && <div className="loading-spinner">AI is thinking...</div>}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="helpdesk-form">
        <textarea
          placeholder="Ask your query..."
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

      {/* Error handling */}
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
