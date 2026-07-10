import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import DashboardSummary from '../components/admin/DashboardSummary';
import UserManager from '../utils/UserManager';
import PaymentConfirmationViewer from '../components/admin/PaymentConfirmationViewer';
import LiveChat from '../components/admin/LiveChat';
import ProjectPlanChart from '../components/admin/ProjectPlanChart';
import NavigationEditor from '../components/admin/NavigationEditor';
import WebsiteSettingsEditor from '../components/admin/WebsiteSettingsEditor';
import ThemeSettingsEditor from '../components/admin/ThemeSettingsEditor';
import SectionVisibilityEditor from '../components/admin/SectionVisibilityEditor';
import SEOSettingsEditor from '../components/admin/SEOSettingsEditor';
import HeroSectionEditor from '../components/admin/HeroSectionEditor';
import AboutEditor from '../components/admin/AboutEditor';
import ManageSkills from '../components/admin/ManageSkills';
import ManageProjects from '../components/admin/ManageProjects';
import VideoEditor from '../components/admin/VideoEditor';
import ManageCertificates from '../components/admin/ManageCertificates';
import ManageTestimonials from '../components/admin/ManageTestimonials';
import PaymentEditor from '../components/admin/PaymentEditor';
import ProfileEditor from '../components/admin/ProfileEditor';
import ManageSocialLinks from '../components/admin/ManageSocialLinks';
import EducationEditor from '../components/admin/EducationEditor';
import { FiGrid, FiUser, FiAward, FiLayers, FiLayout, FiFilm, FiStar, FiSettings, FiSearch, FiDroplet, FiMenu, FiEye, FiUsers, FiDollarSign, FiCreditCard, FiMessageCircle, FiBarChart2, FiBook, FiLink } from 'react-icons/fi';

// মূল অ্যাডমিন প্যানেল কম্পোনেন্ট
export default function Admin({ user, profile, refreshProfile, showToast }) {
  const { theme, toggleTheme } = useTheme();
  const [activeView, setActiveView] = useState('dashboard');

  const adminSections = [
    { title: 'Overview', items: [{ id: 'dashboard', label: 'Dashboard', icon: <FiGrid /> }] },
    {
      title: 'Content Management',
      items: [
        { id: 'profile', label: 'Profile Info', icon: <FiUser /> },
        { id: 'hero', label: 'Hero Section', icon: <FiUser /> },
        { id: 'about', label: 'About & Stats', icon: <FiAward /> },
        { id: 'skills', label: 'Skills', icon: <FiLayers /> },
        { id: 'projects', label: 'Projects', icon: <FiLayout /> },
        { id: 'education', label: 'Education', icon: <FiBook /> },
        { id: 'videos', label: 'Videos', icon: <FiFilm /> },
        { id: 'certificates', label: 'Certificates', icon: <FiAward /> },
        { id: 'testimonials', label: 'Testimonials', icon: <FiStar /> },

      ]
    },
    {
      title: 'Site Settings', items: [
        { id: 'website', label: 'General', icon: <FiSettings /> },
        { id: 'seo', label: 'SEO', icon: <FiSearch /> },
        { id: 'theme', label: 'Theme', icon: <FiDroplet /> },
        { id: 'navigation', label: 'Navigation', icon: <FiMenu /> },
        { id: 'socials', label: 'Social Links', icon: <FiLink /> },
        { id: 'visibility', label: 'Visibility', icon: <FiEye /> },
      ]
    },
    {
      title: 'User & Finance', items: [
        { id: 'users', label: 'Users', icon: <FiUsers /> },
        { id: 'payments', label: 'Payment Methods', icon: <FiDollarSign /> },
        { id: 'confirmations', label: 'Confirmations', icon: <FiCreditCard /> },
      ]
    },
    {
      title: 'Live Tools', items: [
        { id: 'chat', label: 'Live Chat', icon: <FiMessageCircle /> },
        { id: 'planner', label: 'Project Planner', icon: <FiBarChart2 /> },
      ]
    }
  ];

  const renderActiveView = () => {
    // A helper function to pass common props
    const commonProps = {
      profile,
      refetchProfile: refreshProfile,
      showToast: showToast
    };

    switch (activeView) {
      case 'dashboard': return <DashboardSummary profile={profile} />;
      case 'profile': return <ProfileEditor {...commonProps} />;
      case 'hero': return <HeroSectionEditor {...commonProps} />;
      case 'about': return <AboutEditor {...commonProps} />;
      case 'skills': return <ManageSkills showToast={commonProps.showToast} />;
      case 'projects': return <ManageProjects showToast={commonProps.showToast} />;
      case 'education': return <EducationEditor {...commonProps} />;
      case 'videos': return <VideoEditor {...commonProps} />;
      case 'certificates': return <ManageCertificates showToast={commonProps.showToast} />;
      case 'testimonials': return <ManageTestimonials showToast={commonProps.showToast} />;
      case 'website': return <WebsiteSettingsEditor {...commonProps} />;
      case 'seo': return <SEOSettingsEditor {...commonProps} />;
      case 'theme': return <ThemeSettingsEditor {...commonProps} />;
      case 'navigation': return <NavigationEditor {...commonProps} />;
      case 'socials': return <ManageSocialLinks {...commonProps} />;
      case 'visibility': return <SectionVisibilityEditor {...commonProps} />;
      case 'users': return <UserManager currentUser={user} />;
      case 'payments': return <PaymentEditor {...commonProps} />;
      case 'confirmations': return <PaymentConfirmationViewer />;
      case 'chat': return <LiveChat adminUser={user} />;
      case 'planner': return <ProjectPlanChart {...commonProps} />;
      default: return <DashboardSummary profile={profile} />;
    }
  };

  return (
    <section className="py-12 px-6 max-w-7xl mx-auto scroll-mt-20">
      <style>{`
        @keyframes theme-icon-flip {
          0% { transform: rotate(0deg) scale(0.6); opacity: 0; }
          60% { transform: rotate(200deg) scale(1.2); opacity: 1; }
          100% { transform: rotate(360deg) scale(1); opacity: 1; }
        }
        .animate-theme-icon-flip { animation: theme-icon-flip 0.5s ease-out; }
      `}</style>
      <div className="mb-12 flex justify-between items-start">
        <div>
          <h2 className="text-4xl md:text-5xl font-black">Admin Dashboard</h2>
          <p className="text-neutral-500 mt-2">Welcome, {user.name}. Manage your portfolio content from here.</p>
        </div>
        <button
          onClick={toggleTheme}
          className="p-3 rounded-xl border border-light-border dark:border-neutral-800 hover:border-primary dark:hover:border-primary hover:shadow-md transition-all"
          aria-label="Toggle theme"
        >
          <span key={theme} className="text-xl inline-block animate-theme-icon-flip">
            {theme === 'light' ? '🌙' : '☀️'}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <div className="sticky top-24 space-y-6">
            {adminSections.map(section => (
              <div key={section.title}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 px-2">{section.title}</h4>
                <div className="space-y-1">
                  {section.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${activeView === item.id
                        ? 'bg-accent-purple/10 text-accent-purple'
                        : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'
                        }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-9 space-y-8">
          {renderActiveView()}
        </main>
      </div>
    </section>
  );
}