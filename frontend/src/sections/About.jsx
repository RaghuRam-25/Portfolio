import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiCpu, FiActivity, FiLayers, FiGithub, FiLinkedin, FiLoader } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook } from 'react-icons/fa';
// skillAPI, projectsAPI, এবং socialLinkAPI ইম্পোর্ট করা হচ্ছে
import { skillAPI, projectsAPI, socialLinkAPI, profileAPI } from '../utils/api';
import { sanitizeProfile } from '../utils/profileSanitizer';
import { calculateExperience } from '../utils/experience';
const categorizeTech = (techName) => {
  const name = techName.toLowerCase().trim();

  const frontendKeywords = [
    'react', 'vue', 'angular', 'next', 'nuxt', 'svelte', 'html', 'css',
    'tailwind', 'bootstrap', 'javascript', 'js', 'typescript', 'ts',
    'sass', 'less', 'redux', 'zustand', 'styled', 'vite', 'webpack',
    'flutter', 'native', 'android', 'ios', 'expo', 'ui', 'material',
    'jquery', 'ember', 'backbone'
  ];

  const backendKeywords = [
    'node', 'express', 'nest', 'django', 'flask', 'fastapi', 'spring',
    'laravel', 'php', 'ruby', 'rails', 'go', 'golang', 'java', 'python',
    'c#', 'asp', 'dotnet', 'rest', 'graphql', 'apollo', 'microservice',
    'socket', 'websocket', 'koa', 'hapi', 'fastify'
  ];

  const databaseKeywords = [
    'mongo', 'mongoose', 'sql', 'postgres', 'mysql', 'sqlite', 'redis',
    'firebase', 'cassandra', 'dynamodb', 'oracle', 'mariadb', 'prisma',
    'sequelize', 'supabase', 'cockroach', 'neo4j'
  ];

  const devopsKeywords = [
    'docker', 'kubernetes', 'k8s', 'aws', 'azure', 'gcp', 'cloud',
    'jenkins', 'ci/cd', 'ci', 'cd', 'terraform', 'ansible', 'nginx',
    'apache', 'linux', 'ubuntu', 'devops', 'heroku', 'vercel', 'netlify',
    'render', 'digitalocean', 'linode', 'cloudflare', 'github actions',
    'gitlab', 'circleci'
  ];

  if (frontendKeywords.some(kw => name.includes(kw))) {
    return 'frontend';
  }
  if (backendKeywords.some(kw => name.includes(kw))) {
    return 'backend';
  }
  if (databaseKeywords.some(kw => name.includes(kw))) {
    return 'database';
  }
  if (devopsKeywords.some(kw => name.includes(kw))) {
    return 'devops';
  }
  return 'tools';
};

