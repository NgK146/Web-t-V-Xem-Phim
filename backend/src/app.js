import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
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
import { initSeatSocket } from './sockets/seat.socket.js';

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] },
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
app.use('/uploads', express.static('public/uploads'));

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

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Global error handler
app.use((err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: err.stack,
    errors: err.errors || [],
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

initSeatSocket(io);

export default httpServer;
