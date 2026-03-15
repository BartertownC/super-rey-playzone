import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { categoryInfo } from '../data/questions';
import { achievements, getLevelTitle, getLevelProgress } from '../db/database';
import { soundManager } from '../utils/sounds';
import confetti from 'canvas-confetti';

// ============ CONFETTI HELPERS ============
const fireConfetti = () => {
  // Center burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#FFD700', '#4CAF50'],
  });

  // Left side
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ['#667eea', '#764ba2', '#f093fb'],
    });
  }, 200);

  // Right side
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ['#4facfe', '#FFD700', '#4CAF50'],
    });
  }, 400);
};

const fireStars = () => {
  confetti({
    particleCount: 30,
    spread: 360,
    ticks: 60,
    gravity: 0.3,
    decay: 0.94,
    startVelocity: 20,
    shapes: ['star'],
    colors: ['#FFD700', '#FFA500', '#FF6347'],
    origin: { x: 0.5, y: 0.4 },
  });
};

const fireMegaCelebration = () => {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#667eea', '#764ba2', '#f093fb', '#FFD700'],
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#4facfe', '#4CAF50', '#FF6347', '#FFD700'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};

// ============ CELEBRATION COMPONENT ============
const Celebration: React.FC = () => {
  const { currentPlayer, soundEnabled, setCurrentScreen } = useApp();

  const [result, setResult] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedXP, setAnimatedXP] = useState(0);
  const hasPlayedSound = useRef(false);

  // Load result and start animations
  useEffect(() => {
    const stored = localStorage.getItem('quizResult');
    if (!stored) {
      setCurrentScreen('categories');
      return;
    }

    const parsed = JSON.parse(stored);
    setResult(parsed);

    // Staggered reveal animations
    setTimeout(() => setVisible(true), 200);
    setTimeout(() => {
      setShowScore(true);
      // Animate score counting up
      animateCounter(0, parsed.score, 1500, setAnimatedScore);
    }, 800);
    setTimeout(() => {
      setShowXP(true);
      animateCounter(0, parsed.xpEarned, 1200, setAnimatedXP);
    }, 2000);
    setTimeout(() => setShowBreakdown(true), 2800);
    setTimeout(() => {
      if (parsed.newAchievements && parsed.newAchievements.length > 0) {
        setShowAchievements(true);
        if (soundEnabled) soundManager.playStar();
      }
    }, 3500);
    setTimeout(() => {
      if (parsed.newLevel) {
        setShowLevelUp(true);
        if (soundEnabled) soundManager.playLevelUp();
        fireMegaCelebration();
      }
    }, 4200);
    setTimeout(() => setShowButtons(true), 4800);

    // Fire confetti based on performance
    setTimeout(() => {
      const percentage = (parsed.score / parsed.totalQuestions) * 100;
      if (percentage === 100) {
        fireMegaCelebration();
      } else if (percentage >= 70) {
        fireConfetti();
        setTimeout(fireStars, 800);
      } else if (percentage >= 50) {
        fireConfetti();
      }
    }, 1000);

    // Play sound
    if (soundEnabled && !hasPlayedSound.current) {
      hasPlayedSound.current = true;
      soundManager.playComplete();
    }
  }, [soundEnabled, setCurrentScreen]);

  // Counter animation helper
  const animateCounter = (
    start: number,
    end: number,
    duration: number,
    setter: (val: number) => void
  ) => {
    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setter(Math.floor(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    step();
  };

  if (!result || !currentPlayer) return null;

  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  const catInfo = categoryInfo[result.category as keyof typeof categoryInfo];
  const levelInfo = getLevelTitle(currentPlayer.level);
  const stars = percentage === 100 ? 3 : percentage >= 70 ? 2 : percentage >= 40 ? 1 : 0;

  // Grade message
  const gradeMessage =
    percentage === 100
      ? { emoji: '👑', title: 'PERFECT SCORE!', subtitle: "You didn't miss a single one!" }
      : percentage >= 80
      ? { emoji: '🏆', title: 'AMAZING!', subtitle: 'You really know your stuff!' }
      : percentage >= 60
      ? { emoji: '⭐', title: 'Great Job!', subtitle: "You're getting smarter every day!" }
      : percentage >= 40
      ? { emoji: '💪', title: 'Good Try!', subtitle: 'Keep learning and you\'ll ace it!' }
      : { emoji: '📚', title: 'Keep Practicing!', subtitle: 'Every mistake makes you smarter!' };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        padding: '90px 20px 40px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* ---- Background Glow ---- */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background:
            percentage >= 70
              ? 'radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          transition: 'all 1s ease',
        }}
      />

      <div
        style={{
          maxWidth: '600px',
          width: '100%',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* ============ MAIN GRADE EMOJI ============ */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '32px',
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(-30px) scale(0.8)',
          }}
        >
          <div
            style={{
              fontSize: 'clamp(4rem, 12vw, 6rem)',
              marginBottom: '8px',
              animation: visible ? 'celebrationBounce 1s ease' : 'none',
              filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.3))',
            }}
          >
            {gradeMessage.emoji}
          </div>
          <h1
            style={{
              fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
              fontWeight: 900,
              background:
                percentage >= 70
                  ? 'linear-gradient(135deg, #FFD700, #FFA500, #FF6347)'
                  : 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: "'Baloo 2', 'Nunito', cursive",
              marginBottom: '4px',
            }}
          >
            {gradeMessage.title}
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '1rem', fontWeight: 500 }}>
            {gradeMessage.subtitle}
          </p>
        </div>

        {/* ============ CATEGORY & STARS ============ */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '24px',
            transition: 'all 0.6s ease',
            opacity: showScore ? 1 : 0,
            transform: showScore ? 'translateY(0)' : 'translateY(15px)',
          }}
        >
          <span
            style={{
              background: `${catInfo?.color || '#667eea'}25`,
              color: catInfo?.color || '#667eea',
              fontSize: '13px',
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: '10px',
              display: 'inline-block',
              marginBottom: '16px',
            }}
          >
            {catInfo?.emoji} {catInfo?.name} •{' '}
            {result.difficulty === 1 ? '🌱 Easy' : result.difficulty === 2 ? '🔥 Medium' : '💪 Hard'}
          </span>

          {/* Stars */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            {[1, 2, 3].map((star) => (
              <span
                key={star}
                style={{
                  fontSize: '36px',
                  transition: 'all 0.5s ease',
                  transitionDelay: `${star * 0.2 + 1}s`,
                  opacity: showScore ? 1 : 0,
                  transform: showScore
                    ? star <= stars
                      ? 'scale(1) rotate(0deg)'
                      : 'scale(0.7)'
                    : 'scale(0) rotate(-180deg)',
                  filter: star <= stars ? 'none' : 'grayscale(1) opacity(0.3)',
                  animation:
                    showScore && star <= stars
                      ? `starPop 0.6s ease ${star * 0.2 + 1}s both`
                      : 'none',
                }}
              >
                ⭐
              </span>
            ))}
          </div>
        </div>

        {/* ============ SCORE CARD ============ */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '28px',
            marginBottom: '16px',
            transition: 'all 0.6s ease',
            opacity: showScore ? 1 : 0,
            transform: showScore ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          {/* Big Score */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div
              style={{
                fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                fontWeight: 900,
                fontFamily: "'Baloo 2', 'Nunito', cursive",
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1,
              }}
            >
              {animatedScore} / {result.totalQuestions}
            </div>
            <div
              style={{
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '14px',
                fontWeight: 600,
                marginTop: '4px',
              }}
            >
              {percentage}% Correct
            </div>
          </div>

          {/* Score circle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke={
                  percentage >= 80
                    ? '#4CAF50'
                    : percentage >= 60
                    ? '#FF9800'
                    : percentage >= 40
                    ? '#FFB74D'
                    : '#E57373'
                }
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - (showScore ? percentage / 100 : 0))}`}
                transform="rotate(-90 60 60)"
                style={{
                  transition: 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: `drop-shadow(0 0 8px ${
                    percentage >= 80
                      ? 'rgba(76, 175, 80, 0.4)'
                      : percentage >= 60
                      ? 'rgba(255, 152, 0, 0.4)'
                      : 'rgba(229, 115, 115, 0.4)'
                  })`,
                }}
              />
              {/* Percentage text */}
              <text
                x="60"
                y="58"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#fff"
                fontSize="24"
                fontWeight="800"
                fontFamily="'Nunito', sans-serif"
              >
                {percentage}%
              </text>
              <text
                x="60"
                y="76"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.4)"
                fontSize="10"
                fontWeight="600"
              >
                SCORE
              </text>
            </svg>
          </div>

          {/* Stats Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
            }}
          >
            {[
              { label: 'Time', value: formatTime(result.timeSpent), emoji: '⏱️' },
              { label: 'Best Streak', value: `${result.bestStreak}`, emoji: '🔥' },
              { label: 'Difficulty', value: `${result.difficulty === 1 ? 'Easy' : result.difficulty === 2 ? 'Medium' : 'Hard'}`, emoji: result.difficulty === 1 ? '🌱' : result.difficulty === 2 ? '🔥' : '💪' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '14px',
                  padding: '14px 8px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.emoji}</div>
                <div style={{ color: '#fff', fontSize: '15px', fontWeight: 700 }}>{stat.value}</div>
                <div
                  style={{
                    color: 'rgba(255, 255, 255, 0.35)',
                    fontSize: '11px',
                    fontWeight: 600,
                    marginTop: '2px',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============ XP EARNED ============ */}
        <div
          style={{
            background: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '16px',
            textAlign: 'center',
            transition: 'all 0.6s ease',
            opacity: showXP ? 1 : 0,
            transform: showXP ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.4)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px',
            }}
          >
            XP Earned
          </div>
          <div
            style={{
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              fontWeight: 900,
              fontFamily: "'Baloo 2', 'Nunito', cursive",
              background: 'linear-gradient(135deg, #667eea, #f093fb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            +{animatedXP} XP
          </div>

          {/* XP Breakdown */}
          {showBreakdown && result.breakdown && (
            <div
              style={{
                marginTop: '16px',
                animation: 'fadeInUp 0.5s ease',
              }}
            >
              {result.breakdown.map((line: string, i: number) => (
                <div
                  key={i}
                  style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '13px',
                    fontWeight: 500,
                    padding: '4px 0',
                    animation: 'fadeInUp 0.3s ease',
                    animationDelay: `${i * 0.1}s`,
                    animationFillMode: 'both',
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ============ LEVEL UP ============ */}
        {showLevelUp && result.newLevel && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 152, 0, 0.1))',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '20px',
              padding: '28px',
              marginBottom: '16px',
              textAlign: 'center',
              animation: 'levelUpPop 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                marginBottom: '8px',
                animation: 'spin 1s ease',
              }}
            >
              🎖️
            </div>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: "'Baloo 2', 'Nunito', cursive",
                marginBottom: '4px',
              }}
            >
              LEVEL UP!
            </h2>
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              You reached <strong style={{ color: '#FFD700' }}>Level {currentPlayer.level}</strong>!
            </p>
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '14px',
                fontWeight: 500,
                marginTop: '4px',
              }}
            >
              {levelInfo.emoji} {levelInfo.title}
            </p>
          </div>
        )}

        {/* ============ NEW ACHIEVEMENTS ============ */}
        {showAchievements && result.newAchievements && result.newAchievements.length > 0 && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '16px',
              animation: 'fadeInUp 0.6s ease',
            }}
          >
            <h3
              style={{
                color: '#fff',
                fontSize: '1.1rem',
                fontWeight: 700,
                textAlign: 'center',
                marginBottom: '16px',
                fontFamily: "'Baloo 2', 'Nunito', cursive",
              }}
            >
              🏆 Achievement Unlocked!
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {result.newAchievements.map((achId: string, i: number) => {
                const ach = achievements.find((a) => a.id === achId);
                if (!ach) return null;
                return (
                  <div
                    key={achId}
                    style={{
                      background: 'rgba(255, 215, 0, 0.08)',
                      border: '1px solid rgba(255, 215, 0, 0.2)',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      animation: 'achievementSlide 0.5s ease',
                      animationDelay: `${i * 0.15}s`,
                      animationFillMode: 'both',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '28px',
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'rgba(255, 215, 0, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {ach.emoji}
                    </div>
                    <div>
                      <div style={{ color: '#FFD700', fontSize: '14px', fontWeight: 700 }}>
                        {ach.name}
                      </div>
                      <div
                        style={{
                          color: 'rgba(255, 255, 255, 0.4)',
                          fontSize: '12px',
                          fontWeight: 500,
                        }}
                      >
                        {ach.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============ ACTION BUTTONS ============ */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            transition: 'all 0.6s ease',
            opacity: showButtons ? 1 : 0,
            transform: showButtons ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          {/* Play Again */}
          <button
            onClick={() => {
              if (soundEnabled) soundManager.playClick();
              setCurrentScreen('quiz');
            }}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '16px',
              padding: '16px 32px',
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
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
          >
            🔄 Play Again
          </button>

          {/* Change Category */}
          <button
            onClick={() => {
              if (soundEnabled) soundManager.playClick();
              setCurrentScreen('categories');
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '16px 32px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            📚 Categories
          </button>

          {/* View Profile */}
          <button
            onClick={() => {
              if (soundEnabled) soundManager.playClick();
              setCurrentScreen('profile');
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '16px 32px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            👤 Profile
          </button>
        </div>
      </div>

      {/* ============ ANIMATIONS ============ */}
      <style>{`
        @keyframes celebrationBounce {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.3); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes starPop {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          60% { transform: scale(1.4) rotate(20deg); opacity: 1; }
          80% { transform: scale(0.9) rotate(-5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes levelUpPop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes spin {
          0% { transform: rotate(0deg) scale(0.5); }
          50% { transform: rotate(180deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(1); }
        }

        @keyframes achievementSlide {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default Celebration;