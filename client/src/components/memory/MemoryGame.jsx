"use client";

import GameGrid from "./GameGrid";
import TopBar from "../Topbar";
import { useState } from "react";
import { createDeck } from "@/utils/createDeck";
import cardsJSON from "@/data/memory-cards.json";
import DifficultySelector from "./_components/DifficultySelector";
import Leaderboard from "./_components/Leaderboard";
import { useGameStore } from "@/lib/store/gameStore";
import ConfettiBlast from "./_components/ConfettiBlast";

export default function MemoryGame() {
  const [difficulty, setDifficulty] = useState(null); // 4, 6, 8
  const [gameStarted, setGameStarted] = useState(false);
  const [cards, setCards] = useState([]);

  const {gameWon, setGameWon} = useGameStore();

  const handleStartGame = () => {
    const size = parseInt(difficulty);
    const deck = createDeck(cardsJSON, size);
    setCards(deck);
    setGameStarted(true);
  };

  return (
    <div className="w-full max-w-3xl items-center">
      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-bold">Memory Game</h1>
      </div>

      <TopBar />

      <ConfettiBlast trigger={gameWon} difficulty={parseInt(difficulty)} />

      {!gameStarted ? (
        <DifficultySelector
          selectedDifficulty={difficulty}
          setSelectedDifficulty={setDifficulty}
          onStart={handleStartGame}
        />
      ) : (
        <>
          <GameGrid
            cards={cards}
            gridSize={parseInt(difficulty)}
            setCards={setCards}
          />

          {gameWon && <Leaderboard difficulty={difficulty} />}
        </>
      )}
    </div>
  );
}
