import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import HomeScreen from './components/HomeScreen';
import SubjectSelect from './components/SubjectSelect';
import Quiz from './components/Quiz';
import Celebration from './components/Celebration';
import ProgressTracker from './components/ProgressTracker';
import AdminPanel from './components/AdminPanel';

// ============ SCREEN ROUTER ============
const ScreenRouter: React.FC = () => {
  const { currentPlayer, currentScreen } = useApp();

  // If not logged in, show home screen
  if (!currentPlayer && currentScreen !== 'admin') {
    return <HomeScreen />;
  }

  // Route to the correct screen
  switch (currentScreen) {
    case 'home':
      return <HomeScreen />;
    case 'categories':
      return <SubjectSelect />;
    case 'quiz':
      return <Quiz />;
    case 'celebration':
      return <Celebration />;
    case 'profile':
      return <ProgressTracker />;
    case 'achievements':
      return <ProgressTracker />;
    case 'leaderboard':
      return <Leaderboard />;
    case 'admin':
      return <AdminPanel />;
    default:
      return <HomeScreen />;
  }
};

// ============ LEADERBOARD COMPONENT ============
const Leaderboard: React.FC = () => {
  const { allPlayers, soundEnabled, setCurrentScreen } = useApp();

  // Sort players by XP (highest first)
  const sorted = [...allPlayers].sort((a, b) => b.xp - a.xp);

  const medalEmojis = ['🥇', '🥈', '🥉'];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        padding: '90px 20px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translate(-50%, 0)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏆</div>
          <h1
            style={{
              color: '#fff',
              fontSize: '2rem',
              fontWeight: 800,
              fontFamily: "'Baloo 2', 'Nunito', cursive",
              marginBottom: '4px',
            }}
          >
            Leaderboard
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '14px', fontWeight: 500 }}>
            Who's the smartest explorer?
          </p>
        </div>

        {/* Player List */}
        {sorted.length === 0 ? (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '48px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>👀</div>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '15px' }}>
              No players yet! Be the first!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sorted.map((player, index) => {
              const isTop3 = index < 3;
              return (
                <div
                  key={player.name}
                  style={{
                    background: isTop3
                      ? index === 0
                        ? 'rgba(255, 215, 0, 0.08)'
                        : index === 1
                        ? 'rgba(192, 192, 192, 0.06)'
                        : 'rgba(205, 127, 50, 0.06)'
                      : 'rgba(255, 255, 255, 0.04)',
                    border: isTop3
                      ? index === 0
                        ? '1px solid rgba(255, 215, 0, 0.25)'
                        : index === 1
                        ? '1px solid rgba(192, 192, 192, 0.2)'
                        : '1px solid rgba(205, 127, 50, 0.2)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '18px',
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    transition: 'all 0.3s ease',
                    animation: 'fadeInUp 0.4s ease',
                    animationDelay: `${index * 0.08}s`,
                    animationFillMode: 'both',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(6px)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Rank */}
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: isTop3
                        ? index === 0
                          ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                          : index === 1
                          ? 'linear-gradient(135deg, #C0C0C0, #A0A0A0)'
                          : 'linear-gradient(135deg, #CD7F32, #B8860B)'
                        : 'rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isTop3 ? '18px' : '14px',
                      fontWeight: 800,
                      color: isTop3 ? '#fff' : 'rgba(255, 255, 255, 0.4)',
                      flexShrink: 0,
                      boxShadow: isTop3
                        ? `0 4px 12px ${
                            index === 0
                              ? 'rgba(255, 215, 0, 0.3)'
                              : index === 1
                              ? 'rgba(192, 192, 192, 0.2)'
                              : 'rgba(205, 127, 50, 0.2)'
                          }`
                        : 'none',
                    }}
                  >
                    {isTop3 ? medalEmojis[index] : index + 1}
                  </div>

                  {/* Avatar */}
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      flexShrink: 0,
                    }}
                  >
                    {player.avatar}
                  </div>

                  {/* Name + Stats */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        color: '#fff',
                        fontSize: '15px',
                        fontWeight: 700,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {player.name}
                    </div>
                    <div
                      style={{
                        color: 'rgba(255, 255, 255, 0.35)',
                        fontSize: '11px',
                        fontWeight: 500,
                        display: 'flex',
                        gap: '8px',
                      }}
                    >
                      <span>Lvl {player.level}</span>
                      <span>•</span>
                      <span>{player.completedQuizzes.length} quizzes</span>
                      <span>•</span>
                      <span>🔥 {player.streakBest} best</span>
                    </div>
                  </div>

                  {/* XP */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div
                      style={{
                        color: isTop3 ? '#FFD700' : '#93a3f8',
                        fontSize: '16px',
                        fontWeight: 800,
                        fontFamily: "'Baloo 2', 'Nunito', cursive",
                      }}
                    >
                      {player.xp.toLocaleString()}
                    </div>
                    <div
                      style={{
                        color: 'rgba(255, 255, 255, 0.3)',
                        fontSize: '10px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      XP
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Back button */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={() => setCurrentScreen('categories')}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '10px 24px',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
            }}
          >
            ← Back to Categories
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ============ MAIN APP ============
const App: React.FC = () => {
  return (
    <AppProvider>
      <div
        style={{
          minHeight: '100vh',
          background: '#0f172a',
          position: 'relative',
        }}
      >
        <Navbar />
        <ScreenRouter />
      </div>
    </AppProvider>
  );
};

export default App;