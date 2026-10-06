import React from 'react';
import { useCurrentUser } from '../context/CurrentUserContext';

export default function Profile() {
  const { currentUser } = useCurrentUser();
  
  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>
      <div className="bg-white p-6 rounded shadow border">
        <h2 className="text-xl font-semibold">{currentUser.name}</h2>
        <p className="text-slate-600">{currentUser.department} - Year {currentUser.studyYear}</p>
        <p className="mt-4"><strong>Bio:</strong> {currentUser.bio || 'No bio provided'}</p>
      </div>
    </div>
  );
}
