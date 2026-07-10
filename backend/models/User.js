const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const statSchema = new mongoose.Schema({
    value: String,
    label: String,
}, { _id: false });

const skillSchema = new mongoose.Schema({
    name: String, category: String, level: Number, years: Number, description: String,
}, { _id: false });

const videoSchema = new mongoose.Schema({
    title: String,
    description: String,
    videoUrl: String,
    videoType: { type: String, enum: ['embed', 'upload'], default: 'embed' },
    thumbnailUrl: String,
    posterImageUrl: String,
    tag: String,
    autoplay: { type: Boolean, default: false },
    loop: { type: Boolean, default: false },
    muted: { type: Boolean, default: true },
    controls: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
}, { _id: false });

const paymentMethodSchema = new mongoose.Schema({
    name: String,
    details: String,
    qrCodeUrl: String,
    iconUrl: String,
}, { _id: false });

const projectTypeSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: String,
    basePrice: Number,
    baseDays: Number,
}, { _id: false });

const featureSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: String,
    price: Number,
    days: Number,
}, { _id: false });

const heroSectionSchema = new mongoose.Schema({
    headline: String,
    description: String,
    heroImageUrl: String,
    resumeUrl: String,
    ctaText: String,
    ctaUrl: String,
    availability: {
        isAvailable: { type: Boolean, default: true },
        badgeText: String,
    },
}, { _id: false });

const sectionCopySchema = new mongoose.Schema({
    eyebrow: String,
    title: String,
    subtitle: String,
    emptyState: String,
}, { _id: false });

const contactInfoSchema = new mongoose.Schema({
    heading: String,
    subtitle: String,
    formTitle: String,
    socialHeading: String,
    email: String,
    phone: String,
    location: String,
}, { _id: false });

const seoSettingsSchema = new mongoose.Schema({
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    ogImageUrl: String,
}, { _id: false });

const websiteSettingsSchema = new mongoose.Schema({
    siteName: String,
    logoUrl: String,
    faviconUrl: String,
    seo: seoSettingsSchema,
    footer: {
        copyright: String,
    },
    maintenanceMode: {
        enabled: { type: Boolean, default: false },
    },
}, { _id: false });

const themeSettingsSchema = new mongoose.Schema({
    primaryColor: String,
    secondaryColor: String,
    accentColor: String,
    darkModeEnabled: { type: Boolean, default: true },
    fontFamily: String,
}, { _id: false });

const menuItemSchema = new mongoose.Schema({
    id: String,
    label: String,
    requiresAuth: { type: Boolean, default: false },
}, { _id: false });

const navigationSchema = new mongoose.Schema({
    navbarMenu: [menuItemSchema],
    footerMenu: [menuItemSchema],
}, { _id: false });

