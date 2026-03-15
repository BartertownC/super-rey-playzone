import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { categoryInfo, getQuestionsByCategoryAndDifficulty } from '../data/questions';
import { soundManager } from '../utils/sounds';

// ============ DIFFICULTY INFO ============
const difficultyInfo = [
  {
    level: 1,
    label: 'Easy',
    emoji: '🌱',
    color: '#4CAF50',
    gradient: 'linear-gradient(135deg, #4CAF50, #81C784)',
    description: 'Kindergarten - 1st Grade',
    stars: '⭐',
  },
  {
    level: 2,
    label: 'Medium',
    emoji: '🔥',
    color: '#FF9800',
    gradient: 'linear-gradient(135deg, #FF9800, #FFB74D)',
    description: '1st - 2nd Grade',
    stars: '⭐⭐',
  },
  {
    level: 3,
    label: 'Hard',
    emoji: '💪',
    color: '#f44336',
    gradient: 'linear-gradient(135deg, #f44336, #E57373)',
    description: '2nd - 3rd Grade',
    stars: '⭐⭐⭐',
  },
];

// ============ CATEGORY SELECT COMPONENT ============
const SubjectSelect: React.FC = () => {
  const { currentPlayer, soundEnabled, setCurrentScreen } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [difficultyVisible, setDifficultyVisible] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredDifficulty, setHoveredDifficulty] = useState<number | null>(null);

  // Fade in animation
  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  // Show difficulty cards after selecting a category
  useEffect(() => {
    if (selectedCategory) {
      setDifficultyVisible(false);
      setTimeout(() => setDifficultyVisible(true), 200);
    }
  }, [selectedCategory]);

  if (!currentPlayer) return null;

  const categories = Object.entries(categoryInfo);

  // Handle category click
  const handleCategoryClick = (key: string) => {
    setSelectedCategory(key);
    if (soundEnabled) soundManager.playClick();
  };

  // Handle difficulty click - start the quiz!
  const handleDifficultyClick = (difficulty: number) => {
    if (!selectedCategory) return;

    // Check if there are questions
    const questions = getQuestionsByCategoryAndDifficulty(
      selectedCategory as any,
      difficulty as any
    );

    if (questions.length === 0) {
      alert('No questions available for this combo yet!');
      return;
    }

    if (soundEnabled) soundManager.playRocketLaunch();

    // Store selection and go to quiz
    localStorage.setItem(
      'currentQuiz',
      JSON.stringify({ category: selectedCategory, difficulty })
    );
    setCurrentScreen('quiz');
  };

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
      {/* ---- Background Glow ---- */}
      {selectedCategory && (
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            background: `radial-gradient(circle, ${
              categoryInfo[selectedCategory as keyof typeof categoryInfo]?.color || '#667eea'
            }22 0%, transparent 70%)`,
            borderRadius: '50%',
            pointerEvents: 'none',
            transition: 'all 0.8s ease',
          }}
        />
      )}

      {/* ============ HEADER ============ */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '40px',
          transition: 'all 0.6s ease',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-20px)',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
            fontWeight: 800,
            color: '#fff',
            marginBottom: '8px',
            fontFamily: "'Baloo 2', 'Nunito', cursive",
          }}
        >
          {currentPlayer.avatar} What do you want to explore, {currentPlayer.name}?
        </h1>
        <p
          style={{
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '1rem',
            fontWeight: 500,
          }}
        >
          Pick a category then choose your difficulty!
        </p>
      </div>

      {/* ============ CATEGORY GRID ============ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          maxWidth: '900px',
          margin: '0 auto 40px',
        }}
      >
        {categories.map(([key, info], index) => {
          const isSelected = selectedCategory === key;
          const isHovered = hoveredCategory === key;
          const questionCount =
            getQuestionsByCategoryAndDifficulty(key as any, 1).length +
            getQuestionsByCategoryAndDifficulty(key as any, 2).length +
            getQuestionsByCategoryAndDifficulty(key as any, 3).length;

          return (
            <button
              key={key}
              onClick={() => handleCategoryClick(key)}
              onMouseEnter={() => setHoveredCategory(key)}
              onMouseLeave={() => setHoveredCategory(null)}
              style={{
                position: 'relative',
                background: isSelected
                  ? `${info.color}25`
                  : isHovered
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(255, 255, 255, 0.04)',
                border: isSelected
                  ? `2px solid ${info.color}80`
                  : '2px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '28px 16px',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: `${index * 0.08}s`,
                opacity: visible ? 1 : 0,
                transform: visible
                  ? isSelected
                    ? 'translateY(-4px) scale(1.02)'
                    : isHovered
                    ? 'translateY(-4px)'
                    : 'translateY(0)'
                  : 'translateY(30px)',
                textAlign: 'center',
                overflow: 'hidden',
                boxShadow: isSelected
                  ? `0 8px 30px ${info.color}30`
                  : isHovered
                  ? '0 8px 25px rgba(0, 0, 0, 0.3)'
                  : 'none',
              }}
            >
              {/* Selected Checkmark */}
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: info.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: '#fff',
                    fontWeight: 'bold',
                    boxShadow: `0 2px 8px ${info.color}50`,
                  }}
                >
                  ✓
                </div>
              )}

              {/* Top color bar */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: info.gradient,
                  opacity: isSelected ? 1 : 0.5,
                  transition: 'opacity 0.3s ease',
                }}
              />

              {/* Emoji */}
              <div
                style={{
                  fontSize: '48px',
                  marginBottom: '12px',
                  transition: 'transform 0.3s ease',
                  transform: isHovered || isSelected ? 'scale(1.15)' : 'scale(1)',
                  filter:
                    isHovered || isSelected
                      ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                      : 'none',
                }}
              >
                {info.emoji}
              </div>

              {/* Name */}
              <h3
                style={{
                  color: isSelected ? '#fff' : 'rgba(255, 255, 255, 0.85)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  marginBottom: '6px',
                  fontFamily: "'Baloo 2', 'Nunito', cursive",
                }}
              >
                {info.name}
              </h3>

              {/* Description */}
              <p
                style={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '12px',
                  fontWeight: 500,
                  marginBottom: '8px',
                }}
              >
                {info.description}
              </p>

              {/* Question count badge */}
              <span
                style={{
                  display: 'inline-block',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '8px',
                }}
              >
                {questionCount} questions
              </span>
            </button>
          );
        })}
      </div>

      {/* ============ DIFFICULTY SELECTOR ============ */}
      {selectedCategory && (
        <div
          style={{
            maxWidth: '700px',
            margin: '0 auto',
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: difficultyVisible ? 1 : 0,
            transform: difficultyVisible ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2
              style={{
                color: '#fff',
                fontSize: '1.3rem',
                fontWeight: 700,
                fontFamily: "'Baloo 2', 'Nunito', cursive",
              }}
            >
              {categoryInfo[selectedCategory as keyof typeof categoryInfo]?.emoji} Choose
              Your Difficulty
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '14px' }}>
              Harder quizzes give more XP! 🔥
            </p>
          </div>

          {/* Difficulty Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
            }}
          >
            {difficultyInfo.map((diff, index) => {
              const questions = getQuestionsByCategoryAndDifficulty(
                selectedCategory as any,
                diff.level as any
              );
              const isHovered = hoveredDifficulty === diff.level;
              const hasQuestions = questions.length > 0;

              return (
                <button
                  key={diff.level}
                  onClick={() => hasQuestions && handleDifficultyClick(diff.level)}
                  onMouseEnter={() => setHoveredDifficulty(diff.level)}
                  onMouseLeave={() => setHoveredDifficulty(null)}
                  disabled={!hasQuestions}
                  style={{
                    background: isHovered
                      ? `${diff.color}20`
                      : 'rgba(255, 255, 255, 0.04)',
                    border: isHovered
                      ? `2px solid ${diff.color}60`
                      : '2px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px',
                    padding: '24px 16px',
                    cursor: hasQuestions ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                    transitionDelay: `${index * 0.1}s`,
                    opacity: hasQuestions ? (difficultyVisible ? 1 : 0) : 0.4,
                    transform: difficultyVisible
                      ? isHovered
                        ? 'translateY(-4px) scale(1.02)'
                        : 'translateY(0)'
                      : 'translateY(20px)',
                    textAlign: 'center',
                    boxShadow: isHovered
                      ? `0 8px 25px ${diff.color}25`
                      : 'none',
                  }}
                >
                  {/* Top bar */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: diff.gradient,
                      borderRadius: '20px 20px 0 0',
                      opacity: isHovered ? 1 : 0.5,
                    }}
                  />

                  {/* Emoji */}
                  <div
                    style={{
                      fontSize: '36px',
                      marginBottom: '8px',
                      transition: 'transform 0.3s ease',
                      transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                    }}
                  >
                    {diff.emoji}
                  </div>

                  {/* Label */}
                  <h3
                    style={{
                      color: isHovered ? '#fff' : 'rgba(255, 255, 255, 0.85)',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      marginBottom: '4px',
                      fontFamily: "'Baloo 2', 'Nunito', cursive",
                    }}
                  >
                    {diff.label}
                  </h3>

                  {/* Grade level */}
                  <p
                    style={{
                      color: 'rgba(255, 255, 255, 0.4)',
                      fontSize: '12px',
                      fontWeight: 500,
                      marginBottom: '8px',
                    }}
                  >
                    {diff.description}
                  </p>

                  {/* Stars */}
                  <div style={{ fontSize: '14px', marginBottom: '8px' }}>{diff.stars}</div>

                  {/* Question count */}
                  <span
                    style={{
                      display: 'inline-block',
                      background: `${diff.color}20`,
                      color: diff.color,
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '8px',
                    }}
                  >
                    {questions.length} questions
                  </span>

                  {/* XP multiplier badge */}
                  <div
                    style={{
                      marginTop: '8px',
                      fontSize: '11px',
                      color: 'rgba(255, 255, 255, 0.4)',
                      fontWeight: 600,
                    }}
                  >
                    {diff.level === 1
                      ? '1× XP'
                      : diff.level === 2
                      ? '1.5× XP'
                      : '2× XP'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Back button */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              onClick={() => {
                setSelectedCategory(null);
                if (soundEnabled) soundManager.playClick();
              }}
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
              ← Pick a Different Category
            </button>
          </div>
        </div>
      )}

      {/* ============ RESPONSIVE STYLES ============ */}
      <style>{`
        @media (max-width: 600px) {
          .difficulty-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SubjectSelect;