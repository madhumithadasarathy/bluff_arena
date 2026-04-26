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
      votes: {},       // { voterId: targetId }
      hasVoted: [],    // [socketId]
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

  // ── game:startVoting ──
  socket.on('game:startVoting', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || !room.game) return;

    // Only host can manually trigger for now
    if (room.host !== socket.id) return;
    if (room.game.status !== 'playing') return;

    room.game.status = 'voting';
    room.game.votes = {};
    room.game.hasVoted = [];

    io.to(roomId).emit('game:phase', 'voting');
    console.log(`🗳️ Voting started in room ${roomId}`);
  });

  // ── vote:submit ──
  socket.on('vote:submit', ({ roomId, targetId }) => {
    const room = rooms[roomId];
    if (!room || !room.game) return;
    if (room.game.status !== 'voting') return;

    // Cannot vote for self
    if (socket.id === targetId) return;

    // Ignore if already voted
    if (room.game.hasVoted.includes(socket.id)) return;

    // Save vote
    room.game.votes[socket.id] = targetId;
    room.game.hasVoted.push(socket.id);

    // Emit update
    io.to(roomId).emit('vote:update', {
      totalVotes: room.game.hasVoted.length,
      totalPlayers: room.players.length,
    });

    // Check if everyone voted
    if (room.game.hasVoted.length === room.players.length) {
      endVoting(io, roomId, room);
    }
  });
};

const endVoting = (io, roomId, room) => {
  room.game.status = 'result';

  // Count votes
  const voteCounts = {};
  Object.values(room.game.votes).forEach((targetId) => {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
  });

  // Find most voted player
  let mostVotedId = null;
  let maxVotes = 0;
  Object.entries(voteCounts).forEach(([targetId, count]) => {
    if (count > maxVotes) {
      maxVotes = count;
      mostVotedId = targetId;
    }
  });

  const isLiarCaught = mostVotedId === room.game.liarId;

  io.to(roomId).emit('vote:result', {
    votedPlayerId: mostVotedId,
    liarId: room.game.liarId,
    isLiarCaught,
    voteBreakdown: room.game.votes,
  });

  console.log(`🏁 Voting ended in room ${roomId} - Liar Caught? ${isLiarCaught}`);
};

module.exports = { registerGameHandlers };
