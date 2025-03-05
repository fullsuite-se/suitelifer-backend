import express from 'express';
import { getLastSalaryRange, getSalaryRange, insertSalaryRange, updateSalaryRange } from '../controllers/salaryRangeController';

const router = express.Router();

router.get("/last-salary-range", getLastSalaryRange);

router.get("/salary-range", getSalaryRange);

router.post("/insert-salary-range", insertSalaryRange);

router.post("/update-salary-range", updateSalaryRange);

export default router;