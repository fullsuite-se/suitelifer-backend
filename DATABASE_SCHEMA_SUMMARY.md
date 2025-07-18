# 📊 SUITELIFER DATABASE SCHEMA SUMMARY

**Database:** `dev_SuiteLifer`  
**Host:** `suitelifershop-suiteliferojtdev.e.aivencloud.com:10531`  
**Total Tables:** 52 tables  
**Total Columns:** ~400+ columns  

---

## 🗂️ TABLE CATEGORIES WITH DETAILED COLUMNS

### 👥 **USER MANAGEMENT TABLES**

#### 1. **`sl_user_accounts`** - Main user accounts
- `user_id` varchar NOT NULL (PRIMARY KEY)
- `user_email` varchar NOT NULL (UNIQUE)
- `user_password` varchar NOT NULL
- `user_type` enum NOT NULL DEFAULT 'EMPLOYEE'
- `first_name` varchar NOT NULL
- `middle_name` varchar NULL
- `last_name` varchar NOT NULL
- `profile_pic` text NULL
- `is_verified` tinyint NOT NULL DEFAULT 0
- `is_active` tinyint NOT NULL DEFAULT 1
- `created_at` timestamp NOT NULL

#### 2. **`sl_user_heartbits`** - User heartbits/points system
- `heartbits_id` int NOT NULL AUTO_INCREMENT (PRIMARY KEY)
- `user_id` varchar NOT NULL (FOREIGN KEY)
- `heartbits_balance` int NULL DEFAULT 0
- `total_heartbits_earned` int NULL DEFAULT 0
- `total_heartbits_spent` int NULL DEFAULT 0
- `is_suspended` tinyint NULL DEFAULT 0
- `suspension_reason` text NULL
- `suspended_until` timestamp NULL
- `suspended_by` varchar NULL (FOREIGN KEY)
- `suspended_at` timestamp NULL
- `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

#### 3. **`sl_user_points`** - User points tracking
- `user_id` varchar NOT NULL (PRIMARY KEY)
- `available_points` int NULL DEFAULT 0
- `total_earned` int NULL DEFAULT 0
- `total_spent` int NULL DEFAULT 0
- `monthly_cheer_limit` int NULL DEFAULT 100
- `monthly_cheer_used` int NULL DEFAULT 0
- `last_monthly_reset` datetime NULL
- `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

#### 4. **`sl_user_monthly_stats`** - Monthly user statistics
- `stat_id` int NOT NULL AUTO_INCREMENT (PRIMARY KEY)
- `user_id` int NOT NULL (FOREIGN KEY)
- `month_year` varchar NOT NULL
- `cheers_sent` int NULL DEFAULT 0
- `cheers_received` int NULL DEFAULT 0
- `heartbits_earned` int NULL DEFAULT 0
- `heartbits_spent` int NULL DEFAULT 0
- `orders_placed` int NULL DEFAULT 0
- `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

#### 5. **`sl_verification_codes`** - Email verification codes
- `code_id` char NOT NULL (PRIMARY KEY)
- `user_id` char NOT NULL (FOREIGN KEY)
- `verification_code` char NOT NULL
- `created_at` timestamp NOT NULL
- `expires_at` timestamp NOT NULL

### 🎉 **CHEER SYSTEM TABLES**

#### 6. **`sl_cheers`** - New cheer posts system
- `cheer_id` varchar NOT NULL (PRIMARY KEY)
- `from_user_id` varchar NULL (FOREIGN KEY)
- `to_user_id` varchar NULL (FOREIGN KEY)
- `points` int NULL DEFAULT 1
- `message` text NULL
- `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

