import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  getQuestionsByCategoryAndDifficulty,
  categoryInfo,
  Question,
} from '../data/questions';
import { soundManager } from '../utils/sounds';

// ============ SHUFFLE HELPER ============
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============ STREAK MESSAGES ============
const streakMessages = [
  { min: 3, emoji: '🔥', text: '3 in a row!' },
  { min: 5, emoji: '⚡', text: 'ON FIRE!' },
  { min: 7, emoji: '💥', text: 'UNSTOPPABLE!' },
  { min: 10, emoji: '🌟', text: 'LEGENDARY!' },
  { min: 15, emoji: '👑', text: 'G.O.A.T.!' },
];

const getStreakMessage = (streak: number) => {
  for (let i = streakMessages.length - 1; i >= 0; i--) {
    if (streak >= streakMessages[i].min) return streakMessages[i];
  }
  return null;
};

// ============ CORRECT ENCOURAGEMENTS ============
const correctPhrases = [
  '🎉 Amazing!',
  '⭐ Brilliant!',
  '🚀 Fantastic!',
  '💪 You got it!',
  '🧠 Big brain!',
  '🦖 Roar-some!',
  '✨ Superstar!',
  '🎯 Bullseye!',
  '🏆 Champion!',
  '💫 Out of this world!',
  "🔥 You're on fire!",
  '🌟 Spectacular!',
  '👏 Well done!',
  '🎊 Nailed it!',
];

const wrongPhrases = [
  "😊 Good try!",
  "💪 Keep going!",
  "🌱 You're learning!",
  "📚 Now you know!",
  "🧠 Brain power growing!",
  "✨ Next one's yours!",
];

const getRandomPhrase = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

// ============ QUIZ COMPONENT ============
const Quiz: React.FC = () => {
  const { currentPlayer, soundEnabled, setCurrentScreen, completeQuiz } = useApp();

  // Quiz state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showFunFact, setShowFunFact] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState(1);
  const [encouragement, setEncouragement] = useState('');
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [streakMsg, setStreakMsg] = useState<{ emoji: string; text: string } | null>(null);

  // Timer
  const [timeLeft, setTimeLeft] = useState(30);
  const [totalTime, setTotalTime] = useState(0);
  const [timerActive, setTimerActive] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Animations
  const [questionVisible, setQuestionVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [bounceCorrect, setBounceCorrect] = useState(false);
  const [progressPulse, setProgressPulse] = useState(false);

  // ============ LOAD QUIZ ============
  useEffect(() => {
    const stored = localStorage.getItem('currentQuiz');
    if (!stored) {
      setCurrentScreen('categories');
      return;
    }

    const { category: cat, difficulty: diff } = JSON.parse(stored);
    setCategory(cat);
    setDifficulty(diff);

    const allQuestions = getQuestionsByCategoryAndDifficulty(cat, diff);
    const shuffled = shuffleArray(allQuestions).slice(0, 10); // Max 10 questions per quiz
    setQuestions(shuffled);

    // Start animations
    setTimeout(() => setQuestionVisible(true), 300);
    setTimeout(() => setOptionsVisible(true), 600);
  }, [setCurrentScreen]);

  // ============ TIMER ============
  useEffect(() => {
    if (!timerActive || quizComplete || questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto wrong answer
          clearInterval(timerRef.current!);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
      setTotalTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, currentIndex, quizComplete, questions.length]);

  // ============ HANDLE TIME UP ============
  const handleTimeUp = useCallback(() => {
    if (selectedAnswer !== null) return;
    setIsCorrect(false);
    setSelectedAnswer(-1); // no answer selected
    setStreak(0);
    setEncouragement("⏰ Time's up!");
    setShowFunFact(true);
    setTimerActive(false);
    if (soundEnabled) soundManager.playWrong();
  }, [selectedAnswer, soundEnabled]);

  // ============ HANDLE ANSWER ============
  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // Already answered

    setSelectedAnswer(answerIndex);
    setTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const question = questions[currentIndex];
    const correct = answerIndex === question.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      setEncouragement(getRandomPhrase(correctPhrases));
      setBounceCorrect(true);
      setProgressPulse(true);

      // Check for streak message
      const msg = getStreakMessage(newStreak);
      if (msg && (newStreak === 3 || newStreak === 5 || newStreak === 7 || newStreak === 10 || newStreak === 15)) {
        setStreakMsg(msg);
        setShowStreakPopup(true);
        setTimeout(() => setShowStreakPopup(false), 2000);
      }

      if (soundEnabled) soundManager.playCorrect();
      setTimeout(() => setBounceCorrect(false), 600);
      setTimeout(() => setProgressPulse(false), 800);
    } else {
      setStreak(0);
      setEncouragement(getRandomPhrase(wrongPhrases));
      setShakeWrong(true);
      if (soundEnabled) soundManager.playWrong();
      setTimeout(() => setShakeWrong(false), 500);
    }

    // Show fun fact
    setTimeout(() => setShowFunFact(true), 400);
  };

  // ============ NEXT QUESTION ============
  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      // Quiz complete!
      setQuizComplete(true);

      // Calculate results
      const result = completeQuiz(
        category,
        difficulty,
        score + (isCorrect ? 0 : 0), // score already updated
        questions.length,
        totalTime,
        bestStreak
      );

      // Store result for celebration screen
      localStorage.setItem(
        'quizResult',
        JSON.stringify({
          category,
          difficulty,
          score,
          totalQuestions: questions.length,
          timeSpent: totalTime,
          bestStreak,
          ...result,
        })
      );

      setCurrentScreen('celebration');
      return;
    }

    // Reset for next question
    setQuestionVisible(false);
    setOptionsVisible(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowFunFact(false);
    setTimeLeft(30);
    setTimerActive(true);

    setTimeout(() => {
      setCurrentIndex((i) => i + 1);
      setQuestionVisible(true);
    }, 300);

    setTimeout(() => {
      setOptionsVisible(true);
    }, 500);

    if (soundEnabled) soundManager.playClick();
  };

  // ============ QUIT QUIZ ============
  const quitQuiz = () => {
    if (window.confirm('Are you sure you want to quit? Your progress will be lost!')) {
      setCurrentScreen('categories');
    }
  };

  // ============ LOADING STATE ============
  if (questions.length === 0) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '24px',
        }}
      >
        Loading quiz... 🦖
      </div>
    );
  }

  const question = questions[currentIndex];
  const catInfo = categoryInfo[category as keyof typeof categoryInfo];
  const progress = ((currentIndex + (selectedAnswer !== null ? 1 : 0)) / questions.length) * 100;
  const timerPercent = (timeLeft / 30) * 100;
  const timerColor = timeLeft > 15 ? '#4CAF50' : timeLeft > 5 ? '#FF9800' : '#f44336';

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
      {/* ---- Category colored glow ---- */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          background: `radial-gradient(circle, ${catInfo?.color || '#667eea'}15 0%, transparent 70%)`,
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* ============ STREAK POPUP ============ */}
      {showStreakPopup && streakMsg && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            fontSize: 'clamp(2rem, 8vw, 4rem)',
            fontWeight: 900,
            fontFamily: "'Baloo 2', 'Nunito', cursive",
            color: '#fff',
            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
            animation: 'streakPop 2s ease forwards',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {streakMsg.emoji} {streakMsg.text}
        </div>
      )}

      <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* ============ TOP BAR ============ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            gap: '12px',
          }}
        >
          {/* Quit button */}
          <button
            onClick={quitQuiz}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '8px 16px',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.color = '#fca5a5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
            }}
          >
            ✕ Quit
          </button>

          {/* Category + Question counter */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px', fontWeight: 600 }}>
              {catInfo?.emoji} {catInfo?.name}
            </span>
            <span
              style={{
                color: 'rgba(255, 255, 255, 0.3)',
                fontSize: '13px',
                margin: '0 8px',
              }}
            >
              •
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px', fontWeight: 600 }}>
              {currentIndex + 1} / {questions.length}
            </span>
          </div>

          {/* Score + Streak */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {streak >= 2 && (
              <span
                style={{
                  background: 'rgba(255, 152, 0, 0.2)',
                  color: '#FFB74D',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '8px',
                  animation: 'pulse 1s ease infinite',
                }}
              >
                🔥 {streak}
              </span>
            )}
            <span
              style={{
                background: 'rgba(102, 126, 234, 0.2)',
                color: '#93a3f8',
                fontSize: '13px',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: '10px',
              }}
            >
              ⭐ {score}
            </span>
          </div>
        </div>

        {/* ============ PROGRESS BAR ============ */}
        <div
          style={{
            height: '6px',
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '3px',
            marginBottom: '8px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: catInfo?.gradient || 'linear-gradient(90deg, #667eea, #764ba2)',
              borderRadius: '3px',
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: progressPulse ? `0 0 15px ${catInfo?.color || '#667eea'}80` : 'none',
            }}
          />
        </div>

        {/* ============ TIMER BAR ============ */}
        <div
          style={{
            height: '4px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '2px',
            marginBottom: '32px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${timerPercent}%`,
              background: timerColor,
              borderRadius: '2px',
              transition: 'width 1s linear, background 0.5s ease',
              boxShadow: timeLeft <= 5 ? `0 0 10px ${timerColor}80` : 'none',
            }}
          />
        </div>

        {/* ============ TIMER DISPLAY ============ */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '12px',
            transition: 'all 0.3s ease',
          }}
        >
          <span
            style={{
              color: timerColor,
              fontSize: timeLeft <= 5 ? '18px' : '14px',
              fontWeight: 700,
              transition: 'all 0.3s ease',
              animation: timeLeft <= 5 ? 'pulse 0.5s ease infinite' : 'none',
            }}
          >
            ⏱️ {timeLeft}s
          </span>
        </div>

        {/* ============ QUESTION CARD ============ */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '32px 24px',
            marginBottom: '20px',
            textAlign: 'center',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: questionVisible ? 1 : 0,
            transform: questionVisible
              ? shakeWrong
                ? 'translateX(-8px)'
                : bounceCorrect
                ? 'scale(1.02)'
                : 'translateY(0)'
              : 'translateY(20px)',
            animation: shakeWrong ? 'shake 0.5s ease' : 'none',
          }}
        >
          {/* Question emoji */}
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>{question.emoji}</div>

          {/* Question text */}
          <h2
            style={{
              color: '#fff',
              fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
              fontWeight: 700,
              lineHeight: 1.4,
              fontFamily: "'Baloo 2', 'Nunito', cursive",
            }}
          >
            {question.question}
          </h2>

          {/* Difficulty badge */}
          <div style={{ marginTop: '12px' }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: '6px',
              }}
            >
              {difficulty === 1 ? '🌱 Easy' : difficulty === 2 ? '🔥 Medium' : '💪 Hard'}
            </span>
          </div>
        </div>

        {/* ============ ANSWER OPTIONS ============ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectAnswer = index === question.correctAnswer;
            const showResult = selectedAnswer !== null;
            let optionBg = 'rgba(255, 255, 255, 0.05)';
            let optionBorder = 'rgba(255, 255, 255, 0.08)';
            let optionColor = 'rgba(255, 255, 255, 0.85)';
            let optionShadow = 'none';

            if (showResult) {
              if (isCorrectAnswer) {
                optionBg = 'rgba(76, 175, 80, 0.2)';
                optionBorder = 'rgba(76, 175, 80, 0.5)';
                optionColor = '#81C784';
                optionShadow = '0 4px 15px rgba(76, 175, 80, 0.2)';
              } else if (isSelected && !isCorrectAnswer) {
                optionBg = 'rgba(244, 67, 54, 0.2)';
                optionBorder = 'rgba(244, 67, 54, 0.5)';
                optionColor = '#E57373';
                optionShadow = '0 4px 15px rgba(244, 67, 54, 0.2)';
              } else {
                optionBg = 'rgba(255, 255, 255, 0.02)';
                optionBorder = 'rgba(255, 255, 255, 0.05)';
                optionColor = 'rgba(255, 255, 255, 0.3)';
              }
            }

            const optionLetters = ['A', 'B', 'C', 'D'];

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                style={{
                  position: 'relative',
                  background: optionBg,
                  border: `2px solid ${optionBorder}`,
                  borderRadius: '16px',
                  padding: '18px 16px',
                  cursor: selectedAnswer !== null ? 'default' : 'pointer',
                  transition: 'all 0.3s ease',
                  transitionDelay: `${index * 0.05}s`,
                  opacity: optionsVisible ? 1 : 0,
                  transform: optionsVisible ? 'translateY(0)' : 'translateY(15px)',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: optionShadow,
                  animation:
                    showResult && isSelected && !isCorrectAnswer
                      ? 'shake 0.4s ease'
                      : showResult && isCorrectAnswer
                      ? 'correctPop 0.4s ease'
                      : 'none',
                }}
                onMouseEnter={(e) => {
                  if (selectedAnswer === null) {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedAnswer === null) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {/* Letter badge */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: showResult
                      ? isCorrectAnswer
                        ? 'rgba(76, 175, 80, 0.3)'
                        : isSelected
                        ? 'rgba(244, 67, 54, 0.3)'
                        : 'rgba(255, 255, 255, 0.06)'
                      : 'rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 800,
                    color: showResult
                      ? isCorrectAnswer
                        ? '#81C784'
                        : isSelected
                        ? '#E57373'
                        : 'rgba(255, 255, 255, 0.3)'
                      : 'rgba(255, 255, 255, 0.5)',
                    flexShrink: 0,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {showResult && isCorrectAnswer
                    ? '✓'
                    : showResult && isSelected && !isCorrectAnswer
                    ? '✕'
                    : optionLetters[index]}
                </div>

                {/* Answer text */}
                <span
                  style={{
                    color: optionColor,
                    fontSize: '15px',
                    fontWeight: 600,
                    transition: 'color 0.3s ease',
                    lineHeight: 1.3,
                  }}
                >
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* ============ FEEDBACK AREA ============ */}
        {selectedAnswer !== null && (
          <div
            style={{
              background: isCorrect
                ? 'rgba(76, 175, 80, 0.1)'
                : 'rgba(244, 67, 54, 0.1)',
              border: `1px solid ${
                isCorrect ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'
              }`,
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '20px',
              animation: 'fadeInUp 0.5s ease',
            }}
          >
            {/* Encouragement */}
            <p
              style={{
                fontSize: '1.3rem',
                fontWeight: 800,
                color: isCorrect ? '#81C784' : '#E57373',
                textAlign: 'center',
                marginBottom: '12px',
                fontFamily: "'Baloo 2', 'Nunito', cursive",
              }}
            >
              {encouragement}
            </p>

            {/* Fun Fact */}
            {showFunFact && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '14px',
                  padding: '16px',
                  animation: 'fadeInUp 0.4s ease',
                }}
              >
                <p
                  style={{
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '6px',
                  }}
                >
                  💡 Fun Fact
                </p>
                <p
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '14px',
                    fontWeight: 500,
                    lineHeight: 1.5,
                  }}
                >
                  {question.funFact}
                </p>
              </div>
            )}

            {/* Next Button */}
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                onClick={nextQuestion}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '14px 36px',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  display: 'inline-flex',
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
                {currentIndex + 1 >= questions.length ? '🏆 See Results!' : '➡️ Next Question'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============ ANIMATIONS ============ */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }

        @keyframes correctPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }

        @keyframes streakPop {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          20% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
          40% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Quiz;