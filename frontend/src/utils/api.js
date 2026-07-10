// ============================================================
// Central API utility — সব API call এখান থেকে হবে
// UI/Design কিছু পরিবর্তন করে না, শুধু data fetch করে
// ============================================================

let apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (apiURL && !apiURL.endsWith('/api') && !apiURL.endsWith('/api/')) {
  apiURL = apiURL.replace(/\/$/, '') + '/api';
}
const BASE_URL = apiURL;
export const SOCKET_URL = BASE_URL.replace(/\/api\/?$/, '');

// LocalStorage থেকে JWT token নেওয়া
const getToken = () => localStorage.getItem('portfolio_token');

// Common headers
const getHeaders = (isProtected = false) => {
  const headers = { 'Content-Type': 'application/json' };
  if (isProtected) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// ============================================================
// IMAGE URL NORMALIZATION (Relative to Absolute & vice-versa)
// ============================================================
const makeUrlsAbsolute = (data) => {
  if (!data) return data;

  if (typeof data === 'string') {
    if (data.startsWith('uploads/') && !data.startsWith('http://') && !data.startsWith('https://')) {
      return `${SOCKET_URL}/${data}`;
    }
    if (data.startsWith('/uploads/') && !data.startsWith('http://') && !data.startsWith('https://')) {
      return `${SOCKET_URL}${data}`;
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => makeUrlsAbsolute(item));
  }

  if (typeof data === 'object') {
    const newData = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newData[key] = makeUrlsAbsolute(data[key]);
      }
    }
    return newData;
  }

  return data;
};

const makeUrlsRelative = (data) => {
  if (!data) return data;

  if (typeof data === 'string') {
    if (data.startsWith(SOCKET_URL + '/uploads/')) {
      return data.substring(SOCKET_URL.length + 1);
    }
    if (data.startsWith(SOCKET_URL + 'uploads/')) {
      return data.substring(SOCKET_URL.length);
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => makeUrlsRelative(item));
  }

  if (typeof data === 'object') {
    const newData = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newData[key] = makeUrlsRelative(data[key]);
      }
    }
    return newData;
  }

  return data;
};

const cleanFormData = (formData) => {
  if (!(formData instanceof FormData)) return formData;
  const newFormData = new FormData();
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') {
      if ((value.startsWith('[') && value.endsWith(']')) || (value.startsWith('{') && value.endsWith('}'))) {
        try {
          const parsed = JSON.parse(value);
          const cleaned = makeUrlsRelative(parsed);
          newFormData.append(key, JSON.stringify(cleaned));
          continue;
        } catch {
          // ignore
        }
      }
      newFormData.append(key, makeUrlsRelative(value));
    } else {
      newFormData.append(key, value);
    }
  }
  return newFormData;
};

// Override native fetch inside this module to automatically handle conversions
const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
  if (typeof url === 'string' && url.includes(BASE_URL)) {
    if (options.body) {
      if (options.body instanceof FormData) {
        options.body = cleanFormData(options.body);
      } else if (typeof options.body === 'string') {
        try {
          const parsed = JSON.parse(options.body);
          options.body = JSON.stringify(makeUrlsRelative(parsed));
        } catch {
          // ignore
        }
      }
    }
    const res = await originalFetch(url, options);

    // Intercept .json()
    const originalJson = res.json.bind(res);
    res.json = async () => {
      const data = await originalJson();
      return makeUrlsAbsolute(data);
    };
    return res;
  }

  return originalFetch(url, options);
};


