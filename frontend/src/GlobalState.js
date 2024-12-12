import React, { createContext, useState } from 'react';

// Create a Context for Global State
export const GlobalContext = createContext();

// Create a Provider component
export const GlobalProvider = ({ children }) => {
  // Declare your global variable here
  const [BACKEND_API_URL] = useState('http://localhost:5000');

  return (
    <GlobalContext.Provider value={{ BACKEND_API_URL }}>
      {children}
    </GlobalContext.Provider>
  );
};
