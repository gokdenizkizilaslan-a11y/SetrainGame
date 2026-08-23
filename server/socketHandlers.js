const {
  CLASS_SLUGS,
  NAME_MIN,
  NAME_MAX,
} = require("./constants");
const rooms = require("./rooms");
const town = require("./town");
const tavern = require("./tavern");
const dungeon = require("./dungeon");
const combat = require("./combat");
const shop = require("./shop");
const merchant = require("./merchant");
const chest = require("./chest");
const stock = require("./stock");
const temple = require("./temple");
const sessions = require("./sessions");
const { onNewDay, equipItem, unequipSlot, setSkillLoadout } = require("./players");
const { publicCatalog, getClass } = require("../content");

function sanitizeName(raw) {
  const name = String(raw || "").trim().replace(/\s+/g, " ");
  if (name.length < NAME_MIN || name.length > NAME_MAX) {
    throw new Error(`Name must be ${NAME_MIN}–${NAME_MAX} characters.`);
  }
  return name;
}

function sanitizeCharacter(raw) {
  const character = String(raw || "").trim().toLowerCase();
  if (!CLASS_SLUGS.includes(character)) {
    throw new Error("Choose a valid class.");
  }
  const cls = getClass(character);
  if (cls && cls.baseClass) {
    throw new Error("Choose a base class.");
  }
  return character;
}

function requireSetup(socket) {
  if (!socket.data.profile || !socket.data.mode) {
    throw new Error("Complete player setup first.");
  }
  return socket.data;
}

function emitError(socket, err) {
  socket.emit("server:error", { message: err.message || "Something went wrong." });
}

function gameContext(socket) {
  const room = rooms.getRoomForSocket(socket.id);
  if (!room) {
    throw new Error("You are not in a hall.");
  }
  if (room.status !== "playing") {
    throw new Error("The quest has not begun.");
  }
  const player = room.players.find((p) => p.id === socket.id);
  if (!player) {
    throw new Error("You are not seated in this hall.");
  }
  return { room, player };
}

function broadcastRoomList(io) {
  const list = rooms.listPublicLobbies();
  for (const [, sock] of io.of("/").sockets) {
    const inRoom = rooms.getRoomForSocket(sock.id);
    if (!inRoom && sock.data.mode === "multi" && sock.data.profile) {
      sock.emit("room:list", list);
    }
  }
}

function emitRoomState(io, room) {
  if (!room) return;
  io.to(room.id).emit("room:state", rooms.publicRoomState(room));
}

function emitCombatFx(io, room) {
  if (!room) return;
  for (const d of room.dungeons || []) {
    if (!d.fx || !d.fx.length) continue;
    const fx = d.fx;
    d.fx = [];
    io.to(room.id).emit("combat:fx", { fx, dungeonId: d.id });
  }
}

