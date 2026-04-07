import { Router } from 'express';
import { 
  getDiscounts, createDiscount, updateDiscount, deleteDiscount, validateDiscount 
} from '../controllers/discount.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

// Public route for checkout
router.post('/validate', validateDiscount);

// Admin routes
router.use(protect, authorize('admin'));

router.get('/', getDiscounts);
router.post('/', createDiscount);
router.put('/:id', updateDiscount);
router.delete('/:id', deleteDiscount);

export default router;
