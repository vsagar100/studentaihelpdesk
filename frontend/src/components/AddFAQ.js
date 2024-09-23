import React, { useState, useEffect, useContext } from 'react';
import { GlobalContext } from '../GlobalState';
import FeedbackModal from './FeedbackModal'; 

const AddFAQ = ({ onSubmit, handleClose }) => {
  const { BACKEND_API_URL } = useContext(GlobalContext);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [keywords, setKeywords] = useState('');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });

  const handleSubmit = async (e) => {
   // e.preventDefault();
    console.log("handleSubmit");
    const formData = new FormData();
    formData.append('question', question);
    formData.append('answer', answer);
    formData.append('keywords', keywords);

    try {
      const res = await fetch(`${BACKEND_API_URL}/api/faq/add`, {
        method: 'POST',
      //  headers: { 'Content-Type': 'application/json' },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        alert("Added question successfully.")
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      console.log(err)
      setError('Failed to submit query');
    }
  };

  return (
    <div>
      <h3>Add FAQ</h3>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
      
        <div className="form-group">
          <label htmlFor="question">Question:</label>
          <textarea
            id="question"
            className="form-control"
            rows="4"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Frequently asked question..."
          />
        </div>
        <div className="form-group">
          <label htmlFor="answer">Answer:</label>
          <textarea
            id="answer"
            className="form-control"
            rows="4"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Mention answer here..."
          />
        </div>
        <div className="form-group">
          <label htmlFor="keywords">Keywords(',' separated):</label>
          <textarea
            id="answer"
            className="form-control"
            rows="1"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Mention keywods here(',' seperated..."
          />
        </div>
        <button type="submit" className="btn btn-primary">Add FAQ</button>
      </form>
    </div>
  );
};

export default AddFAQ;
