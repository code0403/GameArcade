"use client";

import { useGameStore } from "@/lib/store/gameStore";

export default function TopBar() {
  const { time, moves, score } = useGameStore();

  return (
    <div className="w-full flex justify-between items-center bg-gray-900 text-white px-4 py-3 rounded-xl mb-4">
      <div className="text-lg font-semibold">⏱ Time: {time}s</div>
      <div className="text-lg font-semibold">🎯 Moves: {moves}</div>
      <div className="text-lg font-semibold">⭐ Score: {score}</div>
    </div>
  );
}
