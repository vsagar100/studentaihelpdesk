import React, { useState, useContext } from 'react';
import { GlobalContext } from '../GlobalState';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/StudentHelpdesk.css';

const StudentHelpdesk = () => {
  const { BACKEND_API_URL } = useContext(GlobalContext);
  const [description, setDescription] = useState('');
  const [chatHistory, setChatHistory] = useState([]); // Array to keep track of all messages
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state for button animation

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return; // Prevent submitting empty queries

    // Add user's message to chat history
    setChatHistory([{ role: 'user', content: description }, ...chatHistory]);
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
        setChatHistory([{ role: 'assistant', content: data.answer }, { role: 'user', content: description }, ...chatHistory]);
        setDescription(''); // Clear input field
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      setError('Failed to submit query');
    }
    setIsLoading(false);
  };
  /*
  const handleOnClickAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/add_faq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });

      const data = await res.json();

      if (res.ok) {
        alert("FAQs embedded successfully!");
         } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      setError('Failed to submit query');
    }
    setIsLoading(false);
  };
  */

  return (
    <div className="helpdesk-container">
      <form onSubmit={handleSubmit} className="helpdesk-form">
        {/* Input form on top */}
        <textarea
          placeholder="Ask your query..."
          className="form-control query-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        {/*
        <button type="button" onClick={handleOnClickAdd} className={`btn btn-primary submit-btn ${isLoading ? 'loading' : ''}`}>
          {isLoading ? (
            <span className="loading-spinner"></span>
          ) : (
            <>
              <FontAwesomeIcon icon={faPaperPlane} /> Embed FAQs
            </>
          )}
        </button> */}
        
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

      {/* Chat history below */}
      <div className="chat-history">
        {chatHistory.map((message, index) => (
          <div key={index} className={`chat-message ${message.role}`}>
            <strong>{message.role === 'user' ? 'You' : 'AI Assistant'}:</strong>
            <p>{message.content}</p>
          </div>
        ))}
        {isLoading && <div className="loading-spinner">AI is thinking...</div>}
      </div>

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
