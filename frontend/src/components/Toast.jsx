import React, { useEffect } from 'react';

export default function Toast({ message, type, onClose }) {
  // ৩ সেকেন্ড পর টোস্টটি অটোমেটিক বন্ধ হয়ে যাওয়ার জন্য
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-fadeIn transition-all duration-300">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-xl ${
        isSuccess 
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
          : 'bg-red-500/10 border-red-500/30 text-red-500'
      }`}>
        {/* আইকন */}
        <span className="text-lg">{isSuccess ? '✓' : '✕'}</span>
        
        {/* মেসেজ */}
        <p className="text-sm font-semibold tracking-wide">{message}</p>
        
        {/* ম্যানুয়াল ক্লোজ বাটন */}
        <button 
          onClick={onClose}
          className="ml-2 text-xs opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
}