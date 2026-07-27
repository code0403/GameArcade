"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import GameContainer from "@/components/game-common/GameContainer";
import Board from "@/components/tictactoe/Board";
import { Button } from "@/components/ui/button";
import { checkWinner, pickAiMove } from "@/utils/tictactoeEngine";
import { useAuthStore } from "@/lib/store/authStore";
import api from "@/lib/api";

function AiGame({ onExit }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");
  const [status, setStatus] = useState("in_progress");
  const [winner, setWinner] = useState(null);
  const submittedRef = useRef(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (status !== "in_progress" || turn !== "O") return;
    const timeout = setTimeout(() => {
      const aiIndex = pickAiMove(board, "O");
      const nextBoard = [...board];
      nextBoard[aiIndex] = "O";
      const result = checkWinner(nextBoard);
      setBoard(nextBoard);
      if (result) {
        setStatus(result === "draw" ? "draw" : "won");
        setWinner(result === "draw" ? null : result);
      } else {
        setTurn("X");
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [turn, status, board]);

  useEffect(() => {
    if (status === "in_progress" || submittedRef.current || !isAuthenticated) return;
    submittedRef.current = true;
    const result = status === "draw" ? "draw" : winner === "X" ? "win" : "loss";
    api
      .post("/scores/submit", {
        game: "tictactoe",
        mode: "solo",
        time: Math.round((Date.now() - startTimeRef.current) / 1000),
        moves: board.filter(Boolean).length,
        metadata: { opponent: "ai", result }
      })
      .catch(() => {});
  }, [status, winner, board, isAuthenticated]);

  const handleCellClick = (index) => {
    if (status !== "in_progress" || turn !== "X" || board[index] !== null) return;
    const nextBoard = [...board];
    nextBoard[index] = "X";
    const result = checkWinner(nextBoard);
    setBoard(nextBoard);
    if (result) {
      setStatus(result === "draw" ? "draw" : "won");
      setWinner(result === "draw" ? null : result);
    } else {
      setTurn("O");
    }
  };

  const handleRestart = () => {
    setBoard(Array(9).fill(null));
    setTurn("X");
    setStatus("in_progress");
    setWinner(null);
    submittedRef.current = false;
    startTimeRef.current = Date.now();
  };

  let statusText;
  if (status === "won") statusText = winner === "X" ? "You won!" : "The AI won.";
  else if (status === "draw") statusText = "It's a draw.";
  else statusText = turn === "X" ? "Your turn" : "AI is thinking...";

  return (
    <div className="flex flex-col gap-4 items-center">
      <p className="text-lg font-semibold">{statusText}</p>
      <Board board={board} onCellClick={handleCellClick} disabled={status !== "in_progress" || turn !== "X"} />
      {!isAuthenticated && status !== "in_progress" && (
        <p className="text-sm text-amber-400">
          <Link href="/login" className="underline">Log in</Link> to save this result.
        </p>
      )}
      <div className="flex gap-2">
        {status !== "in_progress" && <Button onClick={handleRestart}>Play Again</Button>}
        <Button variant="secondary" onClick={onExit}>Change Mode</Button>
      </div>
    </div>
  );
}

export default function TicTacToePage() {
  const [mode, setMode] = useState(null);

  return (
    <GameContainer title="Tic Tac Toe">
      {mode === "ai" ? (
        <AiGame onExit={() => setMode(null)} />
      ) : (
        <div className="flex flex-col gap-4 items-center bg-slate-800 border border-slate-700 rounded-xl p-8">
          <Button onClick={() => setMode("ai")}>Play vs AI</Button>
          <p className="text-sm text-slate-400 text-center">
            Want to play a friend? Invite them from your{" "}
            <Link href="/friends" className="text-blue-400 hover:underline">
              Friends list
            </Link>
            .
          </p>
        </div>
      )}
    </GameContainer>
  );
}
