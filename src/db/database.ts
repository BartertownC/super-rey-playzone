// XP & Level System for Super Rey Playzone

export interface PlayerProfile {
  name: string;
  avatar: string;
  xp: number;
  level: number;
  totalCorrect: number;
  totalAnswered: number;
  streakBest: number;
  streakCurrent: number;
  completedQuizzes: CompletedQuiz[];
  achievements: string[];
  createdAt: string;
}

export interface CompletedQuiz {
  category: string;
  difficulty: number;
  score: number;
  totalQuestions: number;
  xpEarned: number;
  completedAt: string;
  timeSpent: number; // seconds
}

// ============ XP & LEVEL CALCULATIONS ============

// How much XP needed for each level
export const xpForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// What level are you based on total XP
export const getLevelFromXP = (xp: number): number => {
  let level = 1;
  let totalNeeded = 0;
  while (true) {
    totalNeeded += xpForLevel(level);
    if (xp < totalNeeded) return level;
    level++;
    if (level > 100) return 100; // Cap at level 100
  }
};

// XP progress within current level (0 to 1)
export const getLevelProgress = (xp: number): number => {
  let level = 1;
  let totalUsed = 0;
  while (true) {
    const needed = xpForLevel(level);
    if (xp < totalUsed + needed) {
      return (xp - totalUsed) / needed;
    }
    totalUsed += needed;
    level++;
    if (level > 100) return 1;
  }
};

// Calculate XP earned from a quiz
export const calculateXP = (
  correct: number,
  total: number,
  difficulty: number,
  timeSpent: number,
  streak: number
): { baseXP: number; bonusXP: number; totalXP: number; breakdown: string[] } => {
  const breakdown: string[] = [];

  // Base XP: 10 per correct answer
  const baseXP = correct * 10;
  breakdown.push(`✅ ${correct} correct × 10 = ${baseXP} XP`);

  let bonusXP = 0;

  // Difficulty multiplier
  const diffMultiplier = difficulty === 1 ? 1 : difficulty === 2 ? 1.5 : 2;
  const diffBonus = Math.floor(baseXP * (diffMultiplier - 1));
  if (diffBonus > 0) {
    bonusXP += diffBonus;
    breakdown.push(`🎯 Difficulty ${difficulty} bonus: +${diffBonus} XP`);
  }

  // Perfect score bonus
  if (correct === total && total > 0) {
    const perfectBonus = 50 * difficulty;
    bonusXP += perfectBonus;
    breakdown.push(`🌟 Perfect score: +${perfectBonus} XP`);
  }

  // Speed bonus (under 10 seconds per question average)
  const avgTime = total > 0 ? timeSpent / total : 999;
  if (avgTime < 10 && correct > 0) {
    const speedBonus = Math.floor((10 - avgTime) * 3 * difficulty);
    bonusXP += speedBonus;
    breakdown.push(`⚡ Speed bonus: +${speedBonus} XP`);
  }

  // Streak bonus
  if (streak >= 3) {
    const streakBonus = streak * 5;
    bonusXP += streakBonus;
    breakdown.push(`🔥 ${streak} streak bonus: +${streakBonus} XP`);
  }

  return {
    baseXP,
    bonusXP,
    totalXP: baseXP + bonusXP,
    breakdown,
  };
};

// ============ ACHIEVEMENTS ============

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  requirement: (player: PlayerProfile) => boolean;
}

