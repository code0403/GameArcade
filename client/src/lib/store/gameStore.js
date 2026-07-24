import { create } from "zustand";

export const useGameStore = create((set, get) => ({
  // Game state
  cards: [],
  flippedCards: [],
  freezeBoard: false,
  
  // Stats
  moves: 0,
  time: 0,
  score: 0,
  
  // Game flow
  gameStarted: false,
  gameWon: false,
  timer: null,
  timerRunning: false,

  setTimerRunning: (running) => set({ timerRunning: !running }),

  // Actions - Timer
  startTimer: () => {
    if (get().timerRunning) return;

    const interval = setInterval(() => {
      set({ time: get().time + 1 });
    }, 1000);

    set({ timer: interval, timerRunning: true, gameStarted: true });
  },

  stopTimer: () => {
    clearInterval(get().timer);
    set({ timer: null, timerRunning: false });
  },

  resetTimer: () => {
    clearInterval(get().timer);
    set({ timer: null, time: 0, timerRunning: false, gameStarted: false });
  },

  // Actions - Game state
  setCards: (cards) => set({ cards }),
  
  setFlippedCards: (flippedCards) => set({ flippedCards }),
  
  setFreezeBoard: (frozen) => set({ freezeBoard: frozen }),
  
  incrementMoves: () => set({ moves: get().moves + 1 }),
  
  setGameWon: (won) => set({ gameWon: won }),
  
  calculateScore: () => {
    const { time, moves } = get();
    const score = Math.max(1000 - time * 5 - moves * 10, 0);
    set({ score });
  },

  // Reset everything
  resetGame: () => {
    clearInterval(get().timer);
    set({
      cards: [],
      flippedCards: [],
      freezeBoard: false,
      moves: 0,
      time: 0,
      score: 0,
      gameStarted: false,
      gameWon: false,
      timer: null,
      timerRunning: false,
    });
  },
}));
