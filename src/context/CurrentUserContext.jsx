import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initDB } from '../db/schema';
import { SEED_USERS } from '../db/seed';

const CurrentUserContext = createContext(null);

export function CurrentUserProvider({ children }) {
  // Default state on load: Guest mode (null)
  const [currentUserId, setCurrentUserId] = useState(null);
  const [users, setUsers] = useState(SEED_USERS);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState('Sign in to continue');

  const refreshUsers = useCallback(async () => {
    try {
      const db = await initDB();
      const dbUsers = await db.getAll('users');
      if (dbUsers && dbUsers.length > 0) {
        setUsers(dbUsers);
      }
    } catch (err) {
      console.warn('Could not refresh users from DB:', err);
    }
  }, []);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const currentUser = currentUserId ? users.find((u) => u.id === currentUserId) || null : null;
  const isGuest = !currentUser;

  const login = (userId) => {
    setCurrentUserId(userId);
    setAuthPromptOpen(false);
  };

  const logoutToGuest = () => {
    setCurrentUserId(null);
  };

  const promptSignIn = (message = 'Sign in to continue') => {
    setAuthPromptMessage(message);
    setAuthPromptOpen(true);
  };

  const addNewUser = async ({ name, department, year }) => {
    const db = await initDB();
    const newUser = {
      id: 'u-' + Date.now().toString(36),
      name: name.trim(),
      trustScore: 5.0,
      ratingsCount: 1,
      department: department?.trim() || 'General Studies',
      year: year?.trim() || '1st Year',
      verificationStatus: 'verified',
    };
    await db.put('users', newUser);
    await refreshUsers();
    setCurrentUserId(newUser.id);
    setAuthPromptOpen(false);
    return newUser;
  };

  const updateProfile = async (userId, data) => {
    const db = await initDB();
    const user = await db.get('users', userId);
    if (user) {
      const updated = {
        ...user,
        ...data,
      };
      await db.put('users', updated);
      await refreshUsers();
      return updated;
    }
  };

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
