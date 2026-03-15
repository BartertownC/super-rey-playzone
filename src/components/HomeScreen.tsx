import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { loadPlayers, PlayerProfile, getLevelTitle } from '../db/database';
import { soundManager } from '../utils/sounds';

const AVATARS = [
  { emoji: '🦖', label: 'Dino' },
  { emoji: '🚀', label: 'Rocket' },
  { emoji: '🦁', label: 'Lion' },
  { emoji: '🐉', label: 'Dragon' },
  { emoji: '🦊', label: 'Fox' },
  { emoji: '🐺', label: 'Wolf' },
  { emoji: '🦅', label: 'Eagle' },
  { emoji: '🐙', label: 'Octopus' },
  { emoji: '🦈', label: 'Shark' },
  { emoji: '🐯', label: 'Tiger' },
  { emoji: '🦇', label: 'Bat' },
  { emoji: '🐸', label: 'Frog' },
  { emoji: '🦋', label: 'Butterfly' },
  { emoji: '🐼', label: 'Panda' },
  { emoji: '🦄', label: 'Unicorn' },
  { emoji: '🤖', label: 'Robot' },
  { emoji: '👾', label: 'Alien' },
  { emoji: '🧑‍🚀', label: 'Astronaut' },
  { emoji: '🦸', label: 'Hero' },
  { emoji: '🧙', label: 'Wizard' },
];

const HomeScreen: React.FC = () => {
  const { login, createPlayer, soundEnabled, setCurrentScreen } = useApp();
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🦖');
  const [nameError, setNameError] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [logoHover, setLogoHover] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);

  useEffect(() => {
    setPlayers(loadPlayers());
    setTimeout(() => setTitleVisible(true), 200);
    setTimeout(() => setCardsVisible(true), 600);
  }, []);

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) { setNameError('Please type a name!'); return; }
    if (trimmed.length < 2) { setNameError('Name must be at least 2 letters!'); return; }
    if (players.find((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setNameError('That name is taken! Try another.');
      return;
    }
    setNameError('');
    createPlayer(trimmed, selectedAvatar);
    if (soundEnabled) soundManager.playRocketLaunch();
  };

  const handleLogin = (player: PlayerProfile) => {
    login(player.name);
    if (soundEnabled) soundManager.playClick();
  };

  const handleAdminLogin = () => {
    if (adminCode === '1234') {
      setShowAdmin(false);
      setCurrentScreen('admin');
    } else {
      alert('Wrong code! Hint: 1234');
    }
  };

  const particleEmojis = ['🦕', '🚀', '⭐', '🌙', '🦖', '🐾', '🌊', '🔬', '💫', '🪐'];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      {/* Floating Particles */}
      {particleEmojis.map((emoji, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            fontSize: `${16 + Math.random() * 20}px`,
            opacity: 0.15,
            animation: `floatParticle ${8 + Math.random() * 6}s ease-in-out infinite`,
            animationDelay: `${i * 1.2}s`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            pointerEvents: 'none',
          }}
        >
          {emoji}
        </div>
      ))}

      {/* Gradient Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(240, 147, 251, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* LOGO & TITLE */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '48px',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: titleVisible ? 1 : 0,
          transform: titleVisible ? 'translateY(0)' : 'translateY(-30px)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          style={{
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
            transform: logoHover ? 'scale(1.05) rotate(-3deg)' : 'scale(1)',
            marginBottom: '16px',
          }}
          onMouseEnter={() => {
            setLogoHover(true);
            if (soundEnabled) soundManager.playDinoRoar();
          }}
          onMouseLeave={() => setLogoHover(false)}
<img 
  src={`${process.env.PUBLIC_URL}/mascot.png`} 
  alt="Super Rey"
  style={{
    width: '180px',
    height: 'auto',
    filter: 'drop-shadow(0 10px 30px rgba(102, 126, 234, 0.3))',
  }}
