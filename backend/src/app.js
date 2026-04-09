import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import movieRoutes from './routes/movie.routes.js';
import cinemaRoutes from './routes/cinema.routes.js';
import showtimeRoutes from './routes/showtime.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import reviewRoutes from './routes/review.routes.js';
import discountRoutes from './routes/discount.routes.js';
import reportRoutes from './routes/report.routes.js';
import foodRoutes from './routes/food.routes.js';
import loyaltyRoutes from './routes/loyalty.routes.js';
import aiChatRoutes from './routes/aiChat.routes.js';
import checkinRoutes from './routes/checkin.routes.js';
import { initSeatSocket } from './sockets/seat.socket.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'], credentials: true },
});

// Bind io to app for controllers to access without cyclic dependencies
app.set('io', io);

// Rate Limiter: Chống spam 5 request / 10s
const apiLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 5, // Limit each IP to 5 requests per `window` (here, per 10 seconds)
  message: {
    success: false,
    message: 'Bạn đã thao tác quá nhanh, vui lòng chờ 10 giây trước khi thử lại.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Middlewares
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(morgan('dev'));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all requests
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth',      authRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/movies',    movieRoutes);
app.use('/api/cinemas',   cinemaRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings',  bookingRoutes);
app.use('/api/payments',  paymentRoutes);
app.use('/api/reviews',   reviewRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/reports',   reportRoutes);
app.use('/api/foods',     foodRoutes);
app.use('/api/loyalty',   loyaltyRoutes);
app.use('/api/ai',        aiChatRoutes);
app.use('/api/checkin',   checkinRoutes);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Global error handler
app.use(errorHandler);

initSeatSocket(io);

export default httpServer;
