const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const orderController = require('../controllers/orderController');
const { authMiddleware } = require('../middlewares/authMiddleware');


// Routes for order
router.get('/', asyncHandler(orderController.getAllOrders));
router.get('/orderByUserId/:userId', asyncHandler(orderController.getOrdersByUserId));
router.get('/:id', asyncHandler(orderController.getOrderById));
router.use(authMiddleware)
router.post('/', asyncHandler(orderController.createOrder));
router.put('/:id', asyncHandler(orderController.updateOrder));
router.delete('/:id', asyncHandler(orderController.deleteOrder));

module.exports = router;