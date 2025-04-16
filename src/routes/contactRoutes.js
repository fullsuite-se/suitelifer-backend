import express from "express";
import { getContact, insertContact } from "../controllers/contactController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.get("/contact", getContact);

router.post("/contact", verifyToken, verifyAdmin, insertContact);

export default router;
