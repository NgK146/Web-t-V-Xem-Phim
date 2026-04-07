import { Router } from 'express';
import { getMovies, getMovie, createMovie, updateMovie,
         deleteMovie, getNowShowing, getComingSoon } from '../controllers/movie.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';

const router = Router();

router.get('/',            getMovies);
router.get('/now-showing', getNowShowing);
router.get('/coming-soon', getComingSoon);
router.get('/:id',         getMovie);

// Admin only
router.post('/',    protect, authorize('admin'), uploadSingle('poster'), createMovie);
router.put('/:id',  protect, authorize('admin'), uploadSingle('poster'), updateMovie);
router.delete('/:id', protect, authorize('admin'), deleteMovie);

export default router;
