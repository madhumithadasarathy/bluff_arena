const { rooms } = require('./roomHandler');

/**
 * Register chat-related socket events on a given socket.
 */
const registerChatHandlers = (io, socket) => {
  // ── chat:send ──
  socket.on('chat:send', ({ roomId, message, username }) => {
    // Validate message
    if (!message || !message.trim()) return;

    // Validate room exists
    if (!rooms[roomId]) {
      socket.emit('room:error', { message: 'Room not found.' });
      return;
    }

    const payload = {
      username,
      message: message.trim(),
      timestamp: Date.now(),
    };

    io.to(roomId).emit('chat:message', payload);
  });
};

module.exports = { registerChatHandlers };
