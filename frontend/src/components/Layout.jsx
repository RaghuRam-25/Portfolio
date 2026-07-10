import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatWidget from './ChatWidget';
import { useTheme } from '../context/ThemeContext';

export default function Layout({ children, activeTab, setActiveTab, user, setUser, profile }) {
  const { setTheme } = useTheme();

  // থিম সেটিংস ডাইনামিকভাবে প্রয়োগ করার জন্য useEffect
  useEffect(() => {
    if (profile?.themeSettings) {
      const root = document.documentElement;
      const { primaryColor, secondaryColor, accentColor, fontFamily, darkModeEnabled } = profile.themeSettings;

      // Helper to convert hex to an RGB string "r, g, b"
      const hexToRgb = (hex) => {
        if (!hex || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) return null;
        let c = hex.substring(1).split('');
        if (c.length === 3) {
          c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',');
      };

      // CSS ভেরিয়েবল সেট করা হচ্ছে (RGB format for opacity support in Tailwind)
      if (primaryColor) root.style.setProperty('--color-primary-rgb', hexToRgb(primaryColor));
      if (secondaryColor) root.style.setProperty('--color-secondary-rgb', hexToRgb(secondaryColor));
      if (accentColor) root.style.setProperty('--color-accent-rgb', hexToRgb(accentColor));
      if (fontFamily) document.body.style.fontFamily = fontFamily;

      // থিম কনটেক্সট আপডেট করা হচ্ছে
      // শুধুমাত্র তখনই ডাটাবেজের থিম সেট করা হবে যখন ইউজারের কোনো লোকাল স্টোরেজ প্রিফারেন্স থাকবে না।
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme && darkModeEnabled !== undefined) {
        setTheme(darkModeEnabled ? 'dark' : 'light');
      }
    }
  }, [profile?.themeSettings, setTheme]);

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-textPrimary dark:text-dark-textPrimary transition-colors duration-300">
      {/* আমরা একটিভ ট্যাব স্টেট নেবারে পাস করে দিচ্ছি */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} user={user} setUser={setUser} profile={profile} />

      {/* মেইন এরিয়া যেখানে এখন নির্দিষ্ট পেজ অনুযায়ী মিনিমাম হাইট সেট থাকবে */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-12 flex flex-col justify-center">
        {children}
      </main>

      <Footer profile={profile} />
      <ChatWidget user={user} />
    </div>
  );
}