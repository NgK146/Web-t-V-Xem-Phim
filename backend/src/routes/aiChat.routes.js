import { Router } from 'express';
import { chatWithMovieAI } from '../controllers/aiChat.controller.js';

const router = Router();

router.post('/movie-chat', chatWithMovieAI);

export default router;
