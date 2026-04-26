import socket from '../socket';

export default function Lobby({ roomId, players, host, onLeave }) {
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]"
           style={{ background: 'radial-gradient(circle, var(--clr-primary) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
           style={{ background: 'radial-gradient(circle, var(--clr-accent) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        {/* Room Header */}
        <div className="text-center mb-8">
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

        {/* Players Card */}
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
              Players
            </h3>
            <span className="text-sm px-3 py-1 rounded-full"
                  style={{ background: 'rgba(108, 92, 231, 0.15)', color: 'var(--clr-primary-glow)' }}>
              {players.length} joined
            </span>
          </div>

          <ul className="space-y-2">
            {players.map((player) => (
              <li
                key={player.id}
                className="flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: player.id === socket.id
                    ? 'rgba(108, 92, 231, 0.12)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: player.id === socket.id
                    ? '1px solid rgba(108, 92, 231, 0.3)'
                    : '1px solid transparent',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                       style={{ background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))', color: '#fff' }}>
                    {player.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">
                    {player.username}
                    {player.id === socket.id && (
                      <span className="text-xs ml-2" style={{ color: 'var(--clr-text-muted)' }}>(you)</span>
                    )}
                  </span>
                </div>
                {player.id === host && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(253, 121, 168, 0.15)', color: 'var(--clr-accent-glow)' }}>
                    👑 Host
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Waiting message */}
        <p className="text-center text-sm mt-6" style={{ color: 'var(--clr-text-muted)' }}>
          Waiting for players to join...
        </p>

        {/* Leave Room */}
        <div className="text-center mt-6">
          <button
            onClick={onLeave}
            className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                       hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              background: 'rgba(214, 48, 49, 0.12)',
              border: '1px solid rgba(214, 48, 49, 0.3)',
              color: '#ff7675',
            }}
          >
            Leave Room
          </button>
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
