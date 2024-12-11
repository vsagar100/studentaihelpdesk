import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from '../GlobalState';
import { Box, Typography, Avatar, TextField, IconButton, Menu, MenuItem, Button, CircularProgress } from "@mui/material";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import MenuIcon from "@mui/icons-material/Menu";
import SendIcon from "@mui/icons-material/Send";
import "../styles/StudentHelpdesk.css";
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
       // Fetch response from backend
       const response = await fetch(`${BACKEND_API_URL}/api/faq/query`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ query: userMessage }),
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
     <Box className="app-container">
       <Box className="header">
         <Avatar className="header-avatar" src={Logo} alt="AI StudyPal" />
         <Typography variant="h5" className="header-title">
           AI StudyPal
         </Typography>
         <IconButton onClick={handleMenuClick} className="menu-button">
           <MenuIcon />
         </IconButton>
         <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
           <MenuItem onClick={handleMenuClose}>Admin Login</MenuItem>
         </Menu>
       </Box>

       <Box ref={chatWindowRef} className="chat-window">
         {loading && (
           <Box className="loading-container">
             <CircularProgress color="primary" />
             <Typography variant="subtitle1" className="loading-text">
               Loading...
             </Typography>
           </Box>
         )}
         {messages.length === 0 ? (
           <Box className="welcome-container">
             <Avatar className="center-avatar" src={Logo} alt="AI Assistant" />
             <Typography variant="h6" className="welcome-title">
               How can I help you today?
             </Typography>
             <Typography variant="body2" className="welcome-subtitle">
               Ask me anything about your studies!
             </Typography>
           </Box>
         ) : (
           messages.map((msg, index) => (
             <Box
               key={index}
               className={`chat-bubble ${msg.sender === "user" ? "user" : "bot"}`}
               style={{
                 backgroundColor: msg.sender === "user" ? theme.palette.primary.main : theme.palette.secondary.main,
                 color: msg.sender === "user" ? "#fff" : "#000",
               }}
             >
               {msg.text}
             </Box>
           ))
         )}
       </Box>

       <Box className="chat-input-container">
         <TextField
           className="chat-input"
           placeholder="Type your message..."
           fullWidth
           value={userMessage}
           onChange={(e) => setUserMessage(e.target.value)}
           onKeyPress={handleKeyPress}
           InputProps={{
             endAdornment: (
               <IconButton className="send-button" onClick={handleSend}>
                 <SendIcon />
               </IconButton>
             ),
           }}
         />
       </Box>
     </Box>
   </ThemeProvider>
 );
};

export default StudentHelpdesk;