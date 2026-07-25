"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { socket } from "@/lib/socket";

export default function Leaderboard({ difficulty }) {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/scores/leaderboard", { params: { game: "memory", difficulty } })
      .then(({ data }) => {
        if (!cancelled) setScores(data.top);
      })
      .catch(() => {
        if (!cancelled) setScores([]);
      });
    return () => {
      cancelled = true;
    };
  }, [difficulty]);

  useEffect(() => {
    const handleUpdate = (top) => setScores(top);
    socket.emit("leaderboard:subscribe", { game: "memory", difficulty });
    socket.on("leaderboard:update", handleUpdate);

    return () => {
      socket.emit("leaderboard:unsubscribe", { game: "memory", difficulty });
      socket.off("leaderboard:update", handleUpdate);
    };
  }, [difficulty]);

  return (
    <Card className="bg-slate-800 text-white w-full max-w-md mx-auto mt-6">
      <CardHeader>
        <CardTitle className="text-center">
          Leaderboard – {difficulty}×{difficulty}
        </CardTitle>
      </CardHeader>

      <Separator className="bg-slate-600" />

      <CardContent>
        {scores.length === 0 ? (
          <p className="text-center text-gray-400 py-4">No scores yet!</p>
        ) : (
          <div className="flex flex-col gap-4">
            {scores.map((s, index) => (
              <div
                key={s._id}
                className="flex justify-between items-center bg-slate-700 p-3 rounded-lg"
              >
                <Badge variant="outline">{index + 1}</Badge>
                <div className="text-sm">
                  <p className="font-semibold">{s.username}</p>
                  <p>⏱ {s.time}s</p>
                  <p>🎯 {s.moves} moves</p>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(s.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
