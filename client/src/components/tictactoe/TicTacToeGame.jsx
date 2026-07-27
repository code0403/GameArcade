"use client";

import { useEffect, useRef, useState } from "react";
import Board from "./Board";
import { socket } from "@/lib/socket";
import { useAuthStore } from "@/lib/store/authStore";
import api from "@/lib/api";

export default function TicTacToeGame({ roomId, players }) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [state, setState] = useState(null);
  const [error, setError] = useState("");
  const submittedRef = useRef(false);

  useEffect(() => {
    const handleState = (nextState) => setState(nextState);

    socket.emit("ttt:join", { roomId }, (res) => {
      if (!res?.ok) {
        setError(res?.msg || "Could not join game");
        return;
      }
      setState(res.state);
    });

    socket.on("ttt:state", handleState);
    return () => socket.off("ttt:state", handleState);
  }, [roomId]);

  useEffect(() => {
    if (!state || state.status === "in_progress" || submittedRef.current) return;
    submittedRef.current = true;

    const mySymbol = state.players.X === currentUserId ? "X" : "O";
    const result = state.status === "draw" ? "draw" : state.winner === mySymbol ? "win" : "loss";

    api
      .post("/scores/submit", {
        game: "tictactoe",
        mode: "multiplayer",
        moves: state.board.filter(Boolean).length,
        metadata: { opponent: "human", result, roomId }
      })
      .catch(() => {});
  }, [state, currentUserId]);

  if (error) return <p className="text-red-400 text-center">{error}</p>;
  if (!state) return <p className="text-slate-400 text-center">Loading game...</p>;

  const mySymbol = state.players.X === currentUserId ? "X" : "O";
  const isMyTurn = state.status === "in_progress" && state.turn === mySymbol;
  const findPlayer = (id) => players.find((p) => p._id === id);
  const opponent = findPlayer(mySymbol === "X" ? state.players.O : state.players.X);

  const handleCellClick = (index) => {
    if (!isMyTurn) return;
    socket.emit("ttt:move", { roomId, cellIndex: index }, (res) => {
      if (!res?.ok) setError(res?.msg || "Invalid move");
    });
  };

  let statusText;
  if (state.status === "won") {
    statusText = state.winner === mySymbol ? "You won!" : "You lost.";
  } else if (state.status === "draw") {
    statusText = "It's a draw.";
  } else {
    statusText = isMyTurn ? "Your turn" : `Waiting for ${opponent?.username ?? "opponent"}...`;
  }

  return (
    <div className="flex flex-col gap-4 items-center">
      <p className="text-lg font-semibold">{statusText}</p>
      <p className="text-sm text-slate-400">
        You are <span className="font-semibold">{mySymbol}</span>
      </p>
      <Board board={state.board} onCellClick={handleCellClick} disabled={!isMyTurn} />
    </div>
  );
}
