const crypto = require("crypto");
const {
  MAX_PLAYERS_MULTIPLAYER,
  MAX_PLAYERS_SINGLEPLAYER,
  ROOM_CODE_LENGTH,
  ROOM_CODE_CHARS,
} = require("./constants");
const { createPlayer, rollStats, publicPlayer, onNewDay } = require("./players");
const { idleDungeon, publicDungeon } = require("./dungeon");
const stock = require("./stock");

const rooms = new Map();
const socketToRoom = new Map();

function generateId() {
  return crypto.randomBytes(8).toString("hex");
}

function generateCode() {
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_CHARS[crypto.randomInt(ROOM_CODE_CHARS.length)];
  }
  if ([...rooms.values()].some((r) => r.code === code)) {
    return generateCode();
  }
  return code;
}

function maxForMode(mode) {
  return mode === "single" ? MAX_PLAYERS_SINGLEPLAYER : MAX_PLAYERS_MULTIPLAYER;
}

function publicRoomSummary(room) {
  return {
    id: room.id,
    name: room.name,
    code: room.code,
    playerCount: room.players.length,
    maxPlayers: room.maxPlayers,
    status: room.status,
  };
}

function publicRoomState(room) {
  return {
    id: room.id,
    name: room.name,
    code: room.code,
    mode: room.mode,
    status: room.status,
    hostId: room.hostId,
    maxPlayers: room.maxPlayers,
    day: room.day,
    log: room.log,
    shopStock: room.shopStock || null,
    dungeons: (room.dungeons || []).map(publicDungeon),
    players: room.players.map(publicPlayer),
  };
}

function listPublicLobbies() {
  return [...rooms.values()]
    .filter((r) => r.mode === "multi" && r.status === "lobby")
    .map(publicRoomSummary);
}

function getRoom(roomId) {
  return rooms.get(roomId) || null;
}

function getRoomByCode(code) {
  const normalized = String(code || "")
    .trim()
    .toUpperCase();
  return [...rooms.values()].find((r) => r.code === normalized) || null;
}

function getRoomForSocket(socketId) {
  const roomId = socketToRoom.get(socketId);
  return roomId ? rooms.get(roomId) || null : null;
}

function createRoom({ socketId, name, character, mode, roomName }) {
  if (socketToRoom.has(socketId)) {
    throw new Error("Leave your current room before creating another.");
  }

  const id = generateId();
  const host = createPlayer({
    id: socketId,
    name,
    character,
    isHost: true,
  });

  const isSingle = mode === "single";
  const room = {
    id,
    name: isSingle
      ? "Solo Quest"
      : String(roomName || "").trim() || `${name}'s Hall`,
    code: generateCode(),
    mode: isSingle ? "single" : "multi",
    status: "lobby",
    hostId: socketId,
    maxPlayers: maxForMode(isSingle ? "single" : "multi"),
    day: 1,
    log: null,
    dungeons: [],
    chat: [],
    players: [host],
  };

  rooms.set(id, room);
  socketToRoom.set(socketId, id);
  return room;
}

function joinRoom({ socketId, name, character, roomId }) {
  if (socketToRoom.has(socketId)) {
    throw new Error("Leave your current room before joining another.");
  }

  const room = rooms.get(roomId);
  if (!room) {
    throw new Error("That hall no longer exists.");
  }
  if (room.mode === "single") {
    throw new Error("This is a private solo quest.");
  }
  if (room.status !== "lobby") {
    throw new Error("That quest has already begun.");
  }
  if (room.players.length >= room.maxPlayers) {
    throw new Error("That hall is full.");
  }

  const player = createPlayer({
    id: socketId,
    name,
    character,
    isHost: false,
  });
  room.players.push(player);
  socketToRoom.set(socketId, room.id);
  return room;
}

function joinRoomByCode({ socketId, name, character, code }) {
  const room = getRoomByCode(code);
  if (!room) {
    throw new Error("No hall matches that code.");
  }
  return joinRoom({ socketId, name, character, roomId: room.id });
}

function leaveRoom(socketId) {
  const room = getRoomForSocket(socketId);
  if (!room) {
    return null;
  }

  room.players = room.players.filter((p) => p.id !== socketId);
  socketToRoom.delete(socketId);

  if (room.players.length === 0) {
    for (const d of room.dungeons || []) {
      if (d.turnTimer) clearTimeout(d.turnTimer);
      if (d.monsterTimer) clearTimeout(d.monsterTimer);
    }
    rooms.delete(room.id);
    return { room: null, deleted: true, roomId: room.id };
  }

  if (room.hostId === socketId) {
    room.hostId = room.players[0].id;
    room.players[0].isHost = true;
  }

  return { room, deleted: false, roomId: room.id };
}

function setReady(socketId, ready) {
  const room = getRoomForSocket(socketId);
  if (!room) {
    throw new Error("You are not in a hall.");
  }
  if (room.status !== "lobby") {
    throw new Error("The quest has already begun.");
  }
  const player = room.players.find((p) => p.id === socketId);
  if (!player) {
    throw new Error("You are not seated in this hall.");
  }
  player.ready = Boolean(ready);
  return room;
}

function startGame(socketId) {
  const room = getRoomForSocket(socketId);
  if (!room) {
    throw new Error("You are not in a hall.");
  }
  if (room.hostId !== socketId) {
    throw new Error("Only the host may begin the quest.");
  }
  if (room.status !== "lobby") {
    throw new Error("The quest has already begun.");
  }
  if (!room.players.every((p) => p.ready)) {
    throw new Error("Every adventurer must be ready.");
  }
  room.status = "playing";
  room.day = 1;
  room.dungeons = [];
  stock.init(room);
  room.log = { type: "day", text: "Day 1 — the town stirs. Spend your stamina wisely." };
  for (const p of room.players) {
    rollStats(p);
    onNewDay(p);
    p.dungeonId = null;
  }
  return room;
}

function rebindSocket(oldSocketId, newSocketId) {
  const room = getRoomForSocket(oldSocketId);
  if (!room) return null;
  const player = room.players.find((p) => p.id === oldSocketId);
  if (!player) return null;
  player.id = newSocketId;
  socketToRoom.delete(oldSocketId);
  socketToRoom.set(newSocketId, room.id);
  if (room.hostId === oldSocketId) room.hostId = newSocketId;
  for (const d of room.dungeons || []) {
    if (d.leaderId === oldSocketId) d.leaderId = newSocketId;
    d.memberIds = d.memberIds.map((id) => (id === oldSocketId ? newSocketId : id));
    d.turnOrder = (d.turnOrder || []).map((id) => (id === oldSocketId ? newSocketId : id));
    if (d.currentTurnId === oldSocketId) d.currentTurnId = newSocketId;
  }
  return room;
}

function addChat(room, message) {
  if (!room.chat) room.chat = [];
  room.chat.push(message);
  if (room.chat.length > 100) {
    room.chat.splice(0, room.chat.length - 100);
  }
  return message;
}

function allReady(room) {
  return room.players.length > 0 && room.players.every((p) => p.ready);
}

module.exports = {
  listPublicLobbies,
  getRoom,
  getRoomForSocket,
  publicRoomState,
  createRoom,
  joinRoom,
  joinRoomByCode,
  leaveRoom,
  setReady,
  startGame,
  addChat,
  allReady,
  rebindSocket,
};
