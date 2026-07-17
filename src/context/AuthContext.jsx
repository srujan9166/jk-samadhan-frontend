import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axiosClient.get('/api/users/me');
        setUser(response.data);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Session verification failed:', error);
        logout();
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkSession();

    // Listen for global logout events dispatched by the Axios interceptor (on 401 errors)
    const handleGlobalLogout = () => {
      setUser(null);
      setIsLoggedIn(false);
    };

    window.addEventListener('auth-logout', handleGlobalLogout);
    return () => {
      window.removeEventListener('auth-logout', handleGlobalLogout);
    };
  }, []);

  const login = async (mobile, password, otpCode = '') => {
    const data = await authService.login(mobile, password, otpCode);
    if (data.status === 'SUCCESS' && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Load user details
      try {
        const response = await axiosClient.get('/api/users/me');
        setUser(response.data);
        setIsLoggedIn(true);
      } catch (err) {
        // Fallback to profile returned in login if /me fails
        setUser({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          district: data.user.district,
          address: data.user.address,
          role: data.user.role,
        });
        setIsLoggedIn(true);
      }
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isLoading, login, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
