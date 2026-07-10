const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const { buildPagination, parseSort } = require('../utils/apiFeatures');
const { ok, created } = require('../utils/responses');

const calculateTotals = (payload) => {
  const subtotal = payload.items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const tax = Number(payload.tax || 0);
  const shipping = Number(payload.shipping || 0);
  return { ...payload, subtotal, tax, shipping, total: subtotal + tax + shipping };
};

exports.listOrders = asyncHandler(async (req, res) => {
  const filter = { deletedAt: null };
  if (req.user.role !== 'admin') filter.user = req.user._id;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

  const pagination = await buildPagination(Order, filter, req.query);
  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .populate('items.product', 'name slug images')
    .sort(parseSort(req.query))
    .skip(pagination.skip)
    .limit(pagination.limit);

  ok(res, orders, 'Orders list', 200, {
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    pages: pagination.pages,
  });
});

exports.createOrder = asyncHandler(async (req, res) => {
  const payload = calculateTotals({ ...req.body, user: req.body.user || req.user?._id || null });
  const order = await Order.create(payload);
  created(res, order, 'Order created');
});

exports.getOrder = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id, deletedAt: null };
  if (req.user.role !== 'admin') filter.user = req.user._id;

  const order = await Order.findOne(filter).populate('user', 'name email').populate('items.product', 'name slug images');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  ok(res, order, 'Order detail');
});

exports.updateOrder = asyncHandler(async (req, res) => {
  const payload = req.body.items ? calculateTotals(req.body) : req.body;
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, deletedAt: null },
    payload,
    { new: true, runValidators: true }
  ).populate('user', 'name email').populate('items.product', 'name slug images');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  ok(res, order, 'Order updated');
});

exports.deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  );
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  ok(res, null, 'Order deleted');
});
