import express from "express";
import {
  getAbout,
  getAllContent,
  getCareers,
  getHome,
  insertContent,
  patchAbout,
  patchHome,
  patchCareers,
} from "../controllers/contentController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.get("/content/home", getHome);

router.patch("/content/home", verifyToken, verifyAdmin, patchHome);

router.get("/content/about", getAbout);

router.patch("/content/about", verifyToken, verifyAdmin, patchAbout);

router.get("/content/careers", getCareers);

router.patch("/content/careers", patchCareers);

router.get("/content", getAllContent);

router.post("/add-content", verifyToken, verifyAdmin, insertContent);

export default router;
