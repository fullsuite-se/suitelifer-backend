import express from "express";
import { getContact, insertContact } from "../controllers/contactController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/contact", getContact);

router.post("/contact", verifyToken, insertContact);

export default router;
