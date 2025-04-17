import express from "express";
import {
  getAllCert,
  addCert,
  updateCert,
  deleteCert,
} from "../controllers/certificationController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.get("/all-cert", verifyToken, getAllCert);

router.post("/add-cert", verifyToken, verifyAdmin, addCert);

router.put("/update-cert", verifyToken, verifyAdmin, updateCert);

router.delete("/delete-cert", verifyToken, verifyAdmin, deleteCert);

export default router;