#### 7. **`sl_cheer_post`** - Legacy cheer posts
- `cheer_post_id` int NOT NULL AUTO_INCREMENT (PRIMARY KEY)
- `cheerer_id` char NULL (FOREIGN KEY)
- `peer_id` char NULL (FOREIGN KEY)
- `post_body` text NULL
- `heartbits_given` int NULL
- `hashtags` varchar NULL
- `posted_at` datetime NULL
- `is_flagged` tinyint NULL DEFAULT 0
- `is_visible` tinyint NULL DEFAULT 1
- `is_approved` tinyint NULL
- `is_warned` tinyint NULL DEFAULT 0
- `is_hidden` tinyint NULL DEFAULT 0
- `warning_message` text NULL
- `warned_at` timestamp NULL
- `warned_by` varchar NULL
- `moderation_reason` text NULL
- `moderated_at` timestamp NULL
- `moderated_by` varchar NULL

#### 8. **`sl_cheer_comments`** - Cheer comments
- `id` int NOT NULL AUTO_INCREMENT (PRIMARY KEY)
- `cheer_id` varchar NULL (FOREIGN KEY)
- `user_id` varchar NULL (FOREIGN KEY)
- `comment` text NULL
- `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

#### 9. **`sl_cheer_likes`** - Cheer likes
- `cheer_id` varchar NOT NULL (PRIMARY KEY)
- `user_id` varchar NOT NULL (PRIMARY KEY)
- `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

#### 10. **`sl_cheer_designation`** - Cheer designations
- `cheer_designation_id` int NOT NULL AUTO_INCREMENT (PRIMARY KEY)
- `cheer_post_id` int NULL (FOREIGN KEY)
- `peer_id` char NULL (FOREIGN KEY)
- `heartbits_given` int NULL

### 🛒 **SHOP & PRODUCTS TABLES**

#### 11. **`sl_products`** - Main products
- `product_id` int NOT NULL AUTO_INCREMENT (PRIMARY KEY)
- `name` varchar NULL
- `slug` varchar NULL (UNIQUE)
- `description` text NULL
- `image_url` varchar NULL
- `price_points` int NULL
- `is_active` tinyint NULL
- `category_id` int NULL (FOREIGN KEY)
- `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

#### 12. **`sl_shop_categories`** - Product categories
- `category_id` int NOT NULL AUTO_INCREMENT (PRIMARY KEY)
- `category_name` varchar NOT NULL (UNIQUE)
- `is_active` tinyint NULL DEFAULT 1
- `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

#### 13. **`sl_product_variations`** - Product variations
- `variation_id` int NOT NULL AUTO_INCREMENT (PRIMARY KEY)
- `product_id` int NOT NULL (FOREIGN KEY)
- `variation_sku` varchar NULL (UNIQUE)
- `price_adjustment` int NULL DEFAULT 0
- `stock_quantity` int NULL DEFAULT 0
- `is_active` tinyint NULL DEFAULT 1
- `weight` decimal NULL
- `dimensions` varchar NULL
- `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

#### 14. **`sl_product_variation_options`** - Variation options mapping
- `variation_option_id` int NOT NULL AUTO_INCREMENT (PRIMARY KEY)
- `variation_id` int NOT NULL (FOREIGN KEY)
- `option_id` int NOT NULL (FOREIGN KEY)

#### 15. **`sl_variation_types`** - Variation types (size, color, etc.)
- `variation_type_id` int NOT NULL AUTO_INCREMENT (PRIMARY KEY)
- `type_name` varchar NOT NULL (UNIQUE)
- `type_label` varchar NOT NULL
- `is_active` tinyint NULL DEFAULT 1
- `sort_order` int NULL DEFAULT 0
- `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

#### 16. **`sl_variation_options`** - Variation options (small, red, etc.)
- `option_id` int NOT NULL AUTO_INCREMENT (PRIMARY KEY)
- `variation_type_id` int NOT NULL (FOREIGN KEY)
- `option_value` varchar NOT NULL
- `option_label` varchar NOT NULL
- `hex_color` varchar NULL
- `is_active` tinyint NULL DEFAULT 1
- `sort_order` int NULL DEFAULT 0
- `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

### 🛍️ **CART & ORDERS TABLES**

#### 17. **`sl_carts`** - Shopping carts
- `cart_id` int NOT NULL AUTO_INCREMENT (PRIMARY KEY)
- `user_id` char NULL (FOREIGN KEY)
- `created_at` datetime NULL

#### 18. **`sl_cart_items`** - Cart items
- `cart_item_id` int NOT NULL AUTO_INCREMENT (PRIMARY KEY)
- `cart_id` int NULL (FOREIGN KEY)
- `product_id` int NULL (FOREIGN KEY)
- `quantity` int NULL
- `variation_id` int NULL (FOREIGN KEY)
- `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

