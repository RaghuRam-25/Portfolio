import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Layout from './components/Layout';
import Toast from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary'; // নতুন: Error Boundary ইম্পোর্ট করা হলো
import { authAPI, profileAPI, SOCKET_URL } from './utils/api';
import { sanitizeProfile } from './utils/profileSanitizer';
import { io } from 'socket.io-client';

// Code Splitting: সেকশনগুলো ডাইনামিকভাবে ইম্পোর্ট করা হচ্ছে
const Hero = React.lazy(() => import('./sections/Hero'));
const Projects = React.lazy(() => import('./sections/Projects'));
const Blogs = React.lazy(() => import('./sections/Blogs'));
const Services = React.lazy(() => import('./sections/Services'));
const ProjectEstimator = React.lazy(() => import('./sections/ProjectEstimator'));
const About = React.lazy(() => import('./sections/About'));
const Contact = React.lazy(() => import('./sections/Contact'));
const AuthPortal = React.lazy(() => import('./components/AuthPortal'));
const Videos = React.lazy(() => import('./sections/Videos'));
const Certificates = React.lazy(() => import('./sections/Certificates'));
const Education = React.lazy(() => import('./sections/Education'));
const Testimonials = React.lazy(() => import('./sections/Testimonials'));
const Admin = React.lazy(() => import('./sections/Admin'));
const NotFound = React.lazy(() => import('./sections/NotFound'));
const EmailVerificationStatus = React.lazy(() => import('./sections/EmailVerificationStatus'));
const Payment = React.lazy(() => import('./sections/Payment'));
const UserMessageCenter = React.lazy(() => import('./sections/UserMessageCenter'));
const HeroIntro = React.lazy(() => import('./components/HeroIntro'));

