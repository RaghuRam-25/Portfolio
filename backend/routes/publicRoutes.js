const express = require('express');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const Faq = require('../models/Faq');
const BlogPost = require('../models/BlogPost');
const SocialLink = require('../models/SocialLink');
const makeCrudController = require('../controllers/crudController');
const { getPageContent } = require('../controllers/pageContentController');
const { getStats } = require('../utils/stats');

const router = express.Router();

const categories = makeCrudController({ model: Category, name: 'Category', searchFields: ['name', 'description'], publicFilter: { isActive: true } });
const products = makeCrudController({ model: Product, name: 'Product', searchFields: ['name', 'description', 'tags'], populate: 'category', publicFilter: { isPublished: true } });
const banners = makeCrudController({ model: Banner, name: 'Banner', searchFields: ['title', 'placement'], publicFilter: { isActive: true } });
const faqs = makeCrudController({ model: Faq, name: 'FAQ', searchFields: ['question', 'answer', 'category'], publicFilter: { isPublished: true } });
const blogs = makeCrudController({ model: BlogPost, name: 'Blog post', searchFields: ['title', 'excerpt', 'content', 'tags'], populate: 'author', publicFilter: { status: 'published' } });
const socialLinks = makeCrudController({ model: SocialLink, name: 'Social link', searchFields: ['platform'], publicFilter: { isActive: true } });

router.get('/categories', categories.list);
router.get('/categories/:id', categories.getOne);
router.get('/products', products.list);
router.get('/products/:id', products.getOne);
router.get('/banners', banners.list);
router.get('/faqs', faqs.list);
router.get('/blog-posts', blogs.list);
router.get('/blog-posts/:id', blogs.getOne);
router.get('/social-links', socialLinks.list);
router.get('/pages/:key', getPageContent);
router.get('/stats', async (_req, res) => {
  try {
    const stats = await getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
