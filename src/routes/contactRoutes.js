import express from "express";
import { getContact, insertContact } from "../controllers/contactController.js";

const router = express.Router();

router.get("/contact", getContact);

router.post("/contact", insertContact);

export default router;
