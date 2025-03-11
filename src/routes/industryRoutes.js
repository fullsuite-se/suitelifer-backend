import express from "express";
import {
  deleteIndustry,
  getAllIndustries,
  getAllIndustriesHR,
  getAllIndustriesPR,
  insertIndustry,
  updateIndustry,
} from "../controllers/industryController.js";

const router = express.Router();

router.get("/get-all-industries", getAllIndustries);

router.get("/get-all-industries-hr", getAllIndustriesHR);

router.get("/get-all-industries-pr", getAllIndustriesPR);

router.post("/add-industry", insertIndustry);

router.post("/edit-industry", updateIndustry);

router.post("/delete-industry", deleteIndustry);

export default router;
