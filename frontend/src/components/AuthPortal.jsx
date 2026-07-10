import React, { useState } from 'react';
import { authAPI } from '../utils/api';
import { FiMail, FiLock, FiArrowLeft, FiUser, FiCheckCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

export default function AuthPortal({ onLoginSuccess, onBackToHome }) {
  const [isRegister, setIsRegister] = useState(false); // লগইন/রেজিস্টার টগল করার জন্য
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOAuthLogin = (provider) => {
    // OAuth redirect — backend Passport.js হ্যান্ডেল করবে
    if (provider === 'Google') authAPI.loginWithGoogle();
    else authAPI.loginWithGitHub();
  };

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await authAPI.login(email, password);
      if (data.success) {
        authAPI.saveSession(data.token, data.user);
        onLoginSuccess({
          isLoggedIn: true,
          name: data.user.name,
          email: data.user.email,
          avatarUrl: data.user.avatarUrl || '',
          role: data.user.role || '',
          _id: data.user._id,
        });
      } else {
        setErrorMsg(data.message || 'Login failed. Check your credentials.');
      }
    } catch {
      setErrorMsg('Server unreachable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const data = await authAPI.register(name, email, password);
      if (data.success) {
        setSuccessMsg('Registration successful! Please check your email for verification.');
        setIsRegister(false); // রেজিস্টার সফল হলে লগইন ফর্মে ফিরে আসা
        setName('');
        setPassword('');
        // ইমেইল ফিল্ডটি রেখে দেওয়া যেতে পারে সুবিধার জন্য
      } else {
        // Zod থেকে আসা এরর অ্যারে অথবা সাধারণ মেসেজ দেখানো
        const message = Array.isArray(data.errors) ? data.errors.join(', ') : (data.message || 'Registration failed.');
        setErrorMsg(message);
      }
    } catch {
      setErrorMsg('Server unreachable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-gradient-to-b from-transparent to-neutral-50/20 dark:to-neutral-950/20">
      <div className="w-full max-w-md p-8 rounded-3xl border border-light-border dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xl relative backdrop-blur-md">

        {/* Back Button */}
        <button
          onClick={onBackToHome}
          className="absolute top-6 left-6 text-neutral-400 hover:text-light-textPrimary dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
        >
          <FiArrowLeft /> Back
        </button>

        <div className="text-center mt-6 mb-8">
          <h2 className="text-2xl font-black text-light-textPrimary dark:text-white tracking-tight">{isRegister ? 'Create Your Account' : 'Access Cloud Dashboard'}</h2>
          <p className="text-xs text-neutral-400 mt-1.5">{isRegister ? 'Join the matrix to start building.' : 'Sign in to sync database wires.'}</p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleOAuthLogin('Google')}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl border border-light-border dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-bold text-light-textPrimary dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            <FcGoogle className="text-lg" /> Continue with Google
          </button>

          <button
            onClick={() => handleOAuthLogin('GitHub')}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl border border-light-border dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-bold text-light-textPrimary dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            <FaGithub className="text-lg text-neutral-900 dark:text-white" /> Continue with GitHub
          </button>
        </div>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-light-border/60 dark:border-neutral-800"></div></div>
          <span className="relative px-3 bg-white dark:bg-neutral-900 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Or with credentials</span>
        </div>

        {/* Standard Credentials Form */}
        {isRegister ? (
          // Register Form
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Full Name</label>
              <div className="relative"><span className="absolute inset-y-0 left-3 flex items-center text-neutral-400"><FiUser /></span><input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-light-border dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40" placeholder="John Doe" /></div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Email</label>
              <div className="relative"><span className="absolute inset-y-0 left-3 flex items-center text-neutral-400"><FiMail /></span><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-light-border dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40" placeholder="john.doe@example.com" /></div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Password</label>
              <div className="relative"><span className="absolute inset-y-0 left-3 flex items-center text-neutral-400"><FiLock /></span><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-light-border dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40" placeholder="••••••••" /></div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 mt-2 rounded-xl text-xs font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50">{loading ? 'Creating...' : 'Create Account'}</button>
          </form>
        ) : (
          // Login Form
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Console Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-neutral-400"><FiMail /></span>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-light-border dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40" placeholder="developer@matrix.com" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Secure Key</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-neutral-400"><FiLock /></span>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-light-border dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 mt-2 rounded-xl text-xs font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50">{loading ? 'Decrypting...' : 'Unlock Account'}</button>
          </form>
        )}

        {/* Success/Error Messages */}
        {errorMsg && <p className="text-xs text-red-400 text-center mt-4">{errorMsg}</p>}
        {successMsg && <p className="text-xs text-emerald-500 text-center mt-4 flex items-center justify-center gap-1"><FiCheckCircle /> {successMsg}</p>}

        {/* Toggle between Login and Register */}
        <p className="text-center text-xs text-neutral-500 mt-6">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="ml-1 font-bold text-accent-blue dark:text-accent-purple hover:underline"
          >
            {isRegister ? 'Sign In' : 'Create One'}
          </button>
        </p>
      </div>
    </section>
  );
}