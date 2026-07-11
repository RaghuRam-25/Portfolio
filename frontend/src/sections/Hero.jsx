import React, { useRef, useState, useEffect, useMemo } from 'react';
import { FiArrowUpRight, FiDownload } from 'react-icons/fi';
import { projectsAPI, PLACEHOLDER_AVATAR } from '../utils/api';
import { calculateExperience } from '../utils/experience';

export default function Hero({ setActiveTab, profile }) {
  // ===== নতুন: মাউস কার্সর গ্লো ইফেক্টের জন্য =====
  const sectionRef = useRef(null);
  const rafRef = useRef(null);
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0, active: false });

  const [projectCount, setProjectCount] = useState(0);
  const [deliveryRate, setDeliveryRate] = useState(100);

  // অভিজ্ঞতা start date থেকে স্বয়ংক্রিয়ভাবে Days/Weeks/Months/Years হিসেবে দেখানো হয়
  const experienceText = useMemo(
    () => calculateExperience(profile?.careerStartDate),
    [profile?.careerStartDate]
  );

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await projectsAPI.getAll();
        if (response.success) {
          const allProjects = response.data || [];
          setProjectCount(allProjects.length);
          if (allProjects.length > 0) {
            const deliveredCount = allProjects.filter(p => p.isDelivered).length;
            const rate = Math.round((deliveredCount / allProjects.length) * 100);
            setDeliveryRate(rate);
          } else {
            setDeliveryRate(100);
          }
        }
      } catch (error) {
        console.error("Failed to fetch projects in Hero stats:", error);
      }
    };
    fetchProjectData();
  }, []);

  const rawStats = profile?.stats || [];

  const stats = rawStats.map(stat => {
    if (stat.label && stat.label.toLowerCase().includes('project')) {
      return { ...stat, value: `${projectCount}+` };
    }
    if (stat.label && (stat.label.toLowerCase().includes('year') || stat.label.toLowerCase().includes('exp'))) {
      return { ...stat, label: 'Experience', value: experienceText };
    }
    if (stat.label && stat.label.toLowerCase().includes('delivery')) {
      return { ...stat, value: `${deliveryRate}%` };
    }
    return stat;
  });

  // পারফরম্যান্স: প্রতিটি mousemove-এ setState না করে requestAnimationFrame দিয়ে throttle করা হয়
  const handleMouseMove = (e) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      setGlowPos({ x, y, active: true });
    });
  };

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setGlowPos((p) => ({ ...p, active: false }))}
      className="relative min-h-[85vh] flex items-center justify-center py-14 overflow-hidden"
    >
      {/* ============================================= */}
      {/* নতুন যোগ করা কাস্টম কীফ্রেম / অ্যানিমেশন CSS   */}
      {/* ============================================= */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 6s linear infinite; }

        @keyframes orbit {
          from { transform: rotate(0deg) translateX(160px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(160px) rotate(-360deg); }
        }
        .animate-orbit { animation: orbit 10s linear infinite; }
        .animate-orbit-reverse { animation: orbit 14s linear infinite reverse; }

        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 9s infinite ease-in-out; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-text {
          background-size: 200% auto;
          animation: gradient-shift 4s ease infinite;
        }

        @keyframes ping-slow {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
        .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
      `}</style>

      {/* ============================================= */}
      {/* নতুন: ব্যাকগ্রাউন্ড অ্যানিমেটেড ব্লব শেপ         */}
      {/* ============================================= */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-blob pointer-events-none" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-accent/30 rounded-full blur-3xl animate-blob animation-delay-2000 pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-secondary/30 rounded-full blur-3xl animate-blob animation-delay-4000 pointer-events-none" />

      {/* ============================================= */}
      {/* নতুন: মাউস অনুসরণ করা কার্সর গ্লো                */}
      {/* ============================================= */}
      {glowPos.active && (
        <div
          className="absolute w-72 h-72 rounded-full bg-primary/20 blur-3xl pointer-events-none transition-transform duration-150"
          style={{
            left: glowPos.x - 144,
            top: glowPos.y - 144,
          }}
        />
      )}

      <div className="relative w-full max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">

        {/* বাম পাশের টেক্সট কন্টেন্ট - Fade In Animation */}
        <div className="md:col-span-7 text-left space-y-6 order-2 md:order-1 animate-fade-in-left">

          {profile?.heroSection?.availability?.isAvailable && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold tracking-wide text-primary shadow-sm animate-pulse-slow">
              {/* নতুন: সবুজ ডটে ping/ripple ইফেক্ট যোগ করা হলো */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              {profile.heroSection.availability.badgeText || 'Available for New Projects'}
            </div>
          )}

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] text-neutral-900 dark:text-white animate-slide-up animation-delay-200">
            I'm{' '}
            {/* নতুন: নামের টেক্সটে অ্যানিমেটেড গ্রেডিয়েন্ট */}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient-text">
              {profile?.name || 'Your Name'}
            </span>{' '}
            <br />
            {profile?.heroSection?.headline || 'Building Digital Excellence.'}
          </h1>

          <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-lg max-w-xl leading-relaxed animate-slide-up animation-delay-400">
            {profile?.heroSection?.description || profile?.bio || "Full-Stack Developer crafting high-performance, scalable, and intuitive web experiences. Let's build something extraordinary together."}
          </p>

          {/* Stats Section with Hover Effect */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 max-w-md animate-slide-up animation-delay-600">
            {stats.map((item, i) => (
              <div key={i} className="hover:scale-105 transition-transform duration-300">
                <p className="text-2xl font-black text-neutral-900 dark:text-white">{item.value}</p>
                <p className="text-xs text-neutral-500">{item.label}</p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4 animate-slide-up animation-delay-800">
            <button
              onClick={() => setActiveTab && setActiveTab(profile?.heroSection?.ctaUrl || 'projects')}
              className="group relative overflow-hidden px-6 py-3 rounded-xl text-sm font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:scale-105 active:scale-[0.98] transition-transform flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              {/* নতুন: বাটনে শাইন/শিমার ইফেক্ট */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <span className="relative flex items-center gap-2">{profile?.heroSection?.ctaText || 'View My Work'} <FiArrowUpRight /></span>
            </button>
            <a href={profile?.heroSection?.resumeUrl || '#'} download className="group relative overflow-hidden px-6 py-3 rounded-xl text-sm font-bold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900 active:scale-[0.98] transition-all flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              <span className="relative flex items-center gap-2">Resume <FiDownload /></span>
            </a>
          </div>
        </div>

        {/* ডান পাশের প্রোফাইল ইমেজ - Floating Animation */}
        <div className="md:col-span-5 flex justify-center md:justify-end order-1 md:order-2 animate-fade-in-right">
          <div className="relative w-72 h-72 md:w-96 md:h-96 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-float" />

            {/* নতুন: ঘূর্ণায়মান গ্রেডিয়েন্ট বর্ডার */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl opacity-70 blur-md animate-spin-slow" />

            <div className="relative w-full h-full rounded-3xl overflow-hidden border-4 border-white dark:border-neutral-950 shadow-2xl transition-transform duration-500 group-hover:scale-[1.03]">
              <img src={profile?.heroSection?.heroImageUrl || profile?.avatarUrl || PLACEHOLDER_AVATAR} alt="Profile" className="w-full h-full object-cover" />
            </div>

            {/* নতুন: ইমেজের চারপাশে ঘুরতে থাকা অরবিট ডট */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-3 h-3 rounded-full bg-primary shadow-lg animate-orbit" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-2 h-2 rounded-full bg-accent shadow-lg animate-orbit-reverse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}