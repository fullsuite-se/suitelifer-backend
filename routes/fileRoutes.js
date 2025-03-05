import express from "express";
import upload from "../utils/multer.js";
import { uploadImage } from "../controllers/fileController.js";

const router = express.Router();

router.post("/upload-image", upload.single("image"), uploadImage);

export default router;
