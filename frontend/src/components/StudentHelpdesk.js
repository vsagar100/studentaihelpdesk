import React, { useState, useContext } from 'react';
import { Send, Menu, MessageCircle } from 'lucide-react';
import { GlobalContext } from '../GlobalState';
import '../styles/StudentHelpdesk.css';

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const { BACKEND_API_URL } = useContext(GlobalContext);

  const handleSend = async (e) => {
    if (userMessage.trim()) {
      setMessages([...messages, { text: userMessage, sender: 'user' }]);
      setUserMessage('');
      try {
        // Fetch response from backend
        const response = await fetch(`${BACKEND_API_URL}/api/faq/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json", },
          body: JSON.stringify({ userMessage }),
        });
        const data = await response.json();
        setMessages((prev) => [...prev, { text: data.response, sender: 'bot' }]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          { text: 'Failed to send message. Try again later.', sender: 'bot' },
        ]);
        console.log(error);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="header-content">
          <button className="menu-button" onClick={toggleMenu}>
            <Menu size={20} color="#4b5563" />
          </button>
          <div className="logo-section">
            <div className="logo-container">
              <MessageCircle size={20} color="white" />
            </div>
            <h1 className="text-xl font-semibold">Student Chatbot</h1>
          </div>
        </div>
        {showMenu && (
          <div className="dropdown-menu">
            <a href="/adminsignin" className="dropdown-item">
              Admin Login
            </a>
          </div>
        )}
      </header>

      <div className="chat-area">
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <h2>How can I help you today?</h2>
              <p>Ask me anything about your studies, institute!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="input-section">
        <input
          type="text"
          className="message-input"
          placeholder="Type your message..."
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button className="send-button" onClick={handleSend}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
