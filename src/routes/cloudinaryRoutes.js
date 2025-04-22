import express from "express";
import upload from "../utils/multer.js";
import {
  uploadAndSaveImages,
  uploadImage,
} from "../controllers/cloudinaryController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post(
  "/upload-image/:folder",
  verifyToken,
  upload.single("file"),
  uploadImage
);

router.post(
  "/upload-save-image/:table/:folder/:id",
  verifyToken,
  upload.array("images", 10),
  uploadAndSaveImages
);

export default router;
