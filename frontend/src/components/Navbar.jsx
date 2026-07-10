import React, { useEffect, useRef, useState } from 'react';
import { FiLogOut, FiUser, FiMessageSquare, FiSliders } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../utils/api';

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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Default navigation links if none are provided from the profile
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

  // Use dynamic menu from profile if available, otherwise use default
  const allNavLinks = profile?.navigation?.navbarMenu?.length > 0
    ? profile.navigation.navbarMenu.map(item => ({ ...item, name: item.label }))
    : defaultNavLinks;

  const navLinks = allNavLinks.filter(link => {
    if (link.requiresAuth && !user?.isLoggedIn) {
      return false;
    }
    // 'home' is mapped to the 'hero' section key for visibility check
    const sectionKey = link.id === 'home' ? 'hero' : link.id;

    // Default to true (visible) if sectionVisibility is not defined or the key is not present
    // This ensures that if a setting is missing, the section is shown by default.
    return profile?.sectionVisibility?.[sectionKey] ?? true;
  });

  const handleNavClick = (id) => {
    setActiveTab(id);
    setIsOpen(false);
  };

  const handleLogout = () => {
    authAPI.logout(); // localStorage থেকে token ও user data মুছে দেওয়া
    if (setUser) setUser({ isLoggedIn: false, name: '', email: '', avatarUrl: '' });
    setIsProfileOpen(false);
    setActiveTab('home');
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-neutral-950/70 border-b border-light-border/30 dark:border-neutral-900 shadow-sm">

      {/* ============================================= */}
      {/* নতুন যোগ করা কাস্টম কীফ্রেম / অ্যানিমেশন CSS   */}
      {/* ============================================= */}
      <style>{`
        /* লোগোর রিং - আগে দ্রুত ঘুরতো, এখন স্লো করা হলো */
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

        @keyframes underline-grow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
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
          to { opacity: 1; transform: translateY(0); max-height: 500px; }
        }
        .animate-mobile-slide-down { animation: mobile-slide-down 0.35s ease-out forwards; overflow: hidden; }

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

      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* লোগো সেকশন */}
        <button onClick={() => setActiveTab('home')} className="flex items-center gap-3 cursor-pointer group">
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* নতুন: লোগোর পেছনে হালকা glow pulse */}
            <div className="absolute -inset-1 rounded-full bg-primary/40 blur-md animate-logo-glow-pulse" />

            {/* আগে animate-spin (দ্রুত) ছিল, এখন animate-spin-slow-logo দিয়ে স্লো করা হলো */}
            <div className="absolute inset-0 border-2 border-t-transparent border-primary rounded-full animate-spin-slow-logo"></div>
            {/* নতুন: দ্বিতীয় একটা কাউন্টার-রোটেটিং ড্যাশড রিং যোগ হলো */}
            <div className="absolute -inset-1 border border-dashed border-primary/40 rounded-full animate-spin-slow-logo-reverse"></div>

            <img
              src={profile?.heroSection?.heroImageUrl || profile?.avatarUrl || 'https://via.placeholder.com/400'}
              alt="Profile"
              className="relative w-7 h-7 rounded-full object-cover"
            />
          </div>
          {/* নতুন: নামের টেক্সটে অ্যানিমেটেড গ্রেডিয়েন্ট শিমার */}
          <span
            className="text-2xl font-normal tracking-wide bg-gradient-to-r from-light-textPrimary dark:from-white via-primary to-light-textPrimary dark:to-white bg-clip-text text-transparent animate-gradient-shimmer"
            style={{ fontFamily: "'Palace Script MT', cursive" }}
          >
            {profile?.name || 'Portfolio'}
          </span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              // নতুন: nav-link-wrap ক্লাস + relative পজিশন, hover-এ স্কেল
              className={`relative nav-link-wrap text-sm font-semibold transition-all hover:scale-105 ${activeTab === link.id ? 'text-primary' : 'text-neutral-600 dark:text-neutral-300'}`}
            >
              {link.name}
              {/* নতুন: হোভার/অ্যাকটিভ হলে আন্ডারলাইন এনিমেট হয়ে grow করবে */}
              <span className={`nav-underline ${activeTab === link.id ? 'nav-underline-active' : ''}`} />
            </button>
          ))}

          {/* নতুন: থিম টগল বাটনে হোভার গ্লো + আইকন পরিবর্তনে ফ্লিপ অ্যানিমেশন */}
          <button
            onClick={toggleTheme}
            className="relative p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary hover:shadow-[0_0_12px] hover:shadow-primary/30 transition-all"
          >
            <span key={theme} className="inline-block animate-theme-icon-flip">
              {theme === 'light' ? '🌙' : '☀️'}
            </span>
          </button>

          {/* ইউজার সার্কেল বাটন */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => user?.isLoggedIn ? setIsProfileOpen(!isProfileOpen) : setActiveTab('auth-portal')}
              // নতুন: hover-এ ring pulse effect
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-neutral-200 dark:border-neutral-800 hover:scale-105 hover:border-primary transition-transform flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 animate-avatar-ring-pulse"
            >
              {user?.isLoggedIn ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <FiUser className="text-neutral-500" />
              )}
            </button>

            {/* ড্রপডাউন মেনু */}
            {isProfileOpen && user?.isLoggedIn && (
              // নতুন: pop-in entrance animation যোগ হলো
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-neutral-900 p-2 shadow-xl border border-neutral-100 dark:border-neutral-800 origin-top-right animate-dropdown-pop">
                <div className="px-3 py-2 text-xs font-bold text-neutral-500 border-b border-neutral-100 dark:border-neutral-800 mb-1">
                  {user.name}
                </div>
                <button
                  onClick={() => { setActiveTab('my-messages'); setIsProfileOpen(false); }}
                  className="w-full px-3 py-2 text-left text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <FiMessageSquare /> My Messages
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={() => { setActiveTab('admin'); setIsProfileOpen(false); }}
                    className="w-full px-3 py-2 text-left text-xs font-bold text-primary dark:text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl flex items-center gap-2 transition-colors mb-1"
                  >
                    <FiSliders /> Admin Panel
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-left text-xs font-bold text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <FiLogOut /> Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-light-border/30 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={() => setIsOpen(!isOpen)} className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            {isOpen ? 'Close' : 'Menu'}
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary transition-colors">
            <span key={theme} className="inline-block animate-theme-icon-flip">
              {theme === 'light' ? '🌙' : '☀️'}
            </span>
          </button>
        </div>

        {isOpen && (
          // নতুন: মোবাইল মেনু slide-down animation দিয়ে খুলবে
          <div className="max-w-7xl mx-auto px-6 pb-4 space-y-2 animate-mobile-slide-down">
            {navLinks.map((link, index) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`block w-full text-left text-sm font-semibold py-2 animate-stagger-fade-in ${activeTab === link.id ? 'text-primary' : 'text-neutral-700 dark:text-neutral-200'}`}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {link.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}