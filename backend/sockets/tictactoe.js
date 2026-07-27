import { getRoom } from "../lib/matchStore.js";
import { createInitialState, applyMove } from "../game-engines/tictactoe.js";

export default function registerTicTacToeHandlers(io, socket) {
  socket.on("ttt:join", ({ roomId }, ack) => {
    const room = getRoom(roomId);
    if (!room || room.game !== "tictactoe" || !room.players.includes(socket.userId)) {
      return ack?.({ ok: false, msg: "Room not found" });
    }

    socket.join(`room:${roomId}`);
    if (!room.gameState) {
      room.gameState = createInitialState(room.players[0], room.players[1]);
    }

    io.to(`room:${roomId}`).emit("ttt:state", room.gameState);
    ack?.({ ok: true, state: room.gameState });
  });

  socket.on("ttt:move", ({ roomId, cellIndex }, ack) => {
    const room = getRoom(roomId);
    if (!room?.gameState) return ack?.({ ok: false, msg: "Game not found" });

    const result = applyMove(room.gameState, socket.userId, cellIndex);
    if (result.error) return ack?.({ ok: false, msg: result.error });

    room.gameState = result;
    io.to(`room:${roomId}`).emit("ttt:state", room.gameState);
    ack?.({ ok: true });
  });
}
