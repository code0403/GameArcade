"use client";

import MemoryGamePage from "@/app/games/memory/page";
import { useGameSelectionStore } from "@/lib/store/gameSelectionStore";

export default function GameRenderer() {
  const selectedGame = useGameSelectionStore((state) => state.selectedGame);

  if (!selectedGame) return null;

  switch (selectedGame.path) {
    case "/games/memory":
      return <MemoryGamePage />;
    // add other games here later
    default:
      return <div className="text-white">Game not found.</div>;
  }
}
