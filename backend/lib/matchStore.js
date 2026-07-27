const rooms = new Map();

export function createRoom(roomId, data) {
  const room = { id: roomId, ...data, createdAt: Date.now() };
  rooms.set(roomId, room);
  return room;
}

export function getRoom(roomId) {
  return rooms.get(roomId);
}
