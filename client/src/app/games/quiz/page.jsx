"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import GameContainer from "@/components/game-common/GameContainer";
import QuestionCard from "@/components/quiz/QuestionCard";
import { Button } from "@/components/ui/button";
import quizData from "@/data/quizQuestions.json";
import { useAuthStore } from "@/lib/store/authStore";
import api from "@/lib/api";

const TIME_LIMIT = 10;
const REVEAL_PAUSE_MS = 1200;

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function SoloQuiz({ category, onExit }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [questions] = useState(() => shuffle(quizData[category]).slice(0, 10));
  const [index, setIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [correctIndex, setCorrectIndex] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [totalScore, setTotalScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState("question");
  const startedAtRef = useRef(Date.now());
  const gameStartRef = useRef(Date.now());
  const submittedRef = useRef(false);

  const question = questions[index];

  const finishRound = (choiceIndex) => {
    const elapsed = (Date.now() - startedAtRef.current) / 1000;
    const correct = choiceIndex === question.correctIndex;
    const score = correct ? Math.max(10, Math.round(100 - Math.min(elapsed / TIME_LIMIT, 1) * 90)) : 0;

    setSelectedChoice(choiceIndex);
    setCorrectIndex(question.correctIndex);
    setTotalScore((s) => s + score);
    if (correct) setCorrectCount((c) => c + 1);
    setPhase("reveal");
  };

  useEffect(() => {
    if (phase !== "question" || timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, timeLeft]);

  useEffect(() => {
    if (phase === "question" && timeLeft === 0) finishRound(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase]);

  useEffect(() => {
    if (phase !== "reveal") return;
    const timer = setTimeout(() => {
      if (index + 1 >= questions.length) {
        setPhase("ended");
      } else {
        setIndex((i) => i + 1);
        setSelectedChoice(null);
        setCorrectIndex(null);
        setTimeLeft(TIME_LIMIT);
        startedAtRef.current = Date.now();
        setPhase("question");
      }
    }, REVEAL_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [phase, index, questions.length]);

  useEffect(() => {
    if (phase !== "ended" || submittedRef.current || !isAuthenticated) return;
    submittedRef.current = true;
    api
      .post("/scores/submit", {
        game: "quiz",
        mode: "solo",
        moves: correctCount,
        time: Math.round((Date.now() - gameStartRef.current) / 1000),
        metadata: { category, totalScore }
      })
      .catch(() => {});
  }, [phase, isAuthenticated, correctCount, totalScore, category]);

  if (phase === "ended") {
    return (
      <div className="flex flex-col gap-3 items-center">
        <p className="text-xl font-bold">Quiz complete!</p>
        <p className="text-slate-300">
          {correctCount}/{questions.length} correct &middot; {totalScore} pts
        </p>
        {!isAuthenticated && (
          <p className="text-sm text-amber-400">
            <Link href="/login" className="underline">Log in</Link> to save this result.
          </p>
        )}
        <Button variant="secondary" onClick={onExit}>Change Category</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 items-center">
      <QuestionCard
        question={question.question}
        options={question.options}
        category={question.category}
        difficulty={question.difficulty}
        index={index}
        total={questions.length}
        timeLeft={timeLeft}
        selectedChoice={selectedChoice}
        correctIndex={phase === "reveal" ? correctIndex : null}
        onSelect={finishRound}
      />
      <p className="text-sm text-slate-400">Score: {totalScore} pts</p>
    </div>
  );
}

export default function QuizPage() {
  const [category, setCategory] = useState(null);
  const categories = Object.keys(quizData);

  return (
    <GameContainer title="Quiz">
      {category ? (
        <SoloQuiz category={category} onExit={() => setCategory(null)} />
      ) : (
        <div className="flex flex-col gap-4 items-center bg-slate-800 border border-slate-700 rounded-xl p-8">
          <p className="font-semibold">Choose a category</p>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((c) => (
              <Button key={c} variant="secondary" className="capitalize" onClick={() => setCategory(c)}>
                {c}
              </Button>
            ))}
          </div>
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
