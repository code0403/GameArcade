import { create } from "zustand";

export const useGameSelectionStore = create((set) => ({
  selectedGame: null,
  setSelectedGame: (game) => set({ selectedGame: game }),
  clearGame: () => set({ selectedGame: null }),
}));
