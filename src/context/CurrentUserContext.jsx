import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { request } from '../api/client.js';

const CurrentUserContext = createContext(null);

export function CurrentUserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState('Sign in to continue');

  const refreshUsers = useCallback(async () => {
    try {
      const usersData = await request('GET', '/users');
      setUsers(usersData);
    } catch (err) {
      console.warn('Could not refresh users from API:', err);
    }
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const user = await request('GET', `/users/${currentUserId}`);
      setCurrentUser(user);
    } catch (err) {
      console.warn('Could not refresh current user:', err);
    }
  }, [currentUserId]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  useEffect(() => {
    if (currentUserId) {
      refreshCurrentUser();
    } else {
      setCurrentUser(null);
    }
  }, [currentUserId, refreshCurrentUser]);

  const login = async (userId) => {
    try {
      const res = await request('POST', '/auth/login', { body: { userId } });
      sessionStorage.setItem('token', res.token);
      setCurrentUserId(res.user.id);
      setCurrentUser(res.user);
      setAuthPromptOpen(false);
    } catch (err) {
      console.error('Login failed:', err);
      alert('Login failed: ' + err.message);
    }
  };

  const logoutToGuest = () => {
    sessionStorage.removeItem('token');
    setCurrentUserId(null);
    setCurrentUser(null);
  };

  const promptSignIn = (message = 'Sign in to continue') => {
    setAuthPromptMessage(message);
    setAuthPromptOpen(true);
  };

  const addNewUser = async (data) => {
    try {
      const res = await request('POST', '/auth/register', { body: data });
      sessionStorage.setItem('token', res.token);
      await refreshUsers();
      setCurrentUserId(res.user.id);
      setCurrentUser(res.user);
      setAuthPromptOpen(false);
      return res.user;
    } catch (err) {
      console.error('Registration failed:', err);
      alert('Registration failed: ' + err.message);
    }
  };

  const updateProfile = async (userId, data) => {
    try {
      const updated = await request('PATCH', '/users/me', { body: data });
      await refreshUsers();
      await refreshCurrentUser();
      return updated;
    } catch (err) {
      console.error('Update profile failed:', err);
      throw err;
    }
  };

  const isGuest = !currentUser;

  return (
    <CurrentUserContext.Provider
      value={{
        currentUserId,
        setCurrentUserId,
        currentUser,
        isGuest,
        users,
        login,
        logoutToGuest,
        addNewUser,
        updateProfile,
        refreshUsers,
        authPromptOpen,
        setAuthPromptOpen,
        authPromptMessage,
        promptSignIn,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error('useCurrentUser must be used within a CurrentUserProvider');
  }
  return context;
}

export default CurrentUserContext;
