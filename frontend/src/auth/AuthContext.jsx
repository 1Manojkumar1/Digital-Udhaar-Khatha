import React, { createContext, useState, useEffect } from 'react';
import authService from './authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for stored credentials on initial boot
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('udhar_token');
      const storedUser = localStorage.getItem('udhar_user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify session integrity with the backend in the background
          const profileResponse = await authService.getProfile();
          if (profileResponse.success && profileResponse.data) {
            setUser(profileResponse.data);
            localStorage.setItem('udhar_user', JSON.stringify(profileResponse.data));
          }
        } catch (err) {
          console.warn('Cached authentication session is invalid or expired:', err.message);
          // Auto-clean broken session
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.data) {
        const userData = response.data;
        const jwtToken = userData.token;
        
        // Remove token key from the user object for separation
        const cleanUser = { ...userData };
        delete cleanUser.token;

        localStorage.setItem('udhar_token', jwtToken);
        localStorage.setItem('udhar_user', JSON.stringify(cleanUser));

        setToken(jwtToken);
        setUser(cleanUser);
        return cleanUser;
      }
      throw new Error('Login failed. Please verify credentials.');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, phone, shopName, currency) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register({
        name,
        email,
        password,
        phone,
        shopName,
        currency,
      });
      if (response.success && response.data) {
        const userData = response.data;
        const jwtToken = userData.token;

        const cleanUser = { ...userData };
        delete cleanUser.token;

        localStorage.setItem('udhar_token', jwtToken);
        localStorage.setItem('udhar_user', JSON.stringify(cleanUser));

        setToken(jwtToken);
        setUser(cleanUser);
        return cleanUser;
      }
      throw new Error('Registration failed.');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('udhar_token');
    localStorage.removeItem('udhar_user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
