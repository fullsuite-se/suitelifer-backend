import express from "express";
import {
  // Cheer Post endpoints
  createCheerPost,
  getCheerFeed,
  getCheerPost,
  getCheerPostDetails,
  
  // Cheer Comments endpoints
  addCheerComment,
  
  // Cheer Likes endpoints
  toggleCheerLike,
  
  // Products endpoints
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductOrderUsage,
  
  // Product Images endpoints
  getProductImages,
  addProductImage,
  updateProductImage,
  deleteProductImage,
  reorderProductImages,
  setPrimaryImage,
  
  // Categories endpoints
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
  
  // Product Variations endpoints
  getVariationTypes,
  getVariationOptions,
  getProductVariations,
  getProductsWithVariations,
  addVariationType,
  addVariationOption,
  addProductVariation,
  updateProductVariation,
  deleteProductVariation,
  deleteVariationType,
  deleteVariationOption,
  
  // Cart endpoints
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  
  // Orders endpoints
  checkout,
  getOrderHistory,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  approveOrder,
  completeOrder,
  deleteOrder,
  deleteOwnOrder,
  
  // Leaderboard endpoints
  getLeaderboard,
  getMonthlyLeaderboard,
  
  // User heartbits
  getUserHeartbits,
  updateUserHeartbits,
  searchUsers,
  getPeersWhoCheered,
  
  // Monthly limits
  getMonthlyLimits,
  
  // Admin Management endpoints
  getCheerPostsAdmin,
  deleteCheerPost,
  getUsersWithHeartbits,
  setMonthlyLimit,
  getSystemStats,
  moderateCheerPost,
  
  // Super Admin endpoints
  getSystemConfiguration,
  updateSystemConfiguration,
  getAllAdminUsers,
  promoteToAdmin,
  demoteFromAdmin,
  suspendUser,
  unsuspendUser,
  getSystemAuditLogs,
  getAdvancedSystemAnalytics,
  performSystemMaintenance,
  exportSystemData,
  
  // Bulk operations
  bulkUpdateHeartbits,
  resetUserMonthlyStats,
  
  // Initialization
  initializeAllUsersHeartbits,
  
  // System Maintenance
  triggerMonthlyReset,
  
} from "../controllers/suitebiteController.js";

import verifyToken from "../middlewares/verifyToken.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";
import verifySuperAdmin from "../middlewares/verifySuperAdmin.js";

const router = express.Router();

// Cheer Post routes
router.post("/cheers/post", verifyToken, createCheerPost);
router.get("/cheers/feed", verifyToken, getCheerFeed);
router.get("/cheers/post/:id", verifyToken, getCheerPost);
router.get("/admin/cheers/post/:id/details", verifyToken, verifyAdmin, getCheerPostDetails);

// Cheer Comments routes
router.post("/cheers/comment", verifyToken, addCheerComment);

// Cheer Likes routes
router.post("/cheers/like", verifyToken, toggleCheerLike);

// Products routes
router.get("/products", verifyToken, getAllProducts);
router.get("/products/with-variations", verifyToken, getProductsWithVariations);
router.get("/products/:id", verifyToken, getProductById);
router.post("/products", verifyToken, verifyAdmin, addProduct);
router.put("/products/:id", verifyToken, verifyAdmin, updateProduct);
router.delete("/products/:id", verifyToken, verifyAdmin, deleteProduct);
router.get("/products/:id/order-usage", verifyToken, getProductOrderUsage);

// Product Images routes
router.get("/products/:productId/images", verifyToken, getProductImages);
router.post("/products/:productId/images", verifyToken, verifyAdmin, addProductImage);
router.put("/products/images/:imageId", verifyToken, verifyAdmin, updateProductImage);
router.delete("/products/images/:imageId", verifyToken, verifyAdmin, deleteProductImage);
router.put("/products/:productId/images/reorder", verifyToken, verifyAdmin, reorderProductImages);
router.put("/products/images/:imageId/primary", verifyToken, verifyAdmin, setPrimaryImage);

