import express from "express";
import {
  getUsers,
  updateUserPassword,
  updateUserStatus,
  updateUserType,
} from "../controllers/userController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifySuperAdmin from "../middlewares/verifySuperAdmin.js";

const router = express.Router();

router.get("/get-users", verifyToken, verifySuperAdmin, getUsers);

router.patch(
  "/update-user-type",
//   verifyToken,
//   verifySuperAdmin,
  updateUserType
);

router.patch(
  "/update-user-status",
//   verifyToken,
//   verifySuperAdmin,
  updateUserStatus
);

router.post("/update-password", updateUserPassword);

export default router;
