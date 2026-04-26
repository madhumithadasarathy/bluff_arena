import { useEffect, useState } from 'react';
import socket from '../socket';

export default function Home() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log('✅ Connected to server:', socket.id);
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log('❌ Disconnected from server');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

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
                style={{ color: 'var(--clr-primary-glow)', borderColor: 'var(--clr-border)', background: 'rgba(108, 92, 231, 0.08)' }}>
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

        {/* CTA Button */}
        <button
          id="btn-play"
          className="relative inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white text-lg
                     transition-all duration-300 cursor-pointer
                     hover:scale-105 hover:shadow-lg active:scale-95 animate-pulse-glow"
          style={{
            background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
          }}
        >
          ▶ Play Now
        </button>

        {/* Connection Status */}
        <div className="mt-12 glass inline-flex items-center gap-3 px-5 py-2.5">
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
