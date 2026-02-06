import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { workerRouter } from './routes/workers';
import { clientRouter } from './routes/clients';
import { projectRouter } from './routes/projects';
import { clientPriceRouter } from './routes/clientPriceRouter';
import workLogRoutes from "./routes/workLog";
import priceRoutes from "./routes/pricesUpdate";
import { dashboardRouter } from './routes/dashboardRouter';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logovanje zahteva (opciono, ali super za debug)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/workers', workerRouter);
app.use('/api/clients', clientRouter);
app.use('/api/projects', projectRouter);
app.use("/api/prices", priceRoutes);
app.use("/api/client-prices", clientPriceRouter);
app.use("/api/dashboard", dashboardRouter);

// Karnet i Isplate (montirano na /api jer unutar fajla već imaju prefikse)
app.use("/api", workLogRoutes); 

// 404 Fallback - ako ruta ne postoji
app.use((req, res) => {
  res.status(404).json({ message: `Ruta ${req.originalUrl} nije pronađena na serveru.` });
});

// GLOBALNI ERROR HANDLER (Rešava problem sa HTML errorima)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const status = err.status || 500;
  console.error(`❌ Greška na ${req.method} ${req.url}:`, err.message);
  res.status(status).json({
    message: err.message || "Dogodila se greška na serveru",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 EDIFICA PRO API - Server je podignut na portu ${PORT}`);
});