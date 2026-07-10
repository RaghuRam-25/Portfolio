const express = require('express');
const { z } = require('zod');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const Faq = require('../models/Faq');
const BlogPost = require('../models/BlogPost');
const SocialLink = require('../models/SocialLink');
const makeCrudController = require('../controllers/crudController');
const orderController = require('../controllers/orderController');
const { getDashboard } = require('../controllers/dashboardController');
const { getPageContent, upsertPageContent } = require('../controllers/pageContentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
  categorySchema,
  productSchema,
  orderSchema,
  bannerSchema,
  faqSchema,
  blogPostSchema,
  socialLinkSchema,
  pageContentSchema,
} = require('../middleware/validators');

const router = express.Router();
const admin = [protect, adminOnly];
const pageKeySchema = z.object({ key: z.enum(['homepage', 'about', 'contact', 'website-settings']) });

const categories = makeCrudController({
  model: Category,
  name: 'Category',
  searchFields: ['name', 'description'],
  populate: 'parent',
});

const products = makeCrudController({
  model: Product,
  name: 'Product',
  searchFields: ['name', 'description', 'tags'],
  populate: 'category',
});

const banners = makeCrudController({
  model: Banner,
  name: 'Banner',
  searchFields: ['title', 'subtitle', 'placement'],
});

const faqs = makeCrudController({
  model: Faq,
  name: 'FAQ',
  searchFields: ['question', 'answer', 'category'],
});

const blogs = makeCrudController({
  model: BlogPost,
  name: 'Blog post',
  searchFields: ['title', 'excerpt', 'content', 'tags'],
  populate: 'author',
  beforeCreate: (payload, req) => ({
    ...payload,
    author: req.user._id,
    publishedAt: payload.status === 'published' ? payload.publishedAt || new Date() : payload.publishedAt,
  }),
  beforeUpdate: (payload) => ({
    ...payload,
    publishedAt: payload.status === 'published' ? payload.publishedAt || new Date() : payload.publishedAt,
  }),
});

const socialLinks = makeCrudController({
  model: SocialLink,
  name: 'Social link',
  searchFields: ['platform', 'url'],
});

router.get('/dashboard', ...admin, getDashboard);

router.route('/categories')
  .get(...admin, categories.list)
  .post(...admin, validate(categorySchema), categories.create);
router.route('/categories/:id')
  .get(...admin, categories.getOne)
  .put(...admin, validate(categorySchema.partial()), categories.update)
  .delete(...admin, categories.remove);

router.route('/products')
  .get(...admin, products.list)
  .post(...admin, validate(productSchema), products.create);
router.route('/products/:id')
  .get(...admin, products.getOne)
  .put(...admin, validate(productSchema.partial()), products.update)
  .delete(...admin, products.remove);

router.route('/orders')
  .get(...admin, orderController.listOrders)
  .post(...admin, validate(orderSchema), orderController.createOrder);
router.route('/orders/:id')
  .get(...admin, orderController.getOrder)
  .put(...admin, validate(orderSchema.partial()), orderController.updateOrder)
  .delete(...admin, orderController.deleteOrder);

router.route('/banners')
  .get(...admin, banners.list)
  .post(...admin, validate(bannerSchema), banners.create);
router.route('/banners/:id')
  .get(...admin, banners.getOne)
  .put(...admin, validate(bannerSchema.partial()), banners.update)
  .delete(...admin, banners.remove);

router.route('/faqs')
  .get(...admin, faqs.list)
  .post(...admin, validate(faqSchema), faqs.create);
router.route('/faqs/:id')
  .get(...admin, faqs.getOne)
  .put(...admin, validate(faqSchema.partial()), faqs.update)
  .delete(...admin, faqs.remove);

router.route('/blog-posts')
  .get(...admin, blogs.list)
  .post(...admin, validate(blogPostSchema), blogs.create);
router.route('/blog-posts/:id')
  .get(...admin, blogs.getOne)
  .put(...admin, validate(blogPostSchema.partial()), blogs.update)
  .delete(...admin, blogs.remove);

router.route('/social-links')
  .get(...admin, socialLinks.list)
  .post(...admin, validate(socialLinkSchema), socialLinks.create);
router.route('/social-links/:id')
  .get(...admin, socialLinks.getOne)
  .put(...admin, validate(socialLinkSchema.partial()), socialLinks.update)
  .delete(...admin, socialLinks.remove);

router.route('/pages/:key')
  .get(...admin, validate(pageKeySchema, 'params'), getPageContent)
  .put(...admin, validate(pageKeySchema, 'params'), validate(pageContentSchema), upsertPageContent);

module.exports = router;
