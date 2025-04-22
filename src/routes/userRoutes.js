import express from "express";
import { getUsers, updateUserPassword, updateUserType } from "../controllers/userController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifySuperAdmin from "../middlewares/verifySuperAdmin.js";

const router = express.Router();

router.get("/get-users", verifyToken, verifySuperAdmin, getUsers);

router.patch("/update-user-type", verifyToken, verifySuperAdmin, updateUserType);

router.post("/update-password", updateUserPassword);

export default router;
