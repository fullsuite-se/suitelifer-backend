import cloudinary from "../utils/cloudinary.js";
import { Image } from "../models/imageModel.js";
import { Suitebite } from "../models/suitebiteModel.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { folder } = req.params;
    
    // Upload original image with minimal processing - no format conversion
    const originalResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { 
          folder: `suitelifer/${folder}`,
          // Don't force any format conversion
          quality: "auto"
        },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    // Generate different sizes using Cloudinary transformations
    const baseUrl = originalResult.secure_url;
    const publicId = originalResult.public_id;
    

    
    // Use the original URL for all sizes to test if the issue is with transformations
    const thumbnailUrl = baseUrl;
    const mediumUrl = baseUrl;
    const largeUrl = baseUrl;

    const response = { 
      success: true,
      imageUrl: baseUrl,
      thumbnailUrl: thumbnailUrl,
      mediumUrl: mediumUrl,
      largeUrl: largeUrl,
      publicId: publicId,
      public_id: publicId  // Also include snake_case version for consistency
    };
    

    
    res.json(response);
  } catch (error) {
    console.error('🔍 Backend - Upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const uploadAndSaveImages = async (req, res) => {
  const { table, folder, id } = req.params;

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `suitelifer/${folder}/${id}` },
          (error, result) =>
            error ? reject(error) : resolve(result.secure_url)
        );
        stream.end(file.buffer);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);

    try {
      const tableMap = {
        eBlog: Image.addEmployeeBlogImages,
        cBlog: Image.addCompanyBlogImages,
        cNews: Image.addCompanyNewsImages,
      };
      const saveImagesToDb = tableMap[table];

      if (!saveImagesToDb) {
        return res.status(400).json({ error: "Invalid table name" });
      }

      await saveImagesToDb(id, imageUrls);
    } catch (dbError) {
      console.error("Database error:", dbError);
      return res
        .status(500)
        .json({ error: "Failed to save images in the database" });
    }

    res.status(200).json({
      success: true,
      message: "Upload successful!",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========== PRODUCT IMAGE MANAGEMENT ==========

/**
 * Upload a single product image with multiple sizes
 * Creates thumbnail, medium, and original sizes
 */
export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No image file uploaded" 
      });
    }

    const { productId } = req.params;
    
    // Validate product exists
    const product = await Suitebite.getProductById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Upload image with multiple transformations
    const uploadPromises = [
      // Original image (optimized)
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { 
            folder: `suitelifer/products/${productId}`,
            format: "webp",
            quality: "auto",
            fetch_format: "auto",
            public_id: `${productId}_original_${Date.now()}`
          },
          (error, result) => error ? reject(error) : resolve({
            type: 'original',
            url: result.secure_url,
            public_id: result.public_id
          })
        );
        stream.end(req.file.buffer);
      }),
      
      // Thumbnail (300x300)
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { 
            folder: `suitelifer/products/${productId}`,
            format: "webp",
            quality: "auto",
            transformation: [
              { width: 300, height: 300, crop: "fill", gravity: "center" }
            ],
            public_id: `${productId}_thumb_${Date.now()}`
          },
          (error, result) => error ? reject(error) : resolve({
            type: 'thumbnail',
            url: result.secure_url,
            public_id: result.public_id
          })
        );
        stream.end(req.file.buffer);
      }),
      
      // Medium size (600x600)
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { 
            folder: `suitelifer/products/${productId}`,
            format: "webp",
            quality: "auto",
            transformation: [
              { width: 600, height: 600, crop: "fill", gravity: "center" }
            ],
            public_id: `${productId}_medium_${Date.now()}`
          },
          (error, result) => error ? reject(error) : resolve({
            type: 'medium',
            url: result.secure_url,
            public_id: result.public_id
          })
        );
        stream.end(req.file.buffer);
      })
    ];

    const imageResults = await Promise.all(uploadPromises);
    
    // Update product with new image URL (use original)
    const originalImage = imageResults.find(img => img.type === 'original');
    await Suitebite.updateProduct(productId, {
      image_url: originalImage.url
    });

    res.status(200).json({
      success: true,
      message: "Product image uploaded successfully",
      images: {
        original: imageResults.find(img => img.type === 'original')?.url,
        medium: imageResults.find(img => img.type === 'medium')?.url,
        thumbnail: imageResults.find(img => img.type === 'thumbnail')?.url
      },
      productId
    });

  } catch (error) {
    console.error("Product image upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to upload product image",
      error: error.message 
    });
  }
};

/**
 * Upload multiple product images
 */
export const uploadMultipleProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No image files uploaded" 
      });
    }

    const { productId } = req.params;
    
    // Validate product exists
    const product = await Suitebite.getProductById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Process each uploaded file
    const allImages = [];
    
    for (const file of req.files) {
      const timestamp = Date.now() + Math.random();
      
      const uploadPromises = [
        // Original
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { 
              folder: `suitelifer/products/${productId}`,
              format: "webp",
              quality: "auto",
              public_id: `${productId}_${timestamp}_original`
            },
            (error, result) => error ? reject(error) : resolve({
              type: 'original',
              url: result.secure_url
            })
          );
          stream.end(file.buffer);
        }),
        
        // Thumbnail
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { 
              folder: `suitelifer/products/${productId}`,
              format: "webp",
              quality: "auto",
              transformation: [{ width: 300, height: 300, crop: "fill" }],
              public_id: `${productId}_${timestamp}_thumb`
            },
            (error, result) => error ? reject(error) : resolve({
              type: 'thumbnail',
              url: result.secure_url
            })
          );
          stream.end(file.buffer);
        })
      ];
      
      const imageResults = await Promise.all(uploadPromises);
      allImages.push({
        original: imageResults.find(img => img.type === 'original')?.url,
        thumbnail: imageResults.find(img => img.type === 'thumbnail')?.url
      });
    }

    // Update product with first image as main image
    if (allImages.length > 0) {
      await Suitebite.updateProduct(productId, {
        image_url: allImages[0].original
      });
    }

    res.status(200).json({
      success: true,
      message: `${allImages.length} product images uploaded successfully`,
      images: allImages,
      productId
    });

  } catch (error) {
    console.error("Multiple product images upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to upload product images",
      error: error.message 
    });
  }
};

/**
 * Delete product image from Cloudinary
 */
export const deleteProductImage = async (req, res) => {
  try {
    const { productId, publicId } = req.params;
    
    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: "Product image deleted successfully"
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to delete image from Cloudinary"
      });
    }

  } catch (error) {
    console.error("Delete product image error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete product image",
      error: error.message 
    });
  }
};

/**
 * Get optimized image URL with transformations
 */
export const getOptimizedImageUrl = (req, res) => {
  try {
    const { publicId } = req.params;
    const { width, height, crop = 'fill', quality = 'auto' } = req.query;
    
    let transformation = { 
      quality,
      fetch_format: 'auto'
    };
    
    if (width) transformation.width = parseInt(width);
    if (height) transformation.height = parseInt(height);
    if (width && height) transformation.crop = crop;
    
    const optimizedUrl = cloudinary.url(publicId, { transformation });
    
    res.status(200).json({
      success: true,
      optimizedUrl
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to generate optimized URL",
      error: error.message 
    });
  }
};
