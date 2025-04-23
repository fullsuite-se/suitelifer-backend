import express from "express";
import {
  getAllTerms,
  addTerms,
  updateTerms,
  deleteTerms,
} from "../controllers/termsOfUseController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.get("/get-all-terms", getAllTerms);
router.post("/add-terms", verifyToken, verifyAdmin, addTerms);
router.put("/edit-terms", verifyToken, verifyAdmin, updateTerms);
router.delete("/delete-terms", verifyToken, verifyAdmin, deleteTerms);

export default router;