#### 19. **`sl_orders`** - Orders
- `order_id` int NOT NULL AUTO_INCREMENT (PRIMARY KEY)
- `user_id` char NULL (FOREIGN KEY)
- `total_points` int NULL
- `ordered_at` datetime NULL
- `status` enum NULL
- `processed_at` datetime NULL
- `completed_at` datetime NULL
- `notes` text NULL

#### 20. **`sl_order_items`** - Order items
- `order_item_id` int NOT NULL AUTO_INCREMENT (PRIMARY KEY)
- `order_id` int NULL (FOREIGN KEY)
- `product_id` int NULL (FOREIGN KEY)
- `quantity` int NULL
- `points_spent` int NULL
- `variation_id` int NULL (FOREIGN KEY)
- `variation_details` json NULL
- `product_name` varchar NOT NULL
- `price_points` int NOT NULL

### 💰 **TRANSACTIONS & HEARTBITS TABLES**

#### 21. **`sl_transactions`** - Heartbits transactions
- `transaction_id` varchar NOT NULL (PRIMARY KEY)
- `from_user_id` varchar NULL (FOREIGN KEY)
- `to_user_id` varchar NULL (FOREIGN KEY)
- `type` enum NULL
- `amount` int NULL
- `description` varchar NULL
- `message` text NULL
- `metadata` json NULL
- `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

#### 22. **`sl_heartbits_transactions`** - Legacy heartbits transactions
- `transaction_id` int NOT NULL AUTO_INCREMENT (PRIMARY KEY)
- `user_id` varchar NOT NULL (FOREIGN KEY)
- `transaction_type` varchar NOT NULL
- `points_amount` int NOT NULL
- `reference_type` enum NULL
- `reference_id` int NULL
- `description` text NULL
- `processed_by` int NULL
- `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP

#### 23. **`sl_monthly_limits`** - Monthly sending limits
- `limit_id` int NOT NULL AUTO_INCREMENT (PRIMARY KEY)
- `user_id` varchar NOT NULL (FOREIGN KEY)
- `month_year` varchar NULL
- `heartbits_sent` int NULL
- `heartbits_limit` int NULL

### 📊 **ANALYTICS & STATISTICS TABLES**

#### 24. **`sl_daily_stats`** - Daily system statistics
- `stat_id` int NOT NULL AUTO_INCREMENT (PRIMARY KEY)
- `stat_date` date NOT NULL (UNIQUE)
- `total_cheers` int NULL DEFAULT 0
- `total_heartbits_given` int NULL DEFAULT 0
- `total_orders` int NULL DEFAULT 0
- `total_heartbits_spent` int NULL DEFAULT 0
- `active_users` int NULL DEFAULT 0
- `new_users` int NULL DEFAULT 0
- `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP

#### 25. **`sl_audit_logs`** - System audit logs
- `log_id` char NOT NULL (PRIMARY KEY)
- `description` text NOT NULL
- `date` timestamp NOT NULL
- `action` enum NOT NULL
- `user_id` char NOT NULL (FOREIGN KEY)

#### 26. **`sl_admin_actions`** - Admin action tracking
- `action_id` int NOT NULL AUTO_INCREMENT (PRIMARY KEY)
- `admin_id` varchar NOT NULL
- `action_type` enum NOT NULL
- `target_type` enum NOT NULL
- `details` json NULL
- `target_id` varchar NULL
- `action_details` json NULL
- `reason` text NULL
- `performed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
- `ip_address` varchar NULL
- `user_agent` text NULL

