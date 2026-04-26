import { useState, useEffect, useRef } from 'react';
import socket from '../socket';

export default function Lobby({ roomId, players, host, username, onLeave }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef(null);

  // ── Socket listener for incoming chat messages ──
  useEffect(() => {
    function onChatMessage(payload) {
      setMessages((prev) => [...prev, payload]);
    }

    socket.on('chat:message', onChatMessage);

    return () => {
      socket.off('chat:message', onChatMessage);
    };
  }, []);

  // ── Auto-scroll to latest message ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden py-8 px-4">
      {/* Background Gradient Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]"
           style={{ background: 'radial-gradient(circle, var(--clr-primary) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
           style={{ background: 'radial-gradient(circle, var(--clr-accent) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-2xl animate-fade-in-up">
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
              style={{ background: 'rgba(108, 92, 231, 0.15)', color: 'var(--clr-primary-glow)' }}
              title="Copy room code"
            >
              📋
            </button>
          </div>
        </div>

        {/* Two-column layout: Players + Chat */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

          {/* ── Players Card (2 cols) ── */}
          <div className="md:col-span-2 glass p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                Players
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(108, 92, 231, 0.15)', color: 'var(--clr-primary-glow)' }}>
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
                      ? 'rgba(108, 92, 231, 0.12)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: player.id === socket.id
                      ? '1px solid rgba(108, 92, 231, 0.3)'
                      : '1px solid transparent',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                         style={{ background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))', color: '#fff' }}>
                      {player.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">
                      {player.username}
                      {player.id === socket.id && (
                        <span className="text-xs ml-1" style={{ color: 'var(--clr-text-muted)' }}>(you)</span>
                      )}
                    </span>
                  </div>
                  {player.id === host && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(253, 121, 168, 0.15)', color: 'var(--clr-accent-glow)' }}>
                      👑
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {/* Leave Room */}
            <button
              onClick={onLeave}
              className="w-full mt-4 px-4 py-2 rounded-xl font-medium text-xs transition-all duration-200
                         hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              style={{
                background: 'rgba(214, 48, 49, 0.1)',
                border: '1px solid rgba(214, 48, 49, 0.25)',
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
                return (
                  <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
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
                          ? 'linear-gradient(135deg, var(--clr-primary), rgba(253, 121, 168, 0.7))'
                          : 'var(--clr-surface-light)',
                        border: isMe ? 'none' : '1px solid var(--clr-border)',
                        color: '#fff',
                        borderBottomRightRadius: isMe ? '6px' : '16px',
                        borderBottomLeftRadius: isMe ? '16px' : '6px',
                      }}
                    >
                      {msg.message}
                    </div>
                    {/* Timestamp */}
                    <span className="text-[10px] mt-0.5 mx-1" style={{ color: 'var(--clr-text-muted)' }}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
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
              <button
                id="btn-send-chat"
                onClick={sendMessage}
                disabled={!draft.trim()}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200
                           cursor-pointer hover:scale-105 active:scale-95
                           disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))' }}
              >
                Send
              </button>
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
