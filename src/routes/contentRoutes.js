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

const router = express.Router();

router.get("/content/home", getHome);

router.patch("/content/home", verifyToken, patchHome);

router.get("/content/about", getAbout);

router.get("/content/careers", getCareers);

router.get("/content/contact", getContact);

router.get("/content", getAllContent);

router.post("/add-content", verifyToken, insertContent);

export default router;
