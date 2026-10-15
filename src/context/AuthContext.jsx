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
    const storedUserStr = localStorage.getItem('user');

    if (token) {
      let initialUser = null;
      if (storedUserStr) {
        try {
          initialUser = JSON.parse(storedUserStr);
          setUser(initialUser);
          setIsLoggedIn(true);
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }

      try {
        const response = await axiosClient.get('/api/users/me');
        setUser(response.data);
        setIsLoggedIn(true);
        localStorage.setItem('user', JSON.stringify(response.data));
      } catch (error) {
        console.error('Session verification error:', error);
        // Only force logout if 401 Unauthorized or no stored user was present
        if (error.response?.status === 401 || !initialUser) {
          logout();
        }
      }
    } else {
      logout();
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkSession();

    // Listen for global logout events dispatched by the Axios interceptor (on 401 errors)
    const handleGlobalLogout = () => {
      logout();
    };

    window.addEventListener('auth-logout', handleGlobalLogout);
    return () => {
      window.removeEventListener('auth-logout', handleGlobalLogout);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    setUser(null);
    setIsLoggedIn(false);
  };

  const login = async (identifier, password, otpCode = '') => {
    // 1. Immediately wipe any prior session state to prevent stale user bleed-through
    sessionStorage.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);

    const data = await authService.login(identifier, password, otpCode);
    if (data.status === 'SUCCESS' && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // 2. Fetch fresh authenticated user profile
      let resolvedUser = data.user;
      try {
        const response = await axiosClient.get('/api/users/me');
        if (response.data) {
          resolvedUser = response.data;
          localStorage.setItem('user', JSON.stringify(resolvedUser));
        }
      } catch (err) {
        console.warn('Could not fetch /api/users/me, falling back to login response user', err);
      }

      setUser(resolvedUser);
      setIsLoggedIn(true);
      return { ...data, user: resolvedUser };
    }
    return data;
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
