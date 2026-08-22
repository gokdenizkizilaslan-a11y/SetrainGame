const { getDungeon, getDungeonSize } = require("../content");
const { spendStamina } = require("./town");
const { spawnWave } = require("./combat");

function idleDungeon() {
  return {
    rank: null,
    size: null,
    leaderId: null,
    memberIds: [],
    status: "idle",
    round: 1,
    wave: [],
    phase: "players",
    turnOrder: [],
    turnIndex: 0,
    currentTurnId: null,
    defending: {},
    endedTurns: new Set(),
    usedSkills: {},
    fx: [],
    turnTimer: null,
    monsterQueue: [],
    monsterTimer: null,
    result: null,
    log: [],
  };
}

function delveUnderway(dungeon) {
  return dungeon.status === "fighting" || dungeon.status === "done";
}

function joinDungeon(room, player, rank, size) {
  const dungeonDef = getDungeon(rank);
  const sizeDef = getDungeonSize(size);
  if (!dungeonDef || !sizeDef) {
    throw new Error("Unknown dungeon or size.");
  }
  if (player.endedDay) {
    throw new Error("You have already ended this day.");
  }
  if (delveUnderway(room.dungeon)) {
    throw new Error("A delve is already underway.");
  }

  const matches = room.dungeon.rank === dungeonDef.rank && room.dungeon.size === sizeDef.id;
  if (room.dungeon.status === "idle" || !matches) {
    room.dungeon = {
      ...idleDungeon(),
      rank: dungeonDef.rank,
      size: sizeDef.id,
      leaderId: player.id,
      memberIds: [player.id],
      status: "forming",
    };
    return room.dungeon;
  }

  if (room.dungeon.memberIds.includes(player.id)) {
    return room.dungeon;
  }
  if (room.dungeon.memberIds.length >= room.maxPlayers) {
    throw new Error("That delve is full.");
  }
  room.dungeon.memberIds.push(player.id);
  return room.dungeon;
}

function leaveDungeon(room, player) {
  if (room.dungeon.status === "idle") return room.dungeon;
  if (delveUnderway(room.dungeon)) {
    room.dungeon = idleDungeon();
    return room.dungeon;
  }
  room.dungeon.memberIds = room.dungeon.memberIds.filter((id) => id !== player.id);
  if (room.dungeon.memberIds.length === 0) {
    room.dungeon = idleDungeon();
    return room.dungeon;
  }
  if (room.dungeon.leaderId === player.id) {
    room.dungeon.leaderId = room.dungeon.memberIds[0];
  }
  return room.dungeon;
}

function startDungeon(room, player) {
  const d = room.dungeon;
  if (d.status !== "forming" || !d.rank || !d.size) {
    throw new Error("Gather a party first.");
  }
  if (d.leaderId !== player.id) {
    throw new Error("Only the delve leader may start.");
  }
  const sizeDef = getDungeonSize(d.size);
  const members = d.memberIds.map((id) => room.players.find((p) => p.id === id));
  if (members.some((m) => !m)) {
    throw new Error("A party member is missing.");
  }
  for (const m of members) {
    if (m.endedDay) {
      throw new Error(`${m.name} has already ended the day.`);
    }
    if (m.stamina < sizeDef.stamina) {
      throw new Error(`${m.name} needs ${sizeDef.stamina} stamina.`);
    }
  }
  for (const m of members) {
    spendStamina(m, sizeDef.stamina);
  }
  spawnWave(room);
  return room.dungeon;
}

function returnFromDungeon(room) {
  room.dungeon = idleDungeon();
  return room.dungeon;
}

function publicDungeon(room) {
  const d = room.dungeon;
  const def = d.rank ? getDungeon(d.rank) : null;
  const sizeDef = d.size ? getDungeonSize(d.size) : null;
  return {
    rank: d.rank,
    size: d.size,
    label: def ? def.label : null,
    image: def ? def.image : null,
    stamina: sizeDef ? sizeDef.stamina : null,
    leaderId: d.leaderId,
    memberIds: d.memberIds,
    status: d.status,
    round: d.round,
    phase: d.phase,
    turnOrder: d.turnOrder || [],
    turnIndex: d.turnIndex || 0,
    currentTurnId: d.currentTurnId || null,
    defending: d.defending || {},
    usedSkills: d.usedSkills
      ? Object.fromEntries(Object.entries(d.usedSkills).map(([k, v]) => [k, [...(v || [])]]))
      : {},
    wave: d.wave.map((m) => ({ id: m.id, kind: m.kind, name: m.name, image: m.image, hp: m.hp, maxHp: m.maxHp })),
    result: d.result,
    log: d.log,
  };
}

module.exports = {
  idleDungeon,
  joinDungeon,
  leaveDungeon,
  startDungeon,
  returnFromDungeon,
  publicDungeon,
};
