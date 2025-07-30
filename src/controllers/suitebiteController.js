import { Suitebite, productsTable, orderItemsTable, ordersTable, cartItemsTable } from "../models/suitebiteModel.js";
import { db } from "../config/db.js";
import { v7 as uuidv7 } from "uuid";
import HeartbitsUtils from "../utils/heartbitsUtils.js";

// ========== CHEER POST ENDPOINTS ==========

export const createCheerPost = async (req, res) => {
  try {
    const { peer_id, post_body, heartbits_given, hashtags, as_admin } = req.body;
    const from_user_id = req.user.id;
    const to_user_id = peer_id;

    // Check if peer exists
    const peerExists = await Suitebite.getUserById(to_user_id);
    if (!peerExists) {
      return res.status(404).json({ success: false, message: "Peer not found" });
    }

    // Determine if sender is admin and wants to send as Admin
    const isAdmin = req.user && req.user.role === 'ADMIN';
    const sendAsAdmin = isAdmin && as_admin === true;

    // Validate points (ensure positive and within reasonable limits)
    if (!heartbits_given || heartbits_given <= 0 || heartbits_given > 100) {
      return res.status(400).json({ success: false, message: "Points must be between 1 and 100" });
    }

    // Prevent self-cheering unless admin is sending as Admin
    if (from_user_id === to_user_id && !sendAsAdmin) {
      return res.status(400).json({ success: false, message: "Cannot send cheers to yourself" });
    }

    // If admin is sending as Admin, bypass limits and use special sender logic
    let cheerSenderId = sendAsAdmin ? null : from_user_id;
    let is_admin_grant = sendAsAdmin ? true : false;

    if (!sendAsAdmin) {
      // Check sender's available points
      const senderPoints = await Suitebite.getUserPoints(from_user_id);
      if (!senderPoints || senderPoints.available_points < heartbits_given) {
        return res.status(400).json({ success: false, message: "Insufficient points to send cheer" });
      }
      // Check monthly limit
      const monthlyLimitCheck = await HeartbitsUtils.checkMonthlyLimit(from_user_id, heartbits_given);
      if (!monthlyLimitCheck.withinLimit) {
        return res.status(400).json({
          success: false,
          message: `Monthly limit exceeded. You have sent ${monthlyLimitCheck.sent} heartbits this month with a limit of ${monthlyLimitCheck.limit}. You can send ${monthlyLimitCheck.remaining} more heartbits this month.`
        });
      }
    }

    // Create the cheer
    const cheerData = {
      cheer_id: uuidv7(),
      from_user_id: cheerSenderId,
      to_user_id,
      points: heartbits_given,
      message: post_body || "",
      is_admin_grant,
      created_at: new Date(),
      updated_at: new Date()
    };

    await Suitebite.createCheer(cheerData);

    // Create transactions
    const fromTransactionId = uuidv7();
    const toTransactionId = uuidv7();

    // Transaction from sender (skip if admin grant)
    if (!sendAsAdmin) {
      await Suitebite.createTransaction({
        transaction_id: fromTransactionId,
        from_user_id,
        to_user_id,
        type: "given",
        amount: heartbits_given,
        description: `Cheered ${heartbits_given} points`,
        message: post_body || "",
        metadata: JSON.stringify({ type: "cheer", cheer_id: cheerData.cheer_id }),
        created_at: new Date(),
        updated_at: new Date()
      });
      // Update points for sender
      await Suitebite.updateUserPoints(from_user_id, -heartbits_given);
      // Update monthly limit for the sender
      const currentMonth = new Date().toISOString().slice(0, 7);
      await Suitebite.updateMonthlyLimit(from_user_id, currentMonth, heartbits_given);
    }

    // Transaction to receiver
    await Suitebite.createTransaction({
      transaction_id: toTransactionId,
      from_user_id: sendAsAdmin ? null : from_user_id,
      to_user_id,
      type: "received",
      amount: heartbits_given,
      description: sendAsAdmin ? `Received ${heartbits_given} points from Admin` : `Received ${heartbits_given} points from cheer`,
      message: post_body || "",
      metadata: JSON.stringify({ type: "cheer", cheer_id: cheerData.cheer_id, is_admin_grant }),
      created_at: new Date(),
      updated_at: new Date()
    });
    // Update points for receiver
    await Suitebite.updateUserPoints(to_user_id, heartbits_given);

    res.status(201).json({ success: true, message: "Cheer posted successfully!", cheer_id: cheerData.cheer_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getCheerFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10, user_filter } = req.query;
    const user_id = user_filter || null;

    const posts = await Suitebite.getCheerPosts(page, limit, user_id);
    
    res.status(200).json({ success: true, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getCheerPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Suitebite.getCheerPostById(id);
    
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: "Cheer post not found" 
      });
    }

    res.status(200).json({ success: true, post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get detailed post information with all likes and comments (Admin view)
export const getCheerPostDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Suitebite.getCheerPostById(id);
    
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: "Cheer post not found" 
      });
    }

    // Get likes with user details
    const likes = await Suitebite.getCheerLikes(id);
    
    // Get comments with user details
    const comments = await Suitebite.getCheerComments(id);

    // Add detailed interaction data
    post.detailed_likes = likes;
    post.detailed_comments = comments;
    post.total_interactions = likes.length + comments.length;

    res.status(200).json({ 
      success: true, 
      post,
      interaction_summary: {
        total_likes: likes.length,
        total_comments: comments.length,
        total_interactions: likes.length + comments.length,
        likers: likes.map(like => ({
          user_id: like.liker_id,
          name: `${like.liker_first_name} ${like.liker_last_name}`,
          liked_at: like.liked_at
        })),
        commenters: comments.map(comment => ({
          user_id: comment.commenter_id,
          name: `${comment.commenter_first_name} ${comment.commenter_last_name}`,
          comment: comment.cheer_comment,
          commented_at: comment.commented_at
        }))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ========== CHEER COMMENTS ENDPOINTS ==========

export const addCheerComment = async (req, res) => {
  try {
    const { cheer_post_id, cheer_comment, additional_heartbits = 0 } = req.body;
    const commenter_id = req.user.id; // Changed from req.user.user_id

    // Check if post exists
    const post = await Suitebite.getCheerPostById(cheer_post_id);
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: "Cheer post not found" 
      });
    }

    const commentData = {
      cheer_post_id,
      commenter_id,
      cheer_comment,
      additional_heartbits,
      commented_at: new Date()
    };

    await Suitebite.addCheerComment(commentData);

    // If additional heartbits are given, update the original peer's balance
    if (additional_heartbits > 0) {
      await Suitebite.updateUserHeartbits(post.peer_id, additional_heartbits);
    }

    res.status(201).json({ 
      success: true, 
      message: "Comment added successfully!" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ========== CHEER LIKES ENDPOINTS ==========

export const toggleCheerLike = async (req, res) => {
  try {
    const { cheer_post_id } = req.body;
    const user_id = req.user.id; // Changed from req.user.user_id

    const result = await Suitebite.toggleCheerLike(cheer_post_id, user_id);

    res.status(200).json({ 
      success: true, 
      message: `Post ${result.action} successfully!`,
      action: result.action
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ========== PRODUCTS ENDPOINTS ==========

export const getAllProducts = async (req, res) => {
  try {
    const { active_only = "true" } = req.query;

    const products = await Suitebite.getAllProducts(active_only === "true");
    
    res.status(200).json({ success: true, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Suitebite.getProductById(id);
    console.log('[getProductById CONTROLLER] product.images:', product?.images);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    res.status(200).json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const addProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      price_points, 
      image_url, 
      category, 
      category_id,
      slug,
      is_active = true
    } = req.body;

    if (!name || (!price && !price_points) || (price || price_points) <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Name and valid price are required" 
      });
    }

    // Handle category - either get existing or create new
    let finalCategoryId = category_id;
    
    if (category && !category_id) {
      // Check if category exists by name
      const existingCategory = await Suitebite.getCategoryByName(category);
      if (existingCategory) {
        finalCategoryId = existingCategory.category_id;
      } else {
        // Create new category
        finalCategoryId = await Suitebite.addCategory({
          category_name: category,
          is_active: true
        });
      }
    }

    // Generate slug if not provided
    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    // Create product data with only fields that exist in database
    const productData = {
      name: name.trim(),
      description: description?.trim() || "",
      price_points: parseInt(price || price_points),
      category_id: finalCategoryId,
      image_url: image_url || "",
      slug: finalSlug,
      is_active: Boolean(is_active)
    };

    const productId = await Suitebite.addProduct(productData);

    // Log admin action (non-blocking)
    try {
      await Suitebite.logAdminAction(
        req.user.id || req.user.user_id,
        "ADD_PRODUCT",
        "PRODUCT",
        productId,
        { 
          product_name: name, 
          price: price || price_points,
          category: category,
          slug: finalSlug
        }
      );
    } catch (logError) {
      console.warn('Failed to log admin action:', logError.message);
    }

    res.status(201).json({ 
      success: true, 
      message: "Product added successfully!",
      product: { ...productData, product_id: productId }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate product ID
    if (!id || isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid product ID" 
      });
    }

    const product = await Suitebite.getProductById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Validate price if provided
    if (updateData.price !== undefined && (isNaN(updateData.price) || parseFloat(updateData.price) < 0)) {
      return res.status(400).json({ 
        success: false, 
        message: "Price must be a valid positive number" 
      });
    }

    // Create clean update data without the category field
    const cleanUpdateData = { ...updateData };
    
    // Handle category update if provided
    if (updateData.category && !updateData.category_id) {
      try {
        const existingCategory = await Suitebite.getCategoryByName(updateData.category);
        if (existingCategory) {
          cleanUpdateData.category_id = existingCategory.category_id;
        } else {
          // Create new category
          cleanUpdateData.category_id = await Suitebite.addCategory({
            category_name: updateData.category,
            is_active: true
          });
        }
      } catch (categoryError) {
        console.warn('Failed to handle category update:', categoryError.message);
        // Continue without category update rather than failing the entire request
      }
    }
    
    // Remove the category field from update data since it doesn't exist in database
    delete cleanUpdateData.category;

    await Suitebite.updateProduct(id, cleanUpdateData);

    // Log admin action (non-blocking)
    try {
      await Suitebite.logAdminAction(
        req.user.id || req.user.user_id,
        "UPDATE_PRODUCT",
        "PRODUCT",
        id,
        { 
          product_name: product.name || product.product_name,
          changes: updateData
        }
      );
    } catch (logError) {
      console.warn('Failed to log admin action:', logError.message);
    }

    res.status(200).json({ 
      success: true, 
      message: "Product updated successfully!" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Suitebite.getProductById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    try {
      // Try to hard delete the product
      await Suitebite.deleteProduct(id);
    } catch (err) {
      // If foreign key error, try to delete referencing cart items only
      // Don't delete orders - they should remain visible in admin panel
      if (err && err.code && (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED')) {
        // Remove cart items for this product
        await cartItemsTable()
          .where('product_id', id)
          .del();
        
        // Don't delete order items or orders - let them remain for admin visibility
        // This allows orders with deleted products to still be visible in admin panel
        
        // Retry product deletion
        try {
          await Suitebite.deleteProduct(id);
        } catch (finalErr) {
          return res.status(409).json({
            success: false,
            message: "Product could not be deleted due to existing references in the system. Please contact support.",
            error: finalErr.message
          });
        }
      } else {
        // Other errors
        throw err;
      }
    }

    // Log admin action (non-blocking)
    try {
      await Suitebite.logAdminAction(
        req.user.id || req.user.user_id,
        "DELETE_PRODUCT",
        "PRODUCT",
        id,
        { 
          product_name: product.name || product.product_name,
          price: product.price || product.price_points
        }
      );
    } catch (logError) {
      console.warn('Failed to log admin action:', logError.message);
    }

    res.status(200).json({ 
      success: true, 
      message: "Product deleted successfully!" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ========== CATEGORIES ENDPOINTS ==========

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Suitebite.getAllCategories();
    
    res.status(200).json({ success: true, categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Suitebite.getCategoryById(id);
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found" 
      });
    }

    res.status(200).json({ success: true, category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const addCategory = async (req, res) => {
  try {
    console.log('DEBUG addCategory req.user:', req.user);
    console.log('DEBUG addCategory req.body:', req.body);
    const { category_name } = req.body;

    if (!category_name) {
      console.log('DEBUG: category_name is missing or empty');
      return res.status(400).json({ 
        success: false, 
        message: "Category name is required" 
      });
    }

    console.log('DEBUG: category_name received:', category_name);

    // Check if category already exists
    const existingCategory = await Suitebite.getCategoryByName(category_name);
    if (existingCategory) {
      return res.status(400).json({ 
        success: false, 
        message: "Category already exists" 
      });
    }

    const categoryData = {
      category_name,
      is_active: true
    };

    const categoryId = await Suitebite.addCategory(categoryData);

    // Log admin action (completely non-blocking)
    setImmediate(async () => {
      try {
        console.log('DEBUG: About to log admin action with user:', req.user.id || req.user.user_id);
        await Suitebite.logAdminAction(
          req.user.id || req.user.user_id,
          "ADD_CATEGORY",
          "CATEGORY",
          categoryId,
          { category_name }
        );
        console.log('DEBUG: Admin action logged successfully');
      } catch (logError) {
        console.warn('Failed to log admin action for category addition:', {
          error: logError.message,
          categoryName: category_name,
          categoryId: categoryId,
          adminId: req.user.id || req.user.user_id
        });
      }
    });

    res.status(201).json({ 
      success: true, 
      message: "Category added successfully!",
      category: { ...categoryData, category_id: categoryId }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const category = await Suitebite.getCategoryById(id);
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found" 
      });
    }

    await Suitebite.updateCategory(id, updateData);

    // Log admin action (completely non-blocking)
    setImmediate(async () => {
      try {
        await Suitebite.logAdminAction(
          req.user.id || req.user.user_id,
          "UPDATE_CATEGORY",
          "CATEGORY",
          id,
          { 
            category_name: category.category_name,
            changes: updateData
          }
        );
      } catch (logError) {
        console.warn('Failed to log admin action for category update:', {
          error: logError.message,
          categoryId: id,
          categoryName: category.category_name,
          adminId: req.user.id || req.user.user_id
        });
      }
    });

    res.status(200).json({ 
      success: true, 
      message: "Category updated successfully!" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Suitebite.getCategoryById(id);
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found" 
      });
    }

    await Suitebite.deleteCategory(id);

    // Log admin action (completely non-blocking and with better error handling)
    setImmediate(async () => {
      try {
        await Suitebite.logAdminAction(
          req.user.id || req.user.user_id,
          "DELETE_CATEGORY",
          "CATEGORY",
          id,
          { category_name: category.category_name }
        );
      } catch (logError) {
        console.warn('Failed to log admin action for category deletion:', {
          error: logError.message,
          categoryId: id,
          categoryName: category.category_name,
          adminId: req.user.id || req.user.user_id
        });
      }
    });

    res.status(200).json({ 
      success: true, 
      message: "Category deleted successfully!" 
    });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ========== PRODUCT VARIATIONS ENDPOINTS ==========

// Get all variation types
export const getVariationTypes = async (req, res) => {
  try {
    const variationTypes = await Suitebite.getVariationTypes();
    res.status(200).json({ success: true, variation_types: variationTypes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get all variation options (optionally filtered by type)
export const getVariationOptions = async (req, res) => {
  try {
    const { variation_type_id } = req.query;
    const variationOptions = await Suitebite.getVariationOptions(variation_type_id);
    res.status(200).json({ success: true, variation_options: variationOptions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get product variations for a specific product
export const getProductVariations = async (req, res) => {
  try {
    const { product_id } = req.params;
    
    const variations = await Suitebite.getProductVariations(product_id);
    res.status(200).json({ success: true, variations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get products with their variations for shop display
export const getProductsWithVariations = async (req, res) => {
  try {
    const { active_only = 'true', category = null } = req.query;
    const activeOnly = active_only === 'true';
    
    const products = await Suitebite.getProductsWithVariations(activeOnly);
    
    // Filter by category if provided
    let filteredProducts = products;
    if (category && category !== 'all') {
      filteredProducts = products.filter(product => 
        product.category?.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Add enhanced variation metadata for frontend
    const enhancedProducts = filteredProducts.map(product => ({
      ...product,
      variation_count: product.variations?.length || 0,
      has_variations: Boolean(product.variations?.length),
      variation_types: product.variations?.reduce((types, variation) => {
        variation.options?.forEach(option => {
          if (!types.includes(option.type_name)) {
            types.push(option.type_name);
          }
        });
        return types;
      }, []) || [],
      price_range: product.variations?.length > 0 ? {
        min: Math.min(product.price, ...product.variations.map(v => product.price + (v.price_adjustment || 0))),
        max: Math.max(product.price, ...product.variations.map(v => product.price + (v.price_adjustment || 0)))
      } : { min: product.price, max: product.price }
    }));
    
    res.status(200).json({ 
      success: true, 
      products: enhancedProducts,
      total_count: products.length,
      filtered_count: enhancedProducts.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ADMIN ENDPOINTS FOR VARIATIONS

// Add new variation type (Admin only)
export const addVariationType = async (req, res) => {
  try {
    const { type_name, type_label } = req.body;

    if (!type_name || !type_label) {
      return res.status(400).json({ 
        success: false, 
        message: "Type name and label are required" 
      });
    }

    const variationTypeId = await Suitebite.addVariationType({
      type_name,
      type_label
    });

    res.status(201).json({ 
      success: true, 
      message: "Variation type created successfully!",
      variation_type_id: variationTypeId
    });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: "Variation type with this name already exists" 
      });
    }
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Add new variation option (Admin only)
export const addVariationOption = async (req, res) => {
  try {
    const { variation_type_id, option_value, option_label, hex_color, sort_order = 0 } = req.body;

    if (!variation_type_id || !option_value || !option_label) {
      return res.status(400).json({ 
        success: false, 
        message: "Variation type ID, option value, and label are required" 
      });
    }

    // Validate variation type exists
    const variationType = await Suitebite.getVariationTypeById(variation_type_id);
    if (!variationType) {
      return res.status(404).json({ 
        success: false, 
        message: "Variation type not found" 
      });
    }

    const optionData = {
      variation_type_id,
      option_value,
      option_label,
      sort_order
    };

    if (hex_color) {
      optionData.hex_color = hex_color;
    }

    const optionId = await Suitebite.addVariationOption(optionData);

    res.status(201).json({ 
      success: true, 
      message: "Variation option created successfully!",
      option_id: optionId
    });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: "Variation option with this value already exists for this type" 
      });
    }
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Add product variation (Admin only)
export const addProductVariation = async (req, res) => {
  try {
    const { product_id, variation_sku, price_adjustment = 0, options = [] } = req.body;

    if (!product_id) {
      return res.status(400).json({ 
        success: false, 
        message: "Product ID is required" 
      });
    }

    // Validate product exists
    const product = await Suitebite.getProductById(product_id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Validate options if provided
    if (options.length > 0) {
      for (const optionId of options) {
        const option = await Suitebite.getVariationOptionById(optionId);
        if (!option) {
          return res.status(404).json({ 
            success: false, 
            message: `Variation option ${optionId} not found` 
          });
        }
      }
    }

    const variationData = {
      product_id,
      price_adjustment,
      options
    };

    if (variation_sku) {
      variationData.variation_sku = variation_sku;
    }

    const variationId = await Suitebite.addProductVariation(variationData);

    res.status(201).json({ 
      success: true, 
      message: "Product variation created successfully!",
      variation_id: variationId
    });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: "Variation SKU already exists" 
      });
    }
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Update product variation (Admin only)
export const updateProductVariation = async (req, res) => {
  try {
    const { variation_id } = req.params;
    const { variation_sku, price_adjustment, is_active, options } = req.body;

    // Check if variation exists
    const existingVariation = await Suitebite.getProductVariationById(variation_id);
    if (!existingVariation) {
      return res.status(404).json({ 
        success: false, 
        message: "Product variation not found" 
      });
    }

    const updateData = {};
    
    if (variation_sku !== undefined) updateData.variation_sku = variation_sku;
    if (price_adjustment !== undefined) updateData.price_adjustment = price_adjustment;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (options !== undefined) updateData.options = options;

    await Suitebite.updateProductVariation(variation_id, updateData);

    res.status(200).json({ 
      success: true, 
      message: "Product variation updated successfully!" 
    });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: "Variation SKU already exists" 
      });
    }
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Delete product variation (Admin only)
export const deleteProductVariation = async (req, res) => {
  try {
    const { variation_id } = req.params;

    // Check if variation exists
    const existingVariation = await Suitebite.getProductVariationById(variation_id);
    if (!existingVariation) {
      return res.status(404).json({ 
        success: false, 
        message: "Product variation not found" 
      });
    }

    await Suitebite.deleteProductVariation(variation_id);

    res.status(200).json({ 
      success: true, 
      message: "Product variation deleted successfully!" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ========== CART ENDPOINTS ==========

export const getCart = async (req, res) => {
  try {
    const user_id = req.user.id; // Changed from req.user.user_id

    const cart = await Suitebite.getCart(user_id);
    

    
    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1, variations = [], variation_id = null } = req.body;
    const user_id = req.user.id;

    // Check if product exists and is available
    const product = await Suitebite.getProductById(product_id);
    if (!product || !product.is_active) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found or unavailable" 
      });
    }

    // Handle variations in both formats (new and legacy)
    let processedVariations = variations;
    
    // If variation_id is provided (legacy format), convert to new format
    if (variation_id) {
      const variation = await Suitebite.getProductVariationById(variation_id);
      if (variation) {
        // Get the options for this variation
        const variationWithOptions = await Suitebite.getProductVariations(product_id);
        const selectedVariation = variationWithOptions.find(v => v.variation_id === variation_id);
        
        if (selectedVariation && selectedVariation.options) {
          processedVariations = selectedVariation.options.map(option => ({
            variation_type_id: option.variation_type_id,
            option_id: option.option_id
          }));
        }
      }
    }

    // Validate variations if provided
    if (processedVariations.length > 0) {
      for (const variation of processedVariations) {
        if (!variation.variation_type_id || !variation.option_id) {
          return res.status(400).json({ 
            success: false, 
            message: "Invalid variation data. Both variation_type_id and option_id are required." 
          });
        }
        
        // Validate that the option exists and belongs to the type
        const option = await Suitebite.getVariationOptionById(variation.option_id);
        if (!option || option.variation_type_id !== variation.variation_type_id) {
          return res.status(400).json({ 
            success: false, 
            message: "Invalid variation option or type mismatch" 
          });
        }
      }
    }

    const cartItemId = await Suitebite.addToCart(user_id, product_id, quantity, processedVariations);



    res.status(201).json({ 
      success: true, 
      message: "Item added to cart successfully!",
      data: { cart_item_id: cartItemId }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { cart_item_id } = req.params;
    const { quantity, variations = [] } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid quantity is required" 
      });
    }

    // Validate variations if provided
    if (variations.length > 0) {
      for (const variation of variations) {
        if (!variation.variation_type_id || !variation.option_id) {
          return res.status(400).json({ 
            success: false, 
            message: "Invalid variation data" 
          });
        }
      }
    }

    await Suitebite.updateCartItem(cart_item_id, quantity, variations);

    res.status(200).json({ 
      success: true, 
      message: "Cart item updated successfully!" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { cart_item_id } = req.params;

    await Suitebite.removeFromCart(cart_item_id);

    res.status(200).json({ 
      success: true, 
      message: "Item removed from cart successfully!" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const clearCart = async (req, res) => {
  try {
    const user_id = req.user.id; // Changed from req.user.user_id

    await Suitebite.clearCart(user_id);

    res.status(200).json({ 
      success: true, 
      message: "Cart cleared successfully!" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ========== ORDERS ENDPOINTS ==========

export const checkout = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { items } = req.body;
    


    // Handle direct checkout (Buy Now) vs cart checkout
    let orderItems = [];
    let totalPoints = 0;
    let selectedCartItemIds = [];

    if (items && Array.isArray(items)) {
      // Check if these are cart items (have cart_item_id) or direct product items
      const isCartItems = items.length > 0 && items[0].cart_item_id;
      
      if (isCartItems) {
        // Selected cart items checkout
    
        
        // Get the full cart to process selected items
        const cart = await Suitebite.getCart(user_id);
        if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
          return res.status(400).json({ 
            success: false, 
            message: "Cart is empty" 
          });
        }

        // Filter cart items to only selected ones
        const selectedCartItems = cart.cartItems.filter(cartItem => 
          items.some(selectedItem => selectedItem.cart_item_id === cartItem.cart_item_id)
        );

        if (selectedCartItems.length === 0) {
          return res.status(400).json({ 
            success: false, 
            message: "No valid items selected for checkout" 
          });
        }

        // Process selected cart items
        for (const cartItem of selectedCartItems) {
          const itemPrice = cartItem.price_points || cartItem.price || 0;
          const itemTotal = itemPrice * cartItem.quantity;
          totalPoints += itemTotal;



          const orderItem = {
            product_id: cartItem.product_id,
            product_name: cartItem.product_name,
            price_points: itemPrice,
            quantity: cartItem.quantity,
            variation_id: cartItem.variation_id || null,
            variation_details: cartItem.variation_details || null,
            variations: cartItem.variations || [] // Include variations array
          };
          

          
          orderItems.push(orderItem);
          selectedCartItemIds.push(cartItem.cart_item_id);
        }
      } else {
        // Direct checkout from Buy Now
  
        
        // Process each item and calculate total
        for (const item of items) {
  
          
          const product = await Suitebite.getProductById(item.product_id);
          if (!product) {
            return res.status(400).json({
              success: false,
              message: `Product with ID ${item.product_id} not found`
            });
          }

          const itemPrice = product.price_points || product.price || 0;
          const itemTotal = itemPrice * item.quantity;
          totalPoints += itemTotal;

          const orderItem = {
            product_id: item.product_id,
            product_name: product.name,
            price_points: itemPrice,
            quantity: item.quantity,
            variation_id: item.variation_id || null,
            variation_details: item.variations ? JSON.stringify(item.variations) : null
          };
          
          
          orderItems.push(orderItem);
        }
      }
    } else {
      // Full cart checkout (existing logic)
      const cart = await Suitebite.getCart(user_id);
      if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "Cart is empty" 
        });
      }

      // Ensure cart items have variations property for createOrder function
      orderItems = cart.cartItems.map(item => ({
        ...item,
        variations: item.variations || []
      }));
      totalPoints = cart.cartItems.reduce((total, item) => {
        return total + (item.price_points * item.quantity);
      }, 0);
    }

    // Check if user has enough heartbits
    const userHeartbits = await Suitebite.getUserHeartbits(user_id);
    if (!userHeartbits || userHeartbits.heartbits_balance < totalPoints) {
      const currentBalance = userHeartbits?.heartbits_balance || 0;
      const needed = totalPoints - currentBalance;
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient heartbits balance. You need ${needed} more heartbits to complete this purchase.`,
        current_balance: currentBalance,
        required: totalPoints,
        shortfall: needed
      });
    }

    // Create order
    const orderId = await Suitebite.createOrder(user_id, totalPoints, orderItems);

    // Deduct heartbits (negative amount for spending)
    await Suitebite.updateUserHeartbits(user_id, -totalPoints);

    // Add transaction record
    await Suitebite.createTransaction({
      transaction_id: uuidv7(),
      from_user_id: user_id,
      type: 'spent',
      amount: totalPoints,
      description: `Order #${orderId} purchase`,
      metadata: {
        reference_type: 'order',
        reference_id: orderId
      }
    });

    // Handle cart cleanup based on checkout type
    if (selectedCartItemIds.length > 0) {
      // Remove only selected cart items
      await Suitebite.removeCartItems(user_id, selectedCartItemIds);
    } else if (!items) {
      // Clear entire cart for full cart checkout
      await Suitebite.clearCart(user_id);
    }
    // For direct checkout (Buy Now), don't clear cart

    res.status(201).json({ 
      success: true, 
      message: "Order placed successfully!",
      data: {
        order_id: orderId,
        total_points: totalPoints
      }
    });
  } catch (err) {
    console.error('Checkout error:', err);
    
    res.status(500).json({ 
      success: false, 
      message: "Checkout failed due to a server error. Please try again." 
    });
  }
};

// Admin order approval
export const approveOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const admin_id = req.user.id;

    const result = await Suitebite.approveOrder(order_id, admin_id);
    
    if (result) {
      res.status(200).json({ 
        success: true, 
        message: "Order approved successfully!" 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: "Failed to approve order" 
      });
    }
  } catch (err) {
    console.error('Approve order error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to approve order" 
    });
  }
};

// Admin order completion
export const completeOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const admin_id = req.user.id;

    const result = await Suitebite.completeOrder(order_id, admin_id);
    
    if (result) {
      res.status(200).json({ 
        success: true, 
        message: "Order completed successfully!" 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: "Failed to complete order" 
      });
    }
  } catch (err) {
    console.error('Complete order error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to complete order" 
    });
  }
};

// User order cancellation
export const cancelOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const user_id = req.user.id;
    const { reason } = req.body;
    
    // Check if user is admin (handle both role and user_type fields, and different case formats)
    const userRole = req.user.role || req.user.user_type || '';
    const normalizedRole = userRole.toLowerCase().replace(/\s+/g, '_');
    const isAdmin = normalizedRole === 'admin' || normalizedRole === 'superadmin' || normalizedRole === 'super_admin';
    
    console.log(`Cancel order request - order_id: ${order_id}, user_id: ${user_id}, role: ${req.user.role}, userRole: ${userRole}, normalizedRole: ${normalizedRole}, isAdmin: ${isAdmin}`);

    const result = await Suitebite.cancelOrder(order_id, user_id, reason, isAdmin);
    
    if (result) {
      res.status(200).json({ 
        success: true, 
        message: "Order cancelled successfully!" 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: "Failed to cancel order. Only pending orders can be cancelled by regular users, or pending/processing orders by admins." 
      });
    }
  } catch (err) {
    console.error('Cancel order error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to cancel order" 
    });
  }
};

export const getOrderHistory = async (req, res) => {
  try {
    const user_id = req.user.id; // Changed from req.user.user_id
    const { page = 1, limit = 10 } = req.query;

    const orders = await Suitebite.getOrderHistory(user_id, page, limit);
    
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id; // Changed from req.user.user_id

    const order = await Suitebite.getOrderById(id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    // Check if user owns this order (unless admin)
    if (order.user_id !== user_id && !['ADMIN', 'SUPER_ADMIN', 'SUPER ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied" 
      });
    }

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { status, dateFrom, dateTo } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    const orders = await Suitebite.getAllOrders(filters);
    
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error('getAllOrders error:', err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Update order status (for admins)
export const updateOrderStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    await Suitebite.updateOrderStatus(order_id, status, notes);

    res.status(200).json({ 
      success: true, 
      message: "Order status updated successfully!" 
    });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to update order status" 
    });
  }
};

// Admin delete order
export const deleteOrder = async (req, res) => {
  try {
    let { order_id } = req.params;
    const admin_id = req.user.id;
    const { reason } = req.body;

    order_id = parseInt(order_id, 10);
    if (isNaN(order_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    const result = await Suitebite.deleteOrder(order_id, admin_id, reason, true); // isAdmin = true for hard delete
    
    if (result) {
      res.status(200).json({ 
        success: true, 
        message: "Order deleted successfully!" 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to delete order" 
    });
  }
};

// ========== LEADERBOARD ENDPOINTS ==========

export const getLeaderboard = async (req, res) => {
  try {
    const { type = "received", period = "all", limit = 10 } = req.query;

    const leaderboard = await Suitebite.getLeaderboard(type, period, limit);
    
    res.status(200).json({ success: true, leaderboard });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getMonthlyLeaderboard = async (req, res) => {
  try {
    const { month, year, type = "received", limit = 10 } = req.query;

    const leaderboard = await Suitebite.getMonthlyLeaderboard(month, year, type, limit);
    
    res.status(200).json({ success: true, leaderboard });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ========== USER HEARTBITS ENDPOINTS ==========

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    
    // Return empty array for empty queries instead of error
    if (!q || q.trim().length === 0) {
      return res.status(200).json({ 
        success: true, 
        users: [] 
      });
    }

    if (q.length < 2) {
      return res.status(200).json({ 
        success: true, 
        users: [] 
      });
    }

    const users = await Suitebite.searchUsers(q);
    
    res.status(200).json({ 
      success: true, 
      users: users || [] 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getUserHeartbits = async (req, res) => {
  try {
    const user_id = req.user.id;

    let pointsData = await Suitebite.getUserPoints(user_id);
    
    // If user doesn't have points record, initialize with 0
    if (!pointsData) {
      await Suitebite.updateUserPoints(user_id, 0); // This will create the record
      pointsData = await Suitebite.getUserPoints(user_id);
    }
    
    res.status(200).json({ 
      success: true, 
      heartbits_balance: pointsData?.available_points || 0,
      total_earned: pointsData?.total_earned || 0,
      total_spent: pointsData?.total_spent || 0,
      monthly_limit: pointsData?.monthly_cheer_limit || 100,
      monthly_used: pointsData?.monthly_cheer_used || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getPeersWhoCheered = async (req, res) => {
  try {
    const user_id = req.user.id; // Changed from req.user.user_id
    const { limit = 10, page = 1 } = req.query;

    const peers = await Suitebite.getPeersWhoCheered(user_id, limit, page);
    
    res.status(200).json({ 
      success: true, 
      peers: peers || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateUserHeartbits = async (req, res) => {
  try {
    const { user_id, heartbits, action = "add", reason } = req.body;

    if (!user_id || !heartbits || heartbits <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid user_id and heartbits are required" 
      });
    }

    const heartbitsToUpdate = action === "subtract" ? -heartbits : heartbits;
    await Suitebite.updateUserHeartbits(user_id, heartbitsToUpdate);

    // Log admin action
    await Suitebite.logAdminAction(
      req.user.id, // Changed from req.user.user_id
      "UPDATE_HEARTBITS",
      "USER",
      user_id,
      { 
        action,
        heartbits_change: heartbitsToUpdate,
        reason: reason || "Manual admin update"
      }
    );

    res.status(200).json({ 
      success: true, 
      message: `Heartbits ${action}ed successfully!` 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ========== MONTHLY LIMITS ENDPOINTS ==========

export const getMonthlyLimits = async (req, res) => {
  try {
    const user_id = req.user.id; // Changed from req.user.user_id
    const { month_year } = req.query;
    
    const currentMonth = month_year || new Date().toISOString().slice(0, 7);
    const limits = await Suitebite.getMonthlyLimit(user_id, currentMonth);
    
    // If no limit is set for this user, create one with default value from system config
    if (!limits) {
      // Get default limit from system configuration
      const systemConfig = await Suitebite.getSystemConfiguration();
      const defaultLimit = parseInt(systemConfig.global_monthly_limit?.value) || 1000;
      
      await Suitebite.setUserMonthlyLimit(user_id, currentMonth, defaultLimit);
      
      res.status(200).json({ 
        success: true, 
        limits: { 
          heartbits_sent: 0, 
          heartbits_limit: defaultLimit,
          remaining: defaultLimit 
        }
      });
    } else {
      res.status(200).json({ 
        success: true, 
        limits: {
          heartbits_sent: limits.heartbits_sent || 0,
          heartbits_limit: limits.heartbits_limit || 1000,
          remaining: (limits.heartbits_limit || 1000) - (limits.heartbits_sent || 0)
        }
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ========== ADMIN MANAGEMENT ENDPOINTS ==========

export const getCheerPostsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, date_from, date_to } = req.query;

    const posts = await Suitebite.getCheerPostsForAdmin(page, limit, search, date_from, date_to);
    
    res.status(200).json({ success: true, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteCheerPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Check if post exists
    const post = await Suitebite.getCheerPostById(id);
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: "Cheer post not found" 
      });
    }

    // Log admin action
    await Suitebite.logAdminAction(
      req.user.id, // Changed from req.user.user_id
      "CHEER_POST_DELETE",
      "CHEER_POST",
      id,
      { reason: reason || "No reason provided", post_body: post.post_body }
    );

    await Suitebite.deleteCheerPost(id);

    res.status(200).json({ 
      success: true, 
      message: "Cheer post deleted successfully" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const moderateCheerPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'approve', 'reject', 'hide', 'show', 'flag', 'unflag', 'warn'

    // Validate action
    const validActions = ['approve', 'reject', 'hide', 'show', 'flag', 'unflag', 'warn'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid action. Valid actions are: ${validActions.join(', ')}` 
      });
    }

    // Check if post exists
    const post = await Suitebite.getCheerPostById(id);
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: "Cheer post not found" 
      });
    }

    // For warn action, reason is required
    if (action === 'warn' && !reason) {
      return res.status(400).json({ 
        success: false, 
        message: "Warning message is required for warn action" 
      });
    }

    await Suitebite.moderateCheerPost(id, action, reason, req.user.id);

    // Log admin action
    await Suitebite.logAdminAction(
      req.user.id,
      "CHEER_POST_MODERATE",
      "CHEER_POST",
      id,
      { action, reason: reason || "No reason provided", post_body: post.post_body }
    );

    res.status(200).json({ 
      success: true, 
      message: `Cheer post ${action} successfully`,
      action: action
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getUsersWithHeartbits = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, sort_by = "total_heartbits" } = req.query;

    const users = await Suitebite.getUsersWithHeartbits(page, limit, search, sort_by);
    
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const setMonthlyLimit = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit, month_year } = req.body;

    if (!limit || limit <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid limit is required" 
      });
    }

    const currentMonth = month_year || new Date().toISOString().slice(0, 7);
    
    await Suitebite.setUserMonthlyLimit(userId, currentMonth, limit);

    // Log admin action
    await Suitebite.logAdminAction(
      req.user.id, // Changed from req.user.user_id
      "SET_MONTHLY_LIMIT",
      "USER",
      userId,
      { limit, month_year: currentMonth }
    );

    res.status(200).json({ 
      success: true, 
      message: "Monthly limit updated successfully" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getSystemStats = async (req, res) => {
  try {
    const { period = "month" } = req.query; // week, month, quarter, year

    const stats = await Suitebite.getSystemStats(period);
    
    res.status(200).json({ success: true, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ========== SUPER ADMIN ENDPOINTS ==========

export const getSystemConfiguration = async (req, res) => {
  try {
    const config = await Suitebite.getSystemConfiguration();
    
    res.status(200).json({ success: true, config });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateSystemConfiguration = async (req, res) => {
  try {
    const { config_key, config_value, description } = req.body;

    if (!config_key || config_value === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: "Config key and value are required" 
      });
    }

    await Suitebite.updateSystemConfiguration(config_key, config_value, description);

    // Log super admin action
    await Suitebite.logAdminAction(
      req.user.id, // Changed from req.user.user_id
      "UPDATE_SYSTEM_CONFIG",
      "SYSTEM",
      config_key,
      { config_value, description }
    );

    res.status(200).json({ 
      success: true, 
      message: "System configuration updated successfully" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllAdminUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, status } = req.query;

    const admins = await Suitebite.getAllAdminUsers(page, limit, search, status);
    
    res.status(200).json({ success: true, admins });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    // Check if user exists and is not already an admin
    const user = await Suitebite.getUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    if (user.user_type === "ADMIN" || user.user_type === "SUPER_ADMIN") {
      return res.status(400).json({ 
        success: false, 
        message: "User is already an admin" 
      });
    }

    await Suitebite.promoteToAdmin(userId);

    // Log super admin action
    await Suitebite.logAdminAction(
      req.user.id, // Changed from req.user.user_id
      "PROMOTE_TO_ADMIN",
      "USER",
      userId,
      { 
        previous_type: user.user_type,
        reason: reason || "Promoted by super admin"
      }
    );

    res.status(200).json({ 
      success: true, 
      message: "User promoted to admin successfully" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const demoteFromAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    // Check if user exists and is an admin (but not super admin)
    const user = await Suitebite.getUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    if (user.user_type === "SUPER_ADMIN") {
      return res.status(403).json({ 
        success: false, 
        message: "Cannot demote super admin" 
      });
    }

    if (user.user_type !== "ADMIN") {
      return res.status(400).json({ 
        success: false, 
        message: "User is not an admin" 
      });
    }

    await Suitebite.demoteFromAdmin(userId);

    // Log super admin action
    await Suitebite.logAdminAction(
      req.user.id, // Changed from req.user.user_id
      "DEMOTE_FROM_ADMIN",
      "USER",
      userId,
      { 
        previous_type: user.user_type,
        reason: reason || "Demoted by super admin"
      }
    );

    res.status(200).json({ 
      success: true, 
      message: "User demoted from admin successfully" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, duration_days } = req.body;

    const user = await Suitebite.getUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    if (user.user_type === "SUPER_ADMIN") {
      return res.status(403).json({ 
        success: false, 
        message: "Cannot suspend super admin" 
      });
    }

    const suspensionEnd = duration_days ? 
      new Date(Date.now() + (duration_days * 24 * 60 * 60 * 1000)) : 
      null; // Indefinite suspension

    await Suitebite.suspendUser(userId, reason, suspensionEnd);

    // Log super admin action
    await Suitebite.logAdminAction(
      req.user.id, // Changed from req.user.user_id
      "SUSPEND_USER",
      "USER",
      userId,
      { 
        reason: reason || "No reason provided",
        duration_days,
        suspension_end: suspensionEnd
      }
    );

    res.status(200).json({ 
      success: true, 
      message: "User suspended successfully" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const unsuspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await Suitebite.getUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    await Suitebite.unsuspendUser(userId);

    // Log super admin action
    await Suitebite.logAdminAction(
      req.user.id, // Changed from req.user.user_id
      "UNSUSPEND_USER",
      "USER",
      userId,
      { reason: reason || "Unsuspended by super admin" }
    );

    res.status(200).json({ 
      success: true, 
      message: "User unsuspended successfully" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getSystemAuditLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 100, 
      date_from, 
      date_to, 
      action_type, 
      admin_id,
      severity = "all" 
    } = req.query;

    const logs = await Suitebite.getSystemAuditLogs(
      page, limit, date_from, date_to, action_type, admin_id, severity
    );
    
    res.status(200).json({ success: true, logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAdvancedSystemAnalytics = async (req, res) => {
  try {
    const { 
      period = "month",
      include_trends = "true",
      include_predictions = "false"
    } = req.query;

    const analytics = await Suitebite.getAdvancedSystemAnalytics(
      period, 
      include_trends === "true", 
      include_predictions === "true"
    );
    
    // Spread overview fields to the top level for easier access
    res.status(200).json({ 
      success: true, 
      ...analytics.overview,
      analytics
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ========== SYSTEM MAINTENANCE ENDPOINTS ==========

export const performSystemMaintenance = async (req, res) => {
  try {
    const { operation, parameters = {} } = req.body;

    if (!operation) {
      return res.status(400).json({ 
        success: false, 
        message: "Operation is required" 
      });
    }

    const results = await Suitebite.performSystemMaintenance(operation, parameters);

    // Log admin action
    await Suitebite.logAdminAction(
      req.user.id,
      "SYSTEM_MAINTENANCE",
      "SYSTEM",
      null,
      { operation, parameters, results }
    );

    res.status(200).json({ 
      success: true, 
      message: `System maintenance operation '${operation}' completed successfully`,
      results 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const triggerMonthlyReset = async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Get system configuration for global monthly limit
    const systemConfig = await Suitebite.getSystemConfiguration();
    console.log('System config:', systemConfig); // Debug log
    
    // Access the global_monthly_limit value correctly
    const defaultMonthlyLimit = systemConfig.global_monthly_limit ? 
      parseInt(systemConfig.global_monthly_limit.value) : 1000;
    
    console.log('Default monthly limit:', defaultMonthlyLimit); // Debug log
    
    // Get all active users (more inclusive query)
    const users = await db('sl_user_accounts')
      .select('user_id', 'first_name', 'last_name', 'user_email', 'user_type', 'is_active')
      .whereIn('user_type', ['employee', 'admin', 'superadmin']);
    
    // Filter active users in code to see what's happening
    const activeUsers = users.filter(user => user.is_active === true || user.is_active === 1);
    const inactiveUsers = users.filter(user => user.is_active === false || user.is_active === 0);
    
    console.log('Total users found:', users.length);
    console.log('Active users:', activeUsers.length);
    console.log('Inactive users:', inactiveUsers.length);
    console.log('Inactive users details:', inactiveUsers.map(u => ({ name: `${u.first_name} ${u.last_name}`, type: u.user_type, active: u.is_active })));
    
    // Use all users regardless of active status for monthly reset
    const usersToProcess = users;
    
    console.log('Found users:', users.length); // Debug log
    console.log('Users found:', users); // Debug log - show actual users
    
    // Debug: Check all users in database
    const allUsers = await db('sl_user_accounts').select('user_id', 'first_name', 'last_name', 'user_email', 'user_type', 'is_active');
    console.log('All users in database:', allUsers.length);
    console.log('All users:', allUsers);
    
    // Debug: Check specific user types
    const employees = allUsers.filter(u => u.user_type === 'employee');
    const admins = allUsers.filter(u => u.user_type === 'admin');
    const superadmins = allUsers.filter(u => u.user_type === 'superadmin');
    console.log('Employees:', employees.length);
    console.log('Admins:', admins.length);
    console.log('Super Admins:', superadmins.length);
    
    let resetCount = 0;
    let allowanceGiven = 0;
    
    for (const user of usersToProcess) {
      try {
        // Reset monthly limits for the new month
        await Suitebite.resetMonthlyLimit(user.user_id, currentMonth);
        
        // Give monthly heartbits allowance (updates sl_user_points table)
        await Suitebite.updateUserHeartbits(user.user_id, defaultMonthlyLimit);
        
        // Create transaction record for monthly allowance
        await db('sl_heartbits_transactions').insert({
          user_id: user.user_id,
          transaction_type: 'monthly_allowance',
          points_amount: defaultMonthlyLimit,
          description: `Manual monthly heartbits allowance for ${currentMonth}`,
          created_at: new Date()
        });

        // Reset monthly cheer usage for the user (in sl_user_points table)
        await db('sl_user_points')
          .where('user_id', user.user_id)
          .update({
            monthly_cheer_used: 0,
            last_monthly_reset: new Date()
          });
        
        resetCount++;
        allowanceGiven += defaultMonthlyLimit;
        
      } catch (error) {
        console.error(`Error processing user ${user.user_id} (${user.first_name} ${user.last_name}):`, error);
      }
    }

    // Log admin action with shorter action_type
    await Suitebite.logAdminAction(
      req.user.id,
      "SYSTEM_MAINTENANCE",
      "SYSTEM",
      null,
      { 
        month: currentMonth,
        users_processed: resetCount,
        total_allowance_given: allowanceGiven,
        monthly_limit: defaultMonthlyLimit
      }
    );

    res.status(200).json({ 
      success: true, 
      message: `Monthly reset and allowance process completed successfully`,
      results: {
        users_processed: resetCount,
        total_allowance_given: allowanceGiven,
        monthly_limit: defaultMonthlyLimit,
        month: currentMonth
      }
    });
  } catch (err) {
    console.error('Error in triggerMonthlyReset:', err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const exportSystemData = async (req, res) => {
  try {
    const { 
      data_type, 
      format = "json", 
      date_from, 
      date_to,
      include_pii = "false" 
    } = req.query;

    if (!["cheers", "users", "orders", "analytics", "audit_logs"].includes(data_type)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid data type for export" 
      });
    }

    const exportData = await Suitebite.exportSystemData(
      data_type, 
      format, 
      date_from, 
      date_to, 
      include_pii === "true"
    );

    // Log super admin action
    await Suitebite.logAdminAction(
      req.user.id, // Changed from req.user.user_id
      "EXPORT_SYSTEM_DATA",
      "SYSTEM",
      data_type,
      { format, date_from, date_to, include_pii }
    );

    res.status(200).json({ 
      success: true, 
      message: "Data export completed successfully",
      data: exportData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ========== BULK OPERATIONS ==========

export const bulkUpdateHeartbits = async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Updates array is required and cannot be empty" 
      });
    }

    const results = [];
    for (const update of updates) {
      const { user_id, heartbits, reason } = update;
      
      if (!user_id || typeof heartbits !== 'number') {
        results.push({ user_id, success: false, error: "Invalid user_id or heartbits" });
        continue;
      }

      try {
        await Suitebite.updateUserHeartbits(user_id, heartbits);
        
        // Log admin action
        await Suitebite.logAdminAction(
          req.user.id, // Changed from req.user.user_id
          "BULK_UPDATE_HEARTBITS",
          "USER",
          user_id,
          { heartbits, reason: reason || "Bulk update" }
        );

        results.push({ user_id, success: true });
      } catch (error) {
        console.error(`Error updating heartbits for user ${user_id}:`, error);
        results.push({ user_id, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.status(200).json({ 
      success: true, 
      message: `Bulk update completed. ${successCount} successful, ${failureCount} failed.`,
      results 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const resetUserMonthlyStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { month_year } = req.body;

    if (!month_year || !/^\d{4}-\d{2}$/.test(month_year)) {
      return res.status(400).json({ 
        success: false, 
        message: "month_year is required in YYYY-MM format" 
      });
    }

    const user = await Suitebite.getUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Reset monthly limits for the specified month
    await Suitebite.resetMonthlyLimit(userId, month_year);

    // Log admin action
    await Suitebite.logAdminAction(
      req.user.id, // Changed from req.user.user_id
      "RESET_MONTHLY_STATS",
      "USER",
      userId,
      { month_year }
    );

    res.status(200).json({ 
      success: true, 
      message: "User monthly stats reset successfully" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ========== INITIALIZATION ENDPOINTS ==========

export const initializeAllUsersHeartbits = async (req, res) => {
  try {
    const { heartbits_amount = 1000 } = req.body;

    if (heartbits_amount < 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Heartbits amount must be non-negative" 
      });
    }

    // Get all active users without heartbits records
    const usersNeedingInit = await Suitebite.getUsersWithoutHeartbits();
    
    if (usersNeedingInit.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: "All users already have heartbits records",
        users_initialized: 0
      });
    }

    const results = [];
    for (const user of usersNeedingInit) {
      try {
        // Initialize user with heartbits
        await Suitebite.updateUserHeartbits(user.user_id, heartbits_amount);
        
        // Log admin action
        await Suitebite.logAdminAction(
          req.user.id,
          "INITIALIZE_HEARTBITS",
          "USER",
          user.user_id,
          { 
            initial_amount: heartbits_amount,
            user_name: `${user.first_name} ${user.last_name}`,
            user_email: user.user_email
          }
        );

        results.push({
          user_id: user.user_id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.user_email,
          success: true,
          heartbits_added: heartbits_amount
        });

      } catch (error) {
        console.error(`Error initializing heartbits for user ${user.user_id}:`, error);
        results.push({
          user_id: user.user_id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.user_email,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.status(200).json({ 
      success: true, 
      message: `Initialized heartbits for ${successCount} users (${failureCount} failures)`,
      users_initialized: successCount,
      total_users_processed: results.length,
      results: results
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Delete variation type (Admin only)
export const deleteVariationType = async (req, res) => {
  try {
    const { variation_type_id } = req.params;
    if (!variation_type_id) {
      return res.status(400).json({ success: false, message: "Variation type ID is required" });
    }
    await Suitebite.deleteVariationType(variation_type_id);
    res.status(200).json({ success: true, message: "Variation type deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Delete variation option (Admin only)
export const deleteVariationOption = async (req, res) => {
  try {
    const { option_id } = req.params;
    if (!option_id) {
      return res.status(400).json({ success: false, message: "Option ID is required" });
    }
    await Suitebite.deleteVariationOption(option_id);
    res.status(200).json({ success: true, message: "Variation option deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ========== PRODUCT ORDER USAGE CHECK ENDPOINT ==========
export const getProductOrderUsage = async (req, res) => {
  try {
    const { product_id } = req.params;
    
    const usage = await Suitebite.getProductOrderUsage(product_id);
    
    res.status(200).json({ success: true, usage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ========== PRODUCT IMAGES MANAGEMENT ==========

export const getProductImages = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const images = await Suitebite.getProductImages(productId);
    
    res.status(200).json({ success: true, images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const addProductImage = async (req, res) => {
  try {
    const { productId } = req.params;
    const { 
      image_url, 
      thumbnail_url, 
      medium_url, 
      large_url, 
      public_id, 
      alt_text,
      sort_order,
      is_primary = false,
      is_active = true 
    } = req.body;



    if (!image_url) {
      return res.status(400).json({ 
        success: false, 
        message: "Image URL is required" 
      });
    }

    // Validate product exists
    const product = await Suitebite.getProductById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    const imageId = await Suitebite.addProductImage({
      product_id: productId,
      image_url,
      thumbnail_url,
      medium_url,
      large_url,
      public_id,
      alt_text,
      sort_order,
      is_primary,
      is_active
    });



    // Update product's images_json
    await Suitebite.updateProductImagesJson(productId);

    res.status(201).json({ 
      success: true, 
      message: "Product image added successfully!",
      imageId 
    });
  } catch (err) {
    console.error('🔍 Backend - addProductImage error:', err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateProductImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const updateData = req.body;

    const image = await Suitebite.getProductImageById(imageId);
    if (!image) {
      return res.status(404).json({ 
        success: false, 
        message: "Product image not found" 
      });
    }

    await Suitebite.updateProductImage(imageId, updateData);

    // Update product's images_json
    await Suitebite.updateProductImagesJson(image.product_id);

    res.status(200).json({ 
      success: true, 
      message: "Product image updated successfully!" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteProductImage = async (req, res) => {
  try {

    
    const { imageId } = req.params;


    const image = await Suitebite.getProductImageById(imageId);
    
    
    if (!image) {
      
      return res.status(404).json({ 
        success: false, 
        message: "Product image not found" 
      });
    }

    
    const deleteResult = await Suitebite.deleteProductImage(imageId);
    

    // Update product's images_json
    
    await Suitebite.updateProductImagesJson(image.product_id);
    

    res.status(200).json({ 
      success: true, 
      message: "Product image deleted successfully!" 
    });
  } catch (err) {
    console.error('🔍 Backend - Error in deleteProductImage:', err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const reorderProductImages = async (req, res) => {
  try {
    const { productId } = req.params;
    const { imageIds } = req.body;

    if (!imageIds || !Array.isArray(imageIds)) {
      return res.status(400).json({ 
        success: false, 
        message: "Image IDs array is required" 
      });
    }

    await Suitebite.reorderProductImages(productId, imageIds);

    res.status(200).json({ 
      success: true, 
      message: "Product images reordered successfully!" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const setPrimaryImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await Suitebite.getProductImageById(imageId);
    if (!image) {
      return res.status(404).json({ 
        success: false, 
        message: "Product image not found" 
      });
    }

    await Suitebite.setPrimaryImage(image.product_id, imageId);

    res.status(200).json({ 
      success: true, 
      message: "Primary image set successfully!" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// User delete own order
export const deleteOwnOrder = async (req, res) => {
  try {
    let { order_id } = req.params;
    const user_id = req.user.id;
    const { reason } = req.body;



    order_id = parseInt(order_id, 10);
    if (isNaN(order_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    // Check if order exists and belongs to user
    const order = await Suitebite.getOrderById(order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check if user owns this order
    if (order.user_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: "Access denied - you can only delete your own orders"
      });
    }

    // Check if order can be deleted (only cancelled or completed)
    if (order.status !== 'cancelled' && order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: "Only cancelled or completed orders can be deleted"
      });
    }


    const result = await Suitebite.deleteOrder(order_id, user_id, reason, false); // isAdmin = false for soft delete
    
    if (result) {
  
      res.status(200).json({ 
        success: true, 
        message: "Order deleted successfully!" 
      });
    } else {
      console.log('❌ Soft delete failed for order:', order_id);
      res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }
  } catch (err) {
    console.error('❌ Delete own order error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to delete order" 
    });
  }
};
