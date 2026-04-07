import { Router } from 'express';
import { 
  getShowtimesByMovie, getShowtimeDetails,
  getAdminShowtimes, createShowtime, updateShowtime, deleteShowtime 
} from '../controllers/showtime.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

// Public routes
router.get('/movie/:movieId', getShowtimesByMovie);
router.get('/:id', getShowtimeDetails);

// Admin routes
router.use(protect, authorize('admin'));
router.get('/', getAdminShowtimes);
router.post('/', createShowtime);
router.put('/:id', updateShowtime);
router.delete('/:id', deleteShowtime);

export default router;
