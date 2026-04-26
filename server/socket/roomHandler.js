// ── In-memory room store ──
const rooms = {};

/**
 * Generate a random 5-character room ID.
 */
const generateRoomId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous I/O/0/1
  let id = '';
  for (let i = 0; i < 5; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

/**
 * Find the room a socket belongs to.
 * Returns { roomId, room } or null.
 */
const findRoomBySocket = (socketId) => {
  for (const [roomId, room] of Object.entries(rooms)) {
    if (room.players.some((p) => p.id === socketId)) {
      return { roomId, room };
    }
  }
  return null;
};

/**
 * Remove a player from their room, reassign host or delete if empty.
 * Returns { roomId, room } of the affected room, or null.
 */
const removePlayerFromRoom = (socketId) => {
  const found = findRoomBySocket(socketId);
  if (!found) return null;

  const { roomId, room } = found;

  // Remove the player
  room.players = room.players.filter((p) => p.id !== socketId);

  // Room is empty → delete it
  if (room.players.length === 0) {
    delete rooms[roomId];
    console.log(`🗑️  Room ${roomId} deleted (empty)`);
    return { roomId, room: null };
  }

  // Host left → assign next player as host
  if (room.host === socketId) {
    room.host = room.players[0].id;
    console.log(`👑 Room ${roomId} new host: ${room.players[0].username}`);
  }

  return { roomId, room };
};

/**
 * Register all room-related socket events on a given socket.
 */
const registerRoomHandlers = (io, socket) => {
  // ── room:create ──
  socket.on('room:create', ({ username }) => {
    // Prevent joining multiple rooms
    const existing = findRoomBySocket(socket.id);
    if (existing) {
      socket.emit('room:error', { message: 'You are already in a room.' });
      return;
    }

    const roomId = generateRoomId();

    rooms[roomId] = {
      host: socket.id,
      players: [{ id: socket.id, username, score: 0 }],
    };

    socket.join(roomId);
    socket.emit('room:created', { roomId });
    io.to(roomId).emit('room:players', {
      roomId,
      host: rooms[roomId].host,
      players: rooms[roomId].players,
    });

    console.log(`🏠 Room ${roomId} created by ${username} (${socket.id})`);
  });

  // ── room:join ──
  socket.on('room:join', ({ roomId, username }) => {
    // Prevent joining multiple rooms
    const existing = findRoomBySocket(socket.id);
    if (existing) {
      socket.emit('room:error', { message: 'You are already in a room.' });
      return;
    }

    const room = rooms[roomId];

    if (!room) {
      socket.emit('room:error', { message: `Room "${roomId}" not found.` });
      return;
    }

    room.players.push({ id: socket.id, username, score: 0 });
    socket.join(roomId);

    io.to(roomId).emit('room:players', {
      roomId,
      host: room.host,
      players: room.players,
    });

    console.log(`➕ ${username} (${socket.id}) joined room ${roomId}`);
  });

  // ── room:leave ──
  socket.on('room:leave', () => {
    handleLeave(io, socket);
  });

  // ── disconnect (cleanup) ──
  socket.on('disconnect', () => {
    handleLeave(io, socket);
  });
};

/**
 * Shared leave / disconnect logic.
 */
const handleLeave = (io, socket) => {
  const result = removePlayerFromRoom(socket.id);
  if (!result) return;

  const { roomId, room } = result;
  socket.leave(roomId);

  if (room) {
    io.to(roomId).emit('room:players', {
      roomId,
      host: room.host,
      players: room.players,
    });
  }
};

module.exports = { registerRoomHandlers, rooms };