// App component
function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showIntro, setShowIntro] = useState(true); // ইন্ট্রো অ্যানিমেশন আবার চালু করা হলো
  const [profileData, setProfileData] = useState(null); // ডাইনামিক প্রোফাইল ডেটার জন্য স্টেট
  const [estimation, setEstimation] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // সেন্ট্রাল ইউজার স্টেট
  const [user, setUser] = useState({
    isLoggedIn: false,
    name: '',
    email: '',
    avatarUrl: '',
    role: '',
    _id: null
  });

  const showAppToast = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
  }, []);

  const refreshProfileData = useCallback(async () => {
    try {
      const res = await profileAPI.getPublicProfile();
      setProfileData(res.success ? sanitizeProfile(res.data) : {});
    } catch (error) {
      setProfileData({});
    }
  }, []);

  // প্রথমে, পোর্টফোলিওর পাবলিক ডেটা (নাম, টাইটেল, ইত্যাদি) লোড করা
  // এবং ইউজার সেশন বা OAuth callback হ্যান্ডেল করা
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await profileAPI.getPublicProfile();
        if (res.success) {
          setProfileData(sanitizeProfile(res.data));
        } else {
          // যদি প্রোফাইল ডেটা লোড হতে ব্যর্থ হয় (যেমন: কোনো অ্যাডমিন ইউজার নেই),
          // তাহলে একটি খালি অবজেক্ট দিয়ে স্টেট সেট করা হবে, যাতে অ্যাপটি আটকে না যায়।
          setProfileData({});
        }
      } catch (error) {
        setProfileData({}); // নেটওয়ার্ক এরর হলেও অ্যাপ চলবে
      }
    };
    fetchProfileData();

    // Flag to track if any URL parameters were handled // This was already here
    let handledUrlParams = false;

    // এরপর, ইউজার সেশন বা OAuth callback হ্যান্ডেল করা
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    const name = params.get('name');
    const avatarUrl = params.get('avatarUrl');
    const role = params.get('role');
    const userId = params.get('_id');

    if (token) {
      const userData = { name, email, avatarUrl, role, _id: userId };
      authAPI.saveSession(token, userData);
      setUser({
        isLoggedIn: true,
        name,
        email,
        avatarUrl: avatarUrl || '',
        role: role || '',
        _id: userId,
      });
      setActiveTab('contact');
      handledUrlParams = true;
    }

    const verificationSuccess = params.get('verificationSuccess');
    const verificationError = params.get('verificationError');
    if (verificationSuccess) {
      setActiveTab('email-verified');
      handledUrlParams = true;
    } else if (verificationError) {
      setActiveTab('email-verification-failed');
      handledUrlParams = true;
    }

    // Clean up URL parameters if any were handled
    if (handledUrlParams) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // If no URL parameters were handled, try to load a local session
    if (!handledUrlParams) {
      const session = authAPI.loadSession();
      if (session) {
        setUser({
          isLoggedIn: true,
          name: session.user.name,
          email: session.user.email,
          avatarUrl: session.user.avatarUrl || '',
          role: session.user.role || '',
          _id: session.user._id,
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!profileData) return;
    if (activeTab !== 'admin' && activeTab !== 'auth-portal') {
      refreshProfileData();
    }
  }, [activeTab, refreshProfileData]);

  // নতুন: রিয়েল-টাইম নোটিফিকেশনের জন্য সকেট কানেকশন
  useEffect(() => {
    if (user.isLoggedIn && user.role === 'admin') {
      const socket = io(SOCKET_URL);

      const handleNewMessage = (message) => {
        setNotification({
          show: true,
          message: `New message from ${message.senderName}`,
        });
      };

      const handleNewPayment = (message) => {
        setNotification({
          show: true,
          message: `New payment confirmation from ${message.senderName}`,
        });
      };

      const handleNewReply = (message) => {
        setNotification({
          show: true,
          message: `New reply from ${message.senderName}`,
        });
      };

      socket.on('newMessage', handleNewMessage);
      socket.on('newPaymentConfirmation', handleNewPayment);
      socket.on('newReply', handleNewReply);

      return () => {
        socket.off('newMessage', handleNewMessage);
        socket.off('newPaymentConfirmation', handleNewPayment);
        socket.off('newReply', handleNewReply);
        socket.disconnect();
      };
    }
  }, [user.isLoggedIn, user.role]);

  // ধাপ ১: ইন্ট্রো অ্যানিমেশন দেখানো, যতক্ষণ না এটি শেষ হচ্ছে
  // ডেটা লোড না হওয়া পর্যন্ত ইন্ট্রো দেখানো হবে, যাতে কোনো লোডার না দেখা যায়
  if (showIntro || !profileData) {
    return <HeroIntro onComplete={() => setShowIntro(false)} profile={profileData} />;
  }

  const renderSection = () => {
    const sectionVisible = (key) => profileData?.sectionVisibility?.[key] ?? true;

    switch (activeTab) {
      case 'home': return sectionVisible('hero') ? <Hero setActiveTab={setActiveTab} profile={profileData} /> : <NotFound setActiveTab={setActiveTab} />;
      case 'projects': return sectionVisible('projects') ? <Projects profile={profileData} /> : <NotFound setActiveTab={setActiveTab} />;
      case 'blogs': return sectionVisible('blogs') ? <Blogs profile={profileData} /> : <NotFound setActiveTab={setActiveTab} />;
      case 'services': return sectionVisible('services') ? <Services profile={profileData} /> : <NotFound setActiveTab={setActiveTab} />;
      case 'videos': return sectionVisible('videos') ? <Videos profile={profileData} /> : <NotFound setActiveTab={setActiveTab} />;
      case 'certificates': return sectionVisible('certificates') ? <Certificates profile={profileData} /> : <NotFound setActiveTab={setActiveTab} />;
      case 'education': return sectionVisible('education') ? <Education profile={profileData} /> : <NotFound setActiveTab={setActiveTab} />;
      case 'testimonials': return sectionVisible('testimonials') ? <Testimonials profile={profileData} /> : <NotFound setActiveTab={setActiveTab} />;
      case 'estimator': return sectionVisible('estimator') ? <ProjectEstimator user={user} setActiveTab={setActiveTab} setEstimation={setEstimation} profile={profileData} /> : <NotFound setActiveTab={setActiveTab} />;
      case 'about':
        // About সেকশনে profileData পাস করা হলো
        return sectionVisible('about') ? <About profile={profileData} /> : <NotFound setActiveTab={setActiveTab} />;
      case 'contact':
        // এখানে user প্রপস পাঠানো হলো যাতে কন্টাক্ট পেজ বুঝতে পারে লগইন করা আছে কিনা
        return sectionVisible('contact') ? <Contact
          user={user}
          setUser={setUser}
          setActiveTab={setActiveTab}
          profile={profileData}
        /> : <NotFound setActiveTab={setActiveTab} />;

      case 'auth-portal':
        return (
          <AuthPortal
            onLoginSuccess={(userData) => {
              setUser(userData);
              setActiveTab('contact'); // লগইন সফল হলে সরাসরি কন্টাক্ট পেজে ব্যাক করবে
            }}
            onBackToHome={() => setActiveTab('home')}
          />
        );

      case 'admin':
        // শুধুমাত্র অ্যাডমিন রোল থাকলেই এই সেকশন রেন্ডার হবে
        if (user.isLoggedIn && user.role === 'admin') {
          return <Admin user={user} profile={profileData} refreshProfile={refreshProfileData} setProfileData={setProfileData} showToast={showAppToast} />;
        }
        // অ্যাডমিন না হলে, একটি "Not Found" পেজ দেখানো হয়, যা আরও নিরাপদ
        return <NotFound setActiveTab={setActiveTab} />;
      case 'email-verified': return <EmailVerificationStatus status="success" setActiveTab={setActiveTab} />;
      case 'email-verification-failed': return <EmailVerificationStatus status="error" setActiveTab={setActiveTab} />;
      case 'payment':
        return <Payment profile={profileData} estimation={estimation} />; // estimation prop যোগ করা হলো
      case 'my-messages':
        return user.isLoggedIn ? <UserMessageCenter user={user} /> : <AuthPortal onLoginSuccess={(userData) => { setUser(userData); setActiveTab('contact'); }} onBackToHome={() => setActiveTab('home')} />;

      default: return <NotFound setActiveTab={setActiveTab} />;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={user}
      profile={profileData} // Layout-এ প্রোফাইল ডেটা পাস করা হলো
      setUser={setUser}
    >
      <Suspense fallback={null}>
        <ErrorBoundary key={activeTab}>
          <div className="animate-fadeIn transition-all duration-300">
            {renderSection()}
          </div>
        </ErrorBoundary>
      </Suspense>
      {notification.show && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ show: false, message: '', type: 'success' })}
        />
      )}
    </Layout>
  );
}

export default App;
