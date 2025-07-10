import { Shop } from '../models/shopModel.js';
import { Points } from '../models/pointsModel.js';

// Get all products with optional filtering
export const getProducts = async (req, res) => {
  try {
    const { category, search, limit = 20, offset = 0 } = req.query;
    const products = await Shop.getAllProducts({
      category,
      search,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// Get single product by ID
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Shop.getProductById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const cart = await Shop.getUserCart(userId);
    
    res.json({
      success: true,
      data: cart || { items: [], total: 0 }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart'
    });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Verify product exists and is available
    const product = await Shop.getProductById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    const cartItem = await Shop.addToCart(userId, productId, quantity);
    
    res.json({
      success: true,
      data: cartItem,
      message: 'Item added to cart'
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const updated = await Shop.updateCartItem(userId, id, quantity);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    res.json({
      success: true,
      message: 'Cart item updated'
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item'
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;

    const removed = await Shop.removeFromCart(userId, id);
    
    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
};

// Clear entire cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    await Shop.clearCart(userId);
    
    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
};

// Purchase items from cart
export const purchaseCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Get cart items
    const cart = await Shop.getUserCart(userId);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Calculate total cost
    const totalCost = cart.items.reduce((sum, item) => 
      sum + (item.pointsCost * item.quantity), 0
    );

    // Check user has enough points
    const userPoints = await Points.getUserPoints(userId);
    if (userPoints.availablePoints < totalCost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient points',
        required: totalCost,
        available: userPoints.availablePoints
      });
    }

    // Process purchase
    const order = await Shop.createOrder(userId, cart.items, totalCost);
    
    res.json({
      success: true,
      data: order,
      message: 'Purchase completed successfully'
    });
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process purchase'
    });
  }
};

// Get user's order history
export const getOrders = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { page = 1, limit = 10 } = req.query;
    
    const orders = await Shop.getUserOrders(userId, {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// Get single order details
export const getOrder = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;
    
    const order = await Shop.getOrderById(id, userId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
};

// Admin: Create new product
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      pointsCost,
      category,
      imageUrl,
      inventory = 0,
      isActive = true
    } = req.body;

    if (!name || !pointsCost || pointsCost < 0) {
      return res.status(400).json({
        success: false,
        message: 'Name and valid points cost are required'
      });
    }

    const product = await Shop.createProduct({
      name,
      description,
      pointsCost,
      category,
      imageUrl,
      inventory,
      isActive
    });
    
    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
};

// Admin: Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.pointsCost !== undefined && updates.pointsCost < 0) {
      return res.status(400).json({
        success: false,
        message: 'Points cost must be non-negative'
      });
    }

    const updated = await Shop.updateProduct(id, updates);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
};

// Admin: Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Shop.deleteProduct(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

// Admin: Get all orders with filtering
export const getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      startDate,
      endDate,
      userId 
    } = req.query;
    
    const orders = await Shop.getAllOrders({
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      startDate,
      endDate,
      userId
    });
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// Admin: Get shop analytics
export const getShopAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const analytics = await Shop.getShopAnalytics(parseInt(days));
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching shop analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shop analytics'
    });
  }
};

// Product reviews
export const addProductReview = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { rating, review } = req.body;
    const user_id = req.user.user_id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    const productReview = await Shop.addProductReview(product_id, user_id, rating, review);
    
    res.json({
      success: true,
      data: productReview,
      message: "Review added successfully"
    });
  } catch (error) {
    console.error("Error adding product review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add review"
    });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const reviews = await Shop.getProductReviews(product_id, parseInt(limit), parseInt(offset));
    
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews"
    });
  }
};

export const getUserOrderHistory = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { limit = 10, offset = 0 } = req.query;

    const orders = await Shop.getUserOrderHistory(user_id, parseInt(limit), parseInt(offset));
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order history"
    });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const { order_id } = req.params;
    const user_id = req.user.user_id;

    const order = await Shop.getOrderDetails(order_id, user_id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details"
    });
  }
};
