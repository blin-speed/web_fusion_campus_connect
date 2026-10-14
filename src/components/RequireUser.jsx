import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';

export default function RequireUser({ children }) {
  const { currentUser, isGuest } = useCurrentUser();
  const location = useLocation();

  if (isGuest || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
