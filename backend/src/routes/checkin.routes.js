import { Router } from 'express';
import { lookupBooking, performCheckin, getTodayCheckins, serveFoods, getMyShiftReport } from '../controllers/checkin.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = Router();

// Tất cả route check-in yêu cầu đăng nhập + quyền staff hoặc admin
router.use(protect, restrictTo('staff', 'admin'));

router.get('/my-shift',            getMyShiftReport);
router.get('/lookup/:bookingCode', lookupBooking);
router.post('/:bookingId',        performCheckin);
router.post('/:bookingId/fnb',    serveFoods);
router.get('/today',               getTodayCheckins);

export default router;