// Categories routes
router.get("/categories", verifyToken, getAllCategories);
router.get("/categories/:id", verifyToken, getCategoryById);
router.post("/categories", verifyToken, verifyAdmin, addCategory);
router.put("/categories/:id", verifyToken, verifyAdmin, updateCategory);
router.delete("/categories/:id", verifyToken, verifyAdmin, deleteCategory);

// Product Variations routes
router.get("/variations/types", verifyToken, getVariationTypes);
router.get("/variations/options", verifyToken, getVariationOptions);
router.get("/products/:product_id/variations", verifyToken, getProductVariations);

// Admin routes for variations
router.post("/admin/variations/types", verifyToken, verifyAdmin, addVariationType);
router.post("/admin/variations/options", verifyToken, verifyAdmin, addVariationOption);
router.post("/admin/variations/products", verifyToken, verifyAdmin, addProductVariation);
router.put("/admin/variations/products/:variation_id", verifyToken, verifyAdmin, updateProductVariation);
router.delete("/admin/variations/products/:variation_id", verifyToken, verifyAdmin, deleteProductVariation);

// Admin routes for variation types/options
router.delete('/admin/variations/types/:variation_type_id', verifyToken, verifyAdmin, deleteVariationType);
router.delete('/admin/variations/options/:option_id', verifyToken, verifyAdmin, deleteVariationOption);

// Cart routes
router.get("/cart", verifyToken, getCart);
router.post("/cart/add", verifyToken, addToCart);
router.put("/cart/update/:cart_item_id", verifyToken, updateCartItem);
router.delete("/cart/remove/:cart_item_id", verifyToken, removeFromCart);
router.delete("/cart/clear", verifyToken, clearCart);

// Orders routes
router.post("/orders/checkout", verifyToken, checkout);
router.get("/orders/history", verifyToken, getOrderHistory);
router.get("/orders/:id", verifyToken, getOrderById);
router.put("/orders/:order_id/cancel", verifyToken, cancelOrder);
router.delete("/orders/:order_id", verifyToken, deleteOwnOrder);
router.get("/admin/orders", verifyToken, verifyAdmin, getAllOrders);
router.put("/admin/orders/:order_id/status", verifyToken, verifyAdmin, updateOrderStatus);
router.put("/admin/orders/:order_id/approve", verifyToken, verifyAdmin, approveOrder);
router.put("/admin/orders/:order_id/complete", verifyToken, verifyAdmin, completeOrder);
router.delete("/admin/orders/:order_id", verifyToken, verifyAdmin, deleteOrder);

// Leaderboard routes
router.get("/leaderboard", verifyToken, getLeaderboard);
router.get("/leaderboard/monthly", verifyToken, getMonthlyLeaderboard);

// User heartbits routes
router.get("/heartbits", verifyToken, getUserHeartbits);
router.put("/heartbits", verifyToken, updateUserHeartbits);

// Peers who cheered route
router.get("/peers/cheered", verifyToken, getPeersWhoCheered);

// User search route
router.get("/users/search", verifyToken, searchUsers);

// Monthly limits routes
router.get("/limits/monthly", verifyToken, getMonthlyLimits);

// ========== ADMIN MANAGEMENT ROUTES ==========

// Cheer Posts Management
router.get("/admin/cheers", verifyToken, verifyAdmin, getCheerPostsAdmin);
router.delete("/admin/cheers/:id", verifyToken, verifyAdmin, deleteCheerPost);
router.put("/admin/cheers/:id/moderate", verifyToken, verifyAdmin, moderateCheerPost);

// User & Heartbits Management
router.get("/admin/users/heartbits", verifyToken, verifyAdmin, getUsersWithHeartbits);
router.post("/admin/users/initialize-heartbits", verifyToken, verifyAdmin, initializeAllUsersHeartbits);
router.put("/admin/users/:userId/limit", verifyToken, verifyAdmin, setMonthlyLimit);
router.put("/admin/heartbits", verifyToken, verifyAdmin, updateUserHeartbits);
router.put("/admin/heartbits/bulk-update", verifyToken, verifyAdmin, bulkUpdateHeartbits);
router.put("/admin/users/:userId/reset-monthly", verifyToken, verifyAdmin, resetUserMonthlyStats);