### 🎯 **CONTENT MANAGEMENT TABLES**

#### 27. **`sl_content`** - Website content
- `content_id` char NOT NULL (PRIMARY KEY)
- `get_in_touch_image` text NOT NULL
- `kickstart_video` text NOT NULL
- `text_banner` text NOT NULL
- `about_hero_image` text NOT NULL
- `about_background_image` text NOT NULL
- `about_video` text NOT NULL
- `team_player_video` text NOT NULL
- `understood_video` text NOT NULL
- `focused_video` text NOT NULL
- `upholds_video` text NOT NULL
- `harmony_video` text NOT NULL
- `mission_slogan` varchar NOT NULL
- `mission` text NOT NULL
- `mission_video` text NOT NULL
- `vision_slogan` varchar NOT NULL
- `vision` text NOT NULL
- `vision_video` text NOT NULL
- `day_in_pod_url` text NOT NULL
- `careers_main_image` text NOT NULL
- `careers_left_image` text NOT NULL
- `careers_right_image` text NOT NULL
- `created_at` timestamp NOT NULL
- `created_by` char NOT NULL (FOREIGN KEY)

#### 28. **`sl_employee_blogs`** - Employee blog posts
- `eblog_id` char NOT NULL (PRIMARY KEY)
- `title` varchar NOT NULL
- `description` text NOT NULL
- `is_shown` tinyint NOT NULL DEFAULT 1
- `created_at` timestamp NOT NULL
- `created_by` char NOT NULL (FOREIGN KEY)

#### 29. **`sl_employee_blog_images`** - Blog images
- `eblog_image_id` char NOT NULL (PRIMARY KEY)
- `image_url` text NOT NULL
- `eblog_id` char NOT NULL (FOREIGN KEY)

#### 30. **`sl_eblog_comments`** - Blog comments
- `comment_id` char NOT NULL (PRIMARY KEY)
- `comment` varchar NOT NULL
- `content_id` char NOT NULL (FOREIGN KEY)
- `created_at` timestamp NOT NULL
- `created_by` char NOT NULL (FOREIGN KEY)

#### 31. **`sl_eblog_likes`** - Blog likes
- `like_id` char NOT NULL (PRIMARY KEY)
- `eblog_id` char NOT NULL (FOREIGN KEY)
- `user_id` char NOT NULL (FOREIGN KEY)
- `created_at` timestamp NOT NULL

#### 32. **`sl_newsletters`** - Newsletter articles
- `newsletter_id` char NOT NULL (PRIMARY KEY)
- `title` varchar NOT NULL
- `article` text NOT NULL
- `section` tinyint NOT NULL DEFAULT 0
- `pseudonym` varchar NULL
- `created_at` timestamp NOT NULL
- `created_by` char NOT NULL (FOREIGN KEY)
- `issue_id` char NOT NULL (FOREIGN KEY)

#### 33. **`sl_newsletter_images`** - Newsletter images
- `newsletter_image_id` char NOT NULL (PRIMARY KEY)
- `image_url` text NOT NULL
- `newsletter_id` char NOT NULL (FOREIGN KEY)

#### 34. **`sl_newsletter_issues`** - Newsletter issues
- `issue_id` char NOT NULL (PRIMARY KEY)
- `month` tinyint NOT NULL
- `year` year NOT NULL
- `is_published` tinyint NOT NULL DEFAULT 0
- `created_at` timestamp NOT NULL
- `created_by` char NOT NULL (FOREIGN KEY)

### 🏢 **COMPANY & CAREERS TABLES**

