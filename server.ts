import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import authRouter from './server/routes/auth.js';
import complaintsRouter from './server/routes/complaints.js';
import adminRouter from './server/routes/admin.js';
import notificationsRouter from './server/routes/notifications.js';
import { authMiddleware } from './server/middleware/auth.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Global auth extractor
  app.use(authMiddleware);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CivicResolve Municipal Engine',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/complaints', complaintsRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/notifications', notificationsRouter);

  // Development vs Production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicResolve server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
