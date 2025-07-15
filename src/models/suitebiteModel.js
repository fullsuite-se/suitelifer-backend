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
const productVariationOptionsTable = () => db("sl_product_variation_options");

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
    // Map frontend fields to database fields with proper type conversion
    const dbData = {
      name: productData.name,
      description: productData.description || '',
      price_points: parseInt(productData.price || productData.price_points) || 0,
      category_id: productData.category_id,
      image_url: productData.image_url || '',
      slug: productData.slug || null,
      is_active: productData.is_active !== undefined ? Boolean(productData.is_active) : true
    };
    
    const [insertId] = await productsTable().insert(dbData);
    return insertId;
  },

  updateProduct: async (product_id, updateData) => {
    // Map frontend fields to database fields
    const dbData = {};
    
    if (updateData.name) dbData.name = updateData.name;
    if (updateData.description !== undefined) dbData.description = updateData.description;
    
    // Handle price mapping with proper type conversion
    if (updateData.price !== undefined) {
      dbData.price_points = parseInt(updateData.price) || 0;
    } else if (updateData.price_points !== undefined) {
      dbData.price_points = parseInt(updateData.price_points) || 0;
    }
    
    if (updateData.category_id !== undefined) dbData.category_id = updateData.category_id;
    if (updateData.image_url !== undefined) dbData.image_url = updateData.image_url;
    if (updateData.is_active !== undefined) dbData.is_active = Boolean(updateData.is_active);
    
    dbData.updated_at = new Date();

    return await productsTable()
      .where("product_id", product_id)
      .update(dbData);
  },

  deleteProduct: async (product_id) => {
    return await productsTable()
      .where("product_id", product_id)
      .del();
  },

  // ========== CATEGORIES OPERATIONS ==========

  getAllCategories: async () => {
    return await categoriesTable()
      .select("*")
      .where("is_active", true)
      .orderBy("category_name", "asc");
  },

  getCategoryById: async (category_id) => {
    return await categoriesTable()
      .select("*")
      .where("category_id", category_id)
      .first();
  },

  getCategoryByName: async (category_name) => {
    return await categoriesTable()
      .select("*")
      .where("category_name", category_name)
      .first();
  },

  addCategory: async (categoryData) => {
    const [insertId] = await categoriesTable().insert(categoryData);
    return insertId;
  },

  updateCategory: async (category_id, updateData) => {
    updateData.updated_at = new Date();
    return await categoriesTable()
      .where("category_id", category_id)
      .update(updateData);
  },

  deleteCategory: async (category_id) => {
    return await categoriesTable()
      .where("category_id", category_id)
      .del();
  },

  // ========== PRODUCT VARIATIONS OPERATIONS ==========

  // Variation Types Management
  getVariationTypes: async () => {
    return await variationTypesTable()
      .select("*")
      .where("is_active", true)
      .orderBy("sort_order", "asc");
  },

  getVariationTypeById: async (variation_type_id) => {
    return await variationTypesTable()
      .where("variation_type_id", variation_type_id)
      .first();
  },

  addVariationType: async (typeData) => {
    const [insertId] = await variationTypesTable().insert(typeData);
    return insertId;
  },

  updateVariationType: async (variation_type_id, updateData) => {
    updateData.updated_at = new Date();
    return await variationTypesTable()
      .where("variation_type_id", variation_type_id)
      .update(updateData);
  },

  // Variation Options Management
  getVariationOptions: async (variation_type_id = null) => {
    let query = variationOptionsTable()
      .select(
        "sl_variation_options.*",
        "sl_variation_types.type_name",
        "sl_variation_types.type_label"
      )
      .leftJoin("sl_variation_types", "sl_variation_options.variation_type_id", "sl_variation_types.variation_type_id")
      .where("sl_variation_options.is_active", true);

    if (variation_type_id) {
      query = query.where("sl_variation_options.variation_type_id", variation_type_id);
    }

    return await query.orderBy("sl_variation_options.option_label", "asc");
  },

  getVariationOptionById: async (option_id) => {
    return await variationOptionsTable()
      .select(
        "sl_variation_options.*",
        "sl_variation_types.type_name",
        "sl_variation_types.type_label"
      )
      .leftJoin("sl_variation_types", "sl_variation_options.variation_type_id", "sl_variation_types.variation_type_id")
      .where("sl_variation_options.option_id", option_id)
      .first();
  },

  addVariationOption: async (optionData) => {
    const [insertId] = await variationOptionsTable().insert(optionData);
    return insertId;
  },

  updateVariationOption: async (option_id, updateData) => {
    updateData.updated_at = new Date();
    return await variationOptionsTable()
      .where("option_id", option_id)
      .update(updateData);
  },

  // Product Variations Management
  getProductVariations: async (product_id) => {
    const variations = await productVariationsTable()
      .select("*")
      .where("product_id", product_id)
      .where("is_active", true)
      .orderBy("variation_id", "asc");

    // Get variation options for each variation
    for (let variation of variations) {
      const options = await productVariationOptionsTable()
        .select(
          "sl_product_variation_options.*",
          "sl_variation_options.option_value",
          "sl_variation_options.option_label",
          "sl_variation_options.hex_color",
          "sl_variation_types.type_name",
          "sl_variation_types.type_label"
        )
        .leftJoin("sl_variation_options", "sl_product_variation_options.option_id", "sl_variation_options.option_id")
        .leftJoin("sl_variation_types", "sl_variation_options.variation_type_id", "sl_variation_types.variation_type_id")
        .where("sl_product_variation_options.variation_id", variation.variation_id);

      variation.options = options;
    }

    return variations;
  },

  getProductVariationById: async (variation_id) => {
    const variation = await productVariationsTable()
      .where("variation_id", variation_id)
      .first();

    if (variation) {
      // Get variation options for this variation
      const options = await productVariationOptionsTable()
        .select(
          "sl_product_variation_options.*",
          "sl_variation_options.option_value",
          "sl_variation_options.option_label",
          "sl_variation_options.hex_color",
          "sl_variation_types.type_name",
          "sl_variation_types.type_label"
        )
        .leftJoin("sl_variation_options", "sl_product_variation_options.option_id", "sl_variation_options.option_id")
        .leftJoin("sl_variation_types", "sl_variation_options.variation_type_id", "sl_variation_types.variation_type_id")
        .where("sl_product_variation_options.variation_id", variation_id);

      variation.options = options;
    }

    return variation;
  },

  addProductVariation: async (variationData) => {
    const { options, ...baseData } = variationData;
    
    // Insert the base variation
    const [variationId] = await productVariationsTable().insert(baseData);

    // Insert variation options if provided
    if (options && options.length > 0) {
      const variationOptions = options.map(optionId => ({
        variation_id: variationId,
        option_id: optionId
      }));
      
      await productVariationOptionsTable().insert(variationOptions);
    }

    return variationId;
  },

  updateProductVariation: async (variation_id, updateData) => {
    const { options, ...baseData } = updateData;
    
    // Update base variation data
    if (Object.keys(baseData).length > 0) {
      baseData.updated_at = new Date();
      await productVariationsTable()
        .where("variation_id", variation_id)
        .update(baseData);
    }

    // Update variation options if provided
    if (options) {
      // Remove existing options
      await productVariationOptionsTable()
        .where("variation_id", variation_id)
        .del();

      // Insert new options
      if (options.length > 0) {
        const variationOptions = options.map(optionId => ({
          variation_id: variation_id,
          option_id: optionId
        }));
        
        await productVariationOptionsTable().insert(variationOptions);
      }
    }

    return variation_id;
  },

  deleteProductVariation: async (variation_id) => {
    // Delete variation options first (foreign key constraint)
    await productVariationOptionsTable()
      .where("variation_id", variation_id)
      .del();

    // Delete the variation
    return await productVariationsTable()
      .where("variation_id", variation_id)
      .del();
  },

  // Get products with their variations for shop display
  getProductsWithVariations: async (activeOnly = true) => {
    let query = productsTable()
      .select(
        "sl_products.product_id",
        "sl_products.name",
        "sl_products.description",
        "sl_products.price_points as price",
        "sl_products.category_id",
        "sl_products.image_url",
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

    // Get variations for each product
    for (let product of products) {
      product.variations = await Suitebite.getProductVariations(product.product_id);
    }

    return products;
  },

  // ========== CART OPERATIONS ==========

  getUserCart: async (user_id) => {
    return await cartsTable()
      .select("*")
      .where("user_id", user_id)
      .first();
  },

  createCart: async (user_id) => {
    const [cart_id] = await cartsTable().insert({
      user_id,
      created_at: new Date()
    });
    return cart_id;
  },

  getCartItems: async (user_id) => {
    const cartItems = await cartItemsTable()
      .select(
        "sl_cart_items.*",
        "sl_products.name as product_name",
        "sl_products.description as product_description",
        "sl_products.price_points",
        "sl_products.image_url",
        "sl_product_variations.price_adjustment",
        "sl_product_variations.variation_sku",
        db.raw("((sl_products.price_points + COALESCE(sl_product_variations.price_adjustment, 0)) * sl_cart_items.quantity) as total_points")
      )
      .leftJoin("sl_carts", "sl_cart_items.cart_id", "sl_carts.cart_id")
      .leftJoin("sl_products", "sl_cart_items.product_id", "sl_products.product_id")
      .leftJoin("sl_product_variations", "sl_cart_items.variation_id", "sl_product_variations.variation_id")
      .where("sl_carts.user_id", user_id)
      .where("sl_products.is_active", true);

    // Get variation details for each cart item
    for (let item of cartItems) {
      if (item.variation_id) {
        const variation = await Suitebite.getProductVariationById(item.variation_id);
        item.variation_details = variation;
      }
    }

    return cartItems;
  },

  addToCart: async (user_id, product_id, quantity = 1, variation_id = null) => {
    console.log(`🛒 Adding to cart: user_id=${user_id}, product_id=${product_id}, quantity=${quantity}, variation_id=${variation_id}`);
    
    // Get or create cart
    let cart = await Suitebite.getUserCart(user_id);
    if (!cart) {
      console.log('📝 Creating new cart for user:', user_id);
      const cart_id = await Suitebite.createCart(user_id);
      cart = { cart_id };
    }

    console.log('🛒 Using cart_id:', cart.cart_id);

    // Check if item already exists in cart (including variation)
    let existingItemQuery = cartItemsTable()
      .where("cart_id", cart.cart_id)
      .where("product_id", product_id);

    if (variation_id) {
      existingItemQuery = existingItemQuery.where("variation_id", variation_id);
    } else {
      existingItemQuery = existingItemQuery.whereNull("variation_id");
    }

    const existingItem = await existingItemQuery.first();

    if (existingItem) {
      console.log('📦 Updating existing cart item quantity');
      // Update quantity
      return await cartItemsTable()
        .where("cart_item_id", existingItem.cart_item_id)
        .increment("quantity", quantity);
    } else {
      console.log('🆕 Adding new item to cart');
      // Insert new item
      const cartData = {
        cart_id: cart.cart_id,
        product_id,
        quantity
      };

      if (variation_id) {
        cartData.variation_id = variation_id;
      }

      return await cartItemsTable().insert(cartData);
    }
  },

  updateCartItem: async (item_id, user_id, quantity, variation_id = null, variation_details = null) => {
    try {
      // First verify the cart item exists
      const cartItem = await cartItemsTable()
        .where("cart_item_id", item_id)
        .first();

      if (!cartItem) {
        console.log(`Cart item ${item_id} not found`);
        return null;
      }

      // Check if cart exists
      const cart = await cartsTable()
        .where("cart_id", cartItem.cart_id)
        .first();

      if (!cart) {
        // Only insert if cart does not exist
        await cartsTable().insert({
          cart_id: cartItem.cart_id,
          user_id: user_id,
          created_at: new Date()
        });
        console.log(`Created missing cart record: ${cartItem.cart_id}`);
      } else if (cart.user_id !== user_id) {
        // Only update user_id if cart exists but belongs to a different user
        await cartsTable()
          .where("cart_id", cartItem.cart_id)
          .update({ user_id });
        console.log(`Updated cart ${cartItem.cart_id} to user ${user_id}`);
      }

      // Prepare update data
      const updateData = { quantity };
      if (variation_id !== null) updateData.variation_id = variation_id;
      if (variation_details !== null) updateData.variation_details = JSON.stringify(variation_details);
      const result = await cartItemsTable()
        .where("cart_item_id", item_id)
        .update(updateData);

      console.log(`Updated cart item ${item_id} quantity to ${quantity}`);
      return result;
    } catch (error) {
      console.error('Error in updateCartItem:', error);
      return null;
    }
  },

  removeFromCart: async (item_id, user_id) => {
    try {
      // First verify the cart item exists
      const cartItem = await cartItemsTable()
        .where("cart_item_id", item_id)
        .first();

      if (!cartItem) {
        console.log(`Cart item ${item_id} not found`);
        return null;
      }

      // Check if cart exists
      const cart = await cartsTable()
        .where("cart_id", cartItem.cart_id)
        .first();

      if (!cart) {
        // Only insert if cart does not exist
        await cartsTable().insert({
          cart_id: cartItem.cart_id,
          user_id: user_id,
          created_at: new Date()
        });
        console.log(`Created missing cart record: ${cartItem.cart_id}`);
      } else if (cart.user_id !== user_id) {
        // Only update user_id if cart exists but belongs to a different user
        await cartsTable()
          .where("cart_id", cartItem.cart_id)
          .update({ user_id });
        console.log(`Updated cart ${cartItem.cart_id} to user ${user_id}`);
      }

      // Delete the cart item
      const result = await cartItemsTable()
        .where("cart_item_id", item_id)
        .del();

      console.log(`Removed cart item ${item_id}`);
      return result;
    } catch (error) {
      console.error('Error in removeFromCart:', error);
      return null;
    }
  },

  clearCart: async (user_id) => {
    const cart = await Suitebite.getUserCart(user_id);
    if (!cart) {
      return false;
    }

    return await cartItemsTable()
      .where("cart_id", cart.cart_id)
      .del();
  },

  // ========== ORDERS OPERATIONS ==========

  checkout: async (orderData, cartItems, user_id) => {
    const trx = await db.transaction();

    try {
      // Insert order with pending status
      const [order_id] = await ordersTable().insert({
        ...orderData,
        status: 'pending',
        ordered_at: new Date()
      }).transacting(trx);

      // Insert order items with product snapshots
      const orderItems = cartItems.map(item => ({
        order_id,
        product_id: item.product_id,
        product_name: item.product_name,
        price_points: item.price_points || item.points_cost,
        quantity: item.quantity,
        variation_id: item.variation_id,
        variation_details: item.variation_details ? JSON.stringify(item.variation_details) : null
      }));

      await orderItemsTable().insert(orderItems).transacting(trx);

      // IMMEDIATELY deduct heartbits from user
      await userHeartbitsTable()
        .where('user_id', user_id)
        .decrement('heartbits_balance', orderData.total_points)
        .transacting(trx);

      // Add transaction record for immediate deduction
      await db('sl_heartbits_transactions').insert({
        user_id: user_id,
        transaction_type: 'order_purchase',
        points_amount: orderData.total_points,
        reference_id: order_id,
        reference_type: 'order',
        description: `Order #${order_id} purchase (pending)`,
        created_at: new Date()
      }).transacting(trx);

      // Remove only the selected items from cart (not all items)
      const selectedCartItemIds = cartItems.map(item => item.cart_item_id).filter(Boolean);
      if (selectedCartItemIds.length > 0) {
        await cartItemsTable()
          .whereIn('cart_item_id', selectedCartItemIds)
          .del()
          .transacting(trx);
      }

      await trx.commit();

      return {
        order_id,
        total_points: orderData.total_points,
        items: orderItems,
        status: 'pending'
      };
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  },

  // Admin order approval functions
  approveOrder: async (order_id, admin_id) => {
    const trx = await db.transaction();

    try {
      // Get order details
      const order = await ordersTable()
        .where('order_id', order_id)
        .where('status', 'pending')
        .first();

      if (!order) {
        throw new Error('Order not found or not pending');
      }

      // Update order status to processing (heartbits already deducted during checkout)
      await ordersTable()
        .where('order_id', order_id)
        .update({
          status: 'processing',
          processed_at: new Date()
        })
        .transacting(trx);

      // Update the transaction record to reflect approval
      await db('sl_heartbits_transactions')
        .where('reference_id', order_id)
        .where('reference_type', 'order')
        .update({
          description: `Order #${order_id} purchase (approved)`
        })
        .transacting(trx);

      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  },

  completeOrder: async (order_id, admin_id) => {
    return await ordersTable()
      .where('order_id', order_id)
      .where('status', 'processing')
      .update({
        status: 'completed',
        completed_at: new Date()
      });
  },

  cancelOrder: async (order_id, user_id, reason = null) => {
    const trx = await db.transaction();

    try {
      // Get order details
      const order = await ordersTable()
        .where('order_id', order_id)
        .where('user_id', user_id)
        .where('status', 'pending')
        .first();

      if (!order) {
        throw new Error('Order not found or cannot be cancelled');
      }

      // Update order status to cancelled
      await ordersTable()
        .where('order_id', order_id)
        .update({
          status: 'cancelled',
          notes: reason || 'Cancelled by user'
        })
        .transacting(trx);

      // REFUND heartbits since order was still pending
      await userHeartbitsTable()
        .where('user_id', user_id)
        .increment('heartbits_balance', order.total_points)
        .transacting(trx);

      // Add refund transaction record
      await db('sl_heartbits_transactions').insert({
        user_id: user_id,
        transaction_type: 'order_refund',
        points_amount: order.total_points,
        reference_id: order_id,
        reference_type: 'order',
        description: `Order #${order_id} refund (cancelled)`,
        created_at: new Date()
      }).transacting(trx);

      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  },

  deleteOrder: async (order_id, admin_id, reason = null) => {
    const trx = await db.transaction();

    try {
      // Ensure order_id is an integer
      order_id = parseInt(order_id, 10);
      if (isNaN(order_id)) {
        await trx.rollback();
        return false;
      }

      // Get order details
      const order = await ordersTable()
        .where('order_id', order_id)
        .first();

      if (!order) {
        await trx.rollback();
        return false;
      }

      // Delete order items first
      await orderItemsTable()
        .where('order_id', order_id)
        .del()
        .transacting(trx);

      // Delete the order
      await ordersTable()
        .where('order_id', order_id)
        .del()
        .transacting(trx);

      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  },

  // Get all orders for admin management
  getAllOrders: async (filters = {}) => {
    let query = ordersTable()
      .select(
        'sl_orders.*',
        'user.first_name',
        'user.last_name',
        'user.user_email',
        db.raw('COUNT(sl_order_items.order_item_id) as item_count')
      )
      .leftJoin('sl_user_accounts as user', 'sl_orders.user_id', 'user.user_id')
      .leftJoin('sl_order_items', 'sl_orders.order_id', 'sl_order_items.order_id')
      .groupBy('sl_orders.order_id', 'user.user_id', 'user.first_name', 'user.last_name', 'user.user_email');

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.where('sl_orders.status', filters.status);
    }

    if (filters.dateFrom) {
      query = query.where('sl_orders.ordered_at', '>=', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.where('sl_orders.ordered_at', '<=', filters.dateTo);
    }

    return await query
      .orderBy('sl_orders.ordered_at', 'desc');
  },

  getOrderHistory: async (user_id, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    return await ordersTable()
      .select(
        "sl_orders.*",
        db.raw("COUNT(sl_order_items.order_item_id) as item_count")
      )
      .leftJoin("sl_order_items", "sl_orders.order_id", "sl_order_items.order_id")
      .where("sl_orders.user_id", user_id)
      .groupBy("sl_orders.order_id")
      .orderBy("sl_orders.ordered_at", "desc")
      .limit(limit)
      .offset(offset);
  },

  getOrderById: async (order_id, user_id = null) => {
    let query = ordersTable()
      .select(
        "sl_orders.*",
        "user.first_name as user_first_name",
        "user.last_name as user_last_name",
        "user.user_email as user_email"
      )
      .leftJoin("sl_user_accounts as user", "sl_orders.user_id", "user.user_id")
      .where("sl_orders.order_id", order_id);

    if (user_id) {
      query = query.where("sl_orders.user_id", user_id);
    }

    const order = await query.first();

    if (order) {
      // Get order items
      const orderItems = await orderItemsTable()
        .select(
          "sl_order_items.*",
                  "sl_products.name as product_name",
        "sl_products.description as product_description",
        "sl_products.image_url"
        )
                  .leftJoin("sl_products", "sl_order_items.product_id", "sl_products.product_id")
        .where("sl_order_items.order_id", order_id);

      order.items = orderItems;
    }

    return order;
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
    return await cheerPostTable()
      .where("cheer_post_id", post_id)
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

    return await cheerPostTable()
      .where("cheer_post_id", post_id)
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
      const [avgCheersPerUser] = await cheerPostTable()
        .select(db.raw("COUNT(*) / COUNT(DISTINCT cheerer_id) as avg_cheers"))
        .where("posted_at", ">=", dateFilter);

      const [avgHeartbitsPerCheer] = await cheerPostTable()
        .select(db.raw("AVG(heartbits_given) as avg_heartbits"))
        .where("posted_at", ">=", dateFilter);

      const userEngagement = await cheerPostTable()
        .select(
          "cheerer_id",
          db.raw("COUNT(*) as cheers_sent"),
          db.raw("SUM(heartbits_given) as total_heartbits_sent")
        )
        .where("posted_at", ">=", dateFilter)
        .groupBy("cheerer_id")
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
          db.raw("SUM(points_cost * quantity) as total_revenue")
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
      const hourlyActivity = await cheerPostTable()
        .select(
          db.raw("HOUR(posted_at) as hour"),
          db.raw("COUNT(*) as cheers"),
          db.raw("SUM(heartbits_given) as heartbits")
        )
        .where("posted_at", ">=", dateFilter)
        .groupBy(db.raw("HOUR(posted_at)"))
        .orderBy("hour");

      const weeklyActivity = await cheerPostTable()
        .select(
          db.raw("DAYOFWEEK(posted_at) as day_of_week"),
          db.raw("COUNT(*) as cheers"),
          db.raw("SUM(heartbits_given) as heartbits")
        )
        .where("posted_at", ">=", dateFilter)
        .groupBy(db.raw("DAYOFWEEK(posted_at)"))
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
        COUNT(DISTINCT cp.cheerer_id) as active_users,
        COUNT(cp.cheer_post_id) as total_interactions,
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
};