// ============================================================
// AUTH APIs
// ============================================================
export const authAPI = {
  // Email + Password লগইন
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  // নতুন user তৈরি
  register: async (name, email, password) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password }),
    });
    return res.json();
  },

  // Email verification check
  verifyEmail: async (token) => {
    const res = await fetch(`${BASE_URL}/auth/verify-email/${token}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Token দিয়ে current user info
  getMe: async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getHeaders(true),
    });
    return res.json();
  },

  // Google OAuth — browser redirect
  loginWithGoogle: () => {
    window.location.href = `${BASE_URL}/auth/google`;
  },

  // GitHub OAuth — browser redirect
  loginWithGitHub: () => {
    window.location.href = `${BASE_URL}/auth/github`;
  },

  // Logout — সার্ভার এবং ক্লায়েন্ট উভয় দিক থেকে লগআউট
  logout: async () => {
    // প্রথমে সার্ভার থেকে সেশন এবং/অথবা টোকেন ইনভ্যালিডেট করা
    try {
      await fetch(`${BASE_URL}/auth/logout`, { method: 'POST', headers: getHeaders(true) });
    } catch (error) {
      console.error("Server logout failed, proceeding with client-side logout.", error);
    }
    localStorage.removeItem('portfolio_token');
    localStorage.removeItem('portfolio_user');
  },

  // Token সেভ করা
  saveSession: (token, user) => {
    localStorage.setItem('portfolio_token', token);
    localStorage.setItem('portfolio_user', JSON.stringify(user));
  },

  // Saved user লোড করা (page refresh এ কাজে লাগে)
  loadSession: () => {
    const token = getToken();
    const userStr = localStorage.getItem('portfolio_user');
    if (!token || !userStr) return null;
    try {
      return { token, user: JSON.parse(userStr) };
    } catch {
      return null;
    }
  },
};

// ============================================================
// PROFILE API (Admin Editable Content)
// ============================================================
export const profileAPI = {
  // পাবলিক প্রোফাইল ডেটা আনা
  getPublicProfile: async () => {
    const res = await fetch(`${BASE_URL}/profile`);
    return res.json();
  },

  // প্রোফাইল আপডেট করা (Admin only)
  updateProfile: async (profileData) => {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: getHeaders(true), // Requires auth token
      body: JSON.stringify(profileData),
    });
    return res.json();
  },

  // নতুন: একজন ইউজারকে পোর্টফোলিও প্রোফাইল হিসেবে সেট করা
  setAsPortfolioProfile: async (id) => {
    const res = await fetch(`${BASE_URL}/users/${id}/set-portfolio`, {
      method: 'PUT',
      headers: getHeaders(true),
    });
    return res.json();
  },
};

export const uploadAPI = {
  uploadFile: async (file) => {
    const token = getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BASE_URL}/profile/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return res.json();
  },
};

// ============================================================
// SUMMARY API (Admin Dashboard)
// ============================================================
export const summaryAPI = {
  getSummary: async () => {
    const res = await fetch(`${BASE_URL}/summary`, {
      headers: getHeaders(true),
    });
    return res.json();
  },
  // নতুন: প্রজেক্ট প্ল্যান স্ট্যাটাস আনা
  getProjectPlanStats: async () => {
    const res = await fetch(`${BASE_URL}/summary/project-plan-stats`, {
      headers: getHeaders(true),
    });
    return res.json();
  },
};

// ============================================================
// USER MANAGEMENT API (Admin only)
// ============================================================
export const userAPI = {
  // সব ইউজার আনা
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/users`, {
      headers: getHeaders(true),
    });
    return res.json();
  },

  // ইউজারের রোল আপডেট করা
  updateRole: async (id, role) => {
    const res = await fetch(`${BASE_URL}/users/${id}/role`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ role }),
    });
    return res.json();
  },

  setAsPortfolioProfile: async (id) => {
    const res = await fetch(`${BASE_URL}/users/${id}/set-portfolio`, {
      method: 'PUT',
      headers: getHeaders(true),
    });
    return res.json();
  },
};

