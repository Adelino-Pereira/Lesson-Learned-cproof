const express = require('express');
const cors = require('cors');
const path = require('path');
const { initSchema } = require('./database');
const { seedIfEmpty } = require('./seed');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API routes
app.use('/api', apiRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve Angular frontend (production build)
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Initialize database and start server
initSchema();
seedIfEmpty();

app.listen(PORT, () => {
  console.log(`[SERVER] Backend running on http://localhost:${PORT}`);
});
