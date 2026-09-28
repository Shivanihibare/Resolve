/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * IGNOU BCA Major Project BCSP-064
 * Project Title: AI-Driven IT Service Desk and Automated Ticket Triage System
 * Server Entry Point running Express + Vite Middleware on Port 3000
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './server/api.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Body parser for JSON REST requests
  app.use(express.json());

  // Mount API router
  app.use('/api/v1', apiRouter);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      project: 'AI-Driven IT Service Desk and Automated Ticket Triage System',
      course: 'IGNOU BCSP-064',
      uptime: process.uptime(),
    });
  });

  // Development: Mount Vite middleware for React SPA
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`================================================================`);
    console.log(`IGNOU BCA BCSP-064 Major Project Server Running`);
    console.log(`Title: AI-Driven IT Service Desk and Automated Ticket Triage System`);
    console.log(`Listening on: http://0.0.0.0:${PORT}`);
    console.log(`API Base:     http://0.0.0.0:${PORT}/api/v1`);
    console.log(`================================================================`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
