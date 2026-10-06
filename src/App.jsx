import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { CurrentUserProvider, useCurrentUser } from './context/CurrentUserContext';
import UserSwitcher from './components/UserSwitcher';
import SearchBar from './components/SearchBar';
// import CreatePostModal removed
import { request } from './api/client';

// Route components
import Home from './routes/Home';
import Browse from './routes/Browse';
import PostDetail from './routes/PostDetail';
import CreatePost from './routes/CreatePost';
import NeedDiscovery from './routes/NeedDiscovery';
import MyRequests from './routes/MyRequests';
import MyLending from './routes/MyLending';
import Admin from './routes/Admin';
import Profile from './routes/Profile';
import Impact from './routes/Impact';
import RequestsBoard from './routes/RequestsBoard';
import CreateAccount from './routes/CreateAccount';
import RequireUser from './components/RequireUser';
import Kit from './routes/_kit';
import { Navigate } from 'react-router-dom';
function TopBar({ onSearch, darkTheme, onToggleTheme }) {
  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur shadow-sm transition-colors ${darkTheme ? 'border-slate-700 bg-slate-900/95 text-slate-100' : 'border-stone-200 bg-white/95'}`}>
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 sm:px-6">
        <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
          <span className="text-xl font-extrabold tracking-tight text-orange-600 dark:text-orange-500 group-hover:text-orange-500 transition-colors font-heading">
            Campus<span className={darkTheme ? 'text-slate-100' : 'text-slate-800'}>Circular</span>
          </span>
        </Link>
        <div className="flex-1 max-w-2xl">
          <SearchBar onSearch={onSearch} placeholder="Search items, textbooks, equipment..." />
        </div>
        <div className="flex-shrink-0">
          <UserSwitcher />
        </div>
        <button
          type="button"
          onClick={onToggleTheme}
          title={darkTheme ? 'Switch to light theme' : 'Switch to dark theme'}
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-sm transition-colors ${darkTheme ? 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700' : 'border-stone-200 bg-white text-slate-700 hover:bg-stone-100'}`}
        >
          {darkTheme ? '~?' : '~_'}
        </button>
      </div>
    </header>
  );
}

// Removed CreatePostModal
import { useNavigate } from 'react-router-dom';

function FloatingCreateButton() {
  const { isGuest, promptSignIn } = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();

  const hiddenPaths = ['/create', '/my-requests', '/my-lending', '/admin', '/profile', '/requests-board'];
  const shouldHide = hiddenPaths.some((p) => location.pathname.startsWith(p));
  if (shouldHide) return null;

  const handleClick = () => {
    if (isGuest) {
      promptSignIn('Sign in to list an item for lending');
      return;
    }
    navigate('/create');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Create New Listing"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-2xl text-white shadow-lg hover:bg-orange-700 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-orange-300"
    >+</button>
  );
}


const SearchContext = React.createContext({ query: '', setQuery: () => {} });
export const useSearchContext = () => React.useContext(SearchContext);

function AppInner() {
  const [topbarQuery, setTopbarQuery] = useState('');
  const [backendUp, setBackendUp] = useState(true);
  const [darkTheme, setDarkTheme] = useState(() => {
    const saved = localStorage.getItem('cc_theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    if (darkTheme) {
      document.documentElement.classList.add('dark', 'dark-theme');
      localStorage.setItem('cc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark', 'dark-theme');
      localStorage.setItem('cc_theme', 'light');
    }
  }, [darkTheme]);

  useEffect(() => {
    request('GET', '/locations').catch(() => setBackendUp(false));
  }, []);

  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin';

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin" element={<Admin />} />
      </Routes>
    );
  }

  return (
    <SearchContext.Provider value={{ query: topbarQuery, setQuery: setTopbarQuery }}>
      <div className={`min-h-screen bg-stone-50 text-slate-700 flex flex-col ${darkTheme ? 'dark-theme' : ''}`}>
        {!backendUp && (
          <div className="bg-red-500 text-white text-center py-1 text-sm font-semibold shadow-sm z-50">
            Backend is unreachable. Please ensure the Spring Boot server is running.
          </div>
        )}
        <TopBar onSearch={setTopbarQuery} darkTheme={darkTheme} onToggleTheme={() => setDarkTheme((current) => !current)} />

        <main className={`mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/need" element={<NeedDiscovery />} />
            
            {/* New Routes & Redirects */}
            <Route path="/my-requests" element={<Navigate to="/borrowing" />} />
            <Route path="/my-lending" element={<Navigate to="/lending" />} />
            <Route path="/requests-board" element={<Navigate to="/board" />} />
            
            <Route path="/borrowing" element={<RequireUser user={true}><MyRequests /></RequireUser>} />
            <Route path="/lending" element={<RequireUser user={true}><MyLending /></RequireUser>} />
            <Route path="/board" element={<RequestsBoard />} />
            <Route path="/profile" element={<RequireUser user={true}><Profile /></RequireUser>} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/_kit" element={<Kit />} />
          </Routes>
        </main>

        <footer className={`border-t py-4 text-center text-xs transition-colors ${darkTheme ? 'border-slate-700 bg-slate-800 text-slate-400' : 'border-stone-200 bg-white text-slate-500'}`}>
          Campus Circular ? Peer-to-Peer Resource Lending Marketplace
        </footer>

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