export default function About({ profile: initialProfile }) {
  const [latestProfile, setLatestProfile] = useState(null);
  const profile = latestProfile || initialProfile || {};
  const aboutSection = profile?.aboutSection || {};

  useEffect(() => {
    let isMounted = true;

    const fetchLatestAboutProfile = async () => {
      try {
        const response = await profileAPI.getPublicProfile();
        if (isMounted && response.success) {
          setLatestProfile(sanitizeProfile(response.data));
        }
      } catch {
        if (isMounted) {
          setLatestProfile(null);
        }
      }
    };

    fetchLatestAboutProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const [projects, setProjects] = useState([]);
  const [projectCount, setProjectCount] = useState(0);
  const [deliveryRate, setDeliveryRate] = useState(100);
  const [contributionData, setContributionData] = useState([]);
  const [, setIsLoadingContributions] = useState(true);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [socials, setSocials] = useState([]);

  // Calculate experience dynamically from careerStartDate
  const experienceText = useMemo(() => {
    return calculateExperience(profile?.careerStartDate);
  }, [profile?.careerStartDate]);

  // প্রজেক্টগুলো লোড করে সংখ্যা ও ডেলিভারি রেট গণনা করা
  useEffect(() => {
    const fetchProjectData = async () => {
      setIsLoadingProjects(true);
      try {
        const response = await projectsAPI.getAll();
        if (response.success) {
          const allProjects = response.data || [];
          setProjects(allProjects);
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
      setIsLoadingProjects(false);
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
    // "Years Exp" (or label containing year/exp)
    if (stat.label && (stat.label.toLowerCase().includes('year') || stat.label.toLowerCase().includes('exp'))) {
      return { ...stat, label: "Experience", value: experienceText };
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
          setSkills(response.data || []);
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
          setSocials(response.data || []);
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

  // ৪. ডাইনামিক প্রজেক্ট-ক্রিয়েশন অ্যাক্টিভিটি গ্রাফ (GitHub contribution style)
  //    সব ডেটা আসল project.createdAt থেকে তৈরি — কোনো হার্ডকোডেড মান নেই।
  useEffect(() => {
    if (isLoadingProjects) return; // প্রজেক্ট লোড হওয়ার অপেক্ষা
    setIsLoadingContributions(true);

    // প্রজেক্ট না থাকলে গ্রিড খালি রাখা হয় (রেন্ডারে empty-state দেখানো হবে)
    if (!projects || projects.length === 0) {
      setContributionData([]);
      setIsLoadingContributions(false);
      return;
    }

    // লোকাল টাইমজোনে YYYY-MM-DD কী — বাকেট ও গ্রিড সেল একই ফরম্যাট ব্যবহার করে,
    // যাতে UTC/local mismatch-এ দিন এক ঘর সরে না যায়।
    const toKey = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    // প্রতিটি দিনে কতগুলো প্রজেক্ট তৈরি হয়েছে তা গণনা
    const contributionsByDate = new Map();
    projects.forEach((project) => {
      if (!project.createdAt) return;
      const created = new Date(project.createdAt);
      if (Number.isNaN(created.getTime())) return;
      const key = toKey(created);
      contributionsByDate.set(key, (contributionsByDate.get(key) || 0) + 1);
    });

    // ২৪ সপ্তাহের উইন্ডো যা আজকের দিনে শেষ হয় (শেষ কলাম = চলতি সপ্তাহ)।
    const columns = 24;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // চলতি সপ্তাহের রবিবার, তারপর (columns-1) সপ্তাহ পিছিয়ে শুরুর রবিবার
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay() - (columns - 1) * 7);

    const totalDays = columns * 7;
    const matrix = Array.from({ length: totalDays }).map((_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      // ভবিষ্যতের দিন (চলতি সপ্তাহের বাকি অংশ) খালি থাকে
      if (date > today) return 0;
      const count = contributionsByDate.get(toKey(date)) || 0;
      // অ্যাবসোলিউট ইনটেনসিটি: যত বেশি প্রজেক্ট তত গাঢ় (1→1, 2→2, 3→3, 4+→4)
      return Math.min(count, 4);
    });

    setContributionData(matrix);
    setIsLoadingContributions(false);
  }, [projects, isLoadingProjects]);

  const projectCategoriesContent = useMemo(() => {
    if (!projects || projects.length === 0) return null;
    const projectCategories = Array.from(new Set(projects.map(p => p.category).filter(Boolean)));
    if (projectCategories.length === 0) return null;

    return (
      <div className="pt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">Project Categories</h4>
        <div className="flex flex-wrap gap-2">
          {projectCategories.map(cat => (
            <span key={cat} className="text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-3 py-1.5 rounded-full">
              {cat}
            </span>
          ))}
        </div>
      </div>
    );
  }, [projects]);

  const recentProjectContent = useMemo(() => {
    if (!projects || projects.length === 0) return null;
    // createdAt না থাকলে 0 ধরা হয়, যাতে সাজানো stable থাকে; সর্বশেষ প্রজেক্ট নেওয়া হয়
    const ts = (p) => {
      const t = p?.createdAt ? new Date(p.createdAt).getTime() : 0;
      return Number.isNaN(t) ? 0 : t;
    };
    const recentProject = [...projects].sort((a, b) => ts(b) - ts(a))[0];
    if (!recentProject) return null;
    return (
      <div className="mt-4 pt-3 border-t border-dashed border-neutral-800 text-center">
        <p className="text-[10px] uppercase tracking-wider text-neutral-500">Most Recent</p>
        <p className="text-sm font-bold text-light-textPrimary dark:text-white truncate mt-0.5">{recentProject.title}</p>
      </div>
    );
  }, [projects]);

  const skillMatrixContent = useMemo(() => {
    if (isLoadingSkills || isLoadingProjects) {
      return (
        <div className="text-center col-span-full py-10">
          <FiLoader className="animate-spin text-accent-purple text-4xl mx-auto" />
          <p className="text-sm text-neutral-400 mt-2">Loading Skills Matrix...</p>
        </div>
      );
    }

    if (!projects || projects.length === 0) {
      return (
        <div className="text-center col-span-full py-10 bg-neutral-50 dark:bg-neutral-900/40 rounded-2xl border border-light-border/40 dark:border-neutral-800/60">
          <FiLayers className="mx-auto text-4xl text-neutral-400 mb-3" />
          <h4 className="font-bold text-light-textPrimary dark:text-dark-textPrimary">No Technologies to Display</h4>
          <p className="text-sm text-light-textSecondary dark:text-neutral-400 mt-1">Add projects with technologies to see them here.</p>
        </div>
      );
    }

    const techMap = new Map();

    projects.forEach(p => {
      if (p.techStack && Array.isArray(p.techStack)) {
        p.techStack.forEach(tech => {
          const trimmed = tech.trim();
          if (!trimmed) return;
          const key = trimmed.toLowerCase();
          const projectDate = p.createdAt ? new Date(p.createdAt) : new Date();

          if (techMap.has(key)) {
            const entry = techMap.get(key);
            entry.count += 1;
            if (projectDate < entry.oldestDate) {
              entry.oldestDate = projectDate;
            }
          } else {
            techMap.set(key, {
              originalName: trimmed,
              oldestDate: projectDate,
              count: 1
            });
          }
        });
      }
    });

    const dynamicSkills = [];
    const dbSkillsMap = new Map(skills.map(s => [s.name.toLowerCase().trim(), s]));

    techMap.forEach((info, key) => {
      const dbSkill = dbSkillsMap.get(key);
      const category = dbSkill?.category || categorizeTech(info.originalName);
      const experienceLabel = calculateExperience(info.oldestDate.toISOString());
      const descriptionTemplates = {
        frontend: `Expertise in building responsive and interactive user interfaces using ${info.originalName}.`,
        backend: `Robust server-side development, API design, and system integration using ${info.originalName}.`,
        database: `Data persistence, indexing, optimization, and query management with ${info.originalName}.`,
        devops: `Infrastructure automation, CI/CD pipelines, and cloud deployment using ${info.originalName}.`,
        tools: `Streamlining development workflows, tooling, and productivity using ${info.originalName}.`,
      };
      const description = descriptionTemplates[category] || descriptionTemplates.tools;
      const level = Math.min(95, 65 + (info.count * 10));

      dynamicSkills.push({
        name: dbSkill?.name || info.originalName,
        experienceLabel,
        description: dbSkill?.description || description,
        level: dbSkill?.level || level,
        category
      });
    });

    const filteredSkills = dynamicSkills.filter(skill => {
      if (activeFilter === 'all') return true;
      return skill.category === activeFilter;
    });

    if (filteredSkills.length === 0) {
      return (
        <div className="text-center col-span-full py-10 bg-neutral-50 dark:bg-neutral-900/40 rounded-2xl border border-light-border/40 dark:border-neutral-800/60">
          <FiLayers className="mx-auto text-4xl text-neutral-400 mb-3" />
          <h4 className="font-bold text-light-textPrimary dark:text-dark-textPrimary">No Technologies to Display</h4>
          <p className="text-sm text-light-textSecondary dark:text-neutral-400 mt-1">No matching technologies found in this category.</p>
        </div>
      );
    }

    return filteredSkills.map((skill, index) => (
      <div
        key={index}
        className="p-5 sm:p-6 rounded-2xl border border-light-border dark:border-neutral-800 bg-white dark:bg-neutral-900/40 flex flex-col justify-between transition-all hover:border-secondary/30 dark:hover:border-accent/30 group hover:-translate-y-1 duration-300 min-w-0"
      >
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
            <h4 className="font-bold text-sm md:text-base text-light-textPrimary dark:text-dark-textPrimary group-hover:text-secondary dark:group-hover:text-accent transition-colors break-words">{skill.name}</h4>
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary dark:text-accent bg-secondary/10 dark:bg-accent/10 px-2 py-0.5 rounded border border-secondary/10 dark:border-accent/10 flex-shrink-0 self-start">
              {skill.experienceLabel}
            </span>
          </div>
          <p className="text-xs md:text-sm text-light-textSecondary dark:text-neutral-400 leading-relaxed mb-6 font-normal break-words">
            {skill.description}
          </p>
        </div>

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
    ));
  }, [activeFilter, isLoadingProjects, isLoadingSkills, projects, skills]);

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

            {/* Project Categories */}
            {projectCategoriesContent}

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
                  <FiActivity /> Project Creation Pulse
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-light-textSecondary dark:text-neutral-400">
                Project Activity
              </span>
            </div>

            {/* অ্যাক্টিভিটি গ্রিড — প্রজেক্ট থাকলে গ্রিড, না থাকলে empty state */}
            {!isLoadingProjects && (!projects || projects.length === 0) ? (
              <div className="text-center py-10">
                <FiActivity className="mx-auto text-3xl text-neutral-400 mb-2" />
                <p className="text-sm font-bold text-light-textPrimary dark:text-dark-textPrimary">No activity yet</p>
                <p className="text-xs text-light-textSecondary dark:text-neutral-500 mt-1">
                  Project creation activity will appear here once you add projects.
                </p>
              </div>
            ) : (
              <>
                {/* অ্যাক্টিভিটি গ্রিড */}
                <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-2 custom-scrollbar">
                  {contributionData.map((level, idx) => {
                    let colorClass = 'bg-neutral-100 dark:bg-neutral-800/80';
                    if (level === 1) colorClass = 'bg-emerald-200 dark:bg-emerald-900/60';
                    if (level === 2) colorClass = 'bg-emerald-400 dark:bg-emerald-800/80';
                    if (level === 3) colorClass = 'bg-emerald-600 dark:bg-emerald-600';
                    if (level === 4) colorClass = 'bg-emerald-800 dark:bg-emerald-400';

                    return (
                      <div
                        key={idx}
                        className={`w-2.5 h-2.5 rounded-sm transition-colors duration-300 ${colorClass}`}
                        title={`Level ${level} activity`}
                      />
                    );
                  })}
                </div>

                <div className="flex justify-between items-center text-[10px] font-medium text-light-textSecondary dark:text-neutral-500 mt-3">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-sm bg-neutral-100 dark:bg-neutral-800/80"></div>
                    <div className="w-2 h-2 rounded-sm bg-emerald-200 dark:bg-emerald-900/60"></div>
                    <div className="w-2 h-2 rounded-sm bg-emerald-400 dark:bg-emerald-800/80"></div>
                    <div className="w-2 h-2 rounded-sm bg-emerald-600 dark:bg-emerald-600"></div>
                    <div className="w-2 h-2 rounded-sm bg-emerald-800 dark:bg-emerald-400"></div>
                  </div>
                  <span>More</span>
                </div>
              </>
            )}

            {recentProjectContent}
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
                {['all', 'frontend', 'backend', 'database', 'devops', 'tools'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl uppercase tracking-wider transition-all cursor-pointer border ${activeFilter === filter
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm'
                      : 'border-light-border dark:border-neutral-800 bg-white dark:bg-neutral-900/40 text-light-textSecondary dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-light-textPrimary dark:hover:text-white'
                      }`}
                  >
                    {filter === 'tools' ? 'Others' : filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skillMatrixContent}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
