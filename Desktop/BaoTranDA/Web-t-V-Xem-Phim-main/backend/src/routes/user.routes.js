import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleBanUser,
  deleteUser,
} from '../controllers/user.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = Router();

// Tất cả routes dưới đây đều cần đăng nhập + quyền Admin
router.use(protect, restrictTo('admin'));

router.get('/',          getAllUsers);
router.get('/:id',       getUserById);
router.patch('/:id/role', updateUserRole);
router.patch('/:id/ban',  toggleBanUser);
router.delete('/:id',    deleteUser);

export default router;
