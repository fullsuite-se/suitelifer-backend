import express from 'express';
import { deleteSetup, getSetups as getAllSetups, insertSetup, updateSetup } from "../controllers/setupController.js";

const router = express.Router();

router.get("/get-all-setups", getAllSetups);

router.post("/add-setup", insertSetup);

router.post("/update-setup", updateSetup);

router.post("/delete-setup", deleteSetup);

export default router;