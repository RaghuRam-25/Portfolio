import React, { useState, useEffect } from 'react';
import { FiMail, FiGithub, FiLinkedin, FiChevronDown, FiChevronUp, FiHelpCircle, FiInfo, FiLoader } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaDiscord, FaTelegram } from 'react-icons/fa';
import Toast from '../components/Toast';
import { messagesAPI, faqAPI, socialLinkAPI } from '../utils/api';

export default function Contact({ profile }) {
  const [formData, setFormData] = useState({ senderName: '', senderEmail: '', message: '' });
  const [faqs, setFaqs] = useState([]);
  const [openFaqId, setOpenFaqId] = useState(null);
  const [socials, setSocials] = useState([]);
  const [isFaqLoading, setIsFaqLoading] = useState(true);
  const [faqError, setFaqError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isLoading, setIsLoading] = useState(false);
  const contactInfo = profile?.contactInfo || {};

  useEffect(() => {
    const fetchFaqs = async () => {
      setIsFaqLoading(true);
      setFaqError('');
      try {
        const response = await faqAPI.getAll();
        if (response.success) {
          setFaqs(Array.isArray(response.data) ? response.data : []);
        } else {
          setFaqError(response.message || 'FAQs could not be loaded.');
        }
      } catch (error) {
        console.error("Error loading FAQs:", error);
        setFaqError('FAQs could not be loaded right now.');
      } finally {
        setIsFaqLoading(false);
      }
    };

    const fetchSocials = async () => {
      try {
        const response = await socialLinkAPI.getAll();
        if (response.success) setSocials(response.data || []);
      } catch (error) {
        console.error("Error loading social links:", error);
      }
    };

    fetchFaqs();
    fetchSocials();
  }, []);

  const socialPlatformStyles = {
    facebook:  { name: 'Facebook',  icon: <FaFacebook />,  color: 'text-blue-500',    hover: 'hover:bg-blue-500' },
    whatsapp:  { name: 'WhatsApp',  icon: <FaWhatsapp />,  color: 'text-emerald-500', hover: 'hover:bg-emerald-500' },
    github:    { name: 'GitHub',    icon: <FiGithub />,    color: 'text-neutral-300', hover: 'hover:bg-neutral-700' },
    linkedin:  { name: 'LinkedIn',  icon: <FiLinkedin />,  color: 'text-sky-500',     hover: 'hover:bg-sky-500' },
    twitter:   { name: 'Twitter/X', icon: <FaTwitter />,   color: 'text-sky-400',     hover: 'hover:bg-sky-400' },
    instagram: { name: 'Instagram', icon: <FaInstagram />, color: 'text-pink-500',    hover: 'hover:bg-pink-500' },
    youtube:   { name: 'YouTube',   icon: <FaYoutube />,   color: 'text-red-600',     hover: 'hover:bg-red-600' },
    discord:   { name: 'Discord',   icon: <FaDiscord />,   color: 'text-indigo-500',  hover: 'hover:bg-indigo-500' },
    telegram:  { name: 'Telegram',  icon: <FaTelegram />,  color: 'text-sky-500',     hover: 'hover:bg-sky-500' },
    email:     { name: 'Email',     icon: <FiMail />,      color: 'text-gray-400',    hover: 'hover:bg-gray-600' },
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.senderEmail || !formData.message) {
      setToastMsg('Email and message fields are required.');
      setToastType('error');
      setShowToast(true);
      return;
    }
    setIsLoading(true);
    try {
      const res = await messagesAPI.sendPublic(formData.senderName, formData.senderEmail, formData.message);
      // fetch 4xx/5xx-এ reject করে না, তাই সার্ভার রেসপন্স চেক করা হয় (H4 fix)
      if (!res?.success) {
        throw new Error(res?.message || 'Your message could not be sent. Please try again.');
      }
      setToastMsg('Message received successfully!');
      setToastType('success');
      setShowToast(true);
      setFormData({ senderName: '', senderEmail: '', message: '' });
    } catch (error) {
      const errorMessage = error?.message || 'An error occurred. Please try again.';
      setToastMsg(errorMessage);
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <section id="contact" className="py-16 sm:py-24 border-t border-light-border/30 dark:border-neutral-900 bg-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-10 sm:mb-16 text-center animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-black text-light-textPrimary dark:text-white">{contactInfo.heading || "Let's Start A Project"}</h2>
          <p className="text-sm text-neutral-400 mt-2 max-w-xl mx-auto">{contactInfo.subtitle || 'Choose a channel or use the secure portal.'}</p>
        </div>

        {/* Form + FAQ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start max-w-5xl mx-auto">
          {/* Email Form */}
          <div className="p-4 sm:p-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 animate-fade-in-up animation-delay-100 min-w-0">
            <h3 className="text-sm font-bold mb-6 flex items-center gap-2 text-white"><FiMail className="text-accent-purple" /> {contactInfo.formTitle || 'Drop an Email'}</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <input type="text" placeholder="Your Name (Optional)" value={formData.senderName} onChange={(e) => setFormData({ ...formData, senderName: e.target.value })} className="w-full p-3 text-xs rounded-xl bg-neutral-950 border border-neutral-800 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple text-white outline-none transition-all" />
              <input type="email" placeholder="Your Email*" required value={formData.senderEmail} onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })} className="w-full p-3 text-xs rounded-xl bg-neutral-950 border border-neutral-800 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple text-white outline-none transition-all" />
              <textarea placeholder="Your Message*" required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full p-3 text-xs rounded-xl bg-neutral-950 border border-neutral-800 h-32 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple text-white outline-none transition-all resize-none" />
              <button type="submit" disabled={isLoading} className="w-full py-3 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-bold transition-all duration-300 disabled:bg-neutral-500 disabled:cursor-not-allowed">
                {isLoading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* FAQ */}
          <div className="p-4 sm:p-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 min-h-[300px] animate-fade-in-up animation-delay-200 min-w-0">
            <h3 className="text-sm font-bold mb-6 flex items-center gap-2 text-white"><FiHelpCircle className="text-accent-purple" /> Frequently Asked Questions</h3>
            {isFaqLoading ? (
              <div className="flex items-center justify-center py-12 text-neutral-400">
                <FiLoader className="animate-spin text-2xl" />
              </div>
            ) : faqError ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-300 flex gap-2">
                <FiInfo className="mt-0.5 flex-shrink-0" />
                <span>{faqError}</span>
              </div>
            ) : faqs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-950/30 p-6 text-center">
                <FiHelpCircle className="mx-auto text-3xl text-neutral-600 mb-2" />
                <p className="text-xs font-semibold text-neutral-400">No FAQs published yet.</p>
                <p className="text-xs text-neutral-600 mt-1">Please use the contact form for now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div key={faq._id} className="border-b border-neutral-800 pb-3">
                    <button onClick={() => toggleFaq(faq._id)} className="w-full flex justify-between items-center text-left py-2 text-xs font-bold text-white hover:text-accent-purple transition-colors">
                      <span className="min-w-0 pr-3 break-words">{faq.question}</span>
                      {openFaqId === faq._id ? <FiChevronUp className="text-accent-purple flex-shrink-0 ml-2" /> : <FiChevronDown className="text-neutral-500 flex-shrink-0 ml-2" />}
                    </button>
                    {openFaqId === faq._id && (
                      <div className="mt-2 text-xs text-neutral-400 leading-relaxed pl-1 animate-fade-in-up break-words">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Social Links */}
        {socials.length > 0 && (
          <div className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-neutral-800">
            <h3 className="text-center text-xs font-bold uppercase tracking-wider text-neutral-500 mb-8 animate-fade-in-up">
              {contactInfo.socialHeading || 'Or connect via Social Channels'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
              {socials.map((social, index) => {
                const platform = socialPlatformStyles[social.platform];
                if (!platform) return null;
                return (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group p-4 sm:p-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 flex flex-col items-center justify-center gap-3 min-w-0 ${platform.hover} hover:text-white hover:border-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in-up`}
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className={`text-4xl ${platform.color} group-hover:text-white transition-colors`}>{platform.icon}</div>
                    <h4 className="text-xs font-bold uppercase text-neutral-300 group-hover:text-white transition-colors text-center break-words">{platform.name}</h4>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {showToast && <Toast message={toastMsg} type={toastType} onClose={() => setShowToast(false)} />}
    </section>
  );
}
