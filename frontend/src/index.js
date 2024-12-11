import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Your global styles
import MainApp from './MainApp'; // Import MainApp instead of App
import { SidebarProvider } from './contexts/SidebarContext';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './components/UserContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>    
      <UserProvider>
        <MainApp />
      </UserProvider>
  </React.StrictMode>
);