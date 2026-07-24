"use client";

import { useEffect, useRef } from "react";
import Card from "./Card";
import { createDeck } from "@/utils/createDeck";
import cardsJSON from "@/data/memory-cards.json";
import { useGameStore } from "@/lib/store/gameStore";
import { useAuthStore } from "@/lib/store/authStore";
import WinModal from "./_components/WinModal";
import confetti from "canvas-confetti";
import api from "@/lib/api";

export default function GameGrid({cards: propCards, gridSize, setCards}) {
    // console.log(Array.isArray(propCards));
    
    // Ensure propCards is always an array
    const cards = Array.isArray(propCards) ? propCards : [];
    
  const {
    // cards,
    // setCards,
    flippedCards,
    setFlippedCards,
    freezeBoard,
    setFreezeBoard,
    moves,
    incrementMoves,
    time,
    gameWon,
    setGameWon,
    timerRunning,
    startTimer,
    stopTimer,
    resetGame: resetGameStore,
    calculateScore,
    resetTimer,
  } = useGameStore();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const initializedRef = useRef(false);
  const confettiTriggeredRef = useRef(false);

  // Don't re-initialize if cards are already provided from parent
  useEffect(() => {
    // Cards are passed from parent, no need to create them here
  }, []);

  // Trigger confetti on win
  useEffect(() => {
    if (gameWon && !confettiTriggeredRef.current) {
      confettiTriggeredRef.current = true;

      // First burst
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.7 }
      });

      // Second burst (delayed)
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.7 }
        });
      }, 400);
    }
  }, [gameWon]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      resetTimer();
    };
  }, [resetTimer]);

  // Card click handler
  const handleCardClick = (selected) => {
    if (!timerRunning) startTimer();

    if (freezeBoard) return;
    if (selected.flipped || selected.matched) return;

    // Flip selected card
    const newCards = cards.map((c) =>
      c.id === selected.id ? { ...c, flipped: true } : c
    );
    setCards(newCards);

    // Push to flippedCards
    const updatedSelected = newCards.find((c) => c.id === selected.id);
    const newFlipped = [...flippedCards, updatedSelected];
    setFlippedCards(newFlipped);

    // If only 1 card flipped → stop here
    if (newFlipped.length < 2) return;

    // EXACTLY TWO CARDS FLIPPED
    const [card1, card2] = newFlipped;

    setFreezeBoard(true);
    incrementMoves();

    // MATCH CASE
    if (card1.value === card2.value) {
      setTimeout(() => {
        const matchedCards = cards.map((c) =>
          c.value === card1.value ? { ...c, matched: true } : c
        );
        setCards(matchedCards);
        setFlippedCards([]);
        setFreezeBoard(false);

        // Check if game won
        setTimeout(() => {
          const allMatched = matchedCards.every((c) => c.matched);
          if (allMatched) {
            setGameWon(true);
            stopTimer();
            calculateScore();
            if (isAuthenticated) {
              api
                .post("/scores/submit", {
                  game: "memory",
                  difficulty: gridSize,
                  mode: "solo",
                  moves,
                  time,
                })
                .catch(() => {});
            }
          }
        }, 300);
      }, 400);

      return;
    }

    // NOT MATCH
    setTimeout(() => {
      const unfilteredCards = cards.map((c) =>
        c.id === card1.id || c.id === card2.id ? { ...c, flipped: false } : c
      );
      setCards(unfilteredCards);
      setFlippedCards([]);
      setFreezeBoard(false);
    }, 1000);
  };

  // Reset game
  const handleReset = () => {
    resetGameStore();
    confettiTriggeredRef.current = false; // Reset confetti trigger for next round
    setCards(createDeck(cardsJSON, gridSize));
  };

  return (
    <>
      {/* <div className="flex justify-between items-center mb-4 px-2">
        <div className="text-white font-semibold">Moves: {moves}</div>
        <div className="text-white font-semibold">Time: {time}s</div>
        <button
          onClick={handleReset}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Restart
        </button>
      </div> */}

      <div className="grid gap-4 p-4 mx-auto" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
        {cards.map((card) => (
          <Card key={card.id} card={card} onClick={handleCardClick} />
        ))}
      </div>

      {/* {gameWon && (
        <div className="mt-4 p-4 bg-green-600 text-white text-center rounded-xl">
          🎉 You Won in {moves} moves & {time}s!
        </div>
      )} */}

      <WinModal
        open={gameWon}
        moves={moves}
        time={time}
        onRestart={handleReset}
        scoreSaved={isAuthenticated}
      />
    </>
  );
}
