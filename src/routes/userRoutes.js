import express from "express";
import { getUsers, updateUserPassword } from "../controllers/userController.js";

const router = express.Router();

router.get("/users", getUsers);

router.post("/update-password", updateUserPassword);

export default router;
