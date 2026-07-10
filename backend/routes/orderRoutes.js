const express = require('express');
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { orderSchema } = require('../middleware/validators');

const router = express.Router();

router.get('/', protect, orderController.listOrders);
router.post('/', protect, validate(orderSchema), orderController.createOrder);
router.get('/:id', protect, orderController.getOrder);

module.exports = router;
