const crypto = require("crypto");
const rooms = require("./rooms");

const GRACE_MS = 60000;

const sessions = new Map(); // sessionId -> session
const byPlayerId = new Map(); // playerId -> sessionId
const graceTimers = new Map(); // sessionId -> timeout handle

function clearGrace(sessionId) {
  const t = graceTimers.get(sessionId);
  if (t) clearTimeout(t);
  graceTimers.delete(sessionId);
}

function bind(socket, rawSessionId, { mode, profile }) {
  const sessionId =
    String(rawSessionId || "").trim() || crypto.randomBytes(12).toString("hex");
  const room = rooms.getRoomForSocket(socket.id);
  const session = {
    sessionId,
    playerId: socket.id,
    roomId: room ? room.id : null,
    mode,
    profile,
    connected: true,
  };
  sessions.set(sessionId, session);
  byPlayerId.set(socket.id, sessionId);
  clearGrace(sessionId);
  return session;
}

function get(sessionId) {
  return sessions.get(sessionId) || null;
}

function getByPlayerId(playerId) {
  const sessionId = byPlayerId.get(playerId);
  return sessionId ? sessions.get(sessionId) : null;
}

function markDisconnected(playerId, onCleanup) {
  const session = getByPlayerId(playerId);
  if (!session) return null;
  session.connected = false;
  const room = rooms.getRoom(session.roomId);
  if (room) {
    const p = room.players.find((q) => q.id === playerId);
    if (p) p.connected = false;
  }
  const sessionId = session.sessionId;
  clearGrace(sessionId);
  const timer = setTimeout(() => {
    graceTimers.delete(sessionId);
    const s = sessions.get(sessionId);
    if (!s || s.connected) return;
    const result = rooms.leaveRoom(s.playerId);
    byPlayerId.delete(s.playerId);
    sessions.delete(sessionId);
    if (onCleanup && result) onCleanup(result);
  }, GRACE_MS);
  graceTimers.set(sessionId, timer);
  return session;
}

function resume(socket, sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return null;
  const oldId = session.playerId;
  const room = rooms.rebindSocket(oldId, socket.id);
  if (!room) return null;
  session.playerId = socket.id;
  session.connected = true;
  session.roomId = room.id;
  const p = room.players.find((q) => q.id === socket.id);
  if (p) p.connected = true;
  byPlayerId.delete(oldId);
  byPlayerId.set(socket.id, sessionId);
  clearGrace(sessionId);
  return room;
}

function clearForPlayer(playerId) {
  const session = getByPlayerId(playerId);
  if (!session) return;
  clearGrace(session.sessionId);
  byPlayerId.delete(playerId);
  sessions.delete(session.sessionId);
}

function updateRoom(playerId, roomId) {
  const session = getByPlayerId(playerId);
  if (session) session.roomId = roomId;
}

module.exports = { bind, get, getByPlayerId, markDisconnected, resume, clearForPlayer, updateRoom, GRACE_MS };
