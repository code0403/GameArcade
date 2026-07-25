export default function registerLeaderboardHandlers(io, socket) {
  socket.on("leaderboard:subscribe", ({ game, difficulty }) => {
    socket.join(`leaderboard:${game}:${difficulty}`);
  });

  socket.on("leaderboard:unsubscribe", ({ game, difficulty }) => {
    socket.leave(`leaderboard:${game}:${difficulty}`);
  });
}
