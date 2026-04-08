import { Router } from 'express';
import { getMyLoyalty, redeemReward } from '../controllers/loyalty.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/me', getMyLoyalty);
router.post('/redeem', redeemReward);

export default router;
