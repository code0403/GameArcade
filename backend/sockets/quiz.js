import { getRoom } from "../lib/matchStore.js";
import quizData from "../data/quizQuestions.json" with { type: "json" };

const QUESTIONS_PER_ROUND = 10;
const TIME_LIMIT_SECONDS = 10;
const REVEAL_PAUSE_MS = 3000;

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function questionPayload(gameState) {
  const q = gameState.questions[gameState.index];
  return {
    index: gameState.index,
    total: gameState.questions.length,
    question: q.question,
    options: q.options,
    category: q.category,
    difficulty: q.difficulty,
    timeLimit: TIME_LIMIT_SECONDS
  };
}

function broadcastQuestion(io, roomId, room) {
  room.gameState.startedAt = Date.now();
  room.gameState.answers = {};

  io.to(`room:${roomId}`).emit("quiz:question", questionPayload(room.gameState));

  clearTimeout(room.gameState.timer);
  room.gameState.timer = setTimeout(() => revealAndAdvance(io, roomId, room), TIME_LIMIT_SECONDS * 1000);
}

function revealAndAdvance(io, roomId, room) {
  clearTimeout(room.gameState.timer);
  const q = room.gameState.questions[room.gameState.index];

  io.to(`room:${roomId}`).emit("quiz:reveal", {
    index: room.gameState.index,
    correctIndex: q.correctIndex,
    scores: room.gameState.scores
  });

  room.gameState.index += 1;

  if (room.gameState.index >= room.gameState.questions.length) {
    room.gameState.status = "finished";
    setTimeout(() => {
      io.to(`room:${roomId}`).emit("quiz:end", { scores: room.gameState.scores });
    }, REVEAL_PAUSE_MS);
    return;
  }

  setTimeout(() => broadcastQuestion(io, roomId, room), REVEAL_PAUSE_MS);
}

export default function registerQuizHandlers(io, socket) {
  socket.on("quiz:join", ({ roomId }, ack) => {
    const room = getRoom(roomId);
    if (!room || room.game !== "quiz" || !room.players.includes(socket.userId)) {
      return ack?.({ ok: false, msg: "Room not found" });
    }
    socket.join(`room:${roomId}`);

    if (!room.gameState) {
      return ack?.({
        ok: true,
        started: false,
        isOwner: room.players[0] === socket.userId,
        categories: Object.keys(quizData)
      });
    }

    ack?.({ ok: true, started: true, state: { ...questionPayload(room.gameState), scores: room.gameState.scores } });
  });

  socket.on("quiz:selectCategory", ({ roomId, category }, ack) => {
    const room = getRoom(roomId);
    if (!room || room.game !== "quiz" || room.players[0] !== socket.userId) {
      return ack?.({ ok: false, msg: "Not authorized" });
    }
    if (room.gameState) return ack?.({ ok: false, msg: "Already started" });
    if (!quizData[category]) return ack?.({ ok: false, msg: "Invalid category" });

    room.gameState = {
      category,
      questions: shuffle(quizData[category]).slice(0, QUESTIONS_PER_ROUND),
      index: 0,
      scores: Object.fromEntries(room.players.map((p) => [p, 0])),
      answers: {},
      status: "in_progress"
    };

    ack?.({ ok: true });
    broadcastQuestion(io, roomId, room);
  });

  socket.on("quiz:answer", ({ roomId, index, choiceIndex }, ack) => {
    const room = getRoom(roomId);
    if (!room?.gameState || room.gameState.index !== index) return ack?.({ ok: false, msg: "Round already over" });
    if (room.gameState.answers[socket.userId]) return ack?.({ ok: false, msg: "Already answered" });

    const q = room.gameState.questions[index];
    const elapsed = (Date.now() - room.gameState.startedAt) / 1000;
    const correct = choiceIndex === q.correctIndex;
    const score = correct
      ? Math.max(10, Math.round(100 - Math.min(elapsed / TIME_LIMIT_SECONDS, 1) * 90))
      : 0;

    room.gameState.answers[socket.userId] = { choiceIndex, score };
    room.gameState.scores[socket.userId] = (room.gameState.scores[socket.userId] || 0) + score;
    ack?.({ ok: true, correct, score });

    if (Object.keys(room.gameState.answers).length >= room.players.length) {
      revealAndAdvance(io, roomId, room);
    }
  });
}
