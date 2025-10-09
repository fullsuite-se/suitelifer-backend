import express from "express";
import {
  deleteUserAccount,
  getUsers,
  // updateUserPassword,
  updateUserStatus,
  updateUserType,
  addUser,
  searchUsers,
  updatePersonalDetails
} from "../controllers/userController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifySuperAdmin from "../middlewares/verifySuperAdmin.js";

const router = express.Router();

router.get("/users", verifyToken, verifySuperAdmin, getUsers);

router.patch("/users/type", updateUserType);

router.patch("/users/status", updateUserStatus);

router.delete("/users", verifyToken, verifySuperAdmin, deleteUserAccount);

// router.post("/update-password", updateUserPassword);

router.post("/add-user", verifyToken, verifySuperAdmin, addUser);

router.get("/searchUsers", searchUsers);

router.patch("/users/personal-details", updatePersonalDetails);

export default router;
