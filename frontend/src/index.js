import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Your global styles
import MainApp from './MainApp'; // Import MainApp instead of App

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MainApp /> {/* Render MainApp here */}
  </React.StrictMode>
);
