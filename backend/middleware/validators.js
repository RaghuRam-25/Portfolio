const { z } = require('zod');

const registerSchema = z.object({
    name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
    email: z.string().email("সঠিক ইমেইল ফরম্যাট দিন"),
    password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
});

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const optionalUrl = z.string().url('Invalid URL').or(z.literal('')).optional();

const userCreateSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['user', 'admin']).default('user'),
    isVerified: z.boolean().optional(),
});

const userUpdateSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role: z.enum(['user', 'admin']).optional(),
    isVerified: z.boolean().optional(),
    isBlocked: z.boolean().optional(),
});

const categorySchema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    description: z.string().optional().default(''),
    imageUrl: z.string().optional().default(''),
    parent: objectId.nullable().optional(),
    isActive: z.boolean().optional(),
});

const productSchema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    description: z.string().min(2),
    shortDescription: z.string().optional().default(''),
    sku: z.string().optional(),
    price: z.coerce.number().min(0),
    salePrice: z.coerce.number().min(0).nullable().optional(),
    stock: z.coerce.number().int().min(0).optional(),
    category: objectId,
    images: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    isFeatured: z.boolean().optional(),
    isPublished: z.boolean().optional(),
});

const orderItemSchema = z.object({
    product: objectId,
    name: z.string().min(1),
    quantity: z.coerce.number().int().min(1),
    price: z.coerce.number().min(0),
});

const orderSchema = z.object({
    user: objectId.nullable().optional(),
    items: z.array(orderItemSchema).min(1),
    tax: z.coerce.number().min(0).optional(),
    shipping: z.coerce.number().min(0).optional(),
    status: z.enum(['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'refunded']).optional(),
    paymentStatus: z.enum(['unpaid', 'paid', 'failed', 'refunded']).optional(),
    paymentMethod: z.string().optional(),
    transactionId: z.string().optional(),
    shippingAddress: z.record(z.string(), z.string()).optional(),
    notes: z.string().optional(),
});

const bannerSchema = z.object({
    title: z.string().min(2),
    subtitle: z.string().optional().default(''),
    imageUrl: z.string().min(1),
    linkUrl: z.string().optional().default(''),
    ctaText: z.string().optional().default(''),
    placement: z.string().optional().default('home'),
    order: z.coerce.number().optional(),
    isActive: z.boolean().optional(),
    startsAt: z.coerce.date().nullable().optional(),
    endsAt: z.coerce.date().nullable().optional(),
});

const faqSchema = z.object({
    question: z.string().min(2),
    answer: z.string().min(2),
    category: z.string().optional().default('general'),
    order: z.coerce.number().optional(),
    isPublished: z.boolean().optional(),
});

const blogPostSchema = z.object({
    title: z.string().min(2),
    slug: z.string().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    excerpt: z.string().optional().default(''),
    content: z.string().min(2),
    coverImageUrl: z.string().optional().default(''),
    tags: z.array(z.string()).optional(),
    status: z.enum(['draft', 'published']).optional(),
    publishedAt: z.coerce.date().nullable().optional(),
});

const socialLinkSchema = z.object({
    platform: z.string().min(2),
    // mailto: এবং https:// উভয় ধরনের URL accept করে
    url: z.string().refine(
        (val) => {
            try {
                new URL(val);
                return true;
            } catch {
                return val.startsWith('mailto:') && val.includes('@');
            }
        },
        { message: 'Invalid URL. Must be a valid https:// URL or mailto: email link.' }
    ),
    icon: z.string().optional().default(''),
    order: z.coerce.number().optional(),
    isActive: z.boolean().optional(),
});

const pageContentSchema = z.object({
    title: z.string().optional().default(''),
    content: z.record(z.string(), z.any()).default({}),
});

module.exports = {
    registerSchema,
    userCreateSchema,
    userUpdateSchema,
    categorySchema,
    productSchema,
    orderSchema,
    bannerSchema,
    faqSchema,
    blogPostSchema,
    socialLinkSchema,
    pageContentSchema,
};
