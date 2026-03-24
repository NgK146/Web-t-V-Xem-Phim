import { Router } from 'express';
import { getShowtimesByMovie, getShowtimeDetails } from '../controllers/showtime.controller.js';

const router = Router();

router.get('/movie/:movieId', getShowtimesByMovie);
router.get('/:id', getShowtimeDetails);

export default router;
