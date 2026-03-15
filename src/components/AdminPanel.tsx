import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { loadPlayers, savePlayers, PlayerProfile } from '../db/database';
import { soundManager } from '../utils/sounds';

// ============ ADMIN PANEL ============
const AdminPanel: React.FC = () => {
  const { soundEnabled, setCurrentScreen } = useApp();

  const [activeTab, setActiveTab] = useState<'players' | 'stats' | 'settings'>('players');
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [visible, setVisible] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setPlayers(loadPlayers());
    }
  }, [isAuthenticated]);

  // ============ ADMIN LOGIN ============
  const handleLogin = () => {
    if (adminCode === '1234') {
      setIsAuthenticated(true);
      if (soundEnabled) soundManager.playCorrect();
    } else {
      alert('Wrong code! Default is: 1234');
      if (soundEnabled) soundManager.playWrong();
    }
  };

  // ============ DELETE PLAYER ============
  const deletePlayer = (name: string) => {
    const updated = players.filter((p) => p.name !== name);
    savePlayers(updated);
    setPlayers(updated);
    setConfirmDelete(null);
    if (soundEnabled) soundManager.playClick();
  };

  // ============ RESET PLAYER PROGRESS ============
  const resetPlayer = (name: string) => {
    const updated = players.map((p) => {
      if (p.name === name) {
        return {
          ...p,
          xp: 0,
          level: 1,
          totalCorrect: 0,
          totalAnswered: 0,
          streakBest: 0,
          streakCurrent: 0,
          completedQuizzes: [],
          achievements: [],
        };
      }
      return p;
    });
    savePlayers(updated);
    setPlayers(updated);
    if (soundEnabled) soundManager.playClick();
  };

  // ============ GLOBAL STATS ============
  const totalQuizzes = players.reduce((sum, p) => sum + p.completedQuizzes.length, 0);
  const totalCorrect = players.reduce((sum, p) => sum + p.totalCorrect, 0);
  const totalAnswered = players.reduce((sum, p) => sum + p.totalAnswered, 0);
  const globalAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const totalXP = players.reduce((sum, p) => sum + p.xp, 0);
  const totalTime = players.reduce(
    (sum, p) => sum + p.completedQuizzes.reduce((s, q) => s + q.timeSpent, 0),
    0
  );

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hours}h ${remainMins}m`;
  };

  // ============ TAB BUTTON ============
  const TabButton: React.FC<{
    tab: 'players' | 'stats' | 'settings';
    label: string;
    emoji: string;
  }> = ({ tab, label, emoji }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        if (soundEnabled) soundManager.playClick();
      }}
      style={{
        background:
          activeTab === tab
            ? 'rgba(102, 126, 234, 0.2)'
            : 'rgba(255, 255, 255, 0.04)',
        border:
          activeTab === tab
            ? '1px solid rgba(102, 126, 234, 0.3)'
            : '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '10px 20px',
        color: activeTab === tab ? '#fff' : 'rgba(255, 255, 255, 0.5)',
        fontSize: '14px',
        fontWeight: activeTab === tab ? 700 : 500,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
      onMouseEnter={(e) => {
        if (activeTab !== tab) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.color = '#fff';
        }
      }}
      onMouseLeave={(e) => {
        if (activeTab !== tab) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
        }
      }}
    >
      {emoji} {label}
    </button>
  );

  // ============ LOGIN SCREEN ============
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '40px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            transition: 'all 0.6s ease',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
          <h2
            style={{
              color: '#fff',
              fontSize: '1.5rem',
              fontWeight: 800,
              fontFamily: "'Baloo 2', 'Nunito', cursive",
              marginBottom: '8px',
            }}
          >
            Admin Access
          </h2>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '14px',
              marginBottom: '24px',
            }}
          >
            Enter the admin code to manage players and settings
          </p>

          <input
            type="password"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Enter code..."
            style={{
              width: '100%',
              padding: '14px 18px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              color: '#fff',
              fontSize: '18px',
              fontWeight: 600,
              outline: 'none',
              textAlign: 'center',
              letterSpacing: '8px',
              marginBottom: '16px',
              transition: 'all 0.3s ease',
              fontFamily: "'Nunito', sans-serif",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          />

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setCurrentScreen('home')}
              style={{
                flex: 1,
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '14px',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleLogin}
              style={{
                flex: 1,
                padding: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '14px',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              🔓 Enter
            </button>
          </div>

          <p
            style={{
              color: 'rgba(255, 255, 255, 0.25)',
              fontSize: '12px',
              marginTop: '16px',
            }}
          >
            Default code: 1234
          </p>
        </div>
      </div>
    );
  }

  // ============ ADMIN DASHBOARD ============
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
      {/* Background */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translate(-50%, 0)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h1
              style={{
                color: '#fff',
                fontSize: '1.8rem',
                fontWeight: 800,
                fontFamily: "'Baloo 2', 'Nunito', cursive",
              }}
            >
              ⚙️ Admin Panel
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '14px' }}>
              Manage players, view stats, and configure settings
            </p>
          </div>
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setCurrentScreen('home');
            }}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '8px 18px',
              color: '#fca5a5',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
            }}
          >
            🚪 Exit Admin
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            flexWrap: 'wrap',
          }}
        >
          <TabButton tab="players" label="Players" emoji="👤" />
          <TabButton tab="stats" label="Statistics" emoji="📊" />
          <TabButton tab="settings" label="Settings" emoji="⚙️" />
        </div>

        {/* ============ PLAYERS TAB ============ */}
        {activeTab === 'players' && (
          <div style={{ animation: 'fadeInUp 0.5s ease' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h2
                style={{
                  color: '#fff',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  fontFamily: "'Baloo 2', 'Nunito', cursive",
                }}
              >
                👤 All Players ({players.length})
              </h2>
            </div>

            {players.length === 0 ? (
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
                  No players registered yet!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {players.map((player, i) => (
                  <div
                    key={player.name}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '18px',
                      padding: '18px 20px',
                      animation: 'fadeInUp 0.3s ease',
                      animationDelay: `${i * 0.05}s`,
                      animationFillMode: 'both',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap',
                      }}
                    >
                      {/* Player info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            flexShrink: 0,
                          }}
                        >
                          {player.avatar}
                        </div>
                        <div>
                          <div style={{ color: '#fff', fontSize: '15px', fontWeight: 700 }}>
                            {player.name}
                          </div>
                          <div
                            style={{
                              color: 'rgba(255, 255, 255, 0.4)',
                              fontSize: '12px',
                              display: 'flex',
                              gap: '8px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <span>Lvl {player.level}</span>
                            <span>•</span>
                            <span>{player.xp.toLocaleString()} XP</span>
                            <span>•</span>
                            <span>{player.completedQuizzes.length} quizzes</span>
                            <span>•</span>
                            <span>{player.totalCorrect} correct</span>
                            <span>•</span>
                            <span>🔥 {player.streakBest} best streak</span>
                          </div>
                          <div
                            style={{
                              color: 'rgba(255, 255, 255, 0.3)',
                              fontSize: '11px',
                              marginTop: '2px',
                            }}
                          >
                            Joined: {new Date(player.createdAt).toLocaleDateString()}
                            {' • '}
                            {player.achievements.length} achievements
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        {/* Reset Progress */}
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Reset ALL progress for ${player.name}? This cannot be undone!`
                              )
                            ) {
                              resetPlayer(player.name);
                            }
                          }}
                          style={{
                            background: 'rgba(255, 152, 0, 0.12)',
                            border: '1px solid rgba(255, 152, 0, 0.25)',
                            borderRadius: '10px',
                            padding: '8px 14px',
                            color: '#FFB74D',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 152, 0, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 152, 0, 0.12)';
                          }}
                        >
                          🔄 Reset
                        </button>

                        {/* Delete Player */}
                        {confirmDelete === player.name ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => deletePlayer(player.name)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.3)',
                                border: '1px solid rgba(239, 68, 68, 0.5)',
                                borderRadius: '10px',
                                padding: '8px 12px',
                                color: '#fff',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              ✓ Yes
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '10px',
                                padding: '8px 12px',
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              ✕ No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(player.name)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.12)',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              borderRadius: '10px',
                              padding: '8px 14px',
                              color: '#E57373',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                            }}
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============ STATS TAB ============ */}
        {activeTab === 'stats' && (
          <div style={{ animation: 'fadeInUp 0.5s ease' }}>
            <h2
              style={{
                color: '#fff',
                fontSize: '1.1rem',
                fontWeight: 700,
                fontFamily: "'Baloo 2', 'Nunito', cursive",
                marginBottom: '16px',
              }}
            >
              📊 Global Statistics
            </h2>

            {/* Stats Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              {[
                { label: 'Total Players', value: players.length, emoji: '👤', color: '#667eea' },
                { label: 'Total Quizzes', value: totalQuizzes, emoji: '🎮', color: '#4CAF50' },
                { label: 'Total Correct', value: totalCorrect, emoji: '✅', color: '#81C784' },
                { label: 'Global Accuracy', value: `${globalAccuracy}%`, emoji: '🎯', color: '#FF9800' },
                { label: 'Total XP', value: totalXP.toLocaleString(), emoji: '⚡', color: '#f093fb' },
                { label: 'Total Time', value: formatTime(totalTime), emoji: '⏱️', color: '#9C27B0' },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '18px',
                    padding: '20px 16px',
                    textAlign: 'center',
                    animation: 'fadeInUp 0.3s ease',
                    animationDelay: `${i * 0.08}s`,
                    animationFillMode: 'both',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${stat.color}15`;
                    e.currentTarget.style.borderColor = `${stat.color}30`;
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>{stat.emoji}</div>
                  <div
                    style={{
                      color: '#fff',
                      fontSize: '1.3rem',
                      fontWeight: 800,
                      fontFamily: "'Baloo 2', 'Nunito', cursive",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      color: 'rgba(255, 255, 255, 0.35)',
                      fontSize: '11px',
                      fontWeight: 600,
                      marginTop: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Per-player stats */}
            <h3
              style={{
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 700,
                marginBottom: '12px',
                fontFamily: "'Baloo 2', 'Nunito', cursive",
              }}
            >
              👤 Per Player Breakdown
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {players.map((player) => {
                const playerQuizzes = player.completedQuizzes.length;
                const playerAccuracy =
                  player.totalAnswered > 0
                    ? Math.round((player.totalCorrect / player.totalAnswered) * 100)
                    : 0;
                return (
                  <div
                    key={player.name}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>{player.avatar}</span>
                      <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>
                        {player.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
                        🎮 {playerQuizzes}
                      </span>
                      <span
                        style={{
                          color:
                            playerAccuracy >= 80
                              ? '#4CAF50'
                              : playerAccuracy >= 60
                              ? '#FF9800'
                              : '#E57373',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        🎯 {playerAccuracy}%
                      </span>
                      <span style={{ color: '#93a3f8', fontSize: '12px' }}>
                        ⚡ {player.xp.toLocaleString()} XP
                      </span>
                      <span style={{ color: '#FFB74D', fontSize: '12px' }}>
                        🔥 {player.streakBest}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============ SETTINGS TAB ============ */}
        {activeTab === 'settings' && (
          <div style={{ animation: 'fadeInUp 0.5s ease' }}>
            <h2
              style={{
                color: '#fff',
                fontSize: '1.1rem',
                fontWeight: 700,
                fontFamily: "'Baloo 2', 'Nunito', cursive",
                marginBottom: '16px',
              }}
            >
              ⚙️ Settings
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Reset All Data */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '18px',
                  padding: '20px',
                }}
              >
                <h3
                  style={{
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: 700,
                    marginBottom: '8px',
                  }}
                >
                  🗑️ Reset All Data
                </h3>
                <p
                  style={{
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '13px',
                    marginBottom: '12px',
                  }}
                >
                  Delete ALL players and their progress. This cannot be undone!
                </p>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        'Are you SURE you want to delete ALL data? This cannot be undone!'
                      )
                    ) {
                      if (
                        window.confirm(
                          'REALLY sure? All player progress, achievements, and history will be lost forever!'
                        )
                      ) {
                        savePlayers([]);
                        setPlayers([]);
                        if (soundEnabled) soundManager.playClick();
                      }
                    }
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    padding: '10px 20px',
                    color: '#E57373',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                  }}
                >
                  ⚠️ Delete Everything
                </button>
              </div>

              {/* App Info */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '18px',
                  padding: '20px',
                }}
              >
                <h3
                  style={{
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: 700,
                    marginBottom: '12px',
                  }}
                >
                  ℹ️ App Info
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                  }}
                >
                  {[
                    { label: 'App Name', value: 'Super Rey Playzone' },
                    { label: 'Version', value: '2.0.0' },
                    { label: 'Categories', value: '5' },
                    { label: 'Total Questions', value: '100+' },
                    { label: 'Difficulty Levels', value: '3' },
                    { label: 'Achievements', value: '24' },
                  ].map((info) => (
                    <div key={info.label} style={{ padding: '8px 0' }}>
                      <div
                        style={{
                          color: 'rgba(255, 255, 255, 0.35)',
                          fontSize: '11px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {info.label}
                      </div>
                      <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>
                        {info.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Code Info */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '18px',
                  padding: '20px',
                }}
              >
                <h3
                  style={{
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: 700,
                    marginBottom: '8px',
                  }}
                >
                  🔑 Admin Code
                </h3>
                <p
                  style={{
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '13px',
                    marginBottom: '8px',
                  }}
                >
                  The current admin code is: <strong style={{ color: '#93a3f8' }}>1234</strong>
                </p>
                <p
                  style={{
                    color: 'rgba(255, 255, 255, 0.3)',
                    fontSize: '12px',
                  }}
                >
                  To change it, edit the code in AdminPanel.tsx
                </p>
              </div>
            </div>
          </div>
        )}
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

export default AdminPanel;