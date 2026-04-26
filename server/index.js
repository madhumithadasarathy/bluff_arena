require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { connectDB, getDBStatus } = require('./config/db');
const healthRoutes = require('./routes/health');
const { registerRoomHandlers } = require('./socket/roomHandler');

// ── App & Server ──
const app = express();
const server = http.createServer(app);

// ── Middleware ──
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ── API Routes ──
app.use('/api', healthRoutes);

// ── Socket.io ──
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`🟢 Client connected:    ${socket.id}`);

  // Register room events for this socket
  registerRoomHandlers(io, socket);

  socket.on('disconnect', (reason) => {
    console.log(`🔴 Client disconnected: ${socket.id} — ${reason}`);
  });
});

// ── Start ──
const PORT = process.env.PORT || 5000;

// Start Express + Socket.io immediately (non-blocking)
server.listen(PORT, () => {
  console.log(`\n🚀 Bluff Arena server listening on http://localhost:${PORT}`);
  console.log(`   Health check → http://localhost:${PORT}/api/health\n`);
});

// Connect to MongoDB in the background (retries automatically)
connectDB();

// Export for use by routes (e.g. health check)
module.exports = { app, server, io, getDBStatus };