// ============================================================
// PROJECTS APIs
// ============================================================
export const projectsAPI = {
  // সব প্রজেক্ট আনা (Public)
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/projects`);
    return res.json();
  },

  // Featured প্রজেক্ট আনা (Public)
  getFeatured: async () => {
    const res = await fetch(`${BASE_URL}/projects/featured`);
    return res.json();
  },

  // নতুন প্রজেক্ট যোগ করা (Admin only, FormData ব্যবহার করে)
  create: async (formData) => {
    const token = getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return res.json();
  },

  // প্রজেক্ট আপডেট (Admin only, FormData ব্যবহার করে)
  add: async (formData) => projectsAPI.create(formData),

  update: async (id, formData) => {
    const token = getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers,
      body: formData,
    });
    return res.json();
  },

  // প্রজেক্ট মুছে ফেলা (Admin only)
  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.json();
  },
};

// ============================================================
// SKILLS APIs
// ============================================================
export const skillAPI = {
  // সব স্কিল আনা (Public)
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/skills`);
    return res.json();
  },

  // নতুন স্কিল যোগ করা (Admin only)
  create: async (skillData) => {
    const res = await fetch(`${BASE_URL}/skills`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(skillData),
    });
    return res.json();
  },

  // স্কিল আপডেট (Admin only)
  update: async (id, skillData) => {
    const res = await fetch(`${BASE_URL}/skills/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(skillData),
    });
    return res.json();
  },

  // স্কিল মুছে ফেলা (Admin only)
  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/skills/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.json();
  },
};

// ============================================================
// CERTIFICATES APIs
// ============================================================
export const certificateAPI = {
  // সব সার্টিফিকেট আনা (Public)
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/certificates`);
    return res.json();
  },

  // নতুন সার্টিফিকেট যোগ করা (Admin only, FormData ব্যবহার করে)
  create: async (formData) => {
    const token = getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/certificates`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return res.json();
  },

  // সার্টিফিকেট আপডেট (Admin only, FormData ব্যবহার করে)
  update: async (id, formData) => {
    const token = getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/certificates/${id}`, {
      method: 'PUT',
      headers,
      body: formData,
    });
    return res.json();
  },

  // সার্টিফিকেট মুছে ফেলা (Admin only)
  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/certificates/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.json();
  },
};

// ============================================================
// TESTIMONIALS APIs
// ============================================================
export const testimonialAPI = {
  // সব রিভিউ আনা (Public)
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/testimonials`);
    return res.json();
  },

  // নতুন রিভিউ যোগ করা (Admin only, FormData ব্যবহার করে)
  create: async (formData) => {
    const token = getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/testimonials`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return res.json();
  },

  // রিভিউ আপডেট (Admin only, FormData ব্যবহার করে)
  update: async (id, formData) => {
    const token = getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/testimonials/${id}`, {
      method: 'PUT',
      headers,
      body: formData,
    });
    return res.json();
  },

  // রিভিউ মুছে ফেলা (Admin only)
  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/testimonials/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.json();
  },
};

// ============================================================
// MESSAGES APIs
// ============================================================
export const messagesAPI = {
  // Public contact form submit
  sendPublic: async (senderName, senderEmail, message) => {
    const res = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ senderName, senderEmail, message }),
    });
    return res.json();
  },

  // Secure Portal message (লগইন আবশ্যক)
  sendSecure: async (message) => {
    const res = await fetch(`${BASE_URL}/messages/secure`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ message }),
    });
    return res.json();
  },

  // নতুন: ব্যবহারকারীর পাঠানো মেসেজ পাওয়া (লগইন আবশ্যক)
  getSent: async () => {
    const res = await fetch(`${BASE_URL}/messages/sent`, {
      headers: getHeaders(true),
    });
    return res.json();
  },

  // মেসেজ 'পড়া হয়েছে' মার্ক করা (Admin only)
  markAsRead: async (id) => {
    const res = await fetch(`${BASE_URL}/messages/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders(true),
    });
    return res.json();
  },

  // মেসেজ ডিলিট করা (Admin only)
  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/messages/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.json();
  },

  // নতুন: পেমেন্ট কনফার্মেশন পাঠানো (লগইন আবশ্যক)
  sendPaymentConfirmation: async (transactionId, message, amount, projectType) => {
    const res = await fetch(`${BASE_URL}/messages/payment-confirmation`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ transactionId, message, amount, projectType }),
    });
    return res.json();
  },

  // নতুন: পেমেন্ট কনফার্মেশন পাওয়া (Admin only)
  getPaymentConfirmations: async () => {
    const res = await fetch(`${BASE_URL}/messages/payment-confirmations`, {
      headers: getHeaders(true),
    });
    return res.json();
  },

  // নতুন: ব্যবহারকারীর রিপ্লাই পাঠানো (লগইন আবশ্যক)
  userReply: async (id, replyMessage) => {
    const res = await fetch(`${BASE_URL}/messages/${id}/user-reply`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ message: replyMessage }),
    });
    return res.json();
  },
};

