const { rooms } = require('./roomHandler');

// ── Hardcoded prompt pairs ──
const promptPairs = [
  { truth: 'Dog', lie: 'Wolf' },
  { truth: 'Pizza', lie: 'Burger' },
  { truth: 'Beach', lie: 'Desert' },
  { truth: 'Car', lie: 'Bike' },
  { truth: 'Guitar', lie: 'Violin' },
  { truth: 'Coffee', lie: 'Tea' },
  { truth: 'Moon', lie: 'Sun' },
  { truth: 'Sneakers', lie: 'Boots' },
  { truth: 'Painting', lie: 'Sculpture' },
  { truth: 'Rain', lie: 'Snow' },
];

/**
 * Register game-related socket events on a given socket.
 */
const registerGameHandlers = (io, socket) => {
  // ── game:start ──
  socket.on('game:start', ({ roomId }) => {
    const room = rooms[roomId];

    if (!room) {
      socket.emit('room:error', { message: 'Room not found.' });
      return;
    }

    // Only host can start
    if (room.host !== socket.id) {
      socket.emit('room:error', { message: 'Only the host can start the game.' });
      return;
    }

    // Minimum 3 players
    if (room.players.length < 3) {
      socket.emit('room:error', { message: 'Need at least 3 players to start.' });
      return;
    }

    // Already playing
    if (room.game && room.game.status === 'playing') {
      socket.emit('room:error', { message: 'Game is already in progress.' });
      return;
    }

    // Pick a random liar
    const liarIndex = Math.floor(Math.random() * room.players.length);
    const liarId = room.players[liarIndex].id;

    // Pick a random prompt pair
    const pair = promptPairs[Math.floor(Math.random() * promptPairs.length)];

    // Initialize score if not present
    room.players.forEach((p) => {
      if (p.score === undefined) p.score = 0;
    });

    // Save game state in room
    room.game = {
      status: 'playing',
      liarId,
      prompts: pair,
    };

    // Emit role PRIVATELY to each player
    room.players.forEach((player) => {
      const isLiar = player.id === liarId;
      io.to(player.id).emit('game:role', {
        role: isLiar ? 'liar' : 'truth',
        prompt: isLiar ? pair.lie : pair.truth,
      });
    });

    // Emit to entire room that game has started
    io.to(roomId).emit('game:started', {
      playerCount: room.players.length,
    });

    const liarName = room.players[liarIndex].username;
    console.log(`🎮 Game started in room ${roomId} — Liar: ${liarName} | Truth: "${pair.truth}" / Lie: "${pair.lie}"`);
  });
};

module.exports = { registerGameHandlers };
