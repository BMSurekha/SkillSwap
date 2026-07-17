import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('skillswap_user');
      const token = localStorage.getItem('skillswap_token');
      if (savedUser && token) {
        try {
          await api.profile.get();
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.warn("Cached session invalid or user not found in DB. Clearing session.", e);
          localStorage.removeItem('skillswap_token');
          localStorage.removeItem('skillswap_user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.auth.login(email, password);
      setUser(data);
      return data;
    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, fullName, bio, location, avatarUrl) => {
    setLoading(true);
    try {
      const response = await api.auth.register(email, password, fullName, bio, location, avatarUrl);
      return response;
    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const profile = await api.profile.get();
      // Keep DTO fields
      const updatedUser = {
        ...user,
        fullName: profile.fullName,
        bio: profile.bio,
        location: profile.location,
        avatarUrl: profile.avatarUrl,
        averageRating: profile.averageRating,
        completedExchanges: profile.completedExchanges,
        skillsOffered: profile.skillsOffered,
        skillsWanted: profile.skillsWanted
      };
      setUser(updatedUser);
      localStorage.setItem('skillswap_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error("Error refreshing profile: ", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
