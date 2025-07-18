# Product, Cart & Order Management API Summary

## Overview
This document summarizes the backend implementation for product management, cart operations, and order processing with the updated database schema that supports product variations.

## Database Schema Changes

### New Tables
- `sl_cart_item_variations` - Stores cart item variations
- `sl_order_item_variations` - Stores order item variations

### Updated Tables
- `sl_cart_items` - Removed `variation_id` column
- `sl_order_items` - Removed `variation_id` and `variation_details` columns
- `sl_product_variations` - Simplified structure

## 🔹 Products & Variations APIs

### 1. Create Product (with or without variations)
**Endpoint:** `POST /api/suitebite/products`  
**Auth:** Admin required

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price_points": 100,
  "category_id": 1,
  "image_url": "https://example.com/image.jpg",
  "variations": [
    {
      "variation_type_id": 1,
      "option_id": 2
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": { "product_id": 123 }
}
```

### 2. Edit Product
**Endpoint:** `PUT /api/suitebite/products/:id`  
**Auth:** Admin required

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "description": "Updated description",
  "price_points": 150,
  "category_id": 2,
  "image_url": "https://example.com/new-image.jpg",
  "is_active": true
}
```

### 3. Get Product Details (with variations)
**Endpoint:** `GET /api/suitebite/products/:id`  
**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "product_id": 123,
    "name": "Product Name",
    "description": "Description",
    "price": 100,
    "category_id": 1,
    "category": "Category Name",
    "image_url": "https://example.com/image.jpg",
    "is_active": true,
    "variations": [
      {
        "variation_id": 1,
        "product_id": 123,
        "is_active": true,
        "options": [
          {
            "option_id": 1,
            "option_value": "Red",
            "option_label": "Red Color",
            "hex_color": "#FF0000",
            "type_name": "color",
            "type_label": "Color"
          }
        ]
      }
    ]
  }
}
```

### 4. List Products (filter by is_active, include variations)
**Endpoint:** `GET /api/suitebite/products?active_only=true&category_id=1`  
**Auth:** Required

**Query Parameters:**
- `active_only` (boolean) - Filter active products only
- `category_id` (number) - Filter by category

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "product_id": 123,
      "name": "Product Name",
      "description": "Description",
      "price": 100,
      "category_id": 1,
      "category": "Category Name",
      "image_url": "https://example.com/image.jpg",
      "is_active": true,
      "variations": [...]
    }
  ]
}
```

## 🔹 Cart APIs

### 1. Add to Cart
**Endpoint:** `POST /api/suitebite/cart/add`  
**Auth:** Required

**Request Body:**
```json
{
  "product_id": 123,
  "quantity": 2,
  "variations": [
    {
      "variation_type_id": 1,
      "option_id": 2
    },
    {
      "variation_type_id": 2,
      "option_id": 5
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart successfully!",
  "data": { "cart_item_id": 456 }
}
```

### 2. Update Cart Item
**Endpoint:** `PUT /api/suitebite/cart/update/:cart_item_id`  
**Auth:** Required

**Request Body:**
```json
{
  "quantity": 3,
  "variations": [
    {
      "variation_type_id": 1,
      "option_id": 3
    }
  ]
}
```

### 3. Remove Cart Item
**Endpoint:** `DELETE /api/suitebite/cart/remove/:cart_item_id`  
**Auth:** Required

### 4. Get Cart
**Endpoint:** `GET /api/suitebite/cart`  
**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "cart": {
      "cart_id": 789,
      "user_id": "user123",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "cartItems": [
      {
        "cart_item_id": 456,
        "product_id": 123,
        "quantity": 2,
        "product_name": "Product Name",
        "price_points": 100,
        "image_url": "https://example.com/image.jpg",
        "category_name": "Category Name",
        "variations": [
          {
            "cart_item_variation_id": 1,
            "variation_type_id": 1,
            "option_id": 2,
            "option_value": "Red",
            "option_label": "Red Color",
            "hex_color": "#FF0000",
            "type_name": "color",
            "type_label": "Color"
          }
        ]
      }
    ]
  }
}
```

### 5. Clear Cart
**Endpoint:** `DELETE /api/suitebite/cart/clear`  
**Auth:** Required

## 🔹 Orders APIs

### 1. Place Order
**Endpoint:** `POST /api/suitebite/orders/checkout`  
**Auth:** Required

**Process:**
1. Gets user's cart
2. Calculates total points
3. Validates heartbits balance
4. Creates order
5. Deducts heartbits
6. Transfers cart items to order items
7. Transfers cart item variations to order item variations
8. Clears cart

**Response:**
```json
{
  "success": true,
  "message": "Order placed successfully!",
  "data": {
    "order_id": 999,
    "total_points": 200
  }
}
```

### 2. View Order History (for users)
**Endpoint:** `GET /api/suitebite/orders/history?page=1&limit=20`  
**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "order_id": 999,
      "user_id": "user123",
      "total_points": 200,
      "ordered_at": "2024-01-01T00:00:00Z",
      "status": "pending",
      "orderItems": [
        {
          "order_item_id": 1,
          "product_id": 123,
          "quantity": 2,
          "points_spent": 200,
          "product_name": "Product Name",
          "price_points": 100,
          "variations": [
            {
              "order_item_variation_id": 1,
              "variation_type_id": 1,
              "option_id": 2,
              "option_value": "Red",
              "option_label": "Red Color",
              "hex_color": "#FF0000",
              "type_name": "color",
              "type_label": "Color"
            }
          ]
        }
      ]
    }
  ]
}
```

