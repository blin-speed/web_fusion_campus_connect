import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { CurrentUserProvider, useCurrentUser } from './context/CurrentUserContext';
import UserSwitcher from './components/UserSwitcher';
import SearchBar from './components/SearchBar';
import CreatePostModal from './components/CreatePostModal';
import { seedIfEmpty } from './db/seed';

// Route components
import Home from './routes/Home';
import Browse from './routes/Browse';
import PostDetail from './routes/PostDetail';
import CreatePost from './routes/CreatePost';
import MyRequests from './routes/MyRequests';
import MyLending from './routes/MyLending';
import Admin from './routes/Admin';
import Profile from './routes/Profile';
import Impact from './routes/Impact';
import RequestsBoard from './routes/RequestsBoard';
import CreateAccount from './routes/CreateAccount';

// Top bar: search-first, no duplicate nav links
function TopBar({ onSearch }) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 sm:px-6">
        {/* Left: Logo with warm orange brand color */}
        <Link
          to="/"
          className="flex-shrink-0 flex items-center gap-2 group"
        >
          <span className="text-xl font-extrabold tracking-tight text-orange-600 group-hover:text-orange-700 transition-colors font-heading">
            Campus<span className="text-slate-800">Circular</span>
          </span>
        </Link>

        {/* Center: SearchBar (dominant) */}
        <div className="flex-1 max-w-2xl">
          <SearchBar
            onSearch={onSearch}
            placeholder="Search items, textbooks, equipment..."
          />
        </div>

        {/* Right: Account Switcher (Google-style) */}
        <div className="flex-shrink-0">
          <UserSwitcher />
        </div>
      </div>
    </header>
  );
}

// Floating Create Post button (FAB) — fixed bottom-right in warm orange
function FloatingCreateButton() {
  const { isGuest, promptSignIn } = useCurrentUser();
  const [modalOpen, setModalOpen] = useState(false);
  const location = useLocation();

  // Only show on feed/browse/post-detail/impact (not on admin, create, my-requests etc.)
  const hiddenPaths = ['/create', '/my-requests', '/my-lending', '/admin', '/profile', '/requests-board'];
  const shouldHide = hiddenPaths.some((p) => location.pathname.startsWith(p));
  if (shouldHide) return null;

  const handleClick = () => {
    if (isGuest) {
      promptSignIn('Sign in to list an item for lending');
      return;
    }
    setModalOpen(true);
  };

  const handlePostCreated = () => {
    window.dispatchEvent(new CustomEvent('postCreated'));
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title="Create New Listing"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-2xl text-white shadow-lg hover:bg-orange-700 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-orange-300"
        aria-label="Create New Listing"
      >
        ＋
      </button>

      <CreatePostModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </>
  );
}

// SearchContext used to pass topbar search queries into Browse
const SearchContext = React.createContext({ query: '', setQuery: () => {} });
export const useSearchContext = () => React.useContext(SearchContext);

function AppInner() {
  const { refreshUsers } = useCurrentUser();
  const [seeded, setSeeded] = useState(false);
  const [topbarQuery, setTopbarQuery] = useState('');

  useEffect(() => {
    async function init() {
      await seedIfEmpty();
      await refreshUsers();
      setSeeded(true);
    }
    init();
  }, [refreshUsers]);

  // Admin route renders completely outside the main layout
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin';
  const isBrowseRoute = location.pathname === '/' || location.pathname === '/browse';
  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin" element={<Admin />} />
      </Routes>
    );
  }

  return (
    <SearchContext.Provider value={{ query: topbarQuery, setQuery: setTopbarQuery }}>
      <div className="min-h-screen bg-stone-50 text-slate-700 flex flex-col">
        <TopBar onSearch={setTopbarQuery} />

        <main className={`mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 ${isBrowseRoute ? 'lg:h-[calc(100vh-105px)] lg:overflow-hidden' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/my-requests" element={<MyRequests />} />
            <Route path="/my-lending" element={<MyLending />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/requests-board" element={<RequestsBoard />} />
            <Route path="/create-account" element={<CreateAccount />} />
          </Routes>
        </main>

        <footer className="border-t border-stone-200 bg-white py-4 text-center text-xs text-slate-500">
          Campus Circular • Peer-to-Peer Resource Lending Marketplace
        </footer>

        {/* Floating Action Button */}
        <FloatingCreateButton />
      </div>
    </SearchContext.Provider>
  );
}

export default function App() {
  return (
    <CurrentUserProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </CurrentUserProvider>
  );
}
