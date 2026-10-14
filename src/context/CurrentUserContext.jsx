import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { request } from '../api/client.js';
import { getUserToken, setUserToken } from '../api/auth.js';
import { adaptUser } from '../api/adapters.js';

const CurrentUserContext = createContext(null);

export function CurrentUserProvider({ children }) {
  const [currentUserId, setCurrentUserId] = useState(() => {
    const token = getUserToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return parseInt(payload.sub, 10);
      } catch (_e) {
        return null;
      }
    }
    return null;
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState('Sign in to continue');

  const refreshUsers = useCallback(async () => {
    try {
      const usersData = await request('GET', '/users');
      if (Array.isArray(usersData)) setUsers(usersData.map(adaptUser));
    } catch (err) {
      console.warn('Could not refresh users from API:', err);
    }
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const user = await request('GET', `/users/${currentUserId}`);
      if (user) {
        setCurrentUser(adaptUser(user));
      }
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

  const login = async (credentials) => {
    try {
      const body = typeof credentials === 'object' && credentials !== null
        ? credentials
        : { userId: credentials };
      const res = await request('POST', '/auth/login', { body });
      setUserToken(res.token);
      setCurrentUserId(res.user.id);
      setCurrentUser(adaptUser(res.user));
      setAuthPromptOpen(false);
      return adaptUser(res.user);
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    }
  };

  const logoutToGuest = () => {
    setUserToken(null);
    setCurrentUserId(null);
    setCurrentUser(null);
  };

  const promptSignIn = (message = 'Sign in to continue') => {
    setAuthPromptMessage(message);
    setAuthPromptOpen(true);
  };

  const addNewUser = async (data) => {
    try {
      const payload = {
        name: data.username || data.name,
        username: data.username || data.name,
        password: data.password,
        department: data.department || '',
        year: data.year || '',
        bio: data.bio || '',
      };
      const res = await request('POST', '/auth/register', { body: payload });
      setUserToken(res.token);
      await refreshUsers();
      setCurrentUserId(res.user.id);
      setCurrentUser(adaptUser(res.user));
      setAuthPromptOpen(false);
      return adaptUser(res.user);
    } catch (err) {
      console.error('Registration failed:', err);
      throw err;
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
