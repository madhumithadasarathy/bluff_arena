const express = require('express');
const router = express.Router();
const { getDBStatus } = require('../config/db');

// GET /api/health
router.get('/health', (req, res) => {
  const db = getDBStatus();

  const status = db.connected ? 'ok' : 'degraded';
  const httpCode = db.connected ? 200 : 503;

  res.status(httpCode).json({
    status,
    message: db.connected
      ? 'Bluff Arena server is running 🚀'
      : 'Server is running but MongoDB is unavailable ⚠️',
    timestamp: new Date().toISOString(),
    database: {
      connected: db.connected,
      host: db.host,
      name: db.name,
    },
  });
});

module.exports = router;
