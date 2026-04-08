import { Router } from 'express';
import { getDashboard, exportRevenueExcel, getAdvancedAnalytics } from '../controllers/report.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

router.use(protect, authorize('admin'));
router.get('/dashboard', getDashboard);
router.get('/advanced', getAdvancedAnalytics);
router.get('/export-excel', exportRevenueExcel);

export default router;
