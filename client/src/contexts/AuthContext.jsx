import React, { createContext, useContext, useState, useEffect } from 'react';
// Replace with your actual Bolt DB or Firebase Auth imports
// For now, we simulate async authentication
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking auth state (e.g., from local storage or Bolt DB)
    const checkAuth = () => {
      setTimeout(() => {
        // In a real app, you'd check a token here
        const storedUser = localStorage.getItem('travelsync_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        setLoading(false);
      }, 1500);
    };

    checkAuth();
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    // Simulate API call to sign in
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockUser = { id: '123', email: email };
    localStorage.setItem('travelsync_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setLoading(false);
  };

  const signUp = async (email, password) => {
    setLoading(true);
    // Simulate API call to sign up and get a user object
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockUser = { id: '124', email: email };
    localStorage.setItem('travelsync_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setLoading(false);
  };

  const signOut = () => {
    localStorage.removeItem('travelsync_user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};