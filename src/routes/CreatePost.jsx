import React from 'react';
import CreatePostModal from '../components/CreatePostModal';

export default function CreatePost() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create Post</h1>
      <CreatePostModal isOpen={true} onClose={() => window.history.back()} onPostCreated={() => window.history.back()} />
    </div>
  );
}
