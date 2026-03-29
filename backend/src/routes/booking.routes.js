import { Router } from 'express';
import { createBooking, lockSeats, unlockSeats, cancelBooking,
         getMyBookings } from '../controllers/booking.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

router.use(protect);

router.get('/my-bookings',   getMyBookings);
router.post('/',             createBooking);
router.post('/lock-seats',   lockSeats);
router.post('/unlock-seats', unlockSeats);
router.patch('/:id/cancel',  cancelBooking);

export default router;
