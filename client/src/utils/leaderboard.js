export function saveScore(difficulty, moves, time) {
  const key = `memory_leaderboard_${difficulty}`;

  const entry = {
    id: crypto.randomUUID(),
    moves,
    time,
    date: new Date().toISOString(),
  };

  let scores = JSON.parse(localStorage.getItem(key)) || [];

  scores.push(entry);

  // Sort by time first, then moves
  scores.sort((a, b) => {
    if (a.time === b.time) return a.moves - b.moves;
    return a.time - b.time;
  });

  // Keep top 5
  scores = scores.slice(0, 5);

  localStorage.setItem(key, JSON.stringify(scores));
}

export function getScores(difficulty) {
  const key = `memory_leaderboard_${difficulty}`;
  return JSON.parse(localStorage.getItem(key)) || [];
}