const sectionVisibilitySchema = new mongoose.Schema({
    hero: { type: Boolean, default: true },
    about: { type: Boolean, default: true },
    skills: { type: Boolean, default: true },
    projects: { type: Boolean, default: true },
    videos: { type: Boolean, default: true },
    certificates: { type: Boolean, default: true },
    education: { type: Boolean, default: true },
    testimonials: { type: Boolean, default: true },
    estimator: { type: Boolean, default: true },
    contact: { type: Boolean, default: true },
}, { _id: false });

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false }, // পাসওয়ার্ড ডিফল্টভাবে যাতে না আসে
    title: { type: String, default: "Full-Stack Developer" },
    bio: { type: String, default: "Web application developer" },
    avatarUrl: { type: String, default: 'https://www.gravatar.com/avatar/?d=mp' },
    provider: { type: String, enum: ['local', 'google', 'github'], default: 'local' },
    providerId: { type: String },         // OAuth এর unique ID
    isPortfolioProfile: { type: Boolean, default: false }, // New field
    isVerified: { type: Boolean, default: false }, // New field for email verification
    emailVerificationToken: String, // New field for email verification token
    emailVerificationExpires: Date, // New field for email verification token expiry
    isBlocked: { type: Boolean, default: false },
    blockedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    careerStartDate: { type: Date, default: null },
    socials: {
        facebook: { type: String, default: '' },
        whatsapp: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' },
        twitter: { type: String, default: '' },
        instagram: { type: String, default: '' },
        youtube: { type: String, default: '' },
    },

    websiteSettings: {
        type: websiteSettingsSchema,
        default: () => ({})
    },
    heroSection: {
        type: heroSectionSchema,
        default: () => ({})
    },
    aboutSection: {
        type: sectionCopySchema,
        default: () => ({
            eyebrow: 'Engineering Profile',
            title: 'Crafting High-Performance Full-Stack Architectures',
            subtitle: '',
        })
    },
    projectSection: {
        type: sectionCopySchema,
        default: () => ({
            title: 'My Creative Portfolio',
            subtitle: 'Here is a collection of my works that showcases my skills in turning ideas into reality. Each project is a unique piece of development.',
            emptyState: 'No projects have been added yet. Please check back later!',
        })
    },
    videoSection: {
        type: sectionCopySchema,
        default: () => ({
            eyebrow: 'Project Showcases',
            title: 'Video Reviews',
            emptyState: 'No videos have been added yet.',
        })
    },
    certificateSection: {
        type: sectionCopySchema,
        default: () => ({
            title: 'My Achievements & Certifications',
            subtitle: 'A collection of my professional certifications and awards that validate my skills and expertise.',
            emptyState: 'No certificates have been added yet. Please check back later!',
        })
    },
    educationSection: {
        type: sectionCopySchema,
        default: () => ({
            title: 'My Education',
            subtitle: 'A summary of my academic background and qualifications.',
            emptyState: 'No education history has been added yet.',
        })
    },
    testimonialSection: {
        type: sectionCopySchema,
        default: () => ({
            title: 'Client Testimonials',
            subtitle: 'Words from clients who have experienced the quality and impact of my work firsthand.',
            emptyState: 'No testimonials have been added yet. Please check back later!',
        })
    },
    estimatorSection: {
        type: sectionCopySchema,
        default: () => ({
            eyebrow: 'Dynamic Budget Planner',
            title: 'Scope Your Project Instantly',
            subtitle: 'Select your architecture model and extra modules below to get a ballpark engineering timeframe and financial estimation.',
        })
    },
    contactInfo: {
        type: contactInfoSchema,
        default: () => ({
            heading: "Let's Start A Project",
            subtitle: 'Choose a channel or use the secure portal.',
            formTitle: 'Drop an Email',
            socialHeading: 'Or connect via Social Channels',
        })
    },
    seoSettings: {
        type: seoSettingsSchema,
        default: () => ({})
    },
    themeSettings: {
        type: themeSettingsSchema,
        default: () => ({})
    },
    navigation: {
        type: navigationSchema,
        default: () => ({})
    },
    sectionVisibility: {
        type: sectionVisibilitySchema,
        default: () => ({})
    },
    stats: {
        type: [statSchema],
        default: [
            { value: "3+", label: "Years Exp" },
            { value: "30+", label: "Projects" },
            { value: "100%", label: "Delivery" }
        ]
    },
    skills: {
        type: [skillSchema],
        default: [
            { name: "React / Next.js", category: "frontend", level: 90, years: 3, description: "Component architecture, State management (Redux/Context), SSR, Optimization." },
            { name: "Node.js / Express", category: "backend", level: 85, years: 2, description: "RESTful APIs, MVC structure, JWT authentication, Middleware integration." },
            { name: "MongoDB & SQL", category: "database", level: 80, years: 2, description: "Schema design, Aggregation pipelines, Query optimization, Indexing." },
            { name: "Tailwind CSS / UI", category: "frontend", level: 95, years: 3, description: "Custom utility configuration, Dark-mode matrix, Framer Motion transitions." },
            { name: "Docker & AWS", category: "devops", level: 70, years: 1, description: "Containerization, EC2 deployment, S3 bucket storage orchestration." }
        ]
    },
    videos: {
        type: [videoSchema],
        default: [
            {
                title: "Hackathon Project Demo",
                description: "আমাদের হ্যাকাথন প্রজেক্টের মেইন ফিচারগুলো এবং ইউজার ইন্টারফেসের একটি সংক্ষিপ্ত রিভিউ।",
                videoUrl: "https://www.youtube.com/embed/YOUR_VIDEO_ID_1",
                tag: "Hackathon"
            },
            {
                title: "Full Stack Dashboard",
                description: "এই প্রজেক্টের ব্যাকএন্ড এবং রিয়েল-টাইম ডেটা হ্যান্ডলিং নিয়ে বিস্তারিত আলোচনা।",
                videoUrl: "https://www.youtube.com/embed/YOUR_VIDEO_ID_2",
                tag: "Development"
            }
        ]
    },
    paymentMethods: {
        type: [paymentMethodSchema],
        default: []
    },
    projectEstimator: {
        projectTypes: {
            type: [projectTypeSchema],
            default: [
                { id: 'landing', name: 'Premium Landing Page', basePrice: 300, baseDays: 4 },
                { id: 'ecommerce', name: 'E-commerce Platform', basePrice: 800, baseDays: 10 },
                { id: 'saas', name: 'SaaS / Custom Web App', basePrice: 1200, baseDays: 14 },
            ]
        },
        features: {
            type: [featureSchema],
            default: [
                { id: 'auth', name: 'User Authentication & Security', price: 150, days: 2 },
                { id: 'db', name: 'Database Integration (MongoDB/SQL)', price: 200, days: 3 },
                { id: 'payment', name: 'Stripe / SSLCommerz Gateway', price: 250, days: 3 },
                { id: 'ui', name: 'Dark Mode & Premium UI Micro-interactions', price: 120, days: 1 },
                { id: 'admin', name: 'Advanced Admin Control Panel', price: 350, days: 4 },
                { id: 'seo', name: 'SEO Optimization & Speed Auditing', price: 100, days: 1 },
            ]
        }
    },
}, { timestamps: true });

// Password hash middleware
userSchema.pre('save', async function (next) {
    // শুধু পাসওয়ার্ড মডিফাই হলেই হ্যাশ করা হবে
    if (!this.isModified('password') || !this.password) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
