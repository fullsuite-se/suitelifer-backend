import express from "express";
import upload from "../utils/multer.js";
import { uploadImages } from "../controllers/fileController.js";

const router = express.Router();

router.post(
  "/upload-image/:folder/:id",
  upload.array("images", 10),
  uploadImages
);

export default router;
