import express from 'express';
import {
  getProducts,
  getProduct,
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  purchaseCart,
  addProductReview,
  getProductReviews,
  getOrders,
  getOrder,
  getUserOrderHistory,
  getOrderDetails,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  getShopAnalytics
} from '../controllers/shopController.js';
import verifyToken from '../middlewares/verifyToken.js';
import verifyAdmin from '../middlewares/verifyAdmin.js';

const router = express.Router();

// Public routes - no authentication required
// Get all products (with filtering)
router.get('/products', getProducts);

// Get single product by ID
router.get('/products/:id', getProduct);

// User routes - require authentication
router.use(verifyToken);

// Product routes
router.get('/products', getProducts);
router.get('/products/:product_id', getProduct);

// Product reviews
router.post('/products/:product_id/review', addProductReview);
router.get('/products/:product_id/reviews', getProductReviews);

// Cart management
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.put('/cart/:id', updateCartItem);
router.delete('/cart/:id', removeFromCart);
router.delete('/cart', clearCart);

// Purchase
router.post('/purchase', purchaseCart);
router.post('/checkout', purchaseCart);

// Order management
router.get('/orders', getOrders);
router.get('/orders/:id', getOrder);
router.get('/orders/history', getUserOrderHistory);
router.get('/orders/:order_id', getOrderDetails);

// Admin routes - require admin authentication
router.use(verifyAdmin);

// Product management
router.post('/admin/products', createProduct);
router.put('/admin/products/:id', updateProduct);
router.delete('/admin/products/:id', deleteProduct);

// Order management
router.get('/admin/orders', getAllOrders);

// Analytics
router.get('/admin/analytics', getShopAnalytics);

export default router;
