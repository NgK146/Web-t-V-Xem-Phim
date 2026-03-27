import { Router } from 'express';
import { 
  getCinemas, getCinema, createCinema, updateCinema, deleteCinema,
  getRooms, createRoom, updateRoom, deleteRoom 
} from '../controllers/cinema.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

// Public routes
router.get('/', getCinemas);
router.get('/:id', getCinema);
router.get('/:cinemaId/rooms', getRooms);

// Admin routes
router.use(protect, authorize('admin'));

router.post('/', createCinema);
router.put('/:id', updateCinema);
router.delete('/:id', deleteCinema);

router.post('/:cinemaId/rooms', createRoom);
router.put('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);

export default router;
