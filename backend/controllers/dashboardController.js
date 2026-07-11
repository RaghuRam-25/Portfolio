const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Project = require('../models/Project');
const Message = require('../models/Message');
const BlogPost = require('../models/BlogPost');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/responses');
const { getStats, publishedProjectFilter } = require('../utils/stats');

exports.getDashboard = asyncHandler(async (_req, res) => {
  const [
    users,
    blockedUsers,
    products,
    categories,
    orders,
    pendingOrders,
    projects,
    unreadMessages,
    blogPosts,
    revenue,
    liveStats,
  ] = await Promise.all([
    User.countDocuments({ deletedAt: null }),
    User.countDocuments({ deletedAt: null, isBlocked: true }),
    Product.countDocuments({ deletedAt: null }),
    Category.countDocuments({ deletedAt: null }),
    Order.countDocuments({ deletedAt: null }),
    Order.countDocuments({ deletedAt: null, status: 'pending' }),
    Project.countDocuments(publishedProjectFilter),
    Message.countDocuments({ isRead: false }),
    BlogPost.countDocuments({ deletedAt: null }),
    Order.aggregate([
      { $match: { deletedAt: null, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    getStats(),
  ]);

  ok(res, {
    users,
    blockedUsers,
    products,
    categories,
    orders,
    pendingOrders,
    projects,
    experience: liveStats.experience,
    deliveryRate: liveStats.deliveryRate,
    unreadMessages,
    blogPosts,
    revenue: revenue[0]?.total || 0,
  }, 'Dashboard summary');
});
