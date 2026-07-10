import React from 'react';
import { FiHome, FiAlertTriangle } from 'react-icons/fi';

export default function NotFound({ setActiveTab }) {
    return (
        <section className="flex items-center justify-center min-h-[70vh] py-12 px-6 text-center">
            <div className="max-w-md animate-fadeIn">
                <FiAlertTriangle className="mx-auto text-7xl text-amber-400 mb-6 animate-pulse" />
                <h1 className="text-8xl font-black text-light-textPrimary dark:text-dark-textPrimary tracking-tighter">404</h1>
                <h2 className="text-2xl font-bold mt-2 text-light-textSecondary dark:text-dark-textSecondary">Page Not Found</h2>
                <p className="text-neutral-500 dark:text-neutral-400 mt-4 mb-8">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <button
                    onClick={() => setActiveTab('home')}
                    className="group relative overflow-hidden px-6 py-3 rounded-xl text-sm font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer mx-auto"
                >
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    <span className="relative flex items-center gap-2"><FiHome /> Go to Homepage</span>
                </button>
            </div>
        </section>
    );
}