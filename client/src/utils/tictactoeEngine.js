const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export function checkWinner(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every((cell) => cell !== null)) return "draw";
  return null;
}

// Perfect-play minimax — cheap enough at 3x3 to search exhaustively.
export function pickAiMove(board, aiSymbol) {
  const opponent = aiSymbol === "X" ? "O" : "X";

  function minimax(currentBoard, isMaximizing) {
    const result = checkWinner(currentBoard);
    if (result === aiSymbol) return { score: 10 };
    if (result === opponent) return { score: -10 };
    if (result === "draw") return { score: 0 };

    const candidates = [];
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] !== null) continue;
      const nextBoard = [...currentBoard];
      nextBoard[i] = isMaximizing ? aiSymbol : opponent;
      candidates.push({ index: i, score: minimax(nextBoard, !isMaximizing).score });
    }

    return isMaximizing
      ? candidates.reduce((best, m) => (m.score > best.score ? m : best))
      : candidates.reduce((best, m) => (m.score < best.score ? m : best));
  }

  return minimax(board, true).index;
}