/>
        </div>
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #4facfe 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px',
            fontFamily: "'Baloo 2', 'Nunito', cursive",
            letterSpacing: '-1px',
            lineHeight: 1.1,
          }}
        >
          Super Rey Playzone
        </h1>
        <p
          style={{
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '1.1rem',
            fontWeight: 500,
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          Learn - Explore - Level Up
        </p>
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          width: '100%',
          maxWidth: '700px',
          position: 'relative',
          zIndex: 10,
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: cardsVisible ? 1 : 0,
          transform: cardsVisible ? 'translateY(0)' : 'translateY(30px)',
        }}
      >
        {/* EXISTING PLAYERS */}
        {players.length > 0 && !showCreate && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '32px',
              marginBottom: '24px',
            }}
          >
            <h2
              style={{
                color: '#fff',
                fontSize: '1.4rem',
                fontWeight: 700,
                textAlign: 'center',
                marginBottom: '24px',
                fontFamily: "'Baloo 2', 'Nunito', cursive",
              }}
            >
              Welcome Back!
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '12px',
              }}
            >
              {players.map((player, index) => {
                const levelInfo = getLevelTitle(player.level);
                return (
                  <button
                    key={player.name}
                    onClick={() => handleLogin(player)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      textAlign: 'left',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
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
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>
                        {player.name}
                      </div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '11px', fontWeight: 500, marginTop: '2px' }}>
                        {levelInfo.emoji} Lvl {player.level} - {player.xp.toLocaleString()} XP
                      </div>
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '18px' }}>▶</div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => {
                setShowCreate(true);
                if (soundEnabled) soundManager.playClick();
              }}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '14px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '14px',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
              }}
            >
              + New Player
            </button>
          </div>
        )}

        {/* CREATE NEW PLAYER */}
        {(showCreate || players.length === 0) && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '32px',
              marginBottom: '24px',
            }}
          >
            <h2
              style={{
                color: '#fff',
                fontSize: '1.4rem',
                fontWeight: 700,
                textAlign: 'center',
                marginBottom: '24px',
                fontFamily: "'Baloo 2', 'Nunito', cursive",
              }}
            >
              Create Your Player
            </h2>

            {/* Avatar Picker */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  display: 'block',
                  marginBottom: '12px',
                  textAlign: 'center',
                }}
              >
                Choose Your Avatar
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {AVATARS.map((a) => (
                  <button
                    key={a.emoji}
                    onClick={() => {
                      setSelectedAvatar(a.emoji);
                      if (soundEnabled) soundManager.playClick();
                    }}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '14px',
                      border: selectedAvatar === a.emoji ? '2px solid #667eea' : '2px solid rgba(255, 255, 255, 0.1)',
                      background: selectedAvatar === a.emoji ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      fontSize: '24px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: selectedAvatar === a.emoji ? 'scale(1.15)' : 'scale(1)',
                    }}
                    title={a.label}
                  >
                    {a.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  display: 'block',
                  marginBottom: '8px',
                  textAlign: 'center',
                }}
              >
                What is Your Name, Explorer?
              </label>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setNameError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="Type your name..."
                  maxLength={20}
                  style={{
                    flex: 1,
                    maxWidth: '300px',
                    padding: '14px 18px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: nameError ? '2px solid rgba(239, 68, 68, 0.5)' : '2px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '14px',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 600,
                    outline: 'none',
                    transition: 'all 0.3s ease',
                  }}
                />
              </div>
              {nameError && (
                <p style={{ color: '#f87171', fontSize: '13px', fontWeight: 600, textAlign: 'center', marginTop: '8px' }}>
                  {nameError}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {players.length > 0 && (
                <button
                  onClick={() => {
                    setShowCreate(false);
                    if (soundEnabled) soundManager.playClick();
                  }}
                  style={{
                    padding: '14px 24px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '14px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  Back
                </button>
              )}
              <button
                onClick={handleCreate}
                style={{
                  padding: '14px 32px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '14px',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }}
              >
                Lets Go!
              </button>
            </div>
          </div>
        )}

        {/* ADMIN ACCESS */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          {!showAdmin ? (
            <button
              onClick={() => setShowAdmin(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.2)',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'color 0.3s ease',
                padding: '8px 16px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.2)'; }}
            >
              Parent / Teacher Access
            </button>
          ) : (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '20px',
                maxWidth: '350px',
                margin: '0 auto',
              }}
            >
              <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px', marginBottom: '12px' }}>
                Enter admin code (default: 1234)
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <input
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                  placeholder="Code..."
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    width: '120px',
                    textAlign: 'center',
                  }}
                />
                <button
                  onClick={handleAdminLogin}
                  style={{
                    padding: '10px 18px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Enter
                </button>
                <button
                  onClick={() => setShowAdmin(false)}
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  X
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ANIMATIONS */}
      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(30px, -40px) rotate(90deg); }
          50% { transform: translate(-20px, -80px) rotate(180deg); }
          75% { transform: translate(40px, -40px) rotate(270deg); }
        }
        input::placeholder { color: rgba(255, 255, 255, 0.3); }
      `}</style>
    </div>
  );
};

export default HomeScreen;