import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from '../GlobalState';
import { Box, Typography, Avatar, TextField, IconButton, Menu, MenuItem, CircularProgress } from "@mui/material";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MenuIcon from "@mui/icons-material/Menu";
import SendIcon from "@mui/icons-material/Send";
import Logo from "../assets/images/logo.png";

const theme = createTheme({
  palette: {
    primary: {
      main: '#1e88e5',
    },
    secondary: {
      main: '#f1f1f1',
    },
  },
});

const styles = {
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f7fb',
    width: '100%'
  },
  mainContainer: {
    width: '80%',
    maxWidth: '1200px',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  chatBubbleUser: {
    maxWidth: '80%',
    padding: '12px 16px',
    margin: '8px 0',
    borderRadius: '12px',
    backgroundColor: '#1e88e5',
    color: 'white',
    marginLeft: 'auto',
    borderTopRightRadius: '4px',
    boxShadow: '0 2px 4px rgba(30, 136, 229, 0.2)',
    wordWrap: 'break-word',
  },
  chatBubbleBot: {
    maxWidth: '80%',
    padding: '12px 16px',
    margin: '8px 0',
    borderRadius: '12px',
    backgroundColor: 'white',
    color: '#333',
    marginRight: 'auto',
    borderTopLeftRadius: '4px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    wordWrap: 'break-word',
  },
  chatWindow: {
    padding: '20px',
    flexGrow: 1,
    overflowY: 'auto',
    backgroundColor: '#f5f7fb',
    display: 'flex',
    flexDirection: 'column',
  },
  messageContainer: {
    width: '100%',
    marginBottom: '10px',
  }
};

const StudentHelpdesk = () => {
  const { BACKEND_API_URL } = useContext(GlobalContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const chatWindowRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    navigate("/adminsignin");
  };

  const handleSend = async () => {
    if (userMessage.trim()) {
      setMessages([...messages, { text: userMessage, sender: "user" }]);
      setUserMessage("");
      setLoading(true);

      try {
        const response = await fetch(`${BACKEND_API_URL}/api/faq/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userMessage }),
        });
        const data = await response.json();
        setMessages((prev) => [...prev, { text: data.response, sender: "bot" }]);
      } catch (error) {
        setMessages((prev) => [...prev, { text: "Failed to send message. Try again later.", sender: "bot" }]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={styles.pageContainer}>
        <Box sx={styles.mainContainer}>
          <Box sx={{ 
            p: 2, 
            backgroundColor: 'white', 
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Avatar src={Logo} alt="AI StudyPal" sx={{ mr: 2 }} />
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              AI StudyPal
            </Typography>
            <IconButton onClick={handleMenuClick}>
              <MenuIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={handleMenuClose}>Admin Login</MenuItem>
            </Menu>
          </Box>

          <Box ref={chatWindowRef} sx={styles.chatWindow}>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress />
              </Box>
            )}
            
            {messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Avatar 
                  src={Logo} 
                  alt="AI Assistant" 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    margin: '0 auto 20px',
                  }} 
                />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  How can I help you today?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ask me anything about your studies!
                </Typography>
              </Box>
            ) : (
              messages.map((msg, index) => (
                <Box key={index} sx={styles.messageContainer}>
                  <Box sx={msg.sender === "user" ? styles.chatBubbleUser : styles.chatBubbleBot}>
                    {msg.text}
                  </Box>
                </Box>
              ))
            )}
          </Box>

          <Box sx={{ 
            p: 2, 
            backgroundColor: 'white', 
            borderTop: '1px solid #e0e0e0',
            position: 'sticky',
            bottom: 0,
          }}>
            <TextField
              fullWidth
              placeholder="Type your message..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSend} color="primary">
                    <SendIcon />
                  </IconButton>
                ),
                sx: {
                  backgroundColor: '#f5f7fb',
                  borderRadius: '24px',
                  '& fieldset': {
                    borderRadius: '24px',
                  }
                }
              }}
            />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default StudentHelpdesk;