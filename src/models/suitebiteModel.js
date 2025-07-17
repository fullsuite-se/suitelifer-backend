import { db } from "../config/db.js";
import { v7 as uuidv7 } from "uuid";

// Table references based on the new Suitebite schema
const usersTable = () => db("sl_user_accounts");
const userPointsTable = () => db("sl_user_points"); // New points table
const cheersTable = () => db("sl_cheers"); // New cheers table
const cheerCommentsTable = () => db("sl_cheer_comments");
const cheerLikesTable = () => db("sl_cheer_likes");
const transactionsTable = () => db("sl_transactions"); // New transactions table
const productsTable = () => db("sl_products"); // Updated: using unified products table
const categoriesTable = () => db("sl_shop_categories"); // Added categories table
const cartsTable = () => db("sl_carts");
const cartItemsTable = () => db("sl_cart_items");
const ordersTable = () => db("sl_orders");
const orderItemsTable = () => db("sl_order_items");
const monthlyLimitsTable = () => db("sl_monthly_limits");
const adminActionsTable = () => db("sl_admin_actions");

// Product Variations tables
const variationTypesTable = () => db("sl_variation_types");
const variationOptionsTable = () => db("sl_variation_options");
const productVariationsTable = () => db("sl_product_variations");

const userHeartbitsTable = () => db("sl_user_heartbits");

export {
  productsTable,
  orderItemsTable,
  ordersTable,
  cartItemsTable
};

export const Suitebite = {
  // ========== USER OPERATIONS ==========
  
  getUserById: async (user_id) => {
    const user = await usersTable()
      .select("user_id", "first_name", "last_name", "user_email", "profile_pic", "user_type")
      .where("user_id", user_id)
      .first();
    return user;
  },

  getUserPoints: async (user_id) => {
    return await userPointsTable()
      .select("available_points", "total_earned", "total_spent", "monthly_cheer_limit", "monthly_cheer_used")
      .where("user_id", user_id)
      .first();
  },

  updateUserPoints: async (user_id, points_amount) => {
    // Check if points record exists
    const existing = await userPointsTable().where("user_id", user_id).first();
    
    if (existing) {
      if (points_amount > 0) {
        // Earning points
        return await userPointsTable()
          .where("user_id", user_id)
          .update({
            available_points: db.raw("available_points + ?", [points_amount]),
            total_earned: db.raw("total_earned + ?", [points_amount])
          });
      } else {
        // Spending points
        return await userPointsTable()
          .where("user_id", user_id)
          .update({
            available_points: db.raw("available_points + ?", [points_amount]),
            total_spent: db.raw("total_spent + ?", [Math.abs(points_amount)])
          });
      }
    } else {
      return await userPointsTable().insert({
        user_id: user_id,
        available_points: Math.max(0, points_amount),
        total_earned: Math.max(0, points_amount),
        total_spent: 0,
        monthly_cheer_limit: 100,
        monthly_cheer_used: 0
      });
    }
  },

  // Backward compatibility method
  getUserHeartbits: async (user_id) => {
    const points = await userPointsTable()
      .select("available_points as heartbits_balance", "total_earned as total_heartbits_earned", "total_spent as total_heartbits_spent")
      .where("user_id", user_id)
      .first();
    return points;
  },

  updateUserHeartbits: async (user_id, heartbits_amount) => {
    return await Suitebite.updateUserPoints(user_id, heartbits_amount);
  },

  // ========== CHEER OPERATIONS ==========

  createCheer: async (cheerData) => {
    return await cheersTable().insert(cheerData);
  },

  // Backward compatibility method
  createCheerPost: async (cheerData) => {
    // Transform old format to new format
    const newCheerData = {
      cheer_id: cheerData.cheer_post_id || uuidv7(),
      from_user_id: cheerData.cheerer_id,
      to_user_id: cheerData.peer_id,
      points: cheerData.heartbits_given || 1,
      message: cheerData.cheer_message || "",
      created_at: cheerData.posted_at || cheerData.created_at,
      updated_at: cheerData.updated_at || cheerData.created_at
    };
    return await cheersTable().insert(newCheerData);
  },

  getCheers: async (page = 1, limit = 10, user_id = null) => {
    const offset = (page - 1) * limit;
    
    let query = cheersTable()
      .select(
        "sl_cheers.*",
        "from_user.first_name as from_user_first_name",
        "from_user.last_name as from_user_last_name",
        "from_user.profile_pic as from_user_profile_pic",
        "to_user.first_name as to_user_first_name",
        "to_user.last_name as to_user_last_name",
        "to_user.profile_pic as to_user_profile_pic",
        db.raw("(SELECT COUNT(*) FROM sl_cheer_likes WHERE cheer_id = sl_cheers.cheer_id) as likes_count"),
        db.raw("(SELECT COUNT(*) FROM sl_cheer_comments WHERE cheer_id = sl_cheers.cheer_id) as comments_count")
      )
      .leftJoin("sl_user_accounts as from_user", "sl_cheers.from_user_id", "from_user.user_id")
      .leftJoin("sl_user_accounts as to_user", "sl_cheers.to_user_id", "to_user.user_id");

    if (user_id) {
      query = query.where(function() {
        this.where("sl_cheers.from_user_id", user_id)
            .orWhere("sl_cheers.to_user_id", user_id);
      });
    }

    const cheers = await query
      .orderBy("sl_cheers.created_at", "desc")
      .limit(limit)
      .offset(offset);

    return cheers;
  },

  // Backward compatibility method
  getCheerPosts: async (page = 1, limit = 10, user_id = null) => {
    const cheers = await Suitebite.getCheers(page, limit, user_id);
    
    // Transform to old format for backward compatibility
    return cheers.map(cheer => ({
      cheer_post_id: cheer.cheer_id,
      cheerer_id: cheer.from_user_id,
      peer_id: cheer.to_user_id,
      heartbits_given: cheer.points,
      cheer_message: cheer.message,
      posted_at: cheer.created_at,
      created_at: cheer.created_at,
      updated_at: cheer.updated_at,
      cheerer_first_name: cheer.from_user_first_name,
      cheerer_last_name: cheer.from_user_last_name,
      cheerer_profile_pic: cheer.from_user_profile_pic,
      peer_first_name: cheer.to_user_first_name,
      peer_last_name: cheer.to_user_last_name,
      peer_profile_pic: cheer.to_user_profile_pic,
      likes_count: cheer.likes_count,
      comments_count: cheer.comments_count,
      additional_recipients: [] // Simplified to 1-to-1 cheers
    }));
  },

  getCheerById: async (cheer_id) => {
    const cheer = await cheersTable()
      .select(
        "sl_cheers.*",
        "from_user.first_name as from_user_first_name",
        "from_user.last_name as from_user_last_name",
        "from_user.profile_pic as from_user_profile_pic",
        "to_user.first_name as to_user_first_name",
        "to_user.last_name as to_user_last_name",
        "to_user.profile_pic as to_user_profile_pic",
        db.raw("(SELECT COUNT(*) FROM sl_cheer_likes WHERE cheer_id = sl_cheers.cheer_id) as likes_count"),
        db.raw("(SELECT COUNT(*) FROM sl_cheer_comments WHERE cheer_id = sl_cheers.cheer_id) as comments_count")
      )
      .leftJoin("sl_user_accounts as from_user", "sl_cheers.from_user_id", "from_user.user_id")
      .leftJoin("sl_user_accounts as to_user", "sl_cheers.to_user_id", "to_user.user_id")
      .where("sl_cheers.cheer_id", cheer_id)
      .first();

    if (cheer) {
      // Get likes and comments for this cheer
      cheer.likes = await Suitebite.getCheerLikes(cheer_id);
      cheer.comments = await Suitebite.getCheerComments(cheer_id);
    }

    return cheer;
  },

  // Backward compatibility method
  getCheerPostById: async (post_id) => {
    const cheer = await Suitebite.getCheerById(post_id);
    
    if (!cheer) return null;
    
    // Transform to old format for backward compatibility
    return {
      cheer_post_id: cheer.cheer_id,
      cheerer_id: cheer.from_user_id,
      peer_id: cheer.to_user_id,
      heartbits_given: cheer.points,
      cheer_message: cheer.message,
      posted_at: cheer.created_at,
      created_at: cheer.created_at,
      updated_at: cheer.updated_at,
      cheerer_first_name: cheer.from_user_first_name,
      cheerer_last_name: cheer.from_user_last_name,
      cheerer_profile_pic: cheer.from_user_profile_pic,
      peer_first_name: cheer.to_user_first_name,
      peer_last_name: cheer.to_user_last_name,
      peer_profile_pic: cheer.to_user_profile_pic,
      likes_count: cheer.likes_count,
      comments_count: cheer.comments_count,
      likes: cheer.likes,
      comments: cheer.comments,
      additional_recipients: [] // Simplified to 1-to-1 cheers
    };
  },

  // ========== CHEER COMMENTS OPERATIONS ==========

  addCheerComment: async (commentData) => {
    return await cheerCommentsTable().insert(commentData);
  },

  getCheerComments: async (cheer_id) => {
    return await cheerCommentsTable()
      .select(
        "sl_cheer_comments.*",
        "commenter.first_name as commenter_first_name",
        "commenter.last_name as commenter_last_name",
        "commenter.profile_pic as commenter_profile_pic"
      )
      .leftJoin("sl_user_accounts as commenter", "sl_cheer_comments.user_id", "commenter.user_id")
      .where("sl_cheer_comments.cheer_id", cheer_id)
      .orderBy("sl_cheer_comments.created_at", "asc");
  },

  // ========== CHEER LIKES OPERATIONS ==========

  toggleCheerLike: async (cheer_id, user_id) => {
    const existing = await cheerLikesTable()
      .where("cheer_id", cheer_id)
      .where("user_id", user_id)
      .first();

    if (existing) {
      // Unlike
      await cheerLikesTable()
        .where("cheer_id", cheer_id)
        .where("user_id", user_id)
        .del();
      return { action: "unliked" };
    } else {
      // Like
      await cheerLikesTable().insert({
        cheer_id: cheer_id,
        user_id: user_id
      });
      return { action: "liked" };
    }
  },

  // Get users who liked a specific cheer
  getCheerLikes: async (cheer_id) => {
    return await cheerLikesTable()
      .select(
        "sl_cheer_likes.*",
        "liker.first_name as liker_first_name",
        "liker.last_name as liker_last_name",
        "liker.profile_pic as liker_profile_pic"
      )
      .leftJoin("sl_user_accounts as liker", "sl_cheer_likes.user_id", "liker.user_id")
      .where("sl_cheer_likes.cheer_id", cheer_id)
      .orderBy("sl_cheer_likes.created_at", "desc");
  },

  // ========== TRANSACTIONS OPERATIONS ==========

  createTransaction: async (transactionData) => {
    return await transactionsTable().insert(transactionData);
  },

  getUserTransactions: async (user_id, page = 1, limit = 20) => {
    const offset = (page - 1) * limit;
    
    return await transactionsTable()
      .select("*")
      .where(function() {
        this.where("from_user_id", user_id)
            .orWhere("to_user_id", user_id);
      })
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);
  },

  getTransactionById: async (transaction_id) => {
    return await transactionsTable()
      .where("transaction_id", transaction_id)
      .first();
  },

  // ========== PRODUCTS OPERATIONS ==========

  getAllProducts: async (activeOnly = true) => {
    let query = productsTable()
      .select(
        "sl_products.product_id",
        "sl_products.name",
        "sl_products.description",
        "sl_products.price_points as price",
        "sl_products.category_id",
        "sl_products.image_url",
        "sl_products.slug",
        "sl_products.is_active",
        "sl_products.created_at",
        "sl_products.updated_at"
      )
      .leftJoin("sl_shop_categories", "sl_products.category_id", "sl_shop_categories.category_id")
      .select("sl_shop_categories.category_name as category");

    if (activeOnly) {
      query = query.where("sl_products.is_active", true);
    }

    return await query.orderBy("sl_products.name", "asc");
  },

  getProductById: async (product_id) => {
    return await productsTable()
      .select(
        "sl_products.product_id",
        "sl_products.name",
        "sl_products.description",
        "sl_products.price_points as price",
        "sl_products.category_id",
        "sl_products.image_url",
        "sl_products.slug",
        "sl_products.is_active",
        "sl_products.created_at",
        "sl_products.updated_at"
      )
      .leftJoin("sl_shop_categories", "sl_products.category_id", "sl_shop_categories.category_id")
      .select("sl_shop_categories.category_name as category")
      .where("sl_products.product_id", product_id)
      .first();
  },

  addProduct: async (productData) => {
    const [productId] = await productsTable().insert(productData);
    return productId;
  },

  updateProduct: async (product_id, updateData) => {
    return await productsTable()
      .where("product_id", product_id)
      .update(updateData);
  },

  deleteProduct: async (product_id) => {
    // First delete related cart items
    await cartItemsTable()
      .where("product_id", product_id)
      .del();
    
    // Delete product variations
    await db("sl_product_variations")
      .where("product_id", product_id)
      .del();
    
    // Finally delete the product
    return await productsTable()
      .where("product_id", product_id)
      .del();
  },

  // ========== PRODUCT VARIATIONS OPERATIONS ==========

  getProductVariations: async (product_id) => {
    const variations = await db("sl_product_variations")
      .select("*")
      .where("product_id", product_id);

    for (const variation of variations) {
      const optionLinks = await db("sl_product_variation_options")
        .where("variation_id", variation.variation_id);
      const optionIds = optionLinks.map(link => link.option_id);
      if (optionIds.length > 0) {
        const options = await db("sl_variation_options as vo")
          .select(
            "vo.option_id",
            "vo.variation_type_id",
            "vo.option_value",
            "vo.option_label",
            "vo.hex_color",
            "vt.type_name",
            "vt.type_label"
          )
          .leftJoin("sl_variation_types as vt", "vo.variation_type_id", "vt.variation_type_id")
          .whereIn("vo.option_id", optionIds);
        variation.options = options;
      } else {
        variation.options = [];
      }
    }
    return variations;
  },

  addProductVariation: async (variationData) => {
    // Only keep valid fields for sl_product_variations
    const { options, product_id, is_active } = variationData;
    // Insert the main variation
    const [variationId] = await db("sl_product_variations").insert({ product_id, is_active });
    // Insert each option into the join table
    if (options && Array.isArray(options)) {
      const optionRows = options.map(option_id => ({
        variation_id: variationId,
        option_id
      }));
      await db("sl_product_variation_options").insert(optionRows);
    }
    return variationId;
  },

  updateProductVariation: async (variation_id, updateData) => {
    const { options, ...variationFields } = updateData;
    // Update main variation fields
    await db("sl_product_variations")
      .where("variation_id", variation_id)
      .update(variationFields);
    // Update options if provided
    if (options && Array.isArray(options)) {
      // Remove old links
      await db("sl_product_variation_options")
        .where("variation_id", variation_id)
        .del();
      // Add new links
      const optionRows = options.map(option_id => ({
        variation_id,
        option_id
      }));
      await db("sl_product_variation_options").insert(optionRows);
    }
    return true;
  },

  deleteProductVariation: async (variation_id) => {
    // Deleting the variation will cascade and delete links
    return await db("sl_product_variations")
      .where("variation_id", variation_id)
      .del();
  },

  // ========== VARIATION TYPES & OPTIONS ==========

  getVariationTypes: async () => {
    return await db("sl_variation_types")
      .select("*")
      .orderBy("sort_order", "asc");
  },

  getVariationOptions: async (variation_type_id = null) => {
    let query = db("sl_variation_options as vo")
      .select(
        "vo.*",
        "vt.type_name",
        "vt.type_label"
      )
      .leftJoin("sl_variation_types as vt", "vo.variation_type_id", "vt.variation_type_id");

    if (variation_type_id) {
      query = query.where("vo.variation_type_id", variation_type_id);
    }

    return await query.orderBy("vo.sort_order", "asc");
  },

  addVariationType: async (typeData) => {
    // Auto-assign sort_order
    const maxSort = await db("sl_variation_types").max("sort_order as max").first();
    const nextSortOrder = (maxSort && maxSort.max != null) ? maxSort.max + 1 : 1;
    const insertData = {
      ...typeData,
      sort_order: nextSortOrder
    };
    const [typeId] = await db("sl_variation_types").insert(insertData);
    return typeId;
  },

  addVariationOption: async (optionData) => {
    const [optionId] = await db("sl_variation_options").insert(optionData);
    return optionId;
  },

  // Delete a variation type and all its options and product links
  deleteVariationType: async (variation_type_id) => {
    // Delete all option references in cart and order item variations
    const optionIds = await db("sl_variation_options")
      .where("variation_type_id", variation_type_id)
      .pluck("option_id");
    if (optionIds.length > 0) {
      await db("sl_cart_item_variations").whereIn("option_id", optionIds).del();
      await db("sl_order_item_variations").whereIn("option_id", optionIds).del();
      await db("sl_variation_options").whereIn("option_id", optionIds).del();
    }
    // Delete the type itself
    return await db("sl_variation_types").where("variation_type_id", variation_type_id).del();
  },

  // Delete a variation option and remove it from all cart/order items
  deleteVariationOption: async (option_id) => {
    await db("sl_cart_item_variations").where("option_id", option_id).del();
    await db("sl_order_item_variations").where("option_id", option_id).del();
    return await db("sl_variation_options").where("option_id", option_id).del();
  },

  // ========== CART OPERATIONS ==========

  getCart: async (user_id) => {
    // Get cart
    const cart = await cartsTable()
      .where("user_id", user_id)
      .first();

    if (!cart) {
      return null;
    }

    // Get cart items with product details
    const cartItems = await cartItemsTable()
      .select(
        "sl_cart_items.*",
        "sl_products.name as product_name",
        "sl_products.price_points",
        "sl_products.image_url",
        "sl_shop_categories.category_name"
      )
      .leftJoin("sl_products", "sl_cart_items.product_id", "sl_products.product_id")
      .leftJoin("sl_shop_categories", "sl_products.category_id", "sl_shop_categories.category_id")
      .where("sl_cart_items.cart_id", cart.cart_id);

    // Get variations for each cart item
    for (const item of cartItems) {
      const variations = await db("sl_cart_item_variations as civ")
        .select(
          "civ.*",
          "vo.option_value",
          "vo.option_label",
          "vo.hex_color",
          "vt.type_name",
          "vt.type_label"
        )
        .leftJoin("sl_variation_options as vo", "civ.option_id", "vo.option_id")
        .leftJoin("sl_variation_types as vt", "civ.variation_type_id", "vt.variation_type_id")
        .where("civ.cart_item_id", item.cart_item_id);

      item.variations = variations;
    }

    return {
      cart,
      cartItems
    };
  },

  addToCart: async (user_id, product_id, quantity, variations = []) => {
    // Get or create cart
    let cart = await cartsTable()
      .where("user_id", user_id)
      .first();

    if (!cart) {
      const [cartId] = await cartsTable().insert({
        user_id,
        created_at: new Date()
      });
      cart = { cart_id: cartId };
    }

    // Add cart item
    const [cartItemId] = await cartItemsTable().insert({
        cart_id: cart.cart_id,
        product_id,
        quantity
    });

    // Add variations if provided
    if (variations.length > 0) {
      const variationData = variations.map(variation => ({
        cart_item_id: cartItemId,
        variation_type_id: variation.variation_type_id,
        option_id: variation.option_id
      }));

      await db("sl_cart_item_variations").insert(variationData);
    }

    return cartItemId;
  },

  updateCartItem: async (cart_item_id, quantity, variations = []) => {
    // Update cart item
    await cartItemsTable()
      .where("cart_item_id", cart_item_id)
      .update({ quantity });

    // Update variations
    if (variations.length > 0) {
      // Delete existing variations
      await db("sl_cart_item_variations")
        .where("cart_item_id", cart_item_id)
        .del();

      // Add new variations
      const variationData = variations.map(variation => ({
        cart_item_id,
        variation_type_id: variation.variation_type_id,
        option_id: variation.option_id
      }));

      await db("sl_cart_item_variations").insert(variationData);
    }

    return true;
  },

  removeFromCart: async (cart_item_id) => {
    // Delete variations first
    await db("sl_cart_item_variations")
      .where("cart_item_id", cart_item_id)
      .del();

    // Delete cart item
    return await cartItemsTable()
      .where("cart_item_id", cart_item_id)
      .del();
  },

  clearCart: async (user_id) => {
      const cart = await cartsTable()
      .where("user_id", user_id)
        .first();

    if (cart) {
      // Delete all cart item variations
      await db("sl_cart_item_variations")
        .whereIn("cart_item_id", function() {
          this.select("cart_item_id")
            .from("sl_cart_items")
            .where("cart_id", cart.cart_id);
        })
        .del();

      // Delete all cart items
      await cartItemsTable()
        .where("cart_id", cart.cart_id)
        .del();

      // Delete cart
      await cartsTable()
      .where("cart_id", cart.cart_id)
      .del();
    }

    return true;
  },

  // ========== ORDER OPERATIONS ==========

  createOrder: async (user_id, total_points, cartItems) => {
    // Create order
    const [orderId] = await ordersTable().insert({
      user_id,
      total_points,
      ordered_at: new Date(),
      status: 'pending'
    });

    // Transfer cart items to order items
    for (const cartItem of cartItems) {
      const [orderItemId] = await orderItemsTable().insert({
        order_id: orderId,
        product_id: cartItem.product_id,
        quantity: cartItem.quantity,
        points_spent: cartItem.price_points * cartItem.quantity,
        product_name: cartItem.product_name,
        price_points: cartItem.price_points
      });

      // Transfer variations
      if (cartItem.variations && cartItem.variations.length > 0) {
        const variationData = cartItem.variations.map(variation => ({
          order_item_id: orderItemId,
          variation_type_id: variation.variation_type_id,
          option_id: variation.option_id
        }));

        await db("sl_order_item_variations").insert(variationData);
      }
    }

    return orderId;
  },

  getOrderById: async (order_id) => {
      const order = await ordersTable()
      .select("*")
      .where("order_id", order_id)
        .first();

    if (!order) return null;

    // Get order items with variations
    const orderItems = await orderItemsTable()
      .select("*")
      .where("order_id", order_id);

    for (const item of orderItems) {
      const variations = await db("sl_order_item_variations as oiv")
        .select(
          "oiv.*",
          "vo.option_value",
          "vo.option_label",
          "vo.hex_color",
          "vt.type_name",
          "vt.type_label"
        )
        .leftJoin("sl_variation_options as vo", "oiv.option_id", "vo.option_id")
        .leftJoin("sl_variation_types as vt", "oiv.variation_type_id", "vt.variation_type_id")
        .where("oiv.order_item_id", item.order_item_id);

      item.variations = variations;
    }

    return {
      ...order,
      orderItems
    };
  },

  getOrderHistory: async (user_id, page = 1, limit = 20) => {
    const offset = (page - 1) * limit;

    const orders = await ordersTable()
      .select("*")
      .where("user_id", user_id)
      .orderBy("ordered_at", "desc")
      .limit(limit)
      .offset(offset);

    // Get order items for each order
    for (const order of orders) {
      const orderItems = await orderItemsTable()
        .select("*")
        .where("order_id", order.order_id);

      for (const item of orderItems) {
        const variations = await db("sl_order_item_variations as oiv")
          .select(
            "oiv.*",
            "vo.option_value",
            "vo.option_label",
            "vo.hex_color",
            "vt.type_name",
            "vt.type_label"
          )
          .leftJoin("sl_variation_options as vo", "oiv.option_id", "vo.option_id")
          .leftJoin("sl_variation_types as vt", "oiv.variation_type_id", "vt.variation_type_id")
          .where("oiv.order_item_id", item.order_item_id);

        item.variations = variations;
      }

      order.orderItems = orderItems;
    }

    return orders;
  },

  getAllOrders: async (filters = {}) => {
    let query = ordersTable()
      .select(
        "sl_orders.*",
        "sl_user_accounts.first_name",
        "sl_user_accounts.last_name",
        "sl_user_accounts.user_email"
      )
      .leftJoin("sl_user_accounts", "sl_orders.user_id", "sl_user_accounts.user_id");

    // Apply filters
    if (filters.status) {
      query = query.where("sl_orders.status", filters.status);
    }
    if (filters.dateFrom) {
      query = query.where("sl_orders.ordered_at", ">=", filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.where("sl_orders.ordered_at", "<=", filters.dateTo);
    }

    const orders = await query.orderBy("sl_orders.ordered_at", "desc");

    // Get order items for each order
    for (const order of orders) {
      const orderItems = await orderItemsTable()
        .select("*")
        .where("order_id", order.order_id);

      for (const item of orderItems) {
        const variations = await db("sl_order_item_variations as oiv")
      .select(
            "oiv.*",
            "vo.option_value",
            "vo.option_label",
            "vo.hex_color",
            "vt.type_name",
            "vt.type_label"
          )
          .leftJoin("sl_variation_options as vo", "oiv.option_id", "vo.option_id")
          .leftJoin("sl_variation_types as vt", "oiv.variation_type_id", "vt.variation_type_id")
          .where("oiv.order_item_id", item.order_item_id);

        item.variations = variations;
      }

      order.orderItems = orderItems;
    }

    return orders;
  },

  updateOrderStatus: async (order_id, status, notes = null) => {
    const updateData = { status };
    
    if (status === 'completed') {
      updateData.completed_at = new Date();
    } else if (status === 'processed') {
      updateData.processed_at = new Date();
    }
    
    if (notes) {
      updateData.notes = notes;
    }

    return await ordersTable()
      .where("order_id", order_id)
      .update(updateData);
  },

  // ========== CATEGORY OPERATIONS ==========

  getAllCategories: async () => {
    return await db("sl_shop_categories")
      .select("*")
      .where("is_active", true)
      .orderBy("category_name", "asc");
  },

  getCategoryById: async (category_id) => {
    return await db("sl_shop_categories")
      .where("category_id", category_id)
      .first();
  },

  getCategoryByName: async (category_name) => {
    return await db("sl_shop_categories")
      .where("category_name", category_name)
      .first();
  },

  addCategory: async (categoryData) => {
    const [categoryId] = await db("sl_shop_categories").insert(categoryData);
    return categoryId;
  },

  updateCategory: async (category_id, updateData) => {
    return await db("sl_shop_categories")
      .where("category_id", category_id)
      .update(updateData);
  },

  deleteCategory: async (category_id) => {
    // Update products to remove category reference
    await productsTable()
      .where("category_id", category_id)
      .update({ category_id: null });

    // Delete category
    return await db("sl_shop_categories")
      .where("category_id", category_id)
      .del();
  },

  // ========== LEADERBOARD OPERATIONS ==========

  getLeaderboard: async (type = "received", period = "all", limit = 10) => {
    let query = cheersTable()
      .select(
        type === "given" ? "from_user_id as user_id" : "to_user_id as user_id",
        "user.first_name",
        "user.last_name",
        "user.profile_pic",
        db.raw("SUM(points) as total_heartbits"),
        db.raw("COUNT(*) as cheer_count")
      )
      .leftJoin("sl_user_accounts as user", 
        type === "given" ? "sl_cheers.from_user_id" : "sl_cheers.to_user_id", 
        "user.user_id"
      );

    // Add time period filter
    if (period === "day") {
      query = query.where("sl_cheers.created_at", ">=", db.raw("CURDATE()"));
    } else if (period === "week") {
      query = query.where("sl_cheers.created_at", ">=", db.raw("DATE_SUB(NOW(), INTERVAL 7 DAY)"));
    } else if (period === "month") {
      query = query.where("sl_cheers.created_at", ">=", db.raw("DATE_SUB(NOW(), INTERVAL 30 DAY)"));
    } else if (period === "year") {
      query = query.where("sl_cheers.created_at", ">=", db.raw("DATE_SUB(NOW(), INTERVAL 365 DAY)"));
    }
    // For "all" period, no date filter is applied

    return await query
      .groupBy(type === "given" ? "from_user_id" : "to_user_id")
      .orderBy("total_heartbits", "desc")
      .limit(limit);
  },

  getMonthlyLeaderboard: async (month, year, type = "received", limit = 10) => {
    return await cheersTable()
      .select(
        type === "given" ? "from_user_id as user_id" : "to_user_id as user_id",
        "user.first_name",
        "user.last_name",
        "user.profile_pic",
        db.raw("SUM(points) as total_heartbits"),
        db.raw("COUNT(*) as cheer_count")
      )
      .leftJoin("sl_user_accounts as user", 
        type === "given" ? "sl_cheers.from_user_id" : "sl_cheers.to_user_id", 
        "user.user_id"
      )
      .whereRaw("MONTH(sl_cheers.created_at) = ?", [month])
      .whereRaw("YEAR(sl_cheers.created_at) = ?", [year])
      .groupBy(type === "given" ? "from_user_id" : "to_user_id")
      .orderBy("total_heartbits", "desc")
      .limit(limit);
  },

  // ========== PEERS WHO CHEERED OPERATIONS ==========

  getPeersWhoCheered: async (user_id, limit = 10, page = 1) => {
    const offset = (page - 1) * limit;
    
    return await cheersTable()
      .select(
        "cheerer.user_id",
        "cheerer.first_name",
        "cheerer.last_name", 
        "cheerer.profile_pic",
        db.raw("SUM(sl_cheers.points) as points"),
        db.raw("COUNT(*) as cheer_count"),
        db.raw("MAX(sl_cheers.created_at) as last_cheer_date")
      )
      .leftJoin("sl_user_accounts as cheerer", "sl_cheers.from_user_id", "cheerer.user_id")
      .where("sl_cheers.to_user_id", user_id)
      .groupBy("sl_cheers.from_user_id")
      .orderBy("last_cheer_date", "desc")
      .limit(limit)
      .offset(offset);
  },

  // ========== ADMIN MANAGEMENT OPERATIONS ==========

  getCheerPostsForAdmin: async (page = 1, limit = 20, search = null, date_from = null, date_to = null) => {
    const offset = (page - 1) * limit;
    
    let query = cheersTable()
      .select(
        "sl_cheers.*",
        "cheerer.first_name as cheerer_first_name",
        "cheerer.last_name as cheerer_last_name",
        "cheerer.user_email as cheerer_email",
        "peer.first_name as peer_first_name",
        "peer.last_name as peer_last_name",
        "peer.user_email as peer_email",
        db.raw("(SELECT COUNT(*) FROM sl_cheer_likes WHERE cheer_id = sl_cheers.cheer_id) as likes_count"),
        db.raw("(SELECT COUNT(*) FROM sl_cheer_comments WHERE cheer_id = sl_cheers.cheer_id) as comments_count")
      )
      .leftJoin("sl_user_accounts as cheerer", "sl_cheers.from_user_id", "cheerer.user_id")
      .leftJoin("sl_user_accounts as peer", "sl_cheers.to_user_id", "peer.user_id");

    // Add search filter
    if (search) {
      query = query.where(function() {
        this.where("sl_cheers.message", "like", `%${search}%`)
            .orWhere("cheerer.first_name", "like", `%${search}%`)
            .orWhere("cheerer.last_name", "like", `%${search}%`)
            .orWhere("peer.first_name", "like", `%${search}%`)
            .orWhere("peer.last_name", "like", `%${search}%`);
      });
    }

    // Add date filters
    if (date_from) {
      query = query.where("sl_cheers.created_at", ">=", date_from);
    }
    if (date_to) {
      query = query.where("sl_cheers.created_at", "<=", date_to);
    }

    return await query
      .orderBy("sl_cheers.created_at", "desc")
      .limit(limit)
      .offset(offset);
  },

  deleteCheerPost: async (post_id) => {
    return await cheersTable()
      .where("cheer_id", post_id)
      .del();
  },

  moderateCheerPost: async (post_id, action, reason = null, admin_id = null) => {
    const updateData = { moderated_at: new Date() };
    
    if (admin_id) {
      updateData.moderated_by = admin_id;
    }

    switch (action) {
      case 'approve':
        updateData.is_approved = true;
        updateData.is_visible = true;
        break;
      case 'reject':
        updateData.is_approved = false;
        updateData.is_visible = false;
        break;
      case 'hide':
        updateData.is_hidden = true;
        updateData.is_visible = false;
        break;
      case 'show':
        updateData.is_hidden = false;
        updateData.is_visible = true;
        break;
      case 'flag':
        updateData.is_flagged = true;
        break;
      case 'unflag':
        updateData.is_flagged = false;
        break;
      case 'warn':
        updateData.is_warned = true;
        updateData.warned_at = new Date();
        updateData.warned_by = admin_id;
        if (reason) {
          updateData.warning_message = reason;
        }
        break;
    }

    if (reason && action !== 'warn') {
      updateData.moderation_reason = reason;
    }

    return await cheersTable()
      .where("cheer_id", post_id)
      .update(updateData);
  },

  getUsersWithHeartbits: async (page = 1, limit = 50, search = null, sort_by = "total_heartbits_earned") => {
    const offset = (page - 1) * limit;
    
    let query = usersTable()
      .select(
        "sl_user_accounts.user_id",
        "sl_user_accounts.first_name",
        "sl_user_accounts.last_name",
        "sl_user_accounts.user_email",
        "sl_user_accounts.user_type",
        "sl_user_accounts.is_active",
        "sl_user_heartbits.heartbits_balance",
        "sl_user_heartbits.total_heartbits_earned",
        "sl_user_heartbits.total_heartbits_spent",
        "sl_user_heartbits.is_suspended",
        db.raw("(SELECT COUNT(*) FROM sl_cheers WHERE from_user_id = sl_user_accounts.user_id) as cheers_sent"),
        db.raw("(SELECT COUNT(*) FROM sl_cheers WHERE to_user_id = sl_user_accounts.user_id) as cheers_received"),
        db.raw("(SELECT SUM(points) FROM sl_cheers WHERE from_user_id = sl_user_accounts.user_id) as total_heartbits_given"),
        db.raw("(SELECT SUM(points) FROM sl_cheers WHERE to_user_id = sl_user_accounts.user_id) as total_heartbits_received")
      )
      .leftJoin("sl_user_heartbits", "sl_user_accounts.user_id", "sl_user_heartbits.user_id")
      .where("sl_user_accounts.user_type", "in", ["EMPLOYEE", "ADMIN"]);

    // Add search filter
    if (search) {
      query = query.where(function() {
        this.where("sl_user_accounts.first_name", "like", `%${search}%`)
            .orWhere("sl_user_accounts.last_name", "like", `%${search}%`)
            .orWhere("sl_user_accounts.user_email", "like", `%${search}%`);
      });
    }

    // Add sorting
    const validSortFields = ["total_heartbits_earned", "heartbits_balance", "cheers_sent", "cheers_received", "first_name"];
    const sortField = validSortFields.includes(sort_by) ? sort_by : "total_heartbits_earned";
    
    return await query
      .orderBy(sortField === "first_name" ? "sl_user_accounts.first_name" : sortField, "desc")
      .limit(limit)
      .offset(offset);
  },

  getUsersWithoutHeartbits: async () => {
    return await usersTable()
      .select(
        "sl_user_accounts.user_id",
        "sl_user_accounts.first_name",
        "sl_user_accounts.last_name",
        "sl_user_accounts.user_email",
        "sl_user_accounts.user_type"
      )
      .leftJoin("sl_user_heartbits", "sl_user_accounts.user_id", "sl_user_heartbits.user_id")
      .where("sl_user_accounts.is_active", true)
      .where("sl_user_accounts.user_type", "in", ["EMPLOYEE", "ADMIN", "SUPER_ADMIN"])
      .whereNull("sl_user_heartbits.user_id")
      .orderBy("sl_user_accounts.first_name", "asc");
  },

  setUserMonthlyLimit: async (user_id, month_year, limit) => {
    const existing = await monthlyLimitsTable()
      .where("user_id", user_id)
      .where("month_year", month_year)
      .first();

    if (existing) {
      return await monthlyLimitsTable()
        .where("user_id", user_id)
        .where("month_year", month_year)
        .update({ heartbits_limit: limit });
    } else {
      return await monthlyLimitsTable().insert({
        user_id,
        month_year,
        heartbits_sent: 0,
        heartbits_limit: limit
      });
    }
  },

  // ========== SYSTEM STATISTICS OPERATIONS ==========

  getSystemStats: async (period = "month") => {
    let dateFilter;
    
    switch (period) {
      case "week":
        dateFilter = db.raw("DATE_SUB(NOW(), INTERVAL 7 DAY)");
        break;
      case "quarter":
        dateFilter = db.raw("DATE_SUB(NOW(), INTERVAL 3 MONTH)");
        break;
      case "year":
        dateFilter = db.raw("DATE_SUB(NOW(), INTERVAL 1 YEAR)");
        break;
      default: // month
        dateFilter = db.raw("DATE_SUB(NOW(), INTERVAL 1 MONTH)");
    }

    // Get basic stats
    const [totalUsers] = await usersTable()
      .count("user_id as count")
      .where("user_type", "in", ["EMPLOYEE", "ADMIN"])
      .where("is_active", true);

    const [activeUsers] = await cheersTable()
      .countDistinct("from_user_id as count")
      .where("sl_cheers.created_at", ">=", dateFilter);

    const [totalCheers] = await cheersTable()
      .count("cheer_id as count")
      .where("sl_cheers.created_at", ">=", dateFilter);

    const [totalHeartbits] = await cheersTable()
      .sum("points as total")
      .where("sl_cheers.created_at", ">=", dateFilter);

    const [totalProducts] = await productsTable()
      .count("product_id as count")
      .where("is_active", true);

    const [totalOrders] = await ordersTable()
      .count("order_id as count")
      .where("sl_orders.ordered_at", ">=", dateFilter);

    const [totalPointsSpent] = await ordersTable()
      .sum("total_points as total")
      .where("sl_orders.ordered_at", ">=", dateFilter);

    // Get top cheerers
    const topCheerers = await cheersTable()
      .select(
        "from_user_id as user_id",
        "user.first_name",
        "user.last_name",
        db.raw("COUNT(*) as cheer_count"),
        db.raw("SUM(points) as total_heartbits")
      )
      .leftJoin("sl_user_accounts as user", "sl_cheers.from_user_id", "user.user_id")
      .where("sl_cheers.created_at", ">=", dateFilter)
      .groupBy("from_user_id")
      .orderBy("total_heartbits", "desc")
      .limit(5);

    // Get daily activity for the period
    const dailyActivity = await cheersTable()
      .select(
        db.raw("DATE(sl_cheers.created_at) as date"),
        db.raw("COUNT(*) as cheers"),
        db.raw("SUM(points) as heartbits")
      )
      .where("sl_cheers.created_at", ">=", dateFilter)
      .groupBy(db.raw("DATE(sl_cheers.created_at)"))
      .orderBy("date", "desc");

    // Add cancelled orders count
    const [cancelledOrdersData] = await ordersTable()
      .count('order_id as cancelled_orders')
      .where('status', 'cancelled')
      .where('sl_orders.ordered_at', '>=', dateFilter);
    const cancelledOrdersCount = cancelledOrdersData.cancelled_orders || 0;

    return {
      period,
      overview: {
        total_users: totalUsers.count,
        active_users: activeUsers.count,
        total_cheers: totalCheers.count,
        total_heartbits: totalHeartbits.total || 0,
        total_products: totalProducts.count,
        total_orders: totalOrders.count,
        total_points_spent: totalPointsSpent.total || 0,
        cancelled_orders: cancelledOrdersCount
      },
      top_cheerers: topCheerers,
      daily_activity: dailyActivity
    };
  },

  // ========== ADMIN ACTIONS LOGGING ==========

  logAdminAction: async (admin_id, action_type, target_type, target_id, details = null) => {
    return await adminActionsTable().insert({
      admin_id,
      action_type,
      target_type,
      target_id: String(target_id),
      details: details ? JSON.stringify(details) : null,
      performed_at: new Date()
    });
  },

  getAdminActionLogs: async (page = 1, limit = 50, admin_id = null, action_type = null) => {
    const offset = (page - 1) * limit;
    
    let query = adminActionsTable()
      .select(
        "sl_admin_actions.*",
        "admin.first_name as admin_first_name",
        "admin.last_name as admin_last_name",
        "admin.user_email as admin_email"
      )
      .leftJoin("sl_user_accounts as admin", "sl_admin_actions.admin_id", "admin.user_id");

    if (admin_id) {
      query = query.where("sl_admin_actions.admin_id", admin_id);
    }

    if (action_type) {
      query = query.where("sl_admin_actions.action_type", action_type);
    }

    return await query
      .orderBy("sl_admin_actions.performed_at", "desc")
      .limit(limit)
      .offset(offset);
  },

  // ========== MONTHLY LIMITS OPERATIONS ==========

  getMonthlyLimit: async (user_id, month_year) => {
    return await monthlyLimitsTable()
      .where("user_id", user_id)
      .where("month_year", month_year)
      .first();
  },

  updateMonthlyLimit: async (user_id, month_year, heartbits_sent) => {
    const existing = await this.getMonthlyLimit(user_id, month_year);
    
    if (existing) {
      return await monthlyLimitsTable()
        .where("user_id", user_id)
        .where("month_year", month_year)
        .increment("heartbits_sent", heartbits_sent);
    } else {
      // Get default limit from system configuration
      const systemConfig = await this.getSystemConfiguration();
      const defaultLimit = parseInt(systemConfig.default_monthly_limit?.value) || 1000;
      
      return await monthlyLimitsTable().insert({
        user_id,
        month_year,
        heartbits_sent,
        heartbits_limit: defaultLimit
      });
    }
  },

  resetMonthlyLimit: async (user_id, month_year) => {
    const existing = await monthlyLimitsTable()
      .where("user_id", user_id)
      .where("month_year", month_year)
      .first();

    if (existing) {
      return await monthlyLimitsTable()
        .where("user_id", user_id)
        .where("month_year", month_year)
        .update({ heartbits_sent: 0 });
    } else {
      // Get default limit from system configuration
      const systemConfig = await this.getSystemConfiguration();
      const defaultLimit = parseInt(systemConfig.default_monthly_limit?.value) || 1000;
      
      return await monthlyLimitsTable().insert({
        user_id,
        month_year,
        heartbits_sent: 0,
        heartbits_limit: defaultLimit
      });
    }
  },

  // ========== ENHANCED ADMIN ANALYTICS ==========

  getAdvancedAnalytics: async (period = "month", metric = "all") => {
    let dateFilter;
    
    switch (period) {
      case "week":
        dateFilter = db.raw("DATE_SUB(NOW(), INTERVAL 7 DAY)");
        break;
      case "quarter":
        dateFilter = db.raw("DATE_SUB(NOW(), INTERVAL 3 MONTH)");
        break;
      case "year":
        dateFilter = db.raw("DATE_SUB(NOW(), INTERVAL 1 YEAR)");
        break;
      default: // month
        dateFilter = db.raw("DATE_SUB(NOW(), INTERVAL 1 MONTH)");
    }

    const analytics = {};

    // Engagement metrics
    if (metric === "all" || metric === "engagement") {
      const [avgCheersPerUser] = await cheersTable()
        .select(db.raw("COUNT(*) / COUNT(DISTINCT from_user_id) as avg_cheers"))
        .where("created_at", ">=", dateFilter);

      const [avgHeartbitsPerCheer] = await cheersTable()
        .select(db.raw("AVG(points) as avg_heartbits"))
        .where("created_at", ">=", dateFilter);

      const userEngagement = await cheersTable()
        .select(
          "from_user_id",
          db.raw("COUNT(*) as cheers_sent"),
          db.raw("SUM(points) as total_heartbits_sent")
        )
        .where("created_at", ">=", dateFilter)
        .groupBy("from_user_id")
        .orderBy("total_heartbits_sent", "desc");

      analytics.engagement = {
        avg_cheers_per_user: Math.round(avgCheersPerUser.avg_cheers || 0),
        avg_heartbits_per_cheer: Math.round(avgHeartbitsPerCheer.avg_heartbits || 0),
        user_engagement_distribution: userEngagement
      };
    }

    // Shop metrics
    if (metric === "all" || metric === "shop") {
      const [totalRevenue] = await ordersTable()
        .sum("total_points as revenue")
        .where("ordered_at", ">=", dateFilter);

      const [avgOrderValue] = await ordersTable()
        .select(db.raw("AVG(total_points) as avg_value"))
        .where("ordered_at", ">=", dateFilter);

      const topProducts = await orderItemsTable()
        .select(
          "product_id",
          "product.product_name",
          db.raw("COUNT(*) as orders"),
          db.raw("SUM(quantity) as total_quantity"),
          db.raw("SUM(points_spent * quantity) as total_revenue")
        )
        .leftJoin("sl_products as product", "sl_order_items.product_id", "product.product_id")
        .leftJoin("sl_orders as orders", "sl_order_items.order_id", "orders.order_id")
        .where("orders.ordered_at", ">=", dateFilter)
        .groupBy("product_id")
        .orderBy("total_revenue", "desc")
        .limit(10);

      analytics.shop = {
        total_revenue: totalRevenue.revenue || 0,
        avg_order_value: Math.round(avgOrderValue.avg_value || 0),
        top_products: topProducts
      };
    }

    // Time-based patterns
    if (metric === "all" || metric === "patterns") {
      const hourlyActivity = await cheersTable()
        .select(
          db.raw("HOUR(created_at) as hour"),
          db.raw("COUNT(*) as cheers"),
          db.raw("SUM(points) as heartbits")
        )
        .where("created_at", ">=", dateFilter)
        .groupBy(db.raw("HOUR(created_at)"))
        .orderBy("hour");

      const weeklyActivity = await cheersTable()
        .select(
          db.raw("DAYOFWEEK(created_at) as day_of_week"),
          db.raw("COUNT(*) as cheers"),
          db.raw("SUM(points) as heartbits")
        )
        .where("created_at", ">=", dateFilter)
        .groupBy(db.raw("DAYOFWEEK(created_at)"))
        .orderBy("day_of_week");

      analytics.patterns = {
        hourly_activity: hourlyActivity,
        weekly_activity: weeklyActivity
      };
    }

    return analytics;
  },

  // ========== SUPER ADMIN OPERATIONS ==========

  getSystemConfiguration: async () => {
    // Get system configuration settings
    const configs = await db('sl_system_config')
      .select('config_key', 'config_value', 'config_description as description', 'updated_at')
      .orderBy('config_key');

    return configs.reduce((acc, config) => {
      acc[config.config_key] = {
        value: config.config_value,
        description: config.description,
        updated_at: config.updated_at
      };
      return acc;
    }, {});
  },

  updateSystemConfiguration: async (config_key, config_value, description = null) => {
    // Update or insert system configuration
    const existing = await db('sl_system_config')
      .where('config_key', config_key)
      .first();

    if (existing) {
      return await db('sl_system_config')
        .where('config_key', config_key)
        .update({
          config_value: JSON.stringify(config_value),
          config_description: description,
          updated_at: new Date()
        });
    } else {
      return await db('sl_system_config').insert({
        config_key,
        config_value: JSON.stringify(config_value),
        config_description: description,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  },

  getAllAdminUsers: async (page = 1, limit = 50, search = null, status = "all") => {
    const offset = (page - 1) * limit;
    
    let query = usersTable()
      .select(
        'sl_user_accounts.user_id',
        'sl_user_accounts.first_name',
        'sl_user_accounts.last_name',
        'sl_user_accounts.user_email',
        'sl_user_accounts.user_type',
        'sl_user_accounts.is_active',
        'sl_user_accounts.created_at',
        'sl_user_heartbits.suspended_until as suspension_end',
        'sl_user_heartbits.suspension_reason',
        'sl_user_heartbits.is_suspended'
      )
      .leftJoin('sl_user_heartbits', 'sl_user_accounts.user_id', 'sl_user_heartbits.user_id')
      .whereIn('sl_user_accounts.user_type', ['ADMIN', 'SUPER_ADMIN']);

    if (search) {
      query = query.where(function() {
        this.where('sl_user_accounts.first_name', 'like', `%${search}%`)
          .orWhere('sl_user_accounts.last_name', 'like', `%${search}%`)
          .orWhere('sl_user_accounts.user_email', 'like', `%${search}%`);
      });
    }

    if (status === "active") {
      query = query.where('sl_user_accounts.is_active', true).whereNull('sl_user_heartbits.suspended_until');
    } else if (status === "suspended") {
      query = query.where('sl_user_heartbits.suspended_until', '>', new Date());
    } else if (status === "inactive") {
      query = query.where('sl_user_accounts.is_active', false);
    }

    return await query
      .orderBy('sl_user_accounts.user_type', 'desc') // Super admins first
      .orderBy('sl_user_accounts.created_at', 'desc')
      .limit(limit)
      .offset(offset);
  },

  promoteToAdmin: async (userId) => {
    return await usersTable()
      .where('user_id', userId)
      .update({
        user_type: 'ADMIN'
      });
  },

  demoteFromAdmin: async (userId) => {
    return await usersTable()
      .where('user_id', userId)
      .update({
        user_type: 'EMPLOYEE'
      });
  },

  suspendUser: async (userId, reason, suspension_end = null) => {
    // Update user suspension in heartbits table
    await userHeartbitsTable()
      .where('user_id', userId)
      .update({
        suspended_until: suspension_end,
        suspension_reason: reason,
        is_suspended: true,
        suspended_at: new Date(),
        updated_at: new Date()
      });

    // Log suspension in admin actions table
    return await adminActionsTable().insert({
      admin_id: userId, // This should be the admin performing the action
      action_type: 'SUSPEND_USER',
      target_user_id: userId,
      description: `User suspended: ${reason}`,
      performed_at: new Date()
    });
  },

  unsuspendUser: async (userId) => {
    // Remove suspension from heartbits table
    await userHeartbitsTable()
      .where('user_id', userId)
      .update({
        suspended_until: null,
        suspension_reason: null,
        is_suspended: false,
        suspended_at: null,
        updated_at: new Date()
      });

    // Log unsuspension in admin actions table
    return await adminActionsTable().insert({
      admin_id: userId, // This should be the admin performing the action
      action_type: 'UNSUSPEND_USER',
      target_user_id: userId,
      description: 'User unsuspended',
      performed_at: new Date()
    });
  },

  getSystemAuditLogs: async (page = 1, limit = 100, date_from = null, date_to = null, action_type = null, admin_id = null, severity = "all") => {
    const offset = (page - 1) * limit;
    
    let query = adminActionsTable()
      .select(
        "sl_admin_actions.*",
        "admin.first_name as admin_first_name",
        "admin.last_name as admin_last_name",
        "admin.user_email as admin_email",
        "admin.user_type as admin_type"
      )
      .leftJoin("sl_user_accounts as admin", "sl_admin_actions.admin_id", "admin.user_id");

    if (date_from) {
      query = query.where("sl_admin_actions.performed_at", ">=", date_from);
    }

    if (date_to) {
      query = query.where("sl_admin_actions.performed_at", "<=", date_to);
    }

    if (action_type) {
      query = query.where("sl_admin_actions.action_type", action_type);
    }

    if (admin_id) {
      query = query.where("sl_admin_actions.admin_id", admin_id);
    }

    // Severity filtering based on action types
    if (severity === "high") {
      query = query.whereIn("sl_admin_actions.action_type", [
        "DELETE", "SUSPEND_USER", "DEMOTE_FROM_ADMIN", "SYSTEM_MAINTENANCE"
      ]);
    } else if (severity === "medium") {
      query = query.whereIn("sl_admin_actions.action_type", [
        "MODERATE", "PROMOTE_TO_ADMIN", "UPDATE_SYSTEM_CONFIG"
      ]);
    }

    return await query
      .orderBy("sl_admin_actions.performed_at", "desc")
      .limit(limit)
      .offset(offset);
  },

  getAdvancedSystemAnalytics: async (period = "month", include_trends = true, include_predictions = false) => {
    let dateFilter;
    
    switch (period) {
      case "week":
        dateFilter = db.raw("DATE_SUB(NOW(), INTERVAL 7 DAY)");
        break;
      case "quarter":
        dateFilter = db.raw("DATE_SUB(NOW(), INTERVAL 3 MONTH)");
        break;
      case "year":
        dateFilter = db.raw("DATE_SUB(NOW(), INTERVAL 1 YEAR)");
        break;
      default: // month
        dateFilter = db.raw("DATE_SUB(NOW(), INTERVAL 1 MONTH)");
    }

    const analytics = {};

    // System performance metrics
    const [systemMetrics] = await db.raw(`
      SELECT 
        COUNT(DISTINCT cp.from_user_id) as active_users,
        COUNT(cp.cheer_id) as total_interactions,
        AVG(cp.points) as avg_heartbits_per_interaction,
    
        COUNT(DISTINCT o.user_id) as purchasing_users,
        SUM(o.total_points) as total_points_spent
      FROM sl_cheers cp
      LEFT JOIN sl_orders o ON DATE(cp.created_at) = DATE(o.ordered_at)
      WHERE cp.created_at >= ?
    `, [dateFilter]);

    analytics.system_performance = systemMetrics[0];

    // Add cancelled orders count
    const [cancelledOrdersData] = await ordersTable()
      .count('order_id as cancelled_orders')
      .where('status', 'cancelled')
      .where('ordered_at', '>=', dateFilter);
    const cancelledOrdersCount = cancelledOrdersData.cancelled_orders || 0;

    // User engagement distribution
    const engagementDistribution = await db.raw(`
      SELECT 
        CASE 
          WHEN cheer_count >= 20 THEN 'High Engagement'
          WHEN cheer_count >= 5 THEN 'Medium Engagement'
          ELSE 'Low Engagement'
        END as engagement_level,
        COUNT(*) as user_count
      FROM (
        SELECT from_user_id, COUNT(*) as cheer_count
        FROM sl_cheers 
        WHERE created_at >= ?
        GROUP BY from_user_id
      ) user_cheers
      GROUP BY engagement_level
    `, [dateFilter]);

    analytics.engagement_distribution = engagementDistribution[0];

    // Admin activity analysis
    const adminActivity = await adminActionsTable()
      .select(
        "action_type",
        db.raw("COUNT(*) as action_count"),
        db.raw("COUNT(DISTINCT admin_id) as admin_count")
      )
      .where("performed_at", ">=", dateFilter)
      .groupBy("action_type")
      .orderBy("action_count", "desc");

    analytics.admin_activity = adminActivity;

    if (include_trends) {
      // Growth trends
      const weeklyTrends = await cheersTable()
        .select(
          db.raw("YEARWEEK(created_at) as week"),
          db.raw("COUNT(*) as cheers"),
          db.raw("COUNT(DISTINCT from_user_id) as active_users"),
          db.raw("SUM(points) as total_heartbits")
        )
        .where("created_at", ">=", db.raw("DATE_SUB(NOW(), INTERVAL 12 WEEK)"))
        .groupBy(db.raw("YEARWEEK(created_at)"))
        .orderBy("week");

      analytics.weekly_trends = weeklyTrends;
    }

    if (include_predictions) {
      // Simple prediction based on recent trends (basic linear regression)
      const recentData = await cheersTable()
        .select(
          db.raw("DATE(created_at) as date"),
          db.raw("COUNT(*) as daily_cheers")
        )
        .where("created_at", ">=", db.raw("DATE_SUB(NOW(), INTERVAL 30 DAY)"))
        .groupBy(db.raw("DATE(created_at)"))
        .orderBy("date");

      // Calculate simple trend prediction
      const avgDailyGrowth = recentData.length > 1 ? 
        (recentData[recentData.length - 1].daily_cheers - recentData[0].daily_cheers) / recentData.length : 0;

      analytics.predictions = {
        projected_next_week_cheers: Math.max(0, Math.round(
          recentData[recentData.length - 1]?.daily_cheers * 7 + (avgDailyGrowth * 7)
        )),
        growth_trend: avgDailyGrowth > 0 ? "positive" : avgDailyGrowth < 0 ? "negative" : "stable"
      };
    }

    return analytics;
  },

  performSystemMaintenance: async (operation, parameters = {}) => {
    const results = {};

    switch (operation) {
      case "cleanup_old_logs":
        const daysToKeep = parameters.days_to_keep || 90;
        const [logCleanup] = await adminActionsTable()
          .where("performed_at", "<", db.raw(`DATE_SUB(NOW(), INTERVAL ${daysToKeep} DAY)`))
          .del();
        results.logs_deleted = logCleanup;
        break;

      case "rebuild_analytics":
        // Refresh materialized views or update analytics tables
        await db.raw("CALL RefreshAnalyticsViews()"); // Assuming stored procedure
        results.analytics_rebuilt = true;
        break;

      case "optimize_database":
        // Optimize tables
        await db.raw("OPTIMIZE TABLE sl_cheers, sl_orders, sl_admin_actions");
        results.tables_optimized = true;
        break;

      case "reset_monthly_limits":
        const currentMonth = new Date().toISOString().slice(0, 7);
        const [limitsReset] = await monthlyLimitsTable()
          .where("month_year", currentMonth)
          .update({ heartbits_sent: 0 });
        results.limits_reset = limitsReset;
        break;
    }

    return results;
  },

  exportSystemData: async (data_type, format = "json", date_from = null, date_to = null, include_pii = false) => {
    let query;
    
    switch (data_type) {
      case "cheers":
        query = cheersTable()
          .select(
            "cheer_id",
            "from_user_id",
            "to_user_id", 
            "message",
            "points",
            "created_at",
            "is_flagged"
          );
        if (!include_pii) {
          query = query.select(db.raw("'[REDACTED]' as post_body"));
        }
        break;

      case "users":
        query = usersTable()
          .select(
            "user_id",
            "user_type",
            "is_active",
            "created_at",
            "heartbits_balance"
          );
        if (include_pii) {
          query = query.select("first_name", "last_name", "user_email");
        }
        break;

      case "orders":
        query = ordersTable()
          .select(
            "order_id",
            "user_id",
            "total_points",
            "status",
            "ordered_at"
          );
        break;

      case "audit_logs":
        query = adminActionsTable()
          .select(
            "admin_id",
            "action_type",
            "target_type",
            "target_id",
            "performed_at"
          );
        if (include_pii) {
          query = query.select("details");
        }
        break;
    }

    if (date_from) {
      const dateColumn = data_type === "orders" ? "ordered_at" : 
                        data_type === "audit_logs" ? "performed_at" : 
                        data_type === "users" ? "created_at" : "created_at";
      query = query.where(dateColumn, ">=", date_from);
    }

    if (date_to) {
      const dateColumn = data_type === "orders" ? "ordered_at" : 
                        data_type === "audit_logs" ? "performed_at" : 
                        data_type === "users" ? "created_at" : "created_at";
      query = query.where(dateColumn, "<=", date_to);
    }

    const data = await query;

    if (format === "csv") {
      // Convert to CSV format (basic implementation)
      if (data.length === 0) return "";
      
      const headers = Object.keys(data[0]).join(",");
      const rows = data.map(row => 
        Object.values(row).map(val => 
          typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
        ).join(",")
      );
      
      return [headers, ...rows].join("\n");
    }

    return data; // JSON format
  },

  searchUsers: async (searchTerm) => {
    return await usersTable()
      .select('user_id', 'first_name', 'last_name', 'user_email', 'profile_pic')
      .where('user_type', 'in', ['EMPLOYEE', 'ADMIN'])
      .where('is_active', true)
      .where(function() {
        this.where('first_name', 'like', `%${searchTerm}%`)
            .orWhere('last_name', 'like', `%${searchTerm}%`)
            .orWhere('user_email', 'like', `%${searchTerm}%`);
      })
      .limit(10);
  },

  getVariationTypeById: async (variation_type_id) => {
    return await db("sl_variation_types")
      .where({ variation_type_id })
      .first();
  },

  getVariationOptionById: async (option_id) => {
    return await db("sl_variation_options")
      .where("option_id", option_id)
      .first();
  },

  getProductVariationById: async (variation_id) => {
    return await db("sl_product_variations")
      .where("variation_id", variation_id)
      .first();
  },

  getOrderItemByProductId: async (product_id) => {
    return await db("sl_order_items")
      .where("product_id", product_id)
      .first();
  },

  getProductsWithVariations: async (activeOnly = true) => {
    // Get base products with categories
    let query = productsTable()
      .select(
        "sl_products.product_id",
        "sl_products.name",
        "sl_products.description",
        "sl_products.price_points as price",
        "sl_products.category_id",
        "sl_products.image_url",
        "sl_products.slug",
        "sl_products.is_active",
        "sl_products.created_at",
        "sl_products.updated_at"
      )
      .leftJoin("sl_shop_categories", "sl_products.category_id", "sl_shop_categories.category_id")
      .select("sl_shop_categories.category_name as category");

    if (activeOnly) {
      query = query.where("sl_products.is_active", true);
    }

    const products = await query.orderBy("sl_products.name", "asc");

    // For each product, get its variations and options
    for (const product of products) {
      const variations = await db("sl_product_variations")
        .select("*")
        .where("product_id", product.product_id)
        .andWhere("is_active", true);

      // For each variation, get its options
      for (const variation of variations) {
        const optionLinks = await db("sl_product_variation_options")
          .where("variation_id", variation.variation_id);
        
        const optionIds = optionLinks.map(link => link.option_id);
        
        if (optionIds.length > 0) {
          const options = await db("sl_variation_options as vo")
            .select(
              "vo.option_id",
              "vo.variation_type_id",
              "vo.option_value",
              "vo.option_label",
              "vo.hex_color",
              "vt.type_name",
              "vt.type_label"
            )
            .leftJoin("sl_variation_types as vt", "vo.variation_type_id", "vt.variation_type_id")
            .whereIn("vo.option_id", optionIds)
            .orderBy("vt.sort_order", "asc")
            .orderBy("vo.sort_order", "asc");
          
          variation.options = options;
        } else {
          variation.options = [];
        }
      }
      
      product.variations = variations;
    }

    return products;
  },
};
