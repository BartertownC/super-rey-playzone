import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getLevelFromXP } from '../db/database';

// ============ LEVEL THRESHOLDS ============
const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 850, 1300, 1900, 2600, 3500, 4600,
  6000, 7700, 9700, 12000, 15000, 18500, 22500, 27000, 32000, 38000,
  45000, 53000, 62000, 72000, 83000, 95000, 108000, 122000, 137000, 155000,
];

function getXPForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level >= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  return LEVEL_THRESHOLDS[level - 1];
}

function getXPForNextLevel(level: number): number {
  if (level >= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  return LEVEL_THRESHOLDS[level];
}

// ============ NAVBAR COMPONENT ============
const Navbar: React.FC = () => {
  const {
    currentPlayer,
    logout,
    soundEnabled,
    toggleSound,
    currentScreen,
    setCurrentScreen,
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [xpAnimated, setXpAnimated] = useState(0);

  // Track scroll for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animate XP bar when player XP changes
  useEffect(() => {
    if (!currentPlayer) return;
    const timer = setTimeout(() => {
      setXpAnimated(currentPlayer.xp);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPlayer?.xp]);

  if (!currentPlayer) return null;

  // XP progress calculation
  const currentLevelXP = getXPForLevel(currentPlayer.level);
  const nextLevelXP = getXPForNextLevel(currentPlayer.level);
  const xpIntoLevel = xpAnimated - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const progressPercent = xpNeeded > 0 ? Math.min((xpIntoLevel / xpNeeded) * 100, 100) : 100;

  // Navigation items
  const navItems = [
    { id: 'categories', label: '📚 Categories', icon: '📚' },
    { id: 'achievements', label: '🏆 Achievements', icon: '🏆' },
    { id: 'leaderboard', label: '📊 Leaderboard', icon: '📊' },
    { id: 'profile', label: '👤 Profile', icon: '👤' },
  ];

  const handleNav = (screen: string) => {
    setCurrentScreen(screen);
    setMenuOpen(false);
  };

  // Avatar display
  const avatarEmoji = currentPlayer.avatar || '🚀';

  return (
    <>
      {/* ====== NAVBAR ====== */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: scrolled ? '8px 16px' : '12px 16px',
          background: scrolled
            ? 'rgba(15, 23, 42, 0.85)'
            : 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s ease',
          boxShadow: scrolled
            ? '0 4px 30px rgba(0, 0, 0, 0.3)'
            : '0 2px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* ---- LEFT: Avatar + Player Info ---- */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
            }}
            onClick={() => handleNav('profile')}
          >
            {/* Avatar Circle */}
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                boxShadow: '0 2px 10px rgba(102, 126, 234, 0.4)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {avatarEmoji}
            </div>

            {/* Name + Level + XP Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: '120px' }}>
              {/* Name & Level Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '14px',
                    letterSpacing: '0.3px',
                  }}
                >
                  {currentPlayer.name}
                </span>

                {/* Level Badge */}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    letterSpacing: '0.5px',
                    boxShadow: '0 2px 8px rgba(240, 147, 251, 0.3)',
                  }}
                >
                  LVL {currentPlayer.level}
                </span>
              </div>

              {/* XP Progress Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <div
                  style={{
                    flex: 1,
                    height: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    minWidth: '80px',
                  }}
                >
                  <div
                    style={{
                      width: `${progressPercent}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
                      borderRadius: '3px',
                      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 0 8px rgba(102, 126, 234, 0.5)',
                    }}
                  />
                </div>
                <span
                  style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '9px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {xpIntoLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP
                </span>
              </div>
            </div>
          </div>

          {/* ---- CENTER: Desktop Nav Links ---- */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              alignItems: 'center',
            }}
            className="desktop-nav"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                style={{
                  background:
                    currentScreen === item.id
                      ? 'rgba(102, 126, 234, 0.3)'
                      : 'transparent',
                  border: 'none',
                  color:
                    currentScreen === item.id
                      ? '#fff'
                      : 'rgba(255, 255, 255, 0.6)',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: currentScreen === item.id ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  boxShadow:
                    currentScreen === item.id
                      ? 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 2px 8px rgba(102, 126, 234, 0.2)'
                      : 'none',
                }}
                onMouseEnter={(e) => {
                  if (currentScreen !== item.id) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentScreen !== item.id) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                  }
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* ---- RIGHT: Sound Toggle + Logout + Mobile Menu ---- */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>

            {/* Logout Button (Desktop) */}
            <button
              onClick={logout}
              className="desktop-nav"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.color = '#fca5a5';
              }}
            >
              🚪 Logout
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              className="mobile-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                display: 'none', // shown via CSS media query
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                width: '36px',
                height: '36px',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer',
                padding: '8px',
              }}
            >
              <span
                style={{
                  display: 'block',
                  width: '18px',
                  height: '2px',
                  background: '#fff',
                  borderRadius: '2px',
                  transition: 'all 0.3s ease',
                  transform: menuOpen
                    ? 'rotate(45deg) translate(4px, 4px)'
                    : 'none',
                }}
              />
              <span
                style={{
                  display: 'block',
                  width: '18px',
                  height: '2px',
                  background: '#fff',
                  borderRadius: '2px',
                  transition: 'all 0.3s ease',
                  opacity: menuOpen ? 0 : 1,
                  transform: menuOpen ? 'translateX(-10px)' : 'none',
                }}
              />
              <span
                style={{
                  display: 'block',
                  width: '18px',
                  height: '2px',
                  background: '#fff',
                  borderRadius: '2px',
                  transition: 'all 0.3s ease',
                  transform: menuOpen
                    ? 'rotate(-45deg) translate(4px, -4px)'
                    : 'none',
                }}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* ====== MOBILE OVERLAY MENU ====== */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transform: menuOpen ? 'scale(1)' : 'scale(0.95)',
        }}
      >
        {/* Level display in mobile menu */}
        <div
          style={{
            fontSize: '48px',
            marginBottom: '8px',
          }}
        >
          {avatarEmoji}
        </div>
        <div
          style={{
            color: '#fff',
            fontSize: '18px',
            fontWeight: 700,
          }}
        >
          {currentPlayer.name}
        </div>
        <div
          style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 800,
            padding: '4px 16px',
            borderRadius: '16px',
            marginBottom: '24px',
          }}
        >
          LEVEL {currentPlayer.level} • {currentPlayer.xp.toLocaleString()} XP
        </div>

        {/* Mobile nav links */}
        {navItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => handleNav(item.id)}
            style={{
              background:
                currentScreen === item.id
                  ? 'rgba(102, 126, 234, 0.3)'
                  : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              padding: '16px 48px',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transitionDelay: menuOpen ? `${index * 0.05}s` : '0s',
              transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
              opacity: menuOpen ? 1 : 0,
              minWidth: '250px',
              textAlign: 'center',
            }}
          >
            {item.label}
          </button>
        ))}

        {/* Mobile logout */}
        <button
          onClick={logout}
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '14px 48px',
            borderRadius: '16px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: '16px',
            minWidth: '250px',
            transition: 'all 0.3s ease',
            transitionDelay: menuOpen ? '0.25s' : '0s',
            transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
            opacity: menuOpen ? 1 : 0,
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* ====== RESPONSIVE STYLES ====== */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-toggle {
            display: none !important;
          }
        }
      `}</style>

      {/* Spacer so content isn't hidden behind fixed navbar */}
      <div style={{ height: '70px' }} />
    </>
  );
};

export default Navbar;