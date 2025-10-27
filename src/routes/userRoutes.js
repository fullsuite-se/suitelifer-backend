import express from "express";
import {
  deleteUserAccount,
  getUsers,
  // updateUserPassword,
  updateUserStatus,
  updateUserType,
  addUser,
  searchUsers,
  updatePersonalDetails,
  isIdAvailable,
  isEmailAvailable
} from "../controllers/userController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifySuperAdmin from "../middlewares/verifySuperAdmin.js";

const router = express.Router();

router.get("/users", verifyToken, verifySuperAdmin, getUsers);

router.patch("/users/type", updateUserType);


router.get("/users/is-id-available/:user_id", isIdAvailable);

router.get("/users/is-email-available/:user_email", isEmailAvailable);

router.patch("/users/status", updateUserStatus);

router.delete("/users", verifyToken, verifySuperAdmin, deleteUserAccount);

// router.post("/update-password", updateUserPassword);

router.post("/add-user", verifyToken, verifySuperAdmin, addUser);

router.get("/searchUsers", searchUsers);

router.patch("/users/personal-details", updatePersonalDetails);

export default router;
