/**
 * index.js — Express application entry point.
 * Sets up middleware, mounts API routes, serves static files,
 * initializes the database schema, seeds demo data, and starts the server.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { initSchema } = require('./database');
const { seedIfEmpty } = require('./seed');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());                                  // Allow cross-origin requests (Angular dev server)
app.use(express.json());                          // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));  // Parse URL-encoded form data

// Serve uploaded files (documents, images) as static assets
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Mount all API routes under /api prefix
app.use('/api', apiRoutes);

// Health check endpoint for monitoring / Docker health checks
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// --- Static frontend serving (production/Docker) ---
// Serves the Angular build output and falls back to index.html for SPA routing
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// --- Startup: initialize DB schema and seed demo data ---
initSchema();   // Creates tables if they don't exist
seedIfEmpty();  // Inserts demo data on first run

app.listen(PORT, () => {
  console.log(`[SERVER] Backend running on http://localhost:${PORT}`);
});