#### 35. **`sl_company_jobs`** - Job listings
- `job_id` char NOT NULL (PRIMARY KEY)
- `title` varchar NOT NULL
- `industry_id` char NOT NULL (FOREIGN KEY)
- `employment_type` enum NOT NULL
- `setup_id` char NOT NULL (FOREIGN KEY)
- `description` text NOT NULL
- `salary_min` int NULL DEFAULT 0
- `salary_max` int NULL DEFAULT 0
- `responsibility` text NULL
- `requirement` text NULL
- `preferred_qualification` text NULL
- `is_open` tinyint NOT NULL
- `is_shown` tinyint NOT NULL
- `created_at` timestamp NOT NULL
- `created_by` char NOT NULL (FOREIGN KEY)
- `company_id` char NOT NULL (FOREIGN KEY)

#### 36. **`sl_company_jobs_setups`** - Job setup configurations
- `setup_id` char NOT NULL (PRIMARY KEY)
- `setup_name` varchar NOT NULL
- `created_at` timestamp NOT NULL
- `created_by` char NOT NULL

#### 37. **`sl_job_industries`** - Job industries
- `job_ind_id` char NOT NULL (PRIMARY KEY)
- `industry_name` varchar NOT NULL
- `company_id` char NOT NULL (FOREIGN KEY)
- `image_url` text NULL
- `assessment_url` text NOT NULL
- `created_at` timestamp NOT NULL
- `created_by` char NOT NULL (FOREIGN KEY)

#### 38. **`sl_certifications`** - Certifications
- `cert_id` char NOT NULL (PRIMARY KEY)
- `cert_img_url` text NOT NULL
- `created_at` timestamp NOT NULL
- `created_by` char NOT NULL (FOREIGN KEY)

#### 39. **`sl_courses`** - Training courses
- `course_id` char NOT NULL (PRIMARY KEY)
- `title` varchar NOT NULL
- `description` text NOT NULL
- `url` text NOT NULL
- `created_at` timestamp NOT NULL
- `created_by` char NOT NULL (FOREIGN KEY)

### 📋 **LEGAL & POLICIES TABLES**

#### 40. **`sl_privacy_policy`** - Privacy policies
- `policy_id` char NOT NULL (PRIMARY KEY)
- `title` text NOT NULL
- `description` text NOT NULL
- `created_at` timestamp NOT NULL
- `created_by` char NOT NULL (FOREIGN KEY)

#### 41. **`sl_terms_of_use`** - Terms of use
- `terms_id` char NOT NULL (PRIMARY KEY)
- `title` text NOT NULL
- `description` text NOT NULL
- `created_at` timestamp NOT NULL
- `created_by` char NOT NULL (FOREIGN KEY)

#### 42. **`sl_faqs`** - Frequently asked questions
- `faq_id` char NOT NULL (PRIMARY KEY)
- `question` text NOT NULL
- `answer` text NOT NULL
- `is_shown` tinyint NOT NULL DEFAULT 1
- `created_at` timestamp NOT NULL
- `created_by` char NOT NULL (FOREIGN KEY)

### 🎭 **ENGAGEMENT TABLES**

#### 43. **`sl_events`** - Company events
- `event_id` char NOT NULL (PRIMARY KEY)
- `title` varchar NOT NULL
- `description` text NOT NULL
- `date_start` timestamp NOT NULL
- `date_end` timestamp NULL
- `created_at` timestamp NOT NULL
- `created_by` char NOT NULL (FOREIGN KEY)

#### 44. **`sl_testimonials`** - Employee testimonials
- `testimonial_id` char NOT NULL (PRIMARY KEY)
- `employee_name` text NOT NULL
- `position` text NOT NULL
- `testimony` text NOT NULL
- `is_shown` tinyint NOT NULL DEFAULT 1
- `employee_image_url` text NOT NULL
- `created_at` timestamp NOT NULL
- `created_by` char NOT NULL (FOREIGN KEY)

#### 45. **`sl_personality_tests`** - Personality tests
- `test_id` char NOT NULL (PRIMARY KEY)
- `test_title` varchar NOT NULL
- `test_url` text NOT NULL
- `test_description` text NOT NULL
- `created_at` timestamp NOT NULL
- `created_by` char NOT NULL (FOREIGN KEY)

