import express from "express";
import {
  getAbout,
  getAllContent,
  getCareers,
  getContact,
  getHome,
  insertContent,
  patchHome,
} from "../controllers/contentController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.get("/content/home", verifyToken, getHome);

router.patch("/content/home", verifyToken, verifyAdmin, patchHome);

router.get("/content/about", getAbout);

router.get("/content/careers", getCareers);

router.get("/content/contact", getContact);

router.get("/content", getAllContent);

router.post("/add-content", verifyToken, verifyAdmin, insertContent);

export default router;