### 3. Get Order by ID
**Endpoint:** `GET /api/suitebite/orders/:id`  
**Auth:** Required (user can only access their own orders, admins can access any)

### 4. Order Management (for admins)

#### Get All Orders
**Endpoint:** `GET /api/suitebite/admin/orders?status=pending&dateFrom=2024-01-01&dateTo=2024-12-31`  
**Auth:** Admin required

**Query Parameters:**
- `status` - Filter by order status
- `dateFrom` - Filter orders from date
- `dateTo` - Filter orders to date

#### Update Order Status
**Endpoint:** `PUT /api/suitebite/admin/orders/:order_id/status`  
**Auth:** Admin required

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Order fulfilled"
}
```

**Available Statuses:**
- `pending` - Order placed, awaiting processing
- `processed` - Order being processed
- `completed` - Order fulfilled
- `cancelled` - Order cancelled

## 🔹 Variation Management APIs

### 1. Get Variation Types
**Endpoint:** `GET /api/suitebite/variations/types`  
**Auth:** Required

### 2. Get Variation Options
**Endpoint:** `GET /api/suitebite/variations/options?variation_type_id=1`  
**Auth:** Required

### 3. Add Variation Type (Admin)
**Endpoint:** `POST /api/suitebite/admin/variations/types`  
**Auth:** Admin required

**Request Body:**
```json
{
  "type_name": "color",
  "type_label": "Color",
  "sort_order": 1
}
```

### 4. Add Variation Option (Admin)
**Endpoint:** `POST /api/suitebite/admin/variations/options`  
**Auth:** Admin required

**Request Body:**
```json
{
  "variation_type_id": 1,
  "option_value": "red",
  "option_label": "Red Color",
  "hex_color": "#FF0000",
  "sort_order": 1
}
```

## 🔹 Category Management APIs

### 1. Get All Categories
**Endpoint:** `GET /api/suitebite/categories`  
**Auth:** Required

### 2. Add Category (Admin)
**Endpoint:** `POST /api/suitebite/categories`  
**Auth:** Admin required

**Request Body:**
```json
{
  "category_name": "New Category"
}
```

### 3. Update Category (Admin)
**Endpoint:** `PUT /api/suitebite/categories/:id`  
**Auth:** Admin required

### 4. Delete Category (Admin)
**Endpoint:** `DELETE /api/suitebite/categories/:id`  
**Auth:** Admin required

## Key Features Implemented

### ✅ Products & Variations
- ✅ Create product (with or without variations)
- ✅ Edit product (update product fields and manage variations)
- ✅ Get product details (fetch variations dynamically)
- ✅ List products (filter by is_active, include variations)

### ✅ Cart
- ✅ Add to cart (accept product_id, quantity, and variation selections)
- ✅ Update cart item (change quantity or variation options)
- ✅ Remove cart item
- ✅ Get cart with all items and variations
- ✅ Clear cart

### ✅ Orders
- ✅ Place order (transfer cart items → order items, cart item variations → order item variations)
- ✅ View order history (for users)
- ✅ Fetch order items with their variation details
- ✅ Order management (for admins)
- ✅ Fetch orders with product + variation details
- ✅ Update order status

### ✅ Database Integration
- ✅ Proper foreign key relationships
- ✅ Transaction handling for order placement
- ✅ Heartbits deduction and transaction logging
- ✅ Cart clearing after successful order

## Error Handling

All APIs include comprehensive error handling:
- Input validation
- Database constraint checks
- Authorization checks
- Proper HTTP status codes
- Descriptive error messages

## Security Features

- JWT token authentication
- Role-based access control (Admin/User)
- User can only access their own orders
- Admin can access all orders
- Input sanitization and validation 