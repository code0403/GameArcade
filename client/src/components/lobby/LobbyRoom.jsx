"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { socket } from "@/lib/socket";
import TicTacToeGame from "@/components/tictactoe/TicTacToeGame";
import QuizGame from "@/components/quiz/QuizGame";

const GAME_COMPONENTS = {
  tictactoe: TicTacToeGame,
  quiz: QuizGame
};

export default function LobbyRoom({ roomId }) {
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleState = (state) => setRoom(state);

    socket.emit("room:join", { roomId }, (res) => {
      if (!res?.ok) {
        setError(res?.msg || "Room not found");
        return;
      }
      setRoom(res.room);
    });

    socket.on("room:state", handleState);

    return () => {
      socket.emit("room:leave", { roomId });
      socket.off("room:state", handleState);
    };
  }, [roomId]);

  if (error) {
    return <p className="text-red-400 text-center">{error}</p>;
  }

  if (!room) {
    return <p className="text-slate-400 text-center">Joining room...</p>;
  }

  const GameComponent = GAME_COMPONENTS[room.game];

  return (
    <Card className="bg-slate-800 text-white border-slate-700 w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="capitalize">{room.game} Lobby</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {room.players.map((player) => (
            <div key={player._id} className="flex items-center gap-3 bg-slate-700 p-2 rounded-lg">
              <Avatar username={player.username} avatarUrl={player.avatarUrl} />
              <span>{player.username}</span>
            </div>
          ))}
        </div>
        {GameComponent ? (
          <GameComponent roomId={roomId} players={room.players} />
        ) : (
          <p className="text-sm text-amber-400 text-center">
            Multiplayer {room.game} is coming soon — you&apos;re both in the room and ready to go
            once it ships.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
