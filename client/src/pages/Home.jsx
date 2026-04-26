import { useEffect, useState } from 'react';
import { Box, TextField, Button, Stack, Typography } from '@mui/material';
import socket from '../socket';
import Lobby from './Lobby';

export default function Home() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  // Room state
  const [username, setUsername] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [host, setHost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log('✅ Connected to server:', socket.id);
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log('❌ Disconnected from server');
    }

    function onRoomCreated({ roomId }) {
      setRoomId(roomId);
      setError('');
    }

    function onRoomPlayers({ roomId, host, players }) {
      setRoomId(roomId);
      setHost(host);
      setPlayers(players);
      setError('');
    }

    function onRoomError({ message }) {
      setError(message);
    }

    function onGameScoreboard({ players }) {
      setPlayers(players);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room:created', onRoomCreated);
    socket.on('room:players', onRoomPlayers);
    socket.on('room:error', onRoomError);
    socket.on('game:scoreboard', onGameScoreboard);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('room:created', onRoomCreated);
      socket.off('room:players', onRoomPlayers);
      socket.off('room:error', onRoomError);
      socket.off('game:scoreboard', onGameScoreboard);
    };
  }, []);

  const createRoom = () => {
    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }
    socket.emit('room:create', { username: username.trim() });
  };

  const joinRoom = () => {
    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }
    if (!joinCode.trim()) {
      setError('Please enter a room code.');
      return;
    }
    socket.emit('room:join', { roomId: joinCode.trim().toUpperCase(), username: username.trim() });
  };

  const leaveRoom = () => {
    socket.emit('room:leave');
    setRoomId(null);
    setPlayers([]);
    setHost(null);
    setError('');
  };

  // ── Lobby View ──
  if (roomId) {
    return <Lobby roomId={roomId} players={players} host={host} username={username} onLeave={leaveRoom} />;
  }

  // ── Home View ──
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]"
           style={{ background: 'radial-gradient(circle, var(--clr-primary) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
           style={{ background: 'radial-gradient(circle, var(--clr-accent) 0%, transparent 70%)' }} />

      {/* Main Content */}
      <div className="relative z-10 text-center animate-fade-in-up">
        {/* Logo / Title */}
        <div className="mb-6">
          <span className="inline-block text-sm font-medium tracking-[0.3em] uppercase mb-4 px-4 py-1.5 rounded-full border"
                style={{ color: 'var(--clr-primary-glow)', borderColor: 'var(--clr-border)', background: 'rgba(212, 175, 55, 0.1)' }}>
            🃏 Card Game
          </span>
        </div>

        <h1 className="text-7xl md:text-8xl font-black tracking-tight mb-4 gradient-text"
            style={{ fontFamily: 'var(--font-heading)' }}>
          Bluff Arena
        </h1>

        <p className="text-lg md:text-xl max-w-lg mx-auto mb-10"
           style={{ color: 'var(--clr-text-muted)' }}>
          The ultimate multiplayer bluffing card game.
          <br />Outsmart. Deceive. Win.
        </p>

        {/* Room Controls */}
        <Box className="glass p-6 max-w-sm mx-auto text-left" sx={{ borderRadius: 4 }}>
          {/* Username */}
          <TextField
            id="input-username"
            label="Enter your name"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            inputProps={{ maxLength: 20 }}
            sx={{ mb: 2 }}
          />

          {/* Create Room */}
          <Button
            id="btn-create-room"
            onClick={createRoom}
            disabled={!isConnected}
            variant="contained"
            fullWidth
            size="large"
            sx={{
              background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
              color: 'white',
              py: 1.5,
              borderRadius: 3,
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: '0px 4px 20px rgba(212,175,55,0.4)',
              }
            }}
          >
            Create Room
          </Button>

          {/* Divider */}
          <Box className="flex items-center gap-3 my-4">
            <Box className="flex-1 h-px" sx={{ background: 'var(--clr-border)' }} />
            <Typography variant="caption" sx={{ color: 'var(--clr-text-muted)' }}>or join</Typography>
            <Box className="flex-1 h-px" sx={{ background: 'var(--clr-border)' }} />
          </Box>

          {/* Join Room */}
          <Stack direction="row" spacing={1}>
            <TextField
              id="input-room-code"
              label="Room code"
              variant="outlined"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              inputProps={{ maxLength: 5, style: { textTransform: 'uppercase', letterSpacing: '0.2em', fontFamily: 'monospace', fontWeight: 'bold' } }}
              sx={{ flex: 1 }}
            />
            <Button
              id="btn-join-room"
              onClick={joinRoom}
              disabled={!isConnected}
              variant="outlined"
              sx={{
                px: 3,
                borderRadius: 3,
                borderColor: 'rgba(212, 175, 55, 0.3)',
                color: 'primary.main',
                background: 'rgba(212, 175, 55, 0.05)',
                '&:hover': {
                  background: 'rgba(212, 175, 55, 0.15)',
                  transform: 'scale(1.05)',
                }
              }}
            >
              Join
            </Button>
          </Stack>

          {/* Error */}
          {error && (
            <Typography variant="caption" sx={{ color: '#ff7675', display: 'block', mt: 2, px: 1 }}>
              {error}
            </Typography>
          )}
        </Box>

        {/* Connection Status */}
        <div className="mt-8 glass inline-flex items-center gap-3 px-5 py-2.5">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
          <span className="text-sm font-medium" style={{ color: 'var(--clr-text-muted)' }}>
            {isConnected ? 'Connected to server' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Decorative Cards */}
      <div className="absolute bottom-10 left-10 text-6xl opacity-10 animate-float" style={{ animationDelay: '0s' }}>
        🂡
      </div>
      <div className="absolute top-20 right-16 text-5xl opacity-10 animate-float" style={{ animationDelay: '1.5s' }}>
        🂮
      </div>
      <div className="absolute bottom-32 right-28 text-4xl opacity-10 animate-float" style={{ animationDelay: '3s' }}>
        🃏
      </div>
    </div>
  );
}
