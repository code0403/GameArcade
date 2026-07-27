const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export function createInitialState(playerX, playerO) {
  return {
    board: Array(9).fill(null),
    players: { X: playerX, O: playerO },
    turn: "X",
    status: "in_progress",
    winner: null
  };
}

export function checkWinner(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every((cell) => cell !== null)) return "draw";
  return null;
}

export function applyMove(state, playerId, cellIndex) {
  if (state.status !== "in_progress") return { error: "Game already over" };

  const symbol = state.players.X === playerId ? "X" : state.players.O === playerId ? "O" : null;
  if (!symbol) return { error: "Not a player in this game" };
  if (state.turn !== symbol) return { error: "Not your turn" };
  if (cellIndex < 0 || cellIndex > 8 || state.board[cellIndex] !== null) return { error: "Invalid move" };

  const board = [...state.board];
  board[cellIndex] = symbol;
  const result = checkWinner(board);

  return {
    ...state,
    board,
    turn: symbol === "X" ? "O" : "X",
    status: result ? (result === "draw" ? "draw" : "won") : "in_progress",
    winner: result === "draw" ? null : result
  };
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
