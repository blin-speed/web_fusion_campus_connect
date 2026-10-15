import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { CurrentUserProvider, useCurrentUser } from './context/CurrentUserContext';
import UserSwitcher from './components/UserSwitcher';
import SearchBar from './components/SearchBar';
import { request } from './api/client';

// Route components
import Home from './routes/Home';
import Browse from './routes/Browse';
import PostDetail from './routes/PostDetail';
import CreatePost from './routes/CreatePost';
import MyRequests from './routes/MyRequests';
import MyLending from './routes/MyLending';
import ExchangeRoom from './routes/ExchangeRoom';
import Admin from './routes/Admin';
import Profile from './routes/Profile';
import Impact from './routes/Impact';
import Login from './routes/Login';
import Signup from './routes/Signup';
import RequireUser from './components/RequireUser';
import Kit from './routes/_kit';

function NotificationIndicator() {
  const { isGuest, currentUser } = useCurrentUser();
  const location = useLocation();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isGuest || !currentUser?.id) {
      setCount(0);
      return;
    }
    const fetchCount = async () => {
      try {
        const [incomingReqs, myOwner, myBorrower] = await Promise.all([
          request('GET', '/requests/incoming').catch(() => []),
          request('GET', '/exchanges/mine?role=owner').catch(() => []),
          request('GET', '/exchanges/mine?role=borrower').catch(() => []),
        ]);
        let actionCount = 0;
        (incomingReqs || []).forEach((req) => {
          if (req.status === 'pending') actionCount++;
        });
        (myOwner || []).forEach((ex) => {
          if (['handover', 'returned'].includes(ex.state)) actionCount++;
        });
        (myBorrower || []).forEach((ex) => {
          if (['payment_pending', 'borrowed', 'inspected', 'settled'].includes(ex.state)) actionCount++;
        });
        setCount(actionCount);
      } catch (_e) {
        // ignore
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isGuest, currentUser, location.pathname]);

  if (isGuest) return null;

  return (
    <Link
      to="/"
      className={`border px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors mr-2 ${
        count > 0
          ? 'border-red-600 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 animate-pulse'
          : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
      }`}
      title="Active Lending/Borrowing Alerts"
    >
      Alerts ({count})
    </Link>
  );
}

function TopBar({ onSearch, darkTheme, onToggleTheme }) {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-300 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-sm transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between flex-wrap gap-y-3 gap-x-4 px-4 py-2.5 sm:px-6">
        <Link to="/" className="flex-shrink-0 flex items-center gap-2 group order-1">
          <span className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Campus<span className="text-orange-600">Connect</span>
          </span>
          <span className="hidden md:inline text-[10px] font-semibold uppercase tracking-wider text-neutral-500 border border-neutral-200 dark:border-neutral-800 px-1.5 py-0.5">
            Campus Resource Registry
          </span>
        </Link>
        <div className="w-full sm:flex-1 sm:max-w-xl order-3 sm:order-2">
          <SearchBar onSearch={onSearch} placeholder="Search inventory by keyword or model..." />
        </div>
        <div className="flex-shrink-0 flex items-center order-2 sm:order-3">
          <NotificationIndicator />
          <UserSwitcher />
          <button
            type="button"
            onClick={onToggleTheme}
            title={darkTheme ? 'Switch to light theme' : 'Switch to dark theme'}
            className="ml-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors"
          >
            {darkTheme ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </header>
  );
}

function FloatingCreateButton() {
  const { isGuest } = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();

  const hiddenPaths = ['/create', '/borrowing', '/lending', '/admin', '/profile', '/login', '/signup'];
  const shouldHide = hiddenPaths.some((p) => location.pathname.startsWith(p));
  if (shouldHide) return null;

  const handleClick = () => {
    if (isGuest) {
      navigate('/login', { state: { from: { pathname: '/create' } } });
      return;
    }
    navigate('/create');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Create New Listing"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 border-2 border-orange-600 bg-orange-600 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xl hover:bg-orange-700 transition-all active:scale-95"
    >
      <span>+</span>
      <span>List Resource</span>
    </button>
  );
}

const SearchContext = React.createContext({ query: '', setQuery: () => {} });
export const useSearchContext = () => React.useContext(SearchContext);

function AppInner() {
  const { authPromptOpen, setAuthPromptOpen } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (authPromptOpen) {
      setAuthPromptOpen(false);
      navigate('/login', { state: { from: location } });
    }
  }, [authPromptOpen, setAuthPromptOpen, navigate, location]);

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

  const isAdminRoute = location.pathname === '/admin';
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/create-account';

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin" element={<Admin />} />
      </Routes>
    );
  }

  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/create-account" element={<Navigate to="/signup" replace />} />
      </Routes>
    );
  }

  return (
    <SearchContext.Provider value={{ query: topbarQuery, setQuery: setTopbarQuery }}>
      <div className={`min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors`}>
        {!backendUp && (
          <div className="bg-red-600 text-white text-center py-2 text-xs font-semibold uppercase tracking-wider z-50">
            System Error: Backend is unreachable. Ensure Spring Boot is online on port 8080.
          </div>
        )}
        <TopBar onSearch={setTopbarQuery} darkTheme={darkTheme} onToggleTheme={() => setDarkTheme((current) => !current)} />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/create" element={<RequireUser user={true}><CreatePost /></RequireUser>} />
            
            {/* Redirects */}
            <Route path="/my-requests" element={<Navigate to="/borrowing" replace />} />
            <Route path="/my-lending" element={<Navigate to="/lending" replace />} />
            <Route path="/board" element={<Navigate to="/browse" replace />} />
            <Route path="/requests-board" element={<Navigate to="/browse" replace />} />
            <Route path="/need" element={<Navigate to="/browse" replace />} />
            
            <Route path="/borrowing" element={<RequireUser user={true}><MyRequests /></RequireUser>} />
            <Route path="/lending" element={<RequireUser user={true}><MyLending /></RequireUser>} />
            <Route path="/exchange/:id" element={<RequireUser user={true}><ExchangeRoom /></RequireUser>} />
            <Route path="/profile" element={<RequireUser user={true}><Profile /></RequireUser>} />
            <Route path="/u/:id" element={<Profile />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/_kit" element={<Kit />} />
          </Routes>
        </main>

        <footer className="border-t border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-4 text-center text-xs text-neutral-500 transition-colors">
          Campus Connect • Peer-to-Peer Campus Resource Lending • INR (₹)
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
