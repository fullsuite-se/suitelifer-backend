import express from "express";
import {
  getAllPolicy,
  addPolicy,
  updatePolicy,
  deletePolicy,
} from "../controllers/privacyPolicyController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.get("/get-all-policy", getAllPolicy);
router.post("/add-policy", verifyToken, verifyAdmin, addPolicy);
router.put("/edit-policy", verifyToken, verifyAdmin, updatePolicy);
router.delete("/delete-policy", verifyToken, verifyAdmin, deletePolicy);

export default router;
