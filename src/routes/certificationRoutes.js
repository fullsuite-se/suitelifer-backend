import express from "express";
import {
  getAllCertifications,
  addCert,
  updateCert,
  deleteCert,
} from "../controllers/certificationController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.get("/certification", getAllCertifications);

router.post("/certification", verifyToken, verifyAdmin, addCert);

router.put("/certification", verifyToken, verifyAdmin, updateCert);

router.delete("/certification", verifyToken, verifyAdmin, deleteCert);

export default router;
