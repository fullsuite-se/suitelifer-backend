import express from "express";
import upload from "../utils/multer.js";
import { uploadAndSaveImages } from "../controllers/claudinaryController.js";

const router = express.Router();

router.post(
  "/upload-save-image/:table/:folder/:id",
  upload.array("images", 10),
  uploadAndSaveImages
);

export default router;
