import express from "express";
import {
  deleteUserAccount,
  getUsers,
  updateUserPassword,
  updateUserStatus,
  updateUserType,
} from "../controllers/userController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifySuperAdmin from "../middlewares/verifySuperAdmin.js";

const router = express.Router();

// router.get("/get-users", verifyToken, verifySuperAdmin, getUsers);
router.get("/users", getUsers);

router.patch(
  "/users/type",
  verifyToken,
  verifySuperAdmin,
  updateUserType
);

router.patch(
  "/users/status",
  verifyToken,
  verifySuperAdmin,
  updateUserStatus
);

router.patch(
  "/delete-user-account",
  verifyToken,
  verifySuperAdmin,
  deleteUserAccount
);

router.post("/update-password", updateUserPassword);

export default router;