#### 46. **`sl_mood_logs`** - Mood tracking
- `id` int NOT NULL AUTO_INCREMENT (PRIMARY KEY)
- `user_id` varchar NOT NULL (FOREIGN KEY)
- `mood_level` tinyint NOT NULL
- `notes` text NULL
- `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

#### 47. **`sl_spotify_embeds`** - Spotify episode embeds
- `episode_id` char NOT NULL (PRIMARY KEY)
- `spotify_id` char NOT NULL
- `embed_type` enum NOT NULL
- `created_at` timestamp NOT NULL
- `created_by` char NOT NULL (FOREIGN KEY)

### ⚙️ **SYSTEM TABLES**

#### 48. **`sl_system_config`** - System configuration
- `config_id` int NOT NULL AUTO_INCREMENT (PRIMARY KEY)
- `config_key` varchar NOT NULL (UNIQUE)
- `config_value` text NULL
- `config_description` text NULL
- `is_active` tinyint NULL DEFAULT 1
- `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
- `description` text NULL
- `config_type` enum NULL DEFAULT 'string'
- `is_editable` tinyint NULL DEFAULT 1

#### 49. **`sl_admin_permissions`** - Admin permissions
- `permission_id` int NOT NULL AUTO_INCREMENT (PRIMARY KEY)
- `permission_name` varchar NOT NULL (UNIQUE)
- `permission_description` text NULL
- `permission_category` enum NOT NULL
- `is_active` tinyint NULL DEFAULT 1
- `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP

#### 50. **`sl_admin_roles`** - Admin roles
- `role_id` int NOT NULL AUTO_INCREMENT (PRIMARY KEY)
- `role_name` varchar NOT NULL (UNIQUE)
- `role_description` text NULL
- `is_active` tinyint NULL DEFAULT 1
- `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP

#### 51. **`sl_contact`** - Contact information
- `contact_id` char NOT NULL (PRIMARY KEY)
- `website_email` varchar NOT NULL
- `website_tel` varchar NOT NULL
- `website_phone` varchar NOT NULL
- `careers_email` varchar NOT NULL
- `internship_email` varchar NOT NULL
- `careers_phone` varchar NOT NULL
- `created_at` timestamp NOT NULL
- `created_by` char NOT NULL (FOREIGN KEY)

### 👁️ **VIEWS**

#### 52. **`v_user_heartbits_summary`** - User heartbits summary view
- `user_id` varchar NOT NULL
- `first_name` varchar NOT NULL
- `last_name` varchar NOT NULL
- `user_email` varchar NOT NULL
- `heartbits_balance` int NULL DEFAULT 0
- `total_heartbits_earned` int NULL DEFAULT 0
- `total_heartbits_spent` int NULL DEFAULT 0
- `is_suspended` int NOT NULL DEFAULT 0
- `suspension_reason` binary NULL

---

## 🔗 **KEY FOREIGN KEY RELATIONSHIPS**

### **User Account Relationships**
- Most tables reference `sl_user_accounts.user_id` as the central user table
- User creation tracking via `created_by` fields
- User suspension and moderation tracking

### **Product System Relationships**
```
sl_products → sl_shop_categories (category_id)
sl_product_variations → sl_products (product_id)
sl_product_variation_options → sl_product_variations (variation_id)
sl_product_variation_options → sl_variation_options (option_id)
sl_variation_options → sl_variation_types (variation_type_id)
```

### **Order System Relationships**
```
sl_orders → sl_user_accounts (user_id)
sl_order_items → sl_orders (order_id)
sl_order_items → sl_products (product_id)
sl_order_items → sl_product_variations (variation_id)
```

### **Cart System Relationships**
```
sl_carts → sl_user_accounts (user_id)
sl_cart_items → sl_carts (cart_id)
sl_cart_items → sl_products (product_id)
sl_cart_items → sl_product_variations (variation_id)
```

