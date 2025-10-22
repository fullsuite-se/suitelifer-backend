import express from "express";
import upload from "../utils/multer.js";
import {
  uploadAndSaveImages,
  uploadImage,
  uploadProductImage,
  uploadMultipleProductImages,
  deleteProductImage,
  getOptimizedImageUrl,
  deleteBlogImage,
  deleteEmployeeBlogImages
} from "../controllers/cloudinaryController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

// ========== GENERAL IMAGE UPLOADS ==========

router.post(
  "/upload-image/:folder",
  // verifyToken,
  upload.single("file"),
  uploadImage
);

router.post(
  "/upload-save-image/:table/:folder/:id",
  verifyToken,
  upload.array("images", 10),
  uploadAndSaveImages
);

// ========== PRODUCT IMAGE MANAGEMENT ==========

// Upload single product image with multiple sizes
router.post(
  "/products/:productId/image",
  verifyToken,
  upload.single("image"),
  uploadProductImage
);

// Upload multiple product images
router.post(
  "/products/:productId/images",
  verifyToken,
  upload.array("images", 10),
  uploadMultipleProductImages
);

// Delete product image
router.delete(
  "/products/:productId/images/:publicId",
  verifyToken,
  deleteProductImage
);


// Delete Blog Image
router.delete(
  "/blog/:publicId",
  verifyToken,
  deleteBlogImage
);

router.delete(
  "/delete-image-employee-blog/:folderId",
  verifyToken,
  deleteEmployeeBlogImages
)

// Get optimized image URL
router.get(
  "/images/:publicId/optimize",
  getOptimizedImageUrl
);


export default router;
