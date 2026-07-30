import jwt from "jsonwebtoken";
import cookie from "cookie";
import registerLobbyHandlers from "./lobby.js";
import registerLeaderboardHandlers from "./leaderboard.js";
import registerTicTacToeHandlers from "./tictactoe.js";
import registerQuizHandlers from "./quiz.js";

export default function registerSockets(io) {
  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies.token;
      if (!token) return next(new Error("Unauthorized"));

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.id;
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);
    console.log("Socket connected:", socket.id, "user:", socket.userId);

    registerLobbyHandlers(io, socket);
    registerLeaderboardHandlers(io, socket);
    registerTicTacToeHandlers(io, socket);
    registerQuizHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}
