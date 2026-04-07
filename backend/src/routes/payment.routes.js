import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { createPayOSPayment, payOSWebhook, checkPaymentStatus } from '../controllers/payment.controller.js';

const router = Router();

// ── PayOS ──────────────────────────────────────────────
router.post('/payos/create-link', protect, createPayOSPayment);
router.get('/payos/status/:orderCode', checkPaymentStatus);
router.post('/payos/webhook', payOSWebhook); // No auth — called by PayOS server

export default router;
