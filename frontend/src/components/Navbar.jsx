import React, { useEffect, useRef, useState } from 'react';
import { FiLogOut, FiMenu, FiMessageSquare, FiSliders, FiUser, FiX } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { authAPI, PLACEHOLDER_AVATAR } from '../utils/api';

export default function Navbar({ activeTab, setActiveTab, user, setUser, profile }) {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const defaultNavLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Projects', id: 'projects' },
    { name: 'Blogs', id: 'blogs' },
    { name: 'Services', id: 'services' },
    { name: 'Videos', id: 'videos' },
    { name: 'Education', id: 'education' },
    { name: 'Certificates', id: 'certificates' },
    { name: 'Testimonials', id: 'testimonials' },
    { name: 'Planner', id: 'estimator', requiresAuth: true },
    { name: 'About', id: 'about' },
    { name: 'Contact', id: 'contact' },
  ];

  const allNavLinks = profile?.navigation?.navbarMenu?.length > 0
    ? profile.navigation.navbarMenu.map(item => ({ ...item, name: item.label }))
    : defaultNavLinks;

  const navLinks = allNavLinks.filter(link => {
    if (link.requiresAuth && !user?.isLoggedIn) return false;
    const sectionKey = link.id === 'home' ? 'hero' : link.id;
    return profile?.sectionVisibility?.[sectionKey] ?? true;
  });

  const closeMenus = () => {
    setIsOpen(false);
    setIsProfileOpen(false);
  };

  const handleNavClick = (id) => {
    setActiveTab(id);
    closeMenus();
  };

  const handleLogout = async () => {
    await authAPI.logout();
    if (setUser) {
      setUser({ isLoggedIn: false, name: '', email: '', avatarUrl: '', role: '', _id: null });
    }
    closeMenus();
    setActiveTab('home');
  };

  const handleAuthClick = () => {
    setActiveTab('auth-portal');
    closeMenus();
  };

  const avatarUrl = user?.avatarUrl || profile?.avatarUrl || profile?.heroSection?.heroImageUrl || PLACEHOLDER_AVATAR;

  const accountActions = (mobile = false) => (
    <div className={mobile ? 'mt-3 border-t border-light-border/40 dark:border-neutral-800 pt-3 space-y-2' : 'space-y-1'}>
      {user?.isLoggedIn ? (
        <>
          {mobile && (
            <div className="flex items-center gap-3 rounded-xl bg-neutral-100/80 dark:bg-neutral-900/80 px-3 py-2">
              <img src={avatarUrl} alt={user.name || 'User'} className="h-9 w-9 rounded-full object-cover border border-neutral-200 dark:border-neutral-800" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-neutral-800 dark:text-neutral-100">{user.name || 'Account'}</p>
                <p className="truncate text-xs text-neutral-500">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => handleNavClick('my-messages')}
            className={`${mobile ? 'text-sm py-2.5' : 'text-xs py-2'} w-full rounded-xl px-3 text-left font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 transition-colors`}
          >
            <FiMessageSquare /> My Messages
          </button>
          {user.role === 'admin' && (
            <button
              onClick={() => handleNavClick('admin')}
              className={`${mobile ? 'text-sm py-2.5' : 'text-xs py-2'} w-full rounded-xl px-3 text-left font-bold text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 transition-colors`}
            >
              <FiSliders /> Admin Panel
            </button>
          )}
          <button
            onClick={handleLogout}
            className={`${mobile ? 'text-sm py-2.5' : 'text-xs py-2'} w-full rounded-xl px-3 text-left font-bold text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 transition-colors`}
          >
            <FiLogOut /> Log Out
          </button>
        </>
      ) : (
        <button
          onClick={handleAuthClick}
          className={`${mobile ? 'justify-center bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 py-2.5 text-sm' : 'text-xs py-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'} w-full rounded-xl px-3 font-bold flex items-center gap-2 transition-colors`}
        >
          <FiUser /> Log In
        </button>
      )}
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/75 dark:bg-neutral-950/75 border-b border-light-border/30 dark:border-neutral-900 shadow-sm">
      <style>{`
        @keyframes spin-slow-logo {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow-logo { animation: spin-slow-logo 4s linear infinite; }

        @keyframes spin-slow-logo-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow-logo-reverse { animation: spin-slow-logo-reverse 6s linear infinite; }

        @keyframes logo-glow-pulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.15); }
        }
        .animate-logo-glow-pulse { animation: logo-glow-pulse 2.5s ease-in-out infinite; }

        @keyframes gradient-shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-shimmer {
          background-size: 200% auto;
          animation: gradient-shimmer 5s ease infinite;
        }

        .nav-underline {
          content: '';
          position: absolute;
          left: 0; right: 0; bottom: -6px;
          height: 2px;
          background: linear-gradient(90deg, #06b6d4, #3b82f6);
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.3s ease;
        }
        .nav-link-wrap:hover .nav-underline,
        .nav-underline-active {
          transform: scaleX(1) !important;
        }

        @keyframes dropdown-pop {
          from { opacity: 0; transform: translateY(-8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-dropdown-pop { animation: dropdown-pop 0.22s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

        @keyframes mobile-slide-down {
          from { opacity: 0; transform: translateY(-10px); max-height: 0; }
          to { opacity: 1; transform: translateY(0); max-height: 80vh; }
        }
        .animate-mobile-slide-down { animation: mobile-slide-down 0.25s ease-out forwards; overflow: hidden; }

        @keyframes theme-icon-flip {
          0% { transform: rotate(0deg) scale(0.6); opacity: 0; }
          60% { transform: rotate(200deg) scale(1.2); opacity: 1; }
          100% { transform: rotate(360deg) scale(1); opacity: 1; }
        }
        .animate-theme-icon-flip { animation: theme-icon-flip 0.5s ease-out; }

        @keyframes avatar-ring-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(6,182,212,0.4); }
          50% { box-shadow: 0 0 0 5px rgba(6,182,212,0); }
        }
        .animate-avatar-ring-pulse:hover { animation: avatar-ring-pulse 1s ease-out; }

        @keyframes stagger-fade-in {
          from { opacity: 0; transform: translateX(-6px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-stagger-fade-in { animation: stagger-fade-in 0.3s ease-out both; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <button onClick={() => handleNavClick('home')} className="min-w-0 flex items-center gap-3 cursor-pointer group">
          <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
            <div className="absolute -inset-1 rounded-full bg-primary/40 blur-md animate-logo-glow-pulse" />
            <div className="absolute inset-0 border-2 border-t-transparent border-primary rounded-full animate-spin-slow-logo" />
            <div className="absolute -inset-1 border border-dashed border-primary/40 rounded-full animate-spin-slow-logo-reverse" />
            <img
              src={profile?.heroSection?.heroImageUrl || profile?.avatarUrl || PLACEHOLDER_AVATAR}
              alt="Profile"
              className="relative w-7 h-7 rounded-full object-cover"
            />
          </div>
          <span
            className="truncate max-w-[11rem] sm:max-w-xs text-xl sm:text-2xl font-normal tracking-wide bg-gradient-to-r from-light-textPrimary dark:from-white via-primary to-light-textPrimary dark:to-white bg-clip-text text-transparent animate-gradient-shimmer"
            style={{ fontFamily: "'Alex Brush', 'Palace Script MT', cursive" }}
          >
            {profile?.name || 'Portfolio'}
          </span>
        </button>

        <div className="hidden lg:flex items-center gap-5">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`relative nav-link-wrap text-sm font-semibold transition-all hover:scale-105 active:scale-95 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${activeTab === link.id ? 'text-primary' : 'text-neutral-600 dark:text-neutral-300'}`}
            >
              {link.name}
              <span className={`nav-underline ${activeTab === link.id ? 'nav-underline-active' : ''}`} />
            </button>
          ))}

          <button
            onClick={toggleTheme}
            className="relative p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary hover:shadow-[0_0_12px] hover:shadow-primary/30 transition-all"
            aria-label="Toggle theme"
          >
            <span key={theme} className="inline-block animate-theme-icon-flip">
              {theme === 'light' ? '🌙' : '☀️'}
            </span>
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => user?.isLoggedIn ? setIsProfileOpen(!isProfileOpen) : handleAuthClick()}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-neutral-200 dark:border-neutral-800 hover:scale-105 hover:border-primary transition-transform flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 animate-avatar-ring-pulse"
              aria-label={user?.isLoggedIn ? 'Open account menu' : 'Log in'}
              aria-expanded={isProfileOpen}
            >
              {user?.isLoggedIn ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <FiUser className="text-neutral-500" />
              )}
            </button>

            {isProfileOpen && user?.isLoggedIn && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-neutral-900 p-2 shadow-xl border border-neutral-100 dark:border-neutral-800 origin-top-right animate-dropdown-pop">
                <div className="px-3 py-2 text-xs font-bold text-neutral-500 border-b border-neutral-100 dark:border-neutral-800 mb-1 truncate">
                  {user.name || 'Account'}
                </div>
                {accountActions(false)}
              </div>
            )}
          </div>
        </div>

        <div className="lg:hidden flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary transition-colors" aria-label="Toggle theme">
            <span key={theme} className="inline-block animate-theme-icon-flip">
              {theme === 'light' ? '🌙' : '☀️'}
            </span>
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      <div className="lg:hidden border-t border-light-border/30 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95">
        {isOpen && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-1 animate-mobile-slide-down overflow-y-auto">
            {navLinks.map((link, index) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`block w-full text-left text-sm font-semibold px-3 py-2.5 rounded-xl animate-stagger-fade-in ${activeTab === link.id ? 'text-primary bg-primary/10' : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900'}`}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {link.name}
              </button>
            ))}
            {accountActions(true)}
          </div>
        )}
      </div>
    </nav>
  );
}
