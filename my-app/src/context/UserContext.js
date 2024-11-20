import React, { createContext, useState, useContext, useEffect } from 'react';

// Create a Context for user state
const UserContext = createContext();

// Custom hook to use user context
export const useUser = () => {
  return useContext(UserContext);
};

// UserProvider component to wrap the app with user context
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Initially no user is logged in
  const [loading, setLoading] = useState(true); // Loading state for initialization

  // Restore user state from localStorage on app initialization
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Restore user from localStorage
    }
    setLoading(false); // Set loading to false after restoration
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Save user to localStorage
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Remove user from localStorage
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading while restoring user state
  }

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
