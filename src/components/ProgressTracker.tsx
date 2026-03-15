import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  achievements,
  getLevelTitle,
  getLevelProgress,
  getLevelFromXP,
  xpForLevel,
} from '../db/database';
import { categoryInfo } from '../data/questions';
import { soundManager } from '../utils/sounds';

// ============ TAB TYPE ============
type ProfileTab = 'overview' | 'achievements' | 'history';

// ============ PROFILE COMPONENT ============
const ProgressTracker: React.FC = () => {
  const { currentPlayer, soundEnabled, setCurrentScreen } = useApp();
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [visible, setVisible] = useState(false);
  const [animatedXP, setAnimatedXP] = useState(0);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    if (currentPlayer) {
      // Animate XP bar
      const duration = 1500;
      const start = Date.now();
      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimatedXP(Math.floor(currentPlayer.xp * eased));
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
    }
  }, [currentPlayer]);

  if (!currentPlayer) return null;

  const levelInfo = getLevelTitle(currentPlayer.level);
  const levelProgress = getLevelProgress(currentPlayer.xp);
  const xpNeededForNext = xpForLevel(currentPlayer.level);
  const currentLevelXP = currentPlayer.xp - (function () {
    let total = 0;
    for (let i = 1; i < currentPlayer.level; i++) total += xpForLevel(i);
    return total;
  })();

  // Stats calculations
  const totalQuizzes = currentPlayer.completedQuizzes.length;
  const avgScore =
    totalQuizzes > 0
      ? Math.round(
          (currentPlayer.completedQuizzes.reduce(
            (sum, q) => sum + (q.score / q.totalQuestions) * 100,
            0
          ) /
            totalQuizzes)
        )
      : 0;
  const perfectQuizzes = currentPlayer.completedQuizzes.filter(
    (q) => q.score === q.totalQuestions
  ).length;
  const totalTimePlayed = currentPlayer.completedQuizzes.reduce(
    (sum, q) => sum + q.timeSpent,
    0
  );

  // Category stats
  const categoryStats = Object.entries(categoryInfo).map(([key, info]) => {
    const quizzes = currentPlayer.completedQuizzes.filter((q) => q.category === key);
    const totalCorrect = quizzes.reduce((sum, q) => sum + q.score, 0);
    const totalQuestions = quizzes.reduce((sum, q) => sum + q.totalQuestions, 0);
    return {
      key,
      info,
      quizCount: quizzes.length,
      avgScore: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
      totalCorrect,
      totalQuestions,
    };
  });

  // Achievements
  const unlockedAchievements = achievements.filter((a) =>
    currentPlayer.achievements.includes(a.id)
  );
  const lockedAchievements = achievements.filter(
    (a) => !currentPlayer.achievements.includes(a.id)
  );

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hours}h ${remainMins}m`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // ============ TAB BUTTON ============
  const TabButton: React.FC<{
    tab: ProfileTab;
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

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        padding: '90px 20px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translate(-50%, 0)',
          width: '500px',
          height: '500px',
          background:
            'radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* ============ PROFILE HEADER ============ */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '32px',
            marginBottom: '24px',
            textAlign: 'center',
            transition: 'all 0.6s ease',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(-20px)',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '24px',
              background:
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '42px',
              margin: '0 auto 16px',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
            }}
          >
            {currentPlayer.avatar}
          </div>

          {/* Name */}
          <h1
            style={{
              color: '#fff',
              fontSize: '1.8rem',
              fontWeight: 800,
              fontFamily: "'Baloo 2', 'Nunito', cursive",
              marginBottom: '4px',
            }}
          >
            {currentPlayer.name}
          </h1>

          {/* Level Title */}
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '20px',
            }}
          >
            {levelInfo.emoji} {levelInfo.title}
          </p>

          {/* Level & XP */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              marginBottom: '12px',
            }}
          >
            {/* Level Badge */}
            <div
              style={{
                background:
                  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 800,
                padding: '6px 18px',
                borderRadius: '14px',
                boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)',
              }}
            >
              Level {currentPlayer.level}
            </div>

            {/* Total XP */}
            <div
              style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              {animatedXP.toLocaleString()} Total XP
            </div>
          </div>

          {/* XP Progress Bar */}
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '6px',
              }}
            >
              <span
                style={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                Level {currentPlayer.level}
              </span>
              <span
                style={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                Level {currentPlayer.level + 1}
              </span>
            </div>
            <div
              style={{
                height: '10px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '5px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${levelProgress * 100}%`,
                  height: '100%',
                  background:
                    'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
                  borderRadius: '5px',
                  transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 0 10px rgba(102, 126, 234, 0.4)',
                }}
              />
            </div>
            <div
              style={{
                textAlign: 'center',
                marginTop: '6px',
                color: 'rgba(255, 255, 255, 0.35)',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              {Math.round(currentLevelXP)} / {xpNeededForNext} XP to next level
            </div>
          </div>
        </div>

        {/* ============ TAB NAVIGATION ============ */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            transition: 'all 0.6s ease',
            opacity: visible ? 1 : 0,
          }}
        >
          <TabButton tab="overview" label="Overview" emoji="📊" />
          <TabButton tab="achievements" label="Achievements" emoji="🏆" />
          <TabButton tab="history" label="History" emoji="📜" />
        </div>

        {/* ============ OVERVIEW TAB ============ */}
        {activeTab === 'overview' && (
          <div
            style={{
              animation: 'fadeInUp 0.5s ease',
            }}
          >
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
                {
                  label: 'Quizzes Done',
                  value: totalQuizzes,
                  emoji: '🎮',
                  color: '#667eea',
                },
                {
                  label: 'Avg Score',
                  value: `${avgScore}%`,
                  emoji: '📈',
                  color: '#4CAF50',
                },
                {
                  label: 'Perfect Scores',
                  value: perfectQuizzes,
                  emoji: '💯',
                  color: '#FFD700',
                },
                {
                  label: 'Total Correct',
                  value: currentPlayer.totalCorrect,
                  emoji: '✅',
                  color: '#4CAF50',
                },
                {
                  label: 'Best Streak',
                  value: currentPlayer.streakBest,
                  emoji: '🔥',
                  color: '#FF9800',
                },
                {
                  label: 'Time Played',
                  value: formatTime(totalTimePlayed),
                  emoji: '⏱️',
                  color: '#9C27B0',
                },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '18px',
                    padding: '20px 16px',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    animation: 'fadeInUp 0.4s ease',
                    animationDelay: `${i * 0.08}s`,
                    animationFillMode: 'both',
                    cursor: 'default',
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
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>
                    {stat.emoji}
                  </div>
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

            {/* Category Breakdown */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              <h3
                style={{
                  color: '#fff',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  fontFamily: "'Baloo 2', 'Nunito', cursive",
                  marginBottom: '16px',
                  textAlign: 'center',
                }}
              >
                📊 Category Progress
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {categoryStats.map((cat) => (
                  <div key={cat.key}>
                    {/* Category header row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>{cat.info.emoji}</span>
                        <span
                          style={{
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: 600,
                          }}
                        >
                          {cat.info.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                          style={{
                            color: 'rgba(255, 255, 255, 0.4)',
                            fontSize: '12px',
                            fontWeight: 500,
                          }}
                        >
                          {cat.quizCount} quizzes
                        </span>
                        <span
                          style={{
                            color:
                              cat.avgScore >= 80
                                ? '#4CAF50'
                                : cat.avgScore >= 60
                                ? '#FF9800'
                                : cat.avgScore > 0
                                ? '#E57373'
                                : 'rgba(255, 255, 255, 0.3)',
                            fontSize: '13px',
                            fontWeight: 700,
                          }}
                        >
                          {cat.avgScore > 0 ? `${cat.avgScore}%` : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div
                      style={{
                        height: '6px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${cat.avgScore}%`,
                          height: '100%',
                          background: cat.info.gradient,
                          borderRadius: '3px',
                          transition: 'width 1s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============ ACHIEVEMENTS TAB ============ */}
        {activeTab === 'achievements' && (
          <div style={{ animation: 'fadeInUp 0.5s ease' }}>
            {/* Achievement counter */}
            <div
              style={{
                textAlign: 'center',
                marginBottom: '24px',
              }}
            >
              <span
                style={{
                  background: 'rgba(255, 215, 0, 0.1)',
                  border: '1px solid rgba(255, 215, 0, 0.2)',
                  borderRadius: '14px',
                  padding: '8px 20px',
                  color: '#FFD700',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'inline-block',
                }}
              >
                🏆 {unlockedAchievements.length} / {achievements.length} Unlocked
              </span>
            </div>

            {/* Unlocked */}
            {unlockedAchievements.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h3
                  style={{
                    color: '#FFD700',
                    fontSize: '1rem',
                    fontWeight: 700,
                    marginBottom: '12px',
                    fontFamily: "'Baloo 2', 'Nunito', cursive",
                  }}
                >
                  ✨ Unlocked
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '10px',
                  }}
                >
                  {unlockedAchievements.map((ach, i) => (
                    <div
                      key={ach.id}
                      style={{
                        background: 'rgba(255, 215, 0, 0.06)',
                        border: '1px solid rgba(255, 215, 0, 0.15)',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        animation: 'fadeInUp 0.3s ease',
                        animationDelay: `${i * 0.05}s`,
                        animationFillMode: 'both',
                        transition: 'all 0.3s ease',
                        cursor: 'default',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 215, 0, 0.12)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 215, 0, 0.06)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: 'rgba(255, 215, 0, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '22px',
                          flexShrink: 0,
                        }}
                      >
                        {ach.emoji}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: 700,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
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
                  ))}
                </div>
              </div>
            )}

            {/* Locked */}
            {lockedAchievements.length > 0 && (
              <div>
                <h3
                  style={{
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    marginBottom: '12px',
                    fontFamily: "'Baloo 2', 'Nunito', cursive",
                  }}
                >
                  🔒 Locked
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '10px',
                  }}
                >
                  {lockedAchievements.map((ach, i) => (
                    <div
                      key={ach.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        opacity: 0.5,
                        animation: 'fadeInUp 0.3s ease',
                        animationDelay: `${i * 0.03}s`,
                        animationFillMode: 'both',
                      }}
                    >
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '22px',
                          flexShrink: 0,
                          filter: 'grayscale(1)',
                        }}
                      >
                        {ach.emoji}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontSize: '14px',
                            fontWeight: 700,
                          }}
                        >
                          {ach.name}
                        </div>
                        <div
                          style={{
                            color: 'rgba(255, 255, 255, 0.3)',
                            fontSize: '12px',
                            fontWeight: 500,
                          }}
                        >
                          {ach.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============ HISTORY TAB ============ */}
        {activeTab === 'history' && (
          <div style={{ animation: 'fadeInUp 0.5s ease' }}>
            {currentPlayer.completedQuizzes.length === 0 ? (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '48px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📚</div>
                <h3
                  style={{
                    color: '#fff',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    marginBottom: '8px',
                    fontFamily: "'Baloo 2', 'Nunito', cursive",
                  }}
                >
                  No quizzes yet!
                </h3>
                <p
                  style={{
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '14px',
                    marginBottom: '20px',
                  }}
                >
                  Go take a quiz and your history will show up here!
                </p>
                <button
                  onClick={() => setCurrentScreen('categories')}
                  style={{
                    background:
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '12px 28px',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  }}
                >
                  🚀 Start Learning!
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[...currentPlayer.completedQuizzes]
                  .reverse()
                  .map((quiz, i) => {
                    const catDetails =
                      categoryInfo[quiz.category as keyof typeof categoryInfo];
                    const pct = Math.round(
                      (quiz.score / quiz.totalQuestions) * 100
                    );
                    return (
                      <div
                        key={i}
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '16px',
                          padding: '16px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          animation: 'fadeInUp 0.3s ease',
                          animationDelay: `${i * 0.05}s`,
                          animationFillMode: 'both',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            'rgba(255, 255, 255, 0.07)';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            'rgba(255, 255, 255, 0.04)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        {/* Left: Category + Info */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '12px',
                              background: `${catDetails?.color || '#667eea'}20`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '20px',
                              flexShrink: 0,
                            }}
                          >
                            {catDetails?.emoji || '📚'}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                color: '#fff',
                                fontSize: '14px',
                                fontWeight: 700,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {catDetails?.name || quiz.category}
                            </div>
                            <div
                              style={{
                                color: 'rgba(255, 255, 255, 0.35)',
                                fontSize: '11px',
                                fontWeight: 500,
                                display: 'flex',
                                gap: '8px',
                                flexWrap: 'wrap',
                              }}
                            >
                              <span>
                                {quiz.difficulty === 1
                                  ? '🌱 Easy'
                                  : quiz.difficulty === 2
                                  ? '🔥 Medium'
                                  : '💪 Hard'}
                              </span>
                              <span>• {formatDate(quiz.completedAt)}</span>
                              <span>• {formatTime(quiz.timeSpent)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Score + XP */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div
                            style={{
                              color:
                                pct >= 80
                                  ? '#4CAF50'
                                  : pct >= 60
                                  ? '#FF9800'
                                  : '#E57373',
                              fontSize: '16px',
                              fontWeight: 800,
                              fontFamily: "'Baloo 2', 'Nunito', cursive",
                            }}
                          >
                            {pct}%
                          </div>
                          <div
                            style={{
                              color: 'rgba(255, 255, 255, 0.35)',
                              fontSize: '11px',
                              fontWeight: 600,
                            }}
                          >
                            {quiz.score}/{quiz.totalQuestions} •{' '}
                            <span style={{ color: '#93a3f8' }}>
                              +{quiz.xpEarned} XP
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============ ANIMATIONS ============ */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ProgressTracker;