import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleBanUser,
  deleteUser,
  getMe,
  updateMe,
  updatePassword
} from '../controllers/user.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';

const router = Router();

// Các routes dành cho User đang đăng nhập quản lý hồ sơ của chính họ
router.get('/profile', protect, getMe);
router.put('/profile', protect, uploadSingle('avatar'), updateMe);
router.put('/password', protect, updatePassword);

// Tất cả routes dưới đây đều cần đăng nhập + quyền Admin
router.use(protect, restrictTo('admin'));

router.get('/',          getAllUsers);
router.get('/:id',       getUserById);
router.patch('/:id/role', updateUserRole);
router.patch('/:id/ban',  toggleBanUser);
router.delete('/:id',    deleteUser);

export default router;
