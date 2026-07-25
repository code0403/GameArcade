import crypto from "crypto";
import userModel from "../models/userModel.js";
import { createRoom, getRoom } from "../lib/matchStore.js";

const pendingInvites = new Map(); // inviteId -> { from, to, game }

export default function registerLobbyHandlers(io, socket) {
  socket.on("lobby:invite", async ({ toUserId, game }, ack) => {
    try {
      const me = await userModel.findById(socket.userId);
      if (!me.friends.some((id) => String(id) === toUserId)) {
        return ack?.({ ok: false, msg: "You can only invite friends" });
      }

      const inviteId = crypto.randomUUID();
      pendingInvites.set(inviteId, { from: socket.userId, to: toUserId, game });

      const online = (io.sockets.adapter.rooms.get(`user:${toUserId}`)?.size ?? 0) > 0;

      io.to(`user:${toUserId}`).emit("lobby:invite", {
        inviteId,
        game,
        fromUser: { id: me._id, username: me.username }
      });

      ack?.({ ok: true, inviteId, delivered: online });
    } catch (err) {
      console.error(err);
      ack?.({ ok: false, msg: "Server error" });
    }
  });

  socket.on("lobby:accept", async ({ inviteId }, ack) => {
    const invite = pendingInvites.get(inviteId);
    if (!invite || invite.to !== socket.userId) {
      return ack?.({ ok: false, msg: "Invite not found" });
    }
    pendingInvites.delete(inviteId);

    const roomId = crypto.randomUUID();
    const room = createRoom(roomId, {
      game: invite.game,
      players: [invite.from, invite.to],
      status: "waiting"
    });

    io.to(`user:${invite.from}`).to(`user:${invite.to}`).emit("lobby:accepted", { roomId, ...room });
    ack?.({ ok: true, roomId });
  });

  socket.on("lobby:decline", ({ inviteId }) => {
    const invite = pendingInvites.get(inviteId);
    if (!invite || invite.to !== socket.userId) return;
    pendingInvites.delete(inviteId);
    io.to(`user:${invite.from}`).emit("lobby:declined", { inviteId });
  });

  socket.on("room:join", async ({ roomId }, ack) => {
    const room = getRoom(roomId);
    if (!room || !room.players.includes(socket.userId)) {
      return ack?.({ ok: false, msg: "Room not found" });
    }
    socket.join(`room:${roomId}`);

    const players = await userModel.find({ _id: { $in: room.players } }).select("username avatarUrl").lean();
    const state = { ...room, players };
    io.to(`room:${roomId}`).emit("room:state", state);
    ack?.({ ok: true, room: state });
  });

  socket.on("room:leave", ({ roomId }) => {
    socket.leave(`room:${roomId}`);
  });
}
