import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

app.use(limiter);
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Routes placeholders
import categoriesRouter from './routes/categories';
import mangasRouter from './routes/mangas';
import chaptersRouter from './routes/chapters';
import statsRouter from './routes/stats';
import authRouter from './routes/auth';
import sourcesRouter from './routes/sources';
import usersRouter from './routes/users';
import { setupSwagger } from './config/swagger';

setupSwagger(app);

app.use('/api/categories', categoriesRouter);
app.use('/api/mangas', mangasRouter);
app.use('/api/chapters', chaptersRouter);
app.use('/api/stats', statsRouter);
app.use('/api/auth', authRouter);
app.use('/api/sources', sourcesRouter);
app.use('/api/users', usersRouter);

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

export default app;
