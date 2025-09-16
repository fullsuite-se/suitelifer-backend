import express from "express";
import {
  deleteUserAccount,
  getUsers,
  updateUserPassword,
  updateUserStatus,
  updateUserType,
  addUser,
  searchUsers,
} from "../controllers/userController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifySuperAdmin from "../middlewares/verifySuperAdmin.js";

const router = express.Router();

router.get("/users", verifyToken, verifySuperAdmin, getUsers);

router.patch("/users/type", verifyToken, verifySuperAdmin, updateUserType);

router.patch("/users/status", verifyToken, verifySuperAdmin, updateUserStatus);

router.delete("/users", verifyToken, verifySuperAdmin, deleteUserAccount);

router.post("/update-password", updateUserPassword);

router.post("/add-user", verifyToken, verifySuperAdmin, addUser);

router.get("/searchUsers", searchUsers);

export default router;
