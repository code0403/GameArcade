"use client";

import { useEffect, useRef, useState } from "react";
import QuestionCard from "./QuestionCard";
import { Button } from "@/components/ui/button";
import { socket } from "@/lib/socket";
import { useAuthStore } from "@/lib/store/authStore";
import api from "@/lib/api";

export default function QuizGame({ roomId, players }) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [phase, setPhase] = useState("loading");
  const [categories, setCategories] = useState([]);
  const [question, setQuestion] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [correctIndex, setCorrectIndex] = useState(null);
  const [scores, setScores] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState("");
  const submittedRef = useRef(false);

  const findPlayer = (id) => players.find((p) => p._id === id);

  useEffect(() => {
    const handleQuestion = (payload) => {
      setQuestion(payload);
      setSelectedChoice(null);
      setCorrectIndex(null);
      setTimeLeft(payload.timeLimit);
      setPhase("question");
    };
    const handleReveal = ({ correctIndex: ci, scores: nextScores }) => {
      setCorrectIndex(ci);
      setScores(nextScores);
      setPhase("reveal");
    };
    const handleEnd = ({ scores: finalScores }) => {
      setScores(finalScores);
      setPhase("ended");
    };

    socket.emit("quiz:join", { roomId }, (res) => {
      if (!res?.ok) {
        setError(res?.msg || "Could not join quiz");
        return;
      }
      if (!res.started) {
        setCategories(res.categories);
        setPhase(res.isOwner ? "pick-category" : "waiting-category");
        return;
      }
      setScores(res.state.scores);
      handleQuestion(res.state);
    });

    socket.on("quiz:question", handleQuestion);
    socket.on("quiz:reveal", handleReveal);
    socket.on("quiz:end", handleEnd);

    return () => {
      socket.off("quiz:question", handleQuestion);
      socket.off("quiz:reveal", handleReveal);
      socket.off("quiz:end", handleEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => {
    if (phase !== "question" || timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, timeLeft]);

  useEffect(() => {
    if (phase !== "ended" || submittedRef.current) return;
    submittedRef.current = true;

    const myScore = scores[currentUserId] ?? 0;
    const opponentId = players.find((p) => p._id !== currentUserId)?._id;
    const opponentScore = scores[opponentId] ?? 0;
    const result = myScore === opponentScore ? "draw" : myScore > opponentScore ? "win" : "loss";

    api
      .post("/scores/submit", {
        game: "quiz",
        mode: "multiplayer",
        metadata: { opponent: "human", result, totalScore: myScore, roomId }
      })
      .catch(() => {});
  }, [phase, scores, currentUserId, players, roomId]);

  const handleSelectCategory = (category) => {
    socket.emit("quiz:selectCategory", { roomId, category }, (res) => {
      if (!res?.ok) setError(res?.msg || "Could not start quiz");
    });
  };

  const handleSelect = (choiceIndex) => {
    if (selectedChoice !== null) return;
    setSelectedChoice(choiceIndex);
    socket.emit("quiz:answer", { roomId, index: question.index, choiceIndex });
  };

  if (error) return <p className="text-red-400 text-center">{error}</p>;

  if (phase === "loading") return <p className="text-slate-400 text-center">Loading quiz...</p>;

  if (phase === "pick-category") {
    return (
      <div className="flex flex-col gap-3 items-center">
        <p className="font-semibold">Choose a category</p>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((c) => (
            <Button key={c} variant="secondary" className="capitalize" onClick={() => handleSelectCategory(c)}>
              {c}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "waiting-category") {
    return <p className="text-slate-400 text-center">Waiting for {findPlayer(players[0]._id)?.username} to choose a category...</p>;
  }

  if (phase === "ended") {
    const myScore = scores[currentUserId] ?? 0;
    const opponentId = players.find((p) => p._id !== currentUserId)?._id;
    const opponentScore = scores[opponentId] ?? 0;
    const resultText = myScore === opponentScore ? "It's a tie!" : myScore > opponentScore ? "You won!" : "You lost.";

    return (
      <div className="flex flex-col gap-2 items-center">
        <p className="text-xl font-bold">{resultText}</p>
        <p className="text-slate-300">
          You: {myScore} pts &middot; {findPlayer(opponentId)?.username}: {opponentScore} pts
        </p>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="flex flex-col gap-4 items-center">
      <QuestionCard
        {...question}
        timeLeft={timeLeft}
        selectedChoice={selectedChoice}
        correctIndex={phase === "reveal" ? correctIndex : null}
        onSelect={handleSelect}
      />
      <p className="text-sm text-slate-400">
        {players.map((p) => `${p.username}: ${scores[p._id] ?? 0}`).join(" · ")}
      </p>
    </div>
  );
}
