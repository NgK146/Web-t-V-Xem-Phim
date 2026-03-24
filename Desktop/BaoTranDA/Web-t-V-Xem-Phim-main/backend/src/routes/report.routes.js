import { Router } from 'express';
import { getDashboard, exportRevenueExcel } from '../controllers/report.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

router.use(protect, authorize('admin'));
router.get('/dashboard', getDashboard);
router.get('/export-excel', exportRevenueExcel);

export default router;
