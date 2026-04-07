import { Router } from 'express';
import { createReview, getMovieReviews, deleteReview, checkEligibility } from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/movie/:movieId', getMovieReviews);

router.use(protect);
router.get('/eligibility/:movieId', checkEligibility);
router.post('/', createReview);
router.delete('/:id', deleteReview);

export default router;
