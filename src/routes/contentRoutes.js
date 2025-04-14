import express from "express";
import {
  getAboutUs as getAbout,
  getAllContent,
  getCareers,
  getContact,
  getHome,
  insertContent,
  patchHome,
} from "../controllers/contentController.js";

const router = express.Router();

router.get("/content/home", getHome);

router.patch("/content/home", patchHome);

router.get("/content/about", getAbout);

router.get("/content/careers", getCareers);

router.get("/content/contact", getContact);

router.get("/content", getAllContent);

router.post("/add-content", insertContent);

export default router;
