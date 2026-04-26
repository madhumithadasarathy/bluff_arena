import { useState, useEffect, useRef } from 'react';
import socket from '../socket';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundManager';

const getAvatarColor = (name) => {
  const colors = [
    'linear-gradient(135deg, #8b0000, #4a0000)', // Deep Red
    'linear-gradient(135deg, #d4af37, #aa8623)', // Gold
    'linear-gradient(135deg, #183b2b, #0b1f17)', // Dark Green
    'linear-gradient(135deg, #444444, #1a1a1a)', // Charcoal
    'linear-gradient(135deg, #b87333, #8a501c)', // Copper/Bronze
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const getSuit = (name) => {
  const suits = [
    { symbol: '♠', color: 'var(--clr-text-muted)' },
    { symbol: '♥', color: '#8b0000' },
    { symbol: '♦', color: '#8b0000' },
    { symbol: '♣', color: 'var(--clr-text-muted)' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return suits[Math.abs(hash) % suits.length];
};

function TiltCard({ children, isSelected, disabled, onClick, dimOthers }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e) => {
    if (disabled || isSelected) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      style={{
        rotateX: disabled && !isSelected ? 0 : rotateX,
        rotateY: disabled && !isSelected ? 0 : rotateY,
        transformStyle: "preserve-3d",
        background: isSelected ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.02)',
        borderColor: isSelected ? 'var(--clr-primary)' : 'rgba(212, 175, 55, 0.2)',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={`relative p-5 rounded-xl transition-all duration-300 border flex flex-col items-center justify-center
        ${isSelected ? 'shadow-[0_8px_30px_rgba(212,175,55,0.4)] -translate-y-2' : ''}
        ${dimOthers ? 'opacity-40 grayscale-[50%]' : 'opacity-100'}
        ${disabled && !isSelected ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:border-opacity-100 hover:shadow-[0_8px_20px_rgba(0,0,0,0.5)]'}
      `}
    >
      <div style={{ transform: "translateZ(30px)" }}>
        {children}
      </div>
    </motion.button>
  );
}

function FlipCard({ role, prompt }) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setIsFlipped(true);
      sounds.playFlip();
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const isLiar = role === 'liar';

  return (
    <motion.div 
      key="playing"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.3 }}
      className="mb-8 w-full max-w-sm mx-auto h-[320px] md:h-[360px]" 
      style={{ perspective: 1200 }}
    >
      <motion.div
        className="w-full h-full relative"
        initial={{ rotateY: 180 }}
        animate={{ rotateY: isFlipped ? 0 : 180 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of the Card (Face up) */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
          style={{
            backfaceVisibility: "hidden",
            background: 'var(--clr-card-bg)',
            border: `2px solid ${isLiar ? '#8b0000' : '#d4af37'}`,
            color: 'var(--clr-card-text)'
          }}
        >
          <div className="mb-4">
            <span className="text-4xl drop-shadow-md">{isLiar ? '🤥' : '🎭'}</span>
          </div>
          <h3 className="text-xl uppercase tracking-widest font-bold mb-1"
              style={{ color: isLiar ? '#8b0000' : '#aa8623', fontFamily: 'var(--font-heading)' }}>
            {isLiar ? 'You are the Liar' : 'You have the Truth'}
          </h3>
          <p className="text-sm font-medium opacity-70 mb-6 uppercase tracking-wider">Your Prompt</p>
          <p className="text-4xl md:text-5xl font-black drop-shadow-sm" style={{ fontFamily: 'var(--font-heading)' }}>
            {prompt}
          </p>
          <p className="text-xs mt-8 opacity-70 font-medium">
            {isLiar ? 'Blend in! Others have a different word.' : 'Discuss carefully — find the liar!'}
          </p>
        </div>

        {/* Back of the Card (Face down) */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl p-3 shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: 'var(--clr-surface)',
            border: '2px solid rgba(212, 175, 55, 0.5)',
          }}
        >
          <div className="w-full h-full rounded-xl border border-dashed border-[#d4af37]/30 flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'var(--clr-surface-light)' }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#d4af37 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            <div className="text-6xl drop-shadow-md mb-2">🃏</div>
            <div className="font-black tracking-[0.3em] uppercase text-xs" style={{ color: 'var(--clr-primary)', fontFamily: 'var(--font-heading)' }}>Bluff Arena</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Lobby({ roomId, players, host, username, onLeave }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef(null);

  // ── Game state ──
  const [gamePhase, setGamePhase] = useState('waiting'); // 'waiting' | 'playing' | 'voting' | 'result'
  const [role, setRole] = useState(null);       // "liar" | "truth"
  const [prompt, setPrompt] = useState(null);
  const [error, setError] = useState('');
  
  // ── Voting state ──
  const [votedFor, setVotedFor] = useState(null);
  const [voteUpdate, setVoteUpdate] = useState(null);
  const [voteResult, setVoteResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // ── Mute state ──
  const [isMuted, setIsMuted] = useState(sounds.muted);

  const toggleMute = () => {
    setIsMuted(sounds.toggleMute());
  };

  const isHost = socket.id === host;

  // ── Timer Sound ──
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && timeLeft <= 10) {
      sounds.playTick();
    }
  }, [timeLeft]);

  // ── Socket listeners ──
  useEffect(() => {
    function onChatMessage(payload) {
      setMessages((prev) => [...prev, payload]);
    }

    function onGameStarted() {
      setGamePhase('playing');
      setVotedFor(null);
      setVoteUpdate(null);
      setVoteResult(null);
      setTimeLeft(null);
    }

    function onGameRole({ role, prompt }) {
      setRole(role);
      setPrompt(prompt);
    }

    function onRoomError({ message }) {
      setError(message);
      setTimeout(() => setError(''), 3000);
    }

    function onGamePhase(phase) {
      setGamePhase(phase);
    }

    function onVoteUpdate(data) {
      setVoteUpdate(data);
    }

    function onVoteResult(data) {
      setGamePhase('result');
      setVoteResult(data);
      setTimeLeft(null);
      sounds.playReveal(data.isLiarCaught);
    }

    function onGameTimer({ timeLeft }) {
      setTimeLeft(timeLeft);
    }

    socket.on('chat:message', onChatMessage);
    socket.on('game:started', onGameStarted);
    socket.on('game:role', onGameRole);
    socket.on('room:error', onRoomError);
    socket.on('game:phase', onGamePhase);
    socket.on('vote:update', onVoteUpdate);
    socket.on('vote:result', onVoteResult);
    socket.on('game:timer', onGameTimer);

    return () => {
      socket.off('chat:message', onChatMessage);
      socket.off('game:started', onGameStarted);
      socket.off('game:role', onGameRole);
      socket.off('room:error', onRoomError);
      socket.off('game:phase', onGamePhase);
      socket.off('vote:update', onVoteUpdate);
      socket.off('vote:result', onVoteResult);
      socket.off('game:timer', onGameTimer);
    };
  }, []);

  // ── Auto-scroll to latest message ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Confetti Effect ──
  useEffect(() => {
    if (gamePhase === 'result' && voteResult && voteResult.isLiarCaught) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00cec9', '#a29bfe', '#fd79a8', '#ffffff']
      });
    }
  }, [gamePhase, voteResult]);

  const sendMessage = () => {
    if (!draft.trim()) return;
    socket.emit('chat:send', { roomId, message: draft.trim(), username });
    setDraft('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
  };

  const startGame = () => {
    socket.emit('game:start', { roomId });
  };

  const startVoting = () => {
    socket.emit('game:startVoting', { roomId });
  };

  const submitVote = (targetId) => {
    if (votedFor) return;
    sounds.playClick();
    setVotedFor(targetId);
    socket.emit('vote:submit', { roomId, targetId });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden py-8 px-4">
      
      {/* Mute Toggle */}
      <button 
        onClick={toggleMute}
        className="absolute top-4 right-4 z-50 p-3 rounded-full glass transition-transform hover:scale-110 active:scale-95"
        title={isMuted ? "Unmute sounds" : "Mute sounds"}
      >
        <span className="text-xl">{isMuted ? '🔇' : '🔊'}</span>
      </button>

      {/* Background Gradient Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]"
           style={{ background: 'radial-gradient(circle, var(--clr-primary) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
           style={{ background: 'radial-gradient(circle, var(--clr-accent) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-2xl animate-fade-in-up">
        {/* Timer UI */}
        {timeLeft !== null && gamePhase !== 'waiting' && gamePhase !== 'result' && (
          <div className="flex justify-center mb-6">
            <div 
              className={`flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 shadow-lg transition-colors duration-300 ${
                timeLeft <= 10 
                  ? 'border-red-500 shadow-red-500/50 animate-pulse text-red-500' 
                  : 'border-[var(--clr-primary)] shadow-[var(--clr-primary-glow)] text-white'
              }`}
              style={{ background: 'rgba(0, 0, 0, 0.4)' }}
            >
              <span className="text-3xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>
                {timeLeft}
              </span>
            </div>
          </div>
        )}

        {/* Room Header */}
        <div className="text-center mb-6">
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-2"
             style={{ color: 'var(--clr-text-muted)' }}>
            Room Code
          </p>
          <div className="inline-flex items-center gap-3">
            <h2 className="text-4xl font-black tracking-[0.3em] gradient-text"
                style={{ fontFamily: 'var(--font-heading)' }}>
              {roomId}
            </h2>
            <button
              onClick={copyRoomId}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
              style={{ background: 'rgba(212, 175, 55, 0.15)', color: 'var(--clr-primary)' }}
              title="Copy room code"
            >
              📋
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Role Card (Playing Phase) ── */}
          {gamePhase === 'playing' && role && (
            <FlipCard role={role} prompt={prompt} />
          )}

          {/* ── Voting UI (Voting Phase) ── */}
          {gamePhase === 'voting' && (
            <motion.div 
              key="voting"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-5"
            >
              <div className="glass p-5 text-center" style={{ borderColor: 'var(--clr-border)' }}>
                <h3 className="text-xl font-bold mb-2 gradient-text" style={{ fontFamily: 'var(--font-heading)' }}>
                  Who is the Liar?
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--clr-text-muted)' }}>
                  {voteUpdate 
                    ? `${voteUpdate.totalVotes} / ${voteUpdate.totalPlayers} voted` 
                    : 'Cast your vote!'}
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5" style={{ perspective: 1000 }}>
                  {players.map(p => {
                    const isSelf = p.id === socket.id;
                    const isSelected = votedFor === p.id;
                    const hasVoted = votedFor !== null;
                    const dimOthers = hasVoted && !isSelected;
                    
                    return (
                      <TiltCard
                        key={p.id}
                        isSelected={isSelected}
                        disabled={isSelf || hasVoted}
                        onClick={() => submitVote(p.id)}
                        dimOthers={dimOthers}
                      >
                        <div className="font-semibold text-lg truncate drop-shadow-md">
                          <span style={{ color: getSuit(p.username).color, marginRight: '4px' }}>{getSuit(p.username).symbol}</span>
                          {p.username}
                        </div>
                        {isSelf && <div className="text-xs mt-1" style={{ color: 'var(--clr-text-muted)' }}>(You)</div>}
                        {isSelected && <div className="text-xs mt-2 font-black tracking-widest drop-shadow-lg" style={{ color: 'var(--clr-primary)' }}>VOTED</div>}
                      </TiltCard>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Result UI (Result Phase) ── */}
          {gamePhase === 'result' && voteResult && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-5"
            >
              <div className="glass p-6 text-center" style={{ 
                borderColor: voteResult.isLiarCaught ? 'var(--clr-success)' : 'var(--clr-accent)',
              }}>
                <h3 className="text-3xl font-black mb-1" style={{ 
                  fontFamily: 'var(--font-heading)',
                  color: voteResult.isLiarCaught ? 'var(--clr-success)' : 'var(--clr-accent-glow)'
                }}>
                  {voteResult.isLiarCaught ? 'Liar Caught!' : 'Liar Escaped!'}
                </h3>
                
                <div className="my-4 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <p className="text-sm" style={{ color: 'var(--clr-text-muted)' }}>The liar was</p>
                  <p className="text-2xl font-bold mt-1">
                    {players.find(p => p.id === voteResult.liarId)?.username || 'Unknown'}
                  </p>
                  
                  {voteResult.votedPlayerId && voteResult.votedPlayerId !== voteResult.liarId && (
                    <p className="text-sm mt-3 text-gray-400">
                      Most voted: {players.find(p => p.id === voteResult.votedPlayerId)?.username}
                    </p>
                  )}
                </div>

                <div className="text-left mt-4">
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--clr-text-muted)' }}>Vote Breakdown</p>
                  <div className="space-y-1 text-sm">
                    {Object.entries(voteResult.voteBreakdown).map(([voterId, targetId]) => {
                      const voter = players.find(p => p.id === voterId)?.username || 'Unknown';
                      const target = players.find(p => p.id === targetId)?.username || 'Unknown';
                      return (
                        <div key={voterId} className="flex justify-between border-b border-gray-800 pb-1">
                          <span className="text-gray-300">{voter}</span>
                          <span className="text-gray-500">→</span>
                          <span className={targetId === voteResult.liarId ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                            {target}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Scoreboard Section */}
              <div className="text-left mt-6 pt-4 border-t border-gray-800">
                <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--clr-primary-glow)' }}>🏆 Scoreboard</p>
                <div className="space-y-2">
                  {[...players].sort((a, b) => b.score - a.score).map((p, index) => (
                    <motion.div 
                      key={p.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex justify-between items-center p-2 rounded-lg" 
                      style={{ background: index === 0 ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.05)' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}</span>
                        <span className={index === 0 ? 'font-bold text-[var(--clr-success)]' : 'text-gray-300'}>
                          <span style={{ color: getSuit(p.username).color, marginRight: '4px' }}>{getSuit(p.username).symbol}</span>
                          {p.username}
                        </span>
                      </div>
                      <span className="font-black text-lg">{p.score} <span className="text-xs text-gray-500 font-normal">pts</span></span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Two-column layout: Players + Chat */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

          {/* ── Players Card (2 cols) ── */}
          <div className="md:col-span-2 glass p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                Players
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(212, 175, 55, 0.15)', color: 'var(--clr-primary-glow)' }}>
                {players.length}
              </span>
            </div>

            <ul className="space-y-2">
              {players.map((player) => (
                <li
                  key={player.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200"
                  style={{
                    background: player.id === socket.id
                      ? 'rgba(212, 175, 55, 0.12)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: player.id === socket.id
                      ? '1px solid rgba(212, 175, 55, 0.3)'
                      : '1px solid transparent',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md"
                         style={{ background: getAvatarColor(player.username), color: '#fff' }}>
                      {player.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">
                      <span style={{ color: getSuit(player.username).color, marginRight: '4px' }}>{getSuit(player.username).symbol}</span>
                      {player.username}
                      {player.id === socket.id && (
                        <span className="text-xs ml-1" style={{ color: 'var(--clr-text-muted)' }}>(you)</span>
                      )}
                    </span>
                  </div>
                  {player.id === host && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(139, 0, 0, 0.15)', color: 'var(--clr-accent-glow)' }}>
                      👑
                    </span>
                  )}
                  
                  {/* Score */}
                  <div className="ml-auto">
                    <span className="text-xs font-bold px-2 py-1 rounded-md"
                          style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--clr-primary-glow)' }}>
                      {player.score || 0} pts
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {/* Start Game (host only, waiting or result phase) */}
            {isHost && (gamePhase === 'waiting' || gamePhase === 'result') && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="btn-start-game"
                onClick={startGame}
                className="w-full mt-4 px-4 py-2.5 rounded-xl font-semibold text-sm text-white shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-shadow hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] cursor-pointer"
                style={{ background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))' }}
              >
                🎮 {gamePhase === 'result' ? 'Play Again' : 'Start Game'}
              </motion.button>
            )}

            {/* Start Voting (host only, playing phase) */}
            {isHost && gamePhase === 'playing' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="btn-start-voting"
                onClick={startVoting}
                className="w-full mt-4 px-4 py-2.5 rounded-xl font-semibold text-sm text-white shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-shadow hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] cursor-pointer"
                style={{ background: 'linear-gradient(135deg, var(--clr-success), var(--clr-primary))' }}
              >
                🗳️ Start Voting
              </motion.button>
            )}

            {/* Error message */}
            {error && (
              <p className="text-xs text-center mt-2 px-1" style={{ color: '#ff7675' }}>
                {error}
              </p>
            )}

            {/* Waiting for host (non-host, not playing/voting) */}
            {!isHost && (gamePhase === 'waiting' || gamePhase === 'result') && (
              <p className="text-xs text-center mt-4 py-2" style={{ color: 'var(--clr-text-muted)' }}>
                Waiting for host to start...
              </p>
            )}

            {/* Leave Room */}
            <button
              onClick={onLeave}
              className={`w-full px-4 py-2 rounded-xl font-medium text-xs transition-all duration-200
                         hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${gamePhase !== 'waiting' || (!isHost) ? 'mt-4' : 'mt-2'}`}
              style={{
                background: 'rgba(139, 0, 0, 0.1)',
                border: '1px solid rgba(139, 0, 0, 0.25)',
                color: '#ff7675',
              }}
            >
              Leave Room
            </button>
          </div>

          {/* ── Chat Card (3 cols) ── */}
          <div className="md:col-span-3 glass p-5 flex flex-col" style={{ minHeight: '380px' }}>
            <h3 className="text-base font-semibold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              Chat
            </h3>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3"
              style={{ maxHeight: '280px' }}
            >
              {messages.length === 0 && (
                <p className="text-xs text-center py-8" style={{ color: 'var(--clr-text-muted)' }}>
                  No messages yet. Say hello! 👋
                </p>
              )}

              {messages.map((msg, i) => {
                const isMe = msg.username === username;
                const isLatest = i === messages.length - 1;
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {/* Username label */}
                    {!isMe && (
                      <span className="text-[10px] font-medium mb-0.5 ml-1"
                            style={{ color: 'var(--clr-primary-glow)' }}>
                        {msg.username}
                      </span>
                    )}
                    {/* Bubble */}
                    <div
                      className="max-w-[80%] px-3.5 py-2 rounded-2xl text-sm"
                      style={{
                        background: isMe
                          ? 'linear-gradient(135deg, var(--clr-primary), rgba(139, 0, 0, 0.7))'
                          : 'var(--clr-surface-light)',
                        border: isMe ? 'none' : '1px solid var(--clr-border)',
                        color: '#fff',
                        borderBottomRightRadius: isMe ? '6px' : '16px',
                        borderBottomLeftRadius: isMe ? '16px' : '6px',
                        boxShadow: isLatest && !isMe ? '0 0 10px rgba(212, 175, 55, 0.3)' : 'none'
                      }}
                    >
                      {msg.message}
                    </div>
                    {/* Timestamp */}
                    <span className="text-[10px] mt-0.5 mx-1" style={{ color: 'var(--clr-text-muted)' }}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                id="input-chat"
                type="text"
                placeholder="Type a message..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2"
                style={{
                  background: 'var(--clr-surface-light)',
                  border: '1px solid var(--clr-border)',
                  color: 'var(--clr-text)',
                  '--tw-ring-color': 'var(--clr-primary)',
                }}
              />
              <motion.button
                whileHover={draft.trim() ? { scale: 1.05 } : {}}
                whileTap={draft.trim() ? { scale: 0.95 } : {}}
                id="btn-send-chat"
                onClick={sendMessage}
                disabled={!draft.trim()}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200
                           cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))' }}
              >
                Send
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Cards */}
      <div className="absolute bottom-10 left-10 text-6xl opacity-10 animate-float" style={{ animationDelay: '0s' }}>
        🂡
      </div>
      <div className="absolute top-20 right-16 text-5xl opacity-10 animate-float" style={{ animationDelay: '1.5s' }}>
        🂮
      </div>
    </div>
  );
}
