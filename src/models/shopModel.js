import { db } from "../config/db.js";

const productsTable = () => db("sl_products");
const ordersTable = () => db("sl_orders");
const orderItemsTable = () => db("sl_order_items");
const cartTable = () => db("sl_cart");
const cartItemsTable = () => db("sl_cart_items");
const productReviewsTable = () => db("sl_product_reviews");

export const Shop = {
  // Products Management
  getAllProducts: async (filters = {}) => {
    const { category, minPrice, maxPrice, search, isActive = true, limit = 20, offset = 0 } = filters;
    
    let query = productsTable()
      .select(
        "product_id AS productId",
        "name",
        "description", 
        "image_url AS image",
        "points_cost AS pointsCost",
        "category",
        "inventory",
        "rating",
        "is_active AS isActive",
        "created_at AS createdAt"
      )
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);

    if (isActive !== null) {
      query = query.where("is_active", isActive);
    }

    if (category) {
      query = query.where("category", category);
    }

    if (minPrice) {
      query = query.where("points_cost", ">=", minPrice);
    }

    if (maxPrice) {
      query = query.where("points_cost", "<=", maxPrice);
    }

    if (search) {
      query = query.where(function() {
        this.whereILike("name", `%${search}%`)
            .orWhereILike("description", `%${search}%`);
      });
    }

    return await query;
  },

  getProductById: async (product_id) => {
    return await productsTable()
      .select(
        "product_id AS productId",
        "name",
        "description",
        "image_url AS image", 
        "points_cost AS pointsCost",
        "category",
        "inventory",
        "rating",
        "is_active AS isActive",
        "created_at AS createdAt"
      )
      .where({ product_id })
      .first();
  },

  createProduct: async (productData) => {
    return await productsTable().insert({
      ...productData,
      created_at: new Date(),
      updated_at: new Date()
    });
  },

  updateProduct: async (product_id, updates) => {
    return await productsTable()
      .where({ product_id })
      .update({
        ...updates,
        updated_at: new Date()
      });
  },

  deleteProduct: async (product_id) => {
    return await productsTable()
      .where({ product_id })
      .update({ is_active: false });
  },

  getProductCategories: async () => {
    return await productsTable()
      .distinct("category")
      .where("is_active", true)
      .orderBy("category");
  },

  // Cart Management
  getOrCreateCart: async (user_id) => {
    let cart = await cartTable()
      .select("cart_id AS cartId", "user_id AS userId", "created_at AS createdAt")
      .where({ user_id })
      .first();

    if (!cart) {
      const cartData = {
        user_id,
        created_at: new Date(),
        updated_at: new Date()
      };
      await cartTable().insert(cartData);
      cart = await cartTable().where({ user_id }).first();
    }

    return cart;
  },

  getCartWithItems: async (user_id) => {
    const cart = await Shop.getOrCreateCart(user_id);
    
    const items = await cartItemsTable()
      .select(
        "sl_cart_items.product_id AS productId",
        "sl_cart_items.quantity",
        "sl_products.name",
        "sl_products.description",
        "sl_products.image_url AS image",
        "sl_products.points_cost AS pointsCost",
        "sl_products.category",
        "sl_products.inventory",
        "sl_products.is_active AS isActive"
      )
      .innerJoin("sl_products", "sl_cart_items.product_id", "sl_products.product_id")
      .where("sl_cart_items.cart_id", cart.cartId);

    const totalPoints = items.reduce((sum, item) => sum + (item.pointsCost * item.quantity), 0);

    return {
      ...cart,
      items,
      totalPoints
    };
  },

  addToCart: async (user_id, product_id, quantity = 1) => {
    const cart = await Shop.getOrCreateCart(user_id);
    
    // Check if item already exists in cart
    const existingItem = await cartItemsTable()
      .where({ cart_id: cart.cartId, product_id })
      .first();

    if (existingItem) {
      // Update quantity
      await cartItemsTable()
        .where({ cart_id: cart.cartId, product_id })
        .update({ 
          quantity: existingItem.quantity + quantity,
          updated_at: new Date()
        });
    } else {
      // Add new item
      await cartItemsTable().insert({
        cart_id: cart.cartId,
        product_id,
        quantity,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // Update cart timestamp
    await cartTable()
      .where({ cart_id: cart.cartId })
      .update({ updated_at: new Date() });

    return await Shop.getCartWithItems(user_id);
  },

  updateCartItem: async (user_id, product_id, quantity) => {
    const cart = await Shop.getOrCreateCart(user_id);

    if (quantity <= 0) {
      await cartItemsTable()
        .where({ cart_id: cart.cartId, product_id })
        .del();
    } else {
      await cartItemsTable()
        .where({ cart_id: cart.cartId, product_id })
        .update({ 
          quantity,
          updated_at: new Date()
        });
    }

    return await Shop.getCartWithItems(user_id);
  },

  removeFromCart: async (user_id, product_id) => {
    const cart = await Shop.getOrCreateCart(user_id);
    
    await cartItemsTable()
      .where({ cart_id: cart.cartId, product_id })
      .del();

    return await Shop.getCartWithItems(user_id);
  },

  clearCart: async (user_id) => {
    const cart = await Shop.getOrCreateCart(user_id);
    
    await cartItemsTable()
      .where({ cart_id: cart.cartId })
      .del();

    return { items: [], totalPoints: 0 };
  },

  // Orders Management
  createOrder: async (orderData, orderItems) => {
    return await db.transaction(async (trx) => {
      // Create order
      const [order_id] = await trx("sl_orders").insert({
        ...orderData,
        created_at: new Date(),
        updated_at: new Date()
      });

      // Create order items
      const itemsToInsert = orderItems.map(item => ({
        order_id,
        product_id: item.product_id,
        quantity: item.quantity,
        points_cost_per_item: item.points_cost_per_item,
        total_points: item.total_points,
        created_at: new Date()
      }));

      await trx("sl_order_items").insert(itemsToInsert);

      return order_id;
    });
  },

  getUserOrders: async (user_id, limit = 20, offset = 0, status = null) => {
    let query = ordersTable()
      .select(
        "order_id AS orderId",
        "order_number AS orderNumber",
        "total_points AS totalPoints", 
        "status",
        "notes",
        "created_at AS createdAt"
      )
      .where({ user_id })
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);

    if (status) {
      query = query.where("status", status);
    }

    const orders = await query;

    // Get order items for each order
    for (let order of orders) {
      order.items = await orderItemsTable()
        .select(
          "sl_order_items.product_id AS productId",
          "sl_order_items.quantity",
          "sl_order_items.points_cost_per_item AS pointsCostPerItem",
          "sl_order_items.total_points AS totalPoints",
          "sl_products.name",
          "sl_products.description", 
          "sl_products.image_url AS image",
          "sl_products.category"
        )
        .innerJoin("sl_products", "sl_order_items.product_id", "sl_products.product_id")
        .where("sl_order_items.order_id", order.orderId);
    }

    return orders;
  },

  getOrderById: async (order_id, user_id = null) => {
    let query = ordersTable()
      .select(
        "order_id AS orderId",
        "user_id AS userId",
        "order_number AS orderNumber", 
        "total_points AS totalPoints",
        "status",
        "notes",
        "created_at AS createdAt"
      )
      .where({ order_id });

    if (user_id) {
      query = query.where({ user_id });
    }

    const order = await query.first();

    if (order) {
      order.items = await orderItemsTable()
        .select(
          "sl_order_items.product_id AS productId",
          "sl_order_items.quantity",
          "sl_order_items.points_cost_per_item AS pointsCostPerItem", 
          "sl_order_items.total_points AS totalPoints",
          "sl_products.name",
          "sl_products.description",
          "sl_products.image_url AS image",
          "sl_products.category"
        )
        .innerJoin("sl_products", "sl_order_items.product_id", "sl_products.product_id")
        .where("sl_order_items.order_id", order.orderId);
    }

    return order;
  },

  updateOrderStatus: async (order_id, status, notes = null) => {
    const updates = { 
      status, 
      updated_at: new Date() 
    };
    
    if (notes) {
      updates.notes = notes;
    }

    return await ordersTable()
      .where({ order_id })
      .update(updates);
  },

  // Product Reviews
  addProductReview: async (product_id, user_id, rating, review) => {
    const reviewData = {
      product_id,
      user_id,
      rating,
      review,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Use INSERT ... ON DUPLICATE KEY UPDATE for MySQL
    await db.raw(`
      INSERT INTO sl_product_reviews (product_id, user_id, rating, review, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      rating = VALUES(rating),
      review = VALUES(review),
      updated_at = VALUES(updated_at)
    `, [product_id, user_id, rating, review, reviewData.created_at, reviewData.updated_at]);

    // Update product average rating
    await Shop.updateProductRating(product_id);

    return reviewData;
  },

  getProductReviews: async (product_id, limit = 10, offset = 0) => {
    return await productReviewsTable()
      .join("sl_user_accounts", "sl_product_reviews.user_id", "sl_user_accounts.user_id")
      .select(
        "sl_product_reviews.*",
        "sl_user_accounts.first_name",
        "sl_user_accounts.last_name",
        "sl_user_accounts.avatar"
      )
      .where({ product_id })
      .orderBy("sl_product_reviews.created_at", "desc")
      .limit(limit)
      .offset(offset);
  },

  updateProductRating: async (product_id) => {
    const result = await productReviewsTable()
      .where({ product_id })
      .avg("rating as average_rating")
      .first();

    const averageRating = result.average_rating ? parseFloat(result.average_rating).toFixed(1) : 0;

    await productsTable()
      .where({ product_id })
      .update({ 
        rating: averageRating,
        updated_at: new Date()
      });

    return averageRating;
  },

  getUserProductReview: async (product_id, user_id) => {
    return await productReviewsTable()
      .where({ product_id, user_id })
      .first();
  },

  // Enhanced cart with persistence
  createUserCart: async (user_id) => {
    const cartData = {
      user_id,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [cart_id] = await cartTable().insert(cartData);
    return { cart_id, ...cartData };
  },

  getUserCart: async (user_id) => {
    let cart = await cartTable()
      .where({ user_id })
      .first();

    if (!cart) {
      cart = await Shop.createUserCart(user_id);
    }

    const items = await cartItemsTable()
      .join("sl_products", "sl_cart_items.product_id", "sl_products.product_id")
      .select(
        "sl_cart_items.*",
        "sl_products.name",
        "sl_products.description",
        "sl_products.image_url AS image",
        "sl_products.points_cost AS pointsCost",
        "sl_products.inventory"
      )
      .where({ cart_id: cart.cart_id });

    return {
      ...cart,
      items,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      totalPoints: items.reduce((sum, item) => sum + (item.quantity * item.pointsCost), 0)
    };
  },

  // Enhanced order management
  getUserOrderHistory: async (user_id, limit = 10, offset = 0) => {
    const orders = await ordersTable()
      .select(
        "order_id AS orderId",
        "total_points AS totalPoints",
        "status",
        "shipping_address AS shippingAddress",
        "notes",
        "created_at AS createdAt"
      )
      .where({ user_id })
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);

    // Get items for each order
    for (let order of orders) {
      const items = await orderItemsTable()
        .join("sl_products", "sl_order_items.product_id", "sl_products.product_id")
        .select(
          "sl_order_items.*",
          "sl_products.name",
          "sl_products.image_url AS image"
        )
        .where({ order_id: order.orderId });

      order.items = items;
    }

    return orders;
  },

  getOrderDetails: async (order_id, user_id) => {
    const order = await ordersTable()
      .select(
        "order_id AS orderId",
        "total_points AS totalPoints",
        "status",
        "shipping_address AS shippingAddress", 
        "notes",
        "created_at AS createdAt",
        "updated_at AS updatedAt"
      )
      .where({ order_id, user_id })
      .first();

    if (!order) return null;

    const items = await orderItemsTable()
      .join("sl_products", "sl_order_items.product_id", "sl_products.product_id")
      .select(
        "sl_order_items.*",
        "sl_products.name",
        "sl_products.description",
        "sl_products.image_url AS image"
      )
      .where({ order_id });

    return { ...order, items };
  },

  // Admin functions
  getAllOrders: async (limit = 50, offset = 0, status = null, search = null) => {
    let query = ordersTable()
      .select(
        "sl_orders.order_id AS orderId",
        "sl_orders.user_id AS userId",
        "sl_orders.order_number AS orderNumber",
        "sl_orders.total_points AS totalPoints",
        "sl_orders.status",
        "sl_orders.notes",
        "sl_orders.created_at AS createdAt",
        db.raw("CONCAT(sl_user_accounts.first_name, ' ', sl_user_accounts.last_name) AS userName"),
        "sl_user_accounts.user_email AS userEmail"
      )
      .innerJoin("sl_user_accounts", "sl_orders.user_id", "sl_user_accounts.user_id")
      .orderBy("sl_orders.created_at", "desc")
      .limit(limit)
      .offset(offset);

    if (status) {
      query = query.where("sl_orders.status", status);
    }

    if (search) {
      query = query.where(function() {
        this.whereILike("sl_orders.order_number", `%${search}%`)
            .orWhereILike("sl_user_accounts.first_name", `%${search}%`)
            .orWhereILike("sl_user_accounts.last_name", `%${search}%`)
            .orWhereILike("sl_user_accounts.user_email", `%${search}%`);
      });
    }

    return await query;
  }
};
