import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  PlayerProfile,
  loadPlayers,
  savePlayer,
  createPlayer as createNewPlayer,
  getLevelFromXP,
  calculateXP,
  checkAchievements,
  CompletedQuiz,
} from '../db/database';
import { soundManager } from '../utils/sounds';

// ============ TYPES ============

interface AppState {
  // Player
  currentPlayer: PlayerProfile | null;
  allPlayers: PlayerProfile[];
  isAdmin: boolean;

  // Actions
  login: (name: string) => void;
  logout: () => void;
  createPlayer: (name: string, avatar: string) => void;
  setIsAdmin: (val: boolean) => void;

  // Quiz completion
  completeQuiz: (
    category: string,
    difficulty: number,
    score: number,
    totalQuestions: number,
    timeSpent: number,
    streak: number
  ) => { xpEarned: number; newLevel: boolean; newAchievements: string[]; breakdown: string[] };

  // Sound
  soundEnabled: boolean;
  toggleSound: () => void;

  // Screen
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
}

const AppContext = createContext<AppState>({} as AppState);

export const useApp = () => useContext(AppContext);

// ============ PROVIDER ============

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPlayer, setCurrentPlayer] = useState<PlayerProfile | null>(null);
  const [allPlayers, setAllPlayers] = useState<PlayerProfile[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('home');

  // Load players on startup
  useEffect(() => {
    const players = loadPlayers();
    setAllPlayers(players);
  }, []);

  // Login existing player
  const login = useCallback((name: string) => {
    const players = loadPlayers();
    const player = players.find((p) => p.name === name);
    if (player) {
      setCurrentPlayer(player);
      setCurrentScreen('categories');
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    setCurrentPlayer(null);
    setIsAdmin(false);
    setCurrentScreen('home');
  }, []);

  // Create new player
  const createPlayer = useCallback((name: string, avatar: string) => {
    const player = createNewPlayer(name, avatar);
    setCurrentPlayer(player);
    setAllPlayers(loadPlayers());
    setCurrentScreen('categories');
    if (soundEnabled) soundManager.playRocketLaunch();
  }, [soundEnabled]);

  // Complete a quiz and calculate rewards
  const completeQuiz = useCallback((
    category: string,
    difficulty: number,
    score: number,
    totalQuestions: number,
    timeSpent: number,
    streak: number
  ) => {
    if (!currentPlayer) return { xpEarned: 0, newLevel: false, newAchievements: [], breakdown: [] };

    // Calculate XP
    const xpResult = calculateXP(score, totalQuestions, difficulty, timeSpent, streak);

    // Update player
    const oldLevel = currentPlayer.level;
    const updatedPlayer: PlayerProfile = {
      ...currentPlayer,
      xp: currentPlayer.xp + xpResult.totalXP,
      level: getLevelFromXP(currentPlayer.xp + xpResult.totalXP),
      totalCorrect: currentPlayer.totalCorrect + score,
      totalAnswered: currentPlayer.totalAnswered + totalQuestions,
      streakBest: Math.max(currentPlayer.streakBest, streak),
      streakCurrent: streak,
      completedQuizzes: [
        ...currentPlayer.completedQuizzes,
        {
          category,
          difficulty,
          score,
          totalQuestions,
          xpEarned: xpResult.totalXP,
          completedAt: new Date().toISOString(),
          timeSpent,
        } as CompletedQuiz,
      ],
    };

    // Check for new achievements
    const newAchievementIds = checkAchievements(updatedPlayer);
    updatedPlayer.achievements = [...updatedPlayer.achievements, ...newAchievementIds];

    // Check for level up
    const newLevel = updatedPlayer.level > oldLevel;

    // Save
    savePlayer(updatedPlayer);
    setCurrentPlayer(updatedPlayer);
    setAllPlayers(loadPlayers());

    // Play sounds
    if (soundEnabled) {
      if (newLevel) {
        soundManager.playLevelUp();
      } else {
        soundManager.playComplete();
      }
      if (newAchievementIds.length > 0) {
        setTimeout(() => soundManager.playStar(), 500);
      }
    }

    return {
      xpEarned: xpResult.totalXP,
      newLevel,
      newAchievements: newAchievementIds,
      breakdown: xpResult.breakdown,
    };
  }, [currentPlayer, soundEnabled]);

  // Toggle sound
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentPlayer,
        allPlayers,
        isAdmin,
        login,
        logout,
        createPlayer,
        setIsAdmin,
        completeQuiz,
        soundEnabled,
        toggleSound,
        currentScreen,
        setCurrentScreen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};