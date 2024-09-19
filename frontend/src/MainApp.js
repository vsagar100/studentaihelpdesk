import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { SidebarProvider } from './contexts/SidebarContext'; // Import SidebarProvider
import { GlobalProvider } from './GlobalState';  // Import GlobalProvider


function MainApp() {
  return (
    <Router>
      <GlobalProvider>
        <SidebarProvider>
          <App />
        </SidebarProvider>
      </GlobalProvider>
    </Router>
  );
}

export default MainApp;