### **Cheer System Relationships**
```
sl_cheers → sl_user_accounts (from_user_id, to_user_id)
sl_cheer_comments → sl_cheers (cheer_id)
sl_cheer_comments → sl_user_accounts (user_id)
sl_cheer_likes → sl_cheers (cheer_id)
sl_cheer_likes → sl_user_accounts (user_id)
```

---

## 📈 **INDEXES SUMMARY**

### **Primary Indexes**
- All tables have PRIMARY KEY indexes
- Most use auto-incrementing IDs

### **Performance Indexes**
- **User Activity:** `idx_user_active`, `idx_user_email`, `idx_user_type`
- **Cheer System:** `idx_cheer_cheerer`, `idx_cheer_peer`, `idx_cheer_posted`
- **Orders:** `idx_orders_status`, `idx_orders_user`
- **Products:** `idx_products_active`, `idx_products_category`
- **Transactions:** `idx_transactions_type`, `idx_transactions_user`
- **Mood Tracking:** `idx_user_mood_date`, `idx_mood_level`

### **Unique Indexes**
- Email addresses, slugs, SKUs, and business keys
- Category names, variation types, and configuration keys

---

## 🎯 **PRODUCT MANAGEMENT SYSTEM**

### **Core Product Tables**
- **`sl_products`** - Main product information
- **`sl_shop_categories`** - Product categorization
- **`sl_product_variations`** - Product variants (size, color, etc.)
- **`sl_variation_types`** - Variation categories (size, color, style)
- **`sl_variation_options`** - Specific options (small, red, classic)
- **`sl_product_variation_options`** - Product-variation mappings

### **Product Features**
- ✅ Product CRUD operations
- ✅ Category management with color coding
- ✅ Variation system (size, color, design)
- ✅ Image upload and management
- ✅ Price points (heartbits) system
- ✅ Active/inactive status tracking
- ✅ SKU management for variations

---

## 💰 **HEARTBITS & TRANSACTIONS SYSTEM**

### **Points Management**
- **`sl_user_points`** - Current user points
- **`sl_user_heartbits`** - Legacy heartbits system
- **`sl_transactions`** - Transaction history
- **`sl_heartbits_transactions`** - Legacy transaction tracking

### **Monthly Limits**
- **`sl_monthly_limits`** - Monthly sending limits
- **`sl_user_monthly_stats`** - Monthly user statistics

---

## 🛒 **SHOPPING SYSTEM**

### **Cart Management**
- **`sl_carts`** - User shopping carts
- **`sl_cart_items`** - Cart items with variations

### **Order Management**
- **`sl_orders`** - Order tracking
- **`sl_order_items`** - Order line items
- Status tracking: pending, approved, completed, cancelled

---

## 📊 **ANALYTICS & MONITORING**

### **Statistics Tracking**
- **`sl_daily_stats`** - Daily system metrics
- **`sl_audit_logs`** - System audit trail
- **`sl_admin_actions`** - Admin action logging

### **User Analytics**
- Cheer activity tracking
- Order history
- Monthly statistics
- Mood tracking

---

## 🔧 **SYSTEM CONFIGURATION**

### **Configuration Management**
- **`sl_system_config`** - System settings
- **`sl_admin_permissions`** - Permission system
- **`sl_admin_roles`** - Role-based access control

---

## 📋 **SUMMARY STATISTICS**

- **Total Tables:** 52
- **Total Columns:** ~400+
- **Total Indexes:** 100+
- **Total Foreign Keys:** 50+
- **Views:** 1 (v_user_heartbits_summary)
- **Database Size:** ~1MB+ (estimated)

### **Key Features Implemented:**
✅ User authentication and authorization  
✅ Product management with variations  
✅ Shopping cart and order system  
✅ Cheer/recognition system  
✅ Heartbits/points system  
✅ Content management (blogs, newsletters)  
✅ Analytics and reporting  
✅ Admin panel functionality  
✅ Mood tracking system  
✅ Job/career management  
✅ System configuration management  

---

*This schema supports a comprehensive employee engagement platform with e-commerce, social features, and administrative capabilities.* 