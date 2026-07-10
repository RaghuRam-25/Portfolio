import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiCpu, FiActivity, FiLayers, FiGithub, FiLinkedin, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook } from 'react-icons/fa';
// skillAPI, projectsAPI, এবং socialLinkAPI ইম্পোর্ট করা হচ্ছে
import { skillAPI, projectsAPI, socialLinkAPI } from '../utils/api';

export default function About({ profile }) {
  const aboutSection = profile?.aboutSection || {};

  // নতুন: প্রজেক্টের সংখ্যা ও ডেলিভারি রেট গণনার জন্য স্টেট
  const [projectCount, setProjectCount] = useState(0);
  const [deliveryRate, setDeliveryRate] = useState(100);
  const [yearsExp, setYearsExp] = useState(0);
  const [contributionData, setContributionData] = useState([]);
  const [isLoadingContributions, setIsLoadingContributions] = useState(true);
  const [socials, setSocials] = useState([]);

  // নতুন: ক্যারিয়ার শুরুর তারিখ থেকে অভিজ্ঞতার বছর গণনা
  useEffect(() => {
    if (profile?.careerStartDate) {
      const startDate = new Date(profile.careerStartDate);
      const today = new Date();
      let years = today.getFullYear() - startDate.getFullYear();
      const m = today.getMonth() - startDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < startDate.getDate())) years--;
      setYearsExp(years > 0 ? years : 0);
    }
  }, [profile?.careerStartDate]);

  // প্রজেক্টগুলো লোড করে সংখ্যা ও ডেলিভারি রেট গণনা করা
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
        console.error("Failed to fetch projects for count & delivery rate:", error);
      }
    };
    fetchProjectData();
  }, []);

  // ১. ডাইনামিক স্ট্যাটস ডাটা
  const statsData = (profile?.stats || [
    { value: "0+", label: "Years Exp" },
    { value: "0+", label: "Projects" },
    { value: "100%", label: "Delivery" }
  ]).map(stat => {
    // "Projects" লেবেলযুক্ত স্ট্যাটটি খুঁজে তার মান ডাইনামিকভাবে আপডেট করা হচ্ছে
    if (stat.label && stat.label.toLowerCase().includes('project')) {
      return { ...stat, value: `${projectCount}+` };
    }
    // "Years Exp" লেবেলযুক্ত স্ট্যাটটি খুঁজে তার মান ডাইনামিকভাবে আপডেট করা হচ্ছে
    if (stat.label && stat.label.toLowerCase().includes('year')) {
      return { ...stat, value: `${yearsExp}+` };
    }
    // "Delivery" লেবেলযুক্ত স্ট্যাটটি খুঁজে তার মান ডাইনামিকভাবে আপডেট করা হচ্ছে
    if (stat.label && stat.label.toLowerCase().includes('delivery')) {
      return { ...stat, value: `${deliveryRate}%` };
    }
    return stat;
  });
  const statColors = ["text-light-textPrimary dark:text-white", "text-secondary dark:text-accent", "text-emerald-500"];

  // ২. স্কিল ডাটার জন্য নতুন স্টেট
  const [skills, setSkills] = useState([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);

  // ৩. কম্পোনেন্ট মাউন্ট হওয়ার পর skillAPI থেকে স্কিল লোড করা
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await skillAPI.getAll();
        if (response.success) {
          setSkills(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch skills:", error);
      } finally {
        setIsLoadingSkills(false);
      }
    };
    fetchSkills();
  }, []);

  // নতুন: socialLinkAPI থেকে সোশ্যাল লিঙ্ক লোড করা
  useEffect(() => {
    const fetchSocials = async () => {
      try {
        const response = await socialLinkAPI.getAll();
        if (response.success) {
          setSocials(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch social links:", error);
      }
    };
    fetchSocials();
  }, []);

  // Icon and style mapping for social platforms. The data (URL) comes from the database.
  const socialPlatformStyles = {
    whatsapp: { name: 'WhatsApp', icon: <FaWhatsapp />, color: 'hover:bg-emerald-500 hover:text-white' },
    linkedin: { name: 'LinkedIn', icon: <FiLinkedin />, color: 'hover:bg-blue-600 hover:text-white' },
    facebook: { name: 'Facebook', icon: <FaFacebook />, color: 'hover:bg-sky-600 hover:text-white' },
    github: { name: 'GitHub', icon: <FiGithub />, color: 'hover:bg-neutral-800 hover:text-white' },
    // Add other potential socials here to ensure they can be rendered if added from the admin panel
  };

  const [activeFilter, setActiveFilter] = useState('all');

  const filteredSkills = skills.filter(skill => {
    if (activeFilter === 'all') return true;
    return skill.category === activeFilter;
  });

  // ৪. ডাইনামিক গিটহাব অ্যাক্টিভিটি গ্রাফ
  useEffect(() => {
    const fetchContributions = async () => {
      setIsLoadingContributions(true);
      const githubUrl = profile?.socials?.github;
      if (!githubUrl) {
        setContributionData(Array.from({ length: 24 * 7 }, () => 0));
        setIsLoadingContributions(false);
        return;
      }

      let username;
      try {
        const url = new URL(githubUrl);
        username = url.pathname.split('/').filter(Boolean)[0];
      } catch (e) {
        username = githubUrl.split('/').filter(Boolean).pop();
      }

      if (!username) {
        setContributionData(Array.from({ length: 24 * 7 }, () => 0));
        setIsLoadingContributions(false);
        return;
      }

      try {
        const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=all`);
        if (!res.ok) throw new Error('Contribution data not found');
        const data = await res.json();

        const contributionsByDate = new Map(data.contributions.map(c => [c.date, c.level]));
        const totalDays = 24 * 7;

        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - (totalDays - 1));
        const startDayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - startDayOfWeek);

        const matrix = Array.from({ length: totalDays }).map((_, i) => {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          const dateString = date.toISOString().split('T')[0];
          return contributionsByDate.get(dateString) || 0;
        });
        setContributionData(matrix);
      } catch (error) {
        console.error("Failed to fetch GitHub contributions:", error);
        setContributionData(Array.from({ length: 24 * 7 }, () => 0));
      } finally {
        setIsLoadingContributions(false);
      }
    };

    fetchContributions();
  }, [profile?.socials?.github]);

  return (
    // 💡 ম্যাজিক এখানে: pt-20 এর জায়গায় pt-2 করা হয়েছে যাতে ওই ফাঁকা গ্যাপটা সম্পূর্ণ চলে যায়
    <section id="about" className="pt-2 pb-24 border-t border-light-border/30 dark:border-neutral-900 bg-gradient-to-b from-transparent to-neutral-50/30 dark:to-neutral-950/20">
      <Helmet>
        <title>{`About Me - ${profile?.name}`}</title>
        <meta name="description" content={profile?.bio} />
        {/* Structured Data for Rich Snippets */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "${profile?.name}",
              "url": "${window.location.origin}",
              "jobTitle": "${profile?.title}"
            }
          `}
        </script>
      </Helmet>
      <div className="max-w-7xl mx-auto px-6 space-y-16">

        {/* Intro Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs font-bold tracking-widest uppercase text-secondary dark:text-accent bg-secondary/10 dark:bg-accent/10 px-3 py-1.5 rounded-full border border-secondary/20 dark:border-accent/20 inline-flex items-center gap-1.5">
              <FiCpu /> {aboutSection.eyebrow || 'Engineering Profile'}
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-light-textPrimary dark:text-dark-textPrimary leading-tight">
              {aboutSection.title || 'Crafting High-Performance Full-Stack Architectures'}
            </h2>
            <p className="text-light-textSecondary dark:text-neutral-400 text-sm md:text-base leading-relaxed font-normal">
              {aboutSection.subtitle || profile?.bio || "Loading bio..."}
            </p>

            {/* 🔥 নতুন হাইলাইট স্ট্যাটস কাউন্টার সেকশন */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-light-border/50 dark:border-neutral-800">
              {statsData.map((stat, index) => (
                <div key={index} className="p-3 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border border-light-border/40 dark:border-neutral-800/60">
                  <p className={`text-2xl md:text-3xl font-black ${statColors[index] || statColors[0]}`}>
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-neutral-500 uppercase tracking-wider mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* নতুন: সোশ্যাল মিডিয়া কানেক্ট সেকশন */}
            <div className="mt-8 pt-6 border-t border-light-border/50 dark:border-neutral-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-light-textSecondary dark:text-neutral-400 mb-4">Connect with me</h3>
              <div className="flex flex-wrap gap-3">
                {socials.map((social) => {
                  const platform = socialPlatformStyles[social.platform];
                  // Only render if the platform style is defined and the URL exists
                  if (platform && social.url) {
                    return (
                      <a key={social.platform} href={social.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border border-light-border dark:border-neutral-800 bg-white dark:bg-neutral-900/40 transition-all duration-300 ${platform.color}`}>
                        <span className="text-lg">{platform.icon}</span>
                        <span className="text-xs font-bold">{platform.name}</span>
                      </a>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

          </div>

          {/* গিটহাব অ্যাক্টিভিটি গ্রাফ উইজেট */}
          <div className="lg:col-span-5 p-6 rounded-2xl border border-light-border dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-light-textPrimary dark:text-dark-textPrimary inline-flex items-center gap-1.5">
                  <FiActivity /> Live Engine Pulse
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-light-textSecondary dark:text-neutral-400">
                Active Matrix
              </span>
            </div>

            {/* অ্যাক্টিভিটি গ্রিড */}
            <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-2 custom-scrollbar">
              {contributionData.map((level, idx) => {
                let colorClass = 'bg-neutral-100 dark:bg-neutral-800/80';
                if (level === 1) colorClass = 'bg-emerald-200 dark:bg-emerald-950/60';
                if (level === 2) colorClass = 'bg-emerald-400 dark:bg-emerald-800/70';
                if (level === 3) colorClass = 'bg-emerald-600 dark:bg-emerald-600/80';
                if (level === 4) colorClass = 'bg-emerald-700 dark:bg-emerald-400';

                return (
                  <div
                    key={idx}
                    className={`w-2.5 h-2.5 rounded-sm transition-all duration-300 hover:scale-125 ${colorClass}`}
                    title={`Activity Index: ${level}`}
                  />
                );
              })}
            </div>

            <div className="flex justify-between items-center text-[10px] font-medium text-light-textSecondary dark:text-neutral-500 mt-3">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-sm bg-neutral-100 dark:bg-neutral-800/80"></div>
                <div className="w-2 h-2 rounded-sm bg-emerald-200 dark:bg-emerald-950/60"></div>
                <div className="w-2 h-2 rounded-sm bg-emerald-400 dark:bg-emerald-800/70"></div>
                <div className="w-2 h-2 rounded-sm bg-emerald-600 dark:bg-emerald-600/80"></div>
                <div className="w-2 h-2 rounded-sm bg-emerald-700 dark:bg-emerald-400"></div>
              </div>
              <span>More</span>
            </div>
          </div>
        </div>

        {/* ইন্টারঅ্যাক্টিভ টেক-স্ট্যাক ম্যাট্রিক্স (ভিজিবিলিটি কন্ট্রোল সহ) */}
        {(profile?.sectionVisibility?.skills ?? true) && (
          <div className="pt-10 border-t border-light-border/30 dark:border-neutral-900">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
              <div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-light-textPrimary dark:text-dark-textPrimary inline-flex items-center gap-2">
                  <FiLayers className="text-secondary dark:text-accent" /> Interactive Technology Matrix
                </h3>
                <p className="text-xs md:text-sm text-light-textSecondary dark:text-neutral-400 mt-1">
                  Filter by architecture layers to inspect production readiness and core competencies.
                </p>
              </div>

              {/* ফিল্টার বাটনস */}
              <div className="flex flex-wrap gap-2">
                {['all', 'frontend', 'backend', 'database', 'devops'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl uppercase tracking-wider transition-all cursor-pointer border ${activeFilter === filter
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm'
                      : 'border-light-border dark:border-neutral-800 bg-white dark:bg-neutral-900/40 text-light-textSecondary dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-light-textPrimary dark:hover:text-white'
                      }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* স্কিল কার্ডস গ্রিড */}
            {isLoadingSkills ? (
              <div className="text-center col-span-full py-10">
                <FiLoader className="animate-spin text-accent-purple text-4xl mx-auto" />
                <p className="text-sm text-neutral-400 mt-2">Loading Skills...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-2xl border border-light-border dark:border-neutral-800 bg-white dark:bg-neutral-900/40 flex flex-col justify-between transition-all hover:border-secondary/30 dark:hover:border-accent/30 group hover:-translate-y-1 duration-300"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-sm md:text-base text-light-textPrimary dark:text-dark-textPrimary group-hover:text-secondary dark:group-hover:text-accent transition-colors">{skill.name}</h4>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-secondary dark:text-accent bg-secondary/10 dark:bg-accent/10 px-2 py-0.5 rounded border border-secondary/10 dark:border-accent/10">
                          {skill.years} Yrs Exp
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-light-textSecondary dark:text-neutral-400 leading-relaxed mb-6 font-normal">
                        {skill.description}
                      </p>
                    </div>

                    {/* ডায়নামিক প্রোগ্রেস বার */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold tracking-wider uppercase">
                        <span className="text-light-textSecondary dark:text-neutral-500">Proficiency</span>
                        <span className="text-light-textPrimary dark:text-neutral-300">{skill.level}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-secondary to-accent rounded-full transition-all duration-500"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