function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    socket.data.mode = null;
    socket.data.profile = null;
    socket.emit("catalog", publicCatalog());

    socket.on("player:setup", (payload = {}) => {
      try {
        const mode = payload.mode === "single" ? "single" : payload.mode === "multi" ? "multi" : null;
        if (!mode) {
          throw new Error("Choose singleplayer or multiplayer.");
        }
        const name = sanitizeName(payload.name);
        const character = sanitizeCharacter(payload.character);
        const profile = { name, character };
        socket.data.mode = mode;
        socket.data.profile = profile;

        if (mode === "single") {
          const existing = rooms.getRoomForSocket(socket.id);
          if (existing) {
            rooms.leaveRoom(socket.id);
            socket.leave(existing.id);
          }
          const room = rooms.createRoom({
            socketId: socket.id,
            name,
            character,
            mode: "single",
          });
          socket.join(room.id);
          const session = sessions.bind(socket, payload.sessionId, { mode, profile });
          socket.emit("chat:history", room.chat);
          socket.emit("self", {
            playerId: socket.id,
            sessionId: session.sessionId,
            mode,
            profile,
          });
          emitRoomState(io, room);
        } else {
          const session = sessions.bind(socket, payload.sessionId, { mode, profile });
          socket.emit("self", {
            playerId: socket.id,
            sessionId: session.sessionId,
            mode,
            profile,
          });
          socket.emit("room:list", rooms.listPublicLobbies());
        }
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("session:resume", (payload = {}) => {
      try {
        const sessionId = String(payload.sessionId || "").trim();
        if (!sessionId) {
          throw new Error("No session to resume.");
        }
        const room = sessions.resume(socket, sessionId);
        if (!room) {
          socket.emit("session:expired");
          return;
        }
        const session = sessions.get(sessionId);
        socket.data.mode = session.mode;
        socket.data.profile = session.profile;
        socket.join(room.id);
        socket.emit("chat:history", room.chat);
        socket.emit("self", {
          playerId: socket.id,
          sessionId: session.sessionId,
          mode: session.mode,
          profile: session.profile,
        });
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("room:create", (payload = {}) => {
      try {
        const { profile, mode } = requireSetup(socket);
        if (mode !== "multi") {
          throw new Error("Room creation is for multiplayer halls.");
        }
        const room = rooms.createRoom({
          socketId: socket.id,
          name: profile.name,
          character: profile.character,
          mode: "multi",
          roomName: payload.name,
        });
        socket.join(room.id);
        sessions.updateRoom(socket.id, room.id);
        socket.emit("chat:history", room.chat);
        emitRoomState(io, room);
        broadcastRoomList(io);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("room:join", (payload = {}) => {
      try {
        const { profile, mode } = requireSetup(socket);
        if (mode !== "multi") {
          throw new Error("Joining halls is for multiplayer.");
        }
        const room = rooms.joinRoom({
          socketId: socket.id,
          name: profile.name,
          character: profile.character,
          roomId: payload.roomId,
        });
        socket.join(room.id);
        sessions.updateRoom(socket.id, room.id);
        socket.emit("chat:history", room.chat);
        emitRoomState(io, room);
        broadcastRoomList(io);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("room:joinByCode", (payload = {}) => {
      try {
        const { profile, mode } = requireSetup(socket);
        if (mode !== "multi") {
          throw new Error("Joining halls is for multiplayer.");
        }
        const room = rooms.joinRoomByCode({
          socketId: socket.id,
          name: profile.name,
          character: profile.character,
          code: payload.code,
        });
        socket.join(room.id);
        sessions.updateRoom(socket.id, room.id);
        socket.emit("chat:history", room.chat);
        emitRoomState(io, room);
        broadcastRoomList(io);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("room:leave", () => {
      try {
        const result = rooms.leaveRoom(socket.id);
        sessions.clearForPlayer(socket.id);
        if (result) {
          socket.leave(result.roomId);
          if (result.room) {
            emitRoomState(io, result.room);
          }
          socket.emit("room:left");
          if (socket.data.mode === "multi") {
            socket.emit("room:list", rooms.listPublicLobbies());
          }
          broadcastRoomList(io);
        }
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("player:ready", (payload = {}) => {
      try {
        const room = rooms.setReady(socket.id, payload.ready);
        emitRoomState(io, room);
        broadcastRoomList(io);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("game:start", () => {
      try {
        const room = rooms.startGame(socket.id);
        emitRoomState(io, room);
        broadcastRoomList(io);
      } catch (err) {
        emitError(socket, err);
      }
    });

    // ---- Chat ----

    socket.on("chat:send", (payload = {}) => {
      try {
        const room = rooms.getRoomForSocket(socket.id);
        if (!room) {
          throw new Error("You are not in a hall.");
        }
        const text = String(payload.text || "")
          .trim()
          .replace(/\s+/g, " ")
          .slice(0, 200);
        if (!text) return;
        const player = room.players.find((p) => p.id === socket.id);
        const message = rooms.addChat(room, {
          senderId: socket.id,
          name: player ? player.name : "Stranger",
          text,
          ts: Date.now(),
        });
        io.to(room.id).emit("chat:message", message);
      } catch (err) {
        emitError(socket, err);
      }
    });

    // ---- Town ----

    socket.on("town:search", () => {
      try {
        const { room, player } = gameContext(socket);
        town.requirePlaying(room, player);
        const res = town.search(player);
        room.log = {
          type: "search",
          text: res.text,
          name: player.name,
          gold: res.gold,
          wood: res.wood,
          food: res.food,
          hp: res.hp,
          ts: Date.now(),
        };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("town:endDay", () => {
      try {
        const { room, player } = gameContext(socket);
        town.requirePlaying(room, player);
        if (dungeon.dungeonFor(room, player)) {
          throw new Error("Finish or leave the delve first.");
        }
        const res = town.endDay(player);
        room.log = { type: "endDay", text: res.text, name: player.name, ts: Date.now() };
        if (room.players.every((p) => p.endedDay)) {
          room.day += 1;
          for (const p of room.players) {
            onNewDay(p);
          }
          dungeon.resetRoomDungeons(room);
          if (stock.maybeRotate(room)) {
            room.log = { type: "day", text: `Day ${room.day} dawns. The merchants restock their shelves.`, ts: Date.now() };
          } else {
            room.log = { type: "day", text: `Day ${room.day} dawns. Stamina restored.`, ts: Date.now() };
          }
        }
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("town:rest", () => {
      try {
        const { room, player } = gameContext(socket);
        town.requirePlaying(room, player);
        if (dungeon.dungeonFor(room, player)) {
          throw new Error("Finish or leave the delve first.");
        }
        const res = town.rest(player);
        room.log = { type: "rest", text: res.text, name: player.name, ts: Date.now() };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    // ---- Blacksmith / shop ----

    socket.on("blacksmith:buy", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        const res = shop.buy(room, player, payload.itemId);
        room.log = { ...res, name: player.name, ts: Date.now() };
        emitRoomState(io, room);
        socket.emit("shop:buyResult", { text: res.text, itemId: payload.itemId });
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("merchant:buy", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        const res = merchant.buy(room, player, payload.itemId);
        room.log = { ...res, name: player.name, ts: Date.now() };
        emitRoomState(io, room);
        socket.emit("shop:buyResult", { text: res.text, itemId: payload.itemId });
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("chest:open", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        const res = chest.openChest(room, player, payload.itemId);
        room.log = { type: "chest", text: `${player.name} cracks open a chest.`, name: player.name, ts: Date.now() };
        socket.emit("chest:loot", { itemId: payload.itemId, ...res });
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    // ---- Ancient Temple ----

    socket.on("temple:evolve", () => {
      try {
        const { room, player } = gameContext(socket);
        const res = temple.evolve(room, player);
        room.log = { ...res, name: player.name, ts: Date.now() };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("temple:restore", () => {
      try {
        const { room, player } = gameContext(socket);
        room.log = temple.restoreHeart(room, player);
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("temple:craft", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        room.log = temple.craft(room, player, payload.recipeId);
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    // ---- Inventory ----

    socket.on("inventory:equip", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        town.requirePlaying(room, player);
        equipItem(player, payload.itemId);
        room.log = { type: "inventory", text: `You equip ${payload.itemId}.` };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("inventory:unequip", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        town.requirePlaying(room, player);
        const itemId = unequipSlot(player, payload.slot);
        const item = require("../content").getItem(itemId);
        room.log = { type: "inventory", text: `You unequip ${item ? item.name : itemId}.` };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("skill:setLoadout", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        town.requirePlaying(room, player);
        setSkillLoadout(player, payload.skillIds);
        room.log = { type: "inventory", text: "You rearrange your skills." };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    // ---- Tavern ----

    socket.on("tavern:start", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        town.requirePlaying(room, player);
        if (payload.game === "coinflip") {
          player.tavern = tavern.startCoinFlip(player, payload.bet);
        } else if (payload.game === "blackjack") {
          player.tavern = tavern.startBlackjack(player, payload.bet);
        } else {
          throw new Error("Choose a tavern game.");
        }
        room.log = { type: "tavern", text: player.tavern.message, name: player.name, won: player.tavern.won };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("tavern:move", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        town.requirePlaying(room, player);
        tavern.blackjackMove(player, payload.move);
        room.log = { type: "tavern", text: player.tavern.message, name: player.name, won: player.tavern.won };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("tavern:buyFood", () => {
      try {
        const { room, player } = gameContext(socket);
        town.requirePlaying(room, player);
        const res = tavern.buyProvisions(player);
        room.log = res;
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    // ---- Dungeon ----

    socket.on("dungeon:join", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        town.requirePlaying(room, player);
        dungeon.joinDungeon(room, player, payload.rank, payload.size);
        room.log = { type: "dungeon", text: `${player.name} joined the delve party.` };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("dungeon:leave", () => {
      try {
        const { room, player } = gameContext(socket);
        town.requirePlaying(room, player);
        dungeon.leaveDungeon(room, player);
        room.log = { type: "dungeon", text: `${player.name} left the delve party.` };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("dungeon:start", () => {
      try {
        const { room, player } = gameContext(socket);
        town.requirePlaying(room, player);
        room.broadcast = () => {
          emitCombatFx(io, room);
          emitRoomState(io, room);
        };
        dungeon.startDungeon(room, player);
        const d = dungeon.dungeonFor(room, player);
        room.log = { type: "dungeon", text: d ? `${player.name} begins a ${d.label} delve!` : `${player.name} begins a delve!` };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("dungeon:return", () => {
      try {
        const { room, player } = gameContext(socket);
        town.requirePlaying(room, player);
        dungeon.returnFromDungeon(room, player);
        room.log = { type: "town", text: "You return to the town square." };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    // ---- Combat ----

    socket.on("combat:act", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        combat.act(room, player, payload.skillId, payload.targetId);
        emitCombatFx(io, room);
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("combat:useItem", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        combat.useItem(room, player, payload.itemId);
        emitCombatFx(io, room);
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("combat:endTurn", () => {
      try {
        const { room, player } = gameContext(socket);
        const asyncMonster = combat.endTurn(room, player);
        if (!asyncMonster) {
          emitCombatFx(io, room);
          emitRoomState(io, room);
        }
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("combat:flee", () => {
      try {
        const { room, player } = gameContext(socket);
        const result = combat.flee(room, player);
        emitCombatFx(io, room);
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("disconnect", () => {
      const session = sessions.getByPlayerId(socket.id);
      if (session) {
        sessions.markDisconnected(socket.id, (result) => {
          if (result && result.room) {
            emitRoomState(io, result.room);
          }
          broadcastRoomList(io);
        });
      } else {
        const result = rooms.leaveRoom(socket.id);
        if (result && result.room) {
          emitRoomState(io, result.room);
        }
        broadcastRoomList(io);
      }
    });
  });
}

module.exports = { registerSocketHandlers };