export const achievements: Achievement[] = [
  {
    id: 'first-quiz',
    name: 'First Steps!',
    description: 'Complete your first quiz',
    emoji: '🎯',
    requirement: (p) => p.completedQuizzes.length >= 1,
  },
  {
    id: 'five-quizzes',
    name: 'Getting Started!',
    description: 'Complete 5 quizzes',
    emoji: '📚',
    requirement: (p) => p.completedQuizzes.length >= 5,
  },
  {
    id: 'ten-quizzes',
    name: 'Quiz Master!',
    description: 'Complete 10 quizzes',
    emoji: '🏅',
    requirement: (p) => p.completedQuizzes.length >= 10,
  },
  {
    id: 'twenty-five-quizzes',
    name: 'Unstoppable!',
    description: 'Complete 25 quizzes',
    emoji: '⚡',
    requirement: (p) => p.completedQuizzes.length >= 25,
  },
  {
    id: 'first-perfect',
    name: 'Perfect!',
    description: 'Get 100% on any quiz',
    emoji: '💯',
    requirement: (p) => p.completedQuizzes.some((q) => q.score === q.totalQuestions),
  },
  {
    id: 'five-perfect',
    name: 'Perfectionist!',
    description: 'Get 100% on 5 quizzes',
    emoji: '🌟',
    requirement: (p) => p.completedQuizzes.filter((q) => q.score === q.totalQuestions).length >= 5,
  },
  {
    id: 'dino-explorer',
    name: 'Dino Explorer',
    description: 'Complete 3 dinosaur quizzes',
    emoji: '🦕',
    requirement: (p) => p.completedQuizzes.filter((q) => q.category === 'dinosaurs').length >= 3,
  },
  {
    id: 'space-cadet',
    name: 'Space Cadet',
    description: 'Complete 3 space quizzes',
    emoji: '🚀',
    requirement: (p) => p.completedQuizzes.filter((q) => q.category === 'space').length >= 3,
  },
  {
    id: 'animal-whisperer',
    name: 'Animal Whisperer',
    description: 'Complete 3 animal quizzes',
    emoji: '🐾',
    requirement: (p) => p.completedQuizzes.filter((q) => q.category === 'animals').length >= 3,
  },
  {
    id: 'ocean-diver',
    name: 'Ocean Diver',
    description: 'Complete 3 ocean quizzes',
    emoji: '🌊',
    requirement: (p) => p.completedQuizzes.filter((q) => q.category === 'ocean').length >= 3,
  },
  {
    id: 'mad-scientist',
    name: 'Mad Scientist',
    description: 'Complete 3 science quizzes',
    emoji: '🔬',
    requirement: (p) => p.completedQuizzes.filter((q) => q.category === 'science').length >= 3,
  },
  {
    id: 'level-5',
    name: 'Rising Star',
    description: 'Reach Level 5',
    emoji: '⭐',
    requirement: (p) => p.level >= 5,
  },
  {
    id: 'level-10',
    name: 'Super Star',
    description: 'Reach Level 10',
    emoji: '🌟',
    requirement: (p) => p.level >= 10,
  },
  {
    id: 'level-20',
    name: 'Mega Star',
    description: 'Reach Level 20',
    emoji: '💫',
    requirement: (p) => p.level >= 20,
  },
  {
    id: 'streak-5',
    name: 'On Fire!',
    description: 'Get 5 correct answers in a row',
    emoji: '🔥',
    requirement: (p) => p.streakBest >= 5,
  },
  {
    id: 'streak-10',
    name: 'Blazing!',
    description: 'Get 10 correct answers in a row',
    emoji: '💥',
    requirement: (p) => p.streakBest >= 10,
  },
  {
    id: 'streak-20',
    name: 'LEGENDARY!',
    description: 'Get 20 correct answers in a row',
    emoji: '👑',
    requirement: (p) => p.streakBest >= 20,
  },
  {
    id: '100-correct',
    name: 'Century Club',
    description: 'Answer 100 questions correctly',
    emoji: '🎖️',
    requirement: (p) => p.totalCorrect >= 100,
  },
  {
    id: '500-correct',
    name: 'Knowledge King',
    description: 'Answer 500 questions correctly',
    emoji: '👑',
    requirement: (p) => p.totalCorrect >= 500,
  },
  {
    id: 'hard-mode',
    name: 'Challenge Accepted',
    description: 'Complete a difficulty 3 quiz',
    emoji: '💪',
    requirement: (p) => p.completedQuizzes.some((q) => q.difficulty === 3),
  },
  {
    id: 'hard-perfect',
    name: 'GENIUS!',
    description: 'Get 100% on a difficulty 3 quiz',
    emoji: '🧠',
    requirement: (p) => p.completedQuizzes.some((q) => q.difficulty === 3 && q.score === q.totalQuestions),
  },
  {
    id: 'all-categories',
    name: 'Well Rounded',
    description: 'Complete a quiz in every category',
    emoji: '🌈',
    requirement: (p) => {
      const cats = new Set(p.completedQuizzes.map((q) => q.category));
      return cats.size >= 5;
    },
  },
  {
    id: 'xp-1000',
    name: 'XP Hunter',
    description: 'Earn 1,000 total XP',
    emoji: '💰',
    requirement: (p) => p.xp >= 1000,
  },
  {
    id: 'xp-5000',
    name: 'XP Master',
    description: 'Earn 5,000 total XP',
    emoji: '💎',
    requirement: (p) => p.xp >= 5000,
  },
];

// Check for new achievements
export const checkAchievements = (player: PlayerProfile): string[] => {
  const newAchievements: string[] = [];
  achievements.forEach((a) => {
    if (!player.achievements.includes(a.id) && a.requirement(player)) {
      newAchievements.push(a.id);
    }
  });
  return newAchievements;
};

// ============ LOCAL STORAGE ============

const STORAGE_KEY = 'super-rey-playzone-players';

export const savePlayers = (players: PlayerProfile[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
};

export const loadPlayers = (): PlayerProfile[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const savePlayer = (player: PlayerProfile) => {
  const players = loadPlayers();
  const index = players.findIndex((p) => p.name === player.name);
  if (index >= 0) {
    players[index] = player;
  } else {
    players.push(player);
  }
  savePlayers(players);
};

export const getPlayer = (name: string): PlayerProfile | undefined => {
  return loadPlayers().find((p) => p.name === name);
};

export const createPlayer = (name: string, avatar: string): PlayerProfile => {
  const player: PlayerProfile = {
    name,
    avatar,
    xp: 0,
    level: 1,
    totalCorrect: 0,
    totalAnswered: 0,
    streakBest: 0,
    streakCurrent: 0,
    completedQuizzes: [],
    achievements: [],
    createdAt: new Date().toISOString(),
  };
  savePlayer(player);
  return player;
};

// ============ LEVEL TITLES ============

export const getLevelTitle = (level: number): { title: string; emoji: string } => {
  if (level <= 2) return { title: 'Beginner Explorer', emoji: '🌱' };
  if (level <= 4) return { title: 'Curious Learner', emoji: '🔍' };
  if (level <= 6) return { title: 'Knowledge Seeker', emoji: '📖' };
  if (level <= 8) return { title: 'Smart Cookie', emoji: '🍪' };
  if (level <= 10) return { title: 'Brain Builder', emoji: '🧠' };
  if (level <= 13) return { title: 'Quiz Champion', emoji: '🏆' };
  if (level <= 16) return { title: 'Wisdom Warrior', emoji: '⚔️' };
  if (level <= 20) return { title: 'Master Mind', emoji: '🎓' };
  if (level <= 25) return { title: 'Super Genius', emoji: '🦸' };
  if (level <= 30) return { title: 'Legend', emoji: '👑' };
  return { title: 'ULTIMATE LEGEND', emoji: '💫' };
};