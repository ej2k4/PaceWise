import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [emotion, setEmotion] = useState(null);

  useEffect(() => {
    // Check local storage for user on mount
    const storedUser = localStorage.getItem('adaptive_learning_user');
    const storedEmotion = localStorage.getItem('adaptive_learning_emotion');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from local storage");
      }
    }
    if (storedEmotion) {
      try {
        setEmotion(JSON.parse(storedEmotion));
      } catch (e) {
        console.error("Failed to parse emotion from local storage");
      }
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('adaptive_learning_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setEmotion(null);
    localStorage.removeItem('adaptive_learning_user');
    localStorage.removeItem('adaptive_learning_emotion');
  };

  const updateEmotion = (emotionData) => {
    setEmotion(emotionData);
    localStorage.setItem('adaptive_learning_emotion', JSON.stringify(emotionData));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, emotion, setEmotion: updateEmotion }}>
      {children}
    </AuthContext.Provider>
  );
};
