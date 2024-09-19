import React, { createContext, useState, useEffect } from 'react';

// Create a context
export const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  // Initialize sidebar state from local storage, default to true (expanded)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem('isSidebarOpen');
    return savedState === null ? true : JSON.parse(savedState);
  });

  // Update local storage whenever sidebar state changes
  useEffect(() => {
    localStorage.setItem('isSidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};
