'use client'

import GameRenderer from "@/components/GameRenderer";
import { useGameSelectionStore } from "@/lib/store/gameSelectionStore";



export default function Home() {
   const { setSelectedGame, selectedGame, clearGame } = useGameSelectionStore();

  const games = [
    {name : "Memory Game", path : "/games/memory"},
    {name : "Tic Tac Toe", path : "/games/tictactoe"},
    {name : "Ludo", path : "/games/ludo"},
    {name : "Game 4", path : "/games/game4"},
  ]
  return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        {!selectedGame && (
        <>
          <h1 className="text-xl text-semibold text-gray-300 p-8">Game Arcade</h1>

          <div className="grid grid-cols-2 gap-6">
            {games.map((game) => (
              <button
                key={game.name}
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => setSelectedGame(game)}
              >
                {game.name}
              </button>
            ))}
          </div>
        </>
      )}

      {selectedGame && (
        <div className="w-full">
          <button
            onClick={clearGame}
            className="px-4 py-2 bg-red-600 text-white rounded m-4"
          >
            ← Back
          </button>

          <GameRenderer />
        </div>
      )}

        
      </main>
  );
}