// ============================================================
// BLOG APIs
// ============================================================
export const blogAPI = {
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/blog-posts`);
    return res.json();
  },
  getOne: async (id) => {
    const res = await fetch(`${BASE_URL}/blog-posts/${id}`);
    return res.json();
  },
  create: async (blogData) => {
    const res = await fetch(`${BASE_URL}/admin/blog-posts`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(blogData),
    });
    return res.json();
  },
  update: async (id, blogData) => {
    const res = await fetch(`${BASE_URL}/admin/blog-posts/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(blogData),
    });
    return res.json();
  },
  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/admin/blog-posts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.json();
  },
};

// ============================================================
// PRODUCT & CATEGORY APIs
// ============================================================
export const productAPI = {
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/products`);
    return res.json();
  },
  getOne: async (id) => {
    const res = await fetch(`${BASE_URL}/products/${id}`);
    return res.json();
  },
  create: async (productData) => {
    const res = await fetch(`${BASE_URL}/admin/products`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(productData),
    });
    return res.json();
  },
  update: async (id, productData) => {
    const res = await fetch(`${BASE_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(productData),
    });
    return res.json();
  },
  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.json();
  },
};

export const categoryAPI = {
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/categories`);
    return res.json();
  },
  getOne: async (id) => {
    const res = await fetch(`${BASE_URL}/categories/${id}`);
    return res.json();
  },
  create: async (categoryData) => {
    const res = await fetch(`${BASE_URL}/admin/categories`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(categoryData),
    });
    return res.json();
  },
  update: async (id, categoryData) => {
    const res = await fetch(`${BASE_URL}/admin/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(categoryData),
    });
    return res.json();
  },
  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/admin/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.json();
  },
};

// ============================================================
// FAQ APIs
// ============================================================
export const faqAPI = {
  // পাবলিক: শুধু isPublished: true FAQ গুলো আসে
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/faqs`);
    return res.json();
  },

  // Admin: সব FAQ (published + unpublished) আসে
  getAdminAll: async () => {
    const res = await fetch(`${BASE_URL}/admin/faqs`, {
      headers: getHeaders(true),
    });
    return res.json();
  },

  create: async (faqData) => {
    const res = await fetch(`${BASE_URL}/admin/faqs`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(faqData),
    });
    return res.json();
  },
  update: async (id, faqData) => {
    const res = await fetch(`${BASE_URL}/admin/faqs/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(faqData),
    });
    return res.json();
  },
  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/admin/faqs/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.json();
  },
};

// ============================================================
// SOCIAL LINK APIs
// ============================================================
export const socialLinkAPI = {
  // পাবলিক: শুধু isActive: true লিংকগুলো আসে
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/social-links`);
    return res.json();
  },

  // Admin: সব লিংক (active + inactive) আসে
  getAdminAll: async () => {
    const res = await fetch(`${BASE_URL}/admin/social-links`, {
      headers: getHeaders(true),
    });
    return res.json();
  },

  create: async (linkData) => {
    const res = await fetch(`${BASE_URL}/admin/social-links`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(linkData),
    });
    return res.json();
  },
  update: async (id, linkData) => {
    const res = await fetch(`${BASE_URL}/admin/social-links/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(linkData),
    });
    return res.json();
  },
  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/admin/social-links/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.json();
  },
};

// ============================================================
// BANNER APIs
// ============================================================
export const bannerAPI = {
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/banners`);
    return res.json();
  },
  create: async (bannerData) => {
    const res = await fetch(`${BASE_URL}/admin/banners`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(bannerData),
    });
    return res.json();
  },
  update: async (id, bannerData) => {
    const res = await fetch(`${BASE_URL}/admin/banners/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(bannerData),
    });
    return res.json();
  },
  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/admin/banners/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.json();
  },
};

// ============================================================
// EDUCATION APIs
// ============================================================
export const educationAPI = {
  // সব শিক্ষাগত যোগ্যতা আনা (Public)
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/education`);
    return res.json();
  },

  // নতুন শিক্ষাগত যোগ্যতা যোগ করা (Admin only)
  create: async (educationData) => {
    const res = await fetch(`${BASE_URL}/education`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(educationData),
    });
    return res.json();
  },

  // শিক্ষাগত যোগ্যতা আপডেট (Admin only)
  update: async (id, educationData) => {
    const res = await fetch(`${BASE_URL}/education/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(educationData),
    });
    return res.json();
  },

  // শিক্ষাগত যোগ্যতা মুছে ফেলা (Admin only)
  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/education/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.json();
  },
};
