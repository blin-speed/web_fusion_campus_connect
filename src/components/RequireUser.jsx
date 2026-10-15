import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';
import { getUserToken } from '../api/auth';

export default function RequireUser({ children }) {
  const { isGuest, currentUser } = useCurrentUser();
  const location = useLocation();
  const token = getUserToken();

  if (!token && isGuest) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (token && !currentUser) {
    return (
      <div className="border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-12 text-center text-xs font-medium text-neutral-500">
        Resuming member session...
      </div>
    );
  }

  return children;
}
