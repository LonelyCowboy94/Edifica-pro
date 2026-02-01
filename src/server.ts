import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { workerRouter } from './routes/workers';
import { clientRouter } from './routes/clients';
import { projectRouter } from './routes/projects';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect routes
app.use('/api/auth', authRouter);
app.use('/api/workers', workerRouter);
app.use('/api/clients', clientRouter);
app.use('/api/projects', projectRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 API Server is running on port ${PORT}`);
});