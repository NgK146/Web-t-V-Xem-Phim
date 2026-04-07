import { Router } from 'express';
import {
  getActiveFoods,
  getAllFoodsAdmin,
  createFood,
  updateFood,
  deleteFood
} from '../controllers/food.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';

const router = Router();

// Public route for users
router.get('/', getActiveFoods);

// Admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/admin', getAllFoodsAdmin);
router.post('/', uploadSingle('image'), createFood);
router.put('/:id', uploadSingle('image'), updateFood);
router.delete('/:id', deleteFood);

export default router;