// System Analytics & Monitoring
router.get("/admin/stats", verifyToken, verifyAdmin, getSystemStats);
router.get("/admin/config", verifyToken, verifyAdmin, getSystemConfiguration);
router.put("/admin/config", verifyToken, verifyAdmin, updateSystemConfiguration);

// Monthly Reset for Admins
router.post("/admin/monthly-reset", verifyToken, verifyAdmin, triggerMonthlyReset);

// ========== SUPER ADMIN ROUTES (with admin functionality) ==========

// Cheer Posts Management (Super Admin access)
router.get("/superadmin/cheers", verifyToken, verifySuperAdmin, getCheerPostsAdmin);
router.delete("/superadmin/cheers/:id", verifyToken, verifySuperAdmin, deleteCheerPost);
router.put("/superadmin/cheers/:id/moderate", verifyToken, verifySuperAdmin, moderateCheerPost);

// User & Heartbits Management (Super Admin access)
router.get("/superadmin/users/heartbits", verifyToken, verifySuperAdmin, getUsersWithHeartbits);
router.post("/superadmin/users/initialize-heartbits", verifyToken, verifySuperAdmin, initializeAllUsersHeartbits);
router.put("/superadmin/users/:userId/limit", verifyToken, verifySuperAdmin, setMonthlyLimit);
router.put("/superadmin/heartbits", verifyToken, verifySuperAdmin, updateUserHeartbits);
router.put("/superadmin/heartbits/bulk-update", verifyToken, verifySuperAdmin, bulkUpdateHeartbits);
router.put("/superadmin/users/:userId/reset-monthly", verifyToken, verifySuperAdmin, resetUserMonthlyStats);

// System Analytics & Monitoring (Super Admin access)
router.get("/superadmin/stats", verifyToken, verifySuperAdmin, getSystemStats);
router.get("/superadmin/config", verifyToken, verifySuperAdmin, getSystemConfiguration);
router.put("/superadmin/config", verifyToken, verifySuperAdmin, updateSystemConfiguration);

// Monthly Reset for Super Admins
router.post("/superadmin/monthly-reset", verifyToken, verifySuperAdmin, triggerMonthlyReset);

// ========== SUPER ADMIN ROUTES ==========

// System Configuration
router.get("/superadmin/config", verifyToken, verifySuperAdmin, getSystemConfiguration);
router.put("/superadmin/config", verifyToken, verifySuperAdmin, updateSystemConfiguration);

// Admin User Management
router.get("/superadmin/admins", verifyToken, verifySuperAdmin, getAllAdminUsers);
router.put("/superadmin/users/:userId/promote", verifyToken, verifySuperAdmin, promoteToAdmin);
router.put("/superadmin/users/:userId/demote", verifyToken, verifySuperAdmin, demoteFromAdmin);
router.put("/superadmin/users/:userId/suspend", verifyToken, verifySuperAdmin, suspendUser);
router.put("/superadmin/users/:userId/unsuspend", verifyToken, verifySuperAdmin, unsuspendUser);

// Advanced Analytics & Audit
router.get("/superadmin/audit-logs", verifyToken, verifySuperAdmin, getSystemAuditLogs);
router.get("/superadmin/advanced-analytics", verifyToken, verifySuperAdmin, getAdvancedSystemAnalytics);

// System Maintenance & Data Export
router.post("/superadmin/maintenance", verifyToken, verifySuperAdmin, performSystemMaintenance);
router.post("/superadmin/monthly-reset", verifyToken, verifySuperAdmin, triggerMonthlyReset);
router.get("/superadmin/export", verifyToken, verifySuperAdmin, exportSystemData);

export default router;
