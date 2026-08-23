const { CONTENT, getClass, getItem } = require("../content");

function randomInt(min, max) {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

function rollRange(range) {
  return randomInt(range.min, range.max);
}

function pickAnomaly() {
  const { anomalyChance, pureBloodChance, traits } = CONTENT.anomalies;
  const r = Math.random();
  let pool;
  if (r < pureBloodChance) {
    pool = traits.filter((t) => t.pureBlood);
  } else if (r < pureBloodChance + anomalyChance) {
    pool = traits.filter((t) => !t.pureBlood);
  } else {
    return null;
  }
  if (!pool.length) return null;
  const t = pool[Math.floor(Math.random() * pool.length)];
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    pureBlood: t.pureBlood,
    rarity: t.rarity,
    frameColor: t.frameColor,
    effect: t.effect,
  };
}

function applyAnomalyStatBonus(player) {
  if (!player.anomaly || !player.anomaly.effect) return;
  const e = player.anomaly.effect;
  if (e.type === "resistanceBonus") {
    player.resistance += e.amount;
  } else if (e.type === "manaRegenBonus") {
    player.manaRegen += e.amount;
  }
}

function rollStats(player) {
  const cls = getClass(player.character);
  if (!cls) {
    throw new Error("Unknown class.");
  }
  const hp = rollRange(cls.hp);
  player.speed = cls.speed;
  player.hp = hp;
  player.maxHp = hp;
  player.attack = rollRange(cls.attack);
  player.mana = rollRange(cls.mana);
  player.maxMana = player.mana;
  player.resistance = rollRange(cls.resistance);
  player.magicPower = rollRange(cls.magicPower);
  player.healPower = cls.healPower ? rollRange(cls.healPower) : 0;
  applyAnomalyStatBonus(player);
  return player;
}

function xpToNext(currentLevel) {
  const { maxLevel, xpBase, xpExponent } = CONTENT.leveling;
  if (currentLevel >= maxLevel) return 0;
  return Math.round(xpBase * Math.pow(currentLevel, xpExponent));
}

function applyClassGrowth(player) {
  const cls = getClass(player.character);
  if (!cls) return;
  const g = cls.growth;
  player.maxHp += g.hp;
  player.hp = Math.min(player.maxHp, player.hp + g.hp);
  player.attack += g.attack;
  player.mana += g.mana;
  player.resistance += g.resistance;
  player.magicPower += g.magicPower;
  player.healPower += g.healPower || 0;
}

function addXp(player, amount) {
  const { maxLevel } = CONTENT.leveling;
  if (player.level >= maxLevel || amount <= 0) return;
  player.xp += amount;
  while (player.level < maxLevel) {
    const need = xpToNext(player.level);
    if (player.xp < need) break;
    player.xp -= need;
    player.level += 1;
    applyClassGrowth(player);
  }
  if (player.level >= maxLevel) {
    player.xp = 0;
  }
}

function createPlayer({ id, name, character, isHost = false }) {
  const anomaly = pickAnomaly();
  const cls = getClass(character);
  const starting = cls && Array.isArray(cls.startingSkills) ? cls.startingSkills.slice() : [];
  return {
    id,
    name,
    character,
    lives: CONTENT.starting.lives,
    wood: CONTENT.starting.wood,
    gold: CONTENT.starting.gold,
    food: 0,
    inventory: [],
    equipment: {
      weapon: null,
      head: null,
      armor: null,
      legs: null,
      boots: null,
      amulet: null,
      ring1: null,
      ring2: null,
    },
    unlockedSkills: starting,
    skillLoadout: starting.slice(),
    hp: 0,
    maxHp: 0,
    attack: 0,
    mana: 0,
    maxMana: 0,
    resistance: 0,
    magicPower: 0,
    healPower: 0,
    speed: 0,
    manaRegen: (CONTENT.combat.manaRegenPerRound || 3) + (cls && cls.manaRegen ? cls.manaRegen : 0),
    level: 1,
    xp: 0,
    stamina: CONTENT.starting.stamina,
    maxStamina: CONTENT.starting.maxStamina,
    endedDay: false,
    ready: false,
    isHost,
    connected: true,
    anomaly,
    tavern: null,
    dungeonId: null,
  };
}

function publicPlayer(player) {
  return {
    id: player.id,
    name: player.name,
    character: player.character,
    lives: player.lives,
    wood: player.wood,
    gold: player.gold,
    food: player.food || 0,
    inventory: (player.inventory || []).map((i) => ({ itemId: i.itemId, qty: i.qty })),
    equipment: { ...player.equipment },
    unlockedSkills: (player.unlockedSkills || []).slice(),
    skillLoadout: (player.skillLoadout || []).slice(),
    connected: player.connected !== false,
    hp: player.hp,
    maxHp: player.maxHp,
    attack: player.attack,
    mana: player.mana,
    maxMana: player.maxMana,
    resistance: player.resistance,
    magicPower: player.magicPower,
    healPower: player.healPower || 0,
    speed: player.speed,
    manaRegen: player.manaRegen || (CONTENT.combat.manaRegenPerRound || 3),
    level: player.level,
    xp: player.xp,
    xpToNext: xpToNext(player.level),
    stamina: player.stamina,
    maxStamina: player.maxStamina,
    endedDay: player.endedDay,
    ready: player.ready,
    isHost: player.isHost,
    dungeonId: player.dungeonId || null,
    anomaly: player.anomaly
      ? {
          id: player.anomaly.id,
          name: player.anomaly.name,
          description: player.anomaly.description,
          pureBlood: player.anomaly.pureBlood,
          rarity: player.anomaly.rarity,
          frameColor: player.anomaly.frameColor,
        }
      : null,
    tavern: player.tavern
      ? {
          game: player.tavern.game,
          bet: player.tavern.bet,
          playerHand: player.tavern.playerHand,
          dealerHand: player.tavern.dealerShown
            ? player.tavern.dealerHand
            : player.tavern.dealerHand.slice(0, 1),
          status: player.tavern.status,
          won: player.tavern.won,
          message: player.tavern.message,
        }
      : null,
  };
}

function onNewDay(player) {
  player.stamina = player.maxStamina;
  player.endedDay = false;
  if (player.anomaly && player.anomaly.effect) {
    const e = player.anomaly.effect;
    if (e.type === "staminaOnDay") {
      player.stamina += e.amount;
    }
    if (e.type === "manaOnDay") {
      player.mana = Math.min(player.maxMana, player.mana + e.amount);
    }
  }
}

function dealDamage(entity, amount) {
  const n = Math.max(0, Math.round(amount));
  entity.hp = Math.max(0, entity.hp - n);
  return entity.hp;
}

function heal(entity, amount) {
  const n = Math.max(0, Math.round(amount));
  entity.hp = Math.min(entity.maxHp, entity.hp + n);
  return entity.hp;
}

function loseLife(player) {
  player.lives = Math.max(0, player.lives - 1);
}

function addItem(player, itemId, qty = 1) {
  const entry = player.inventory.find((i) => i.itemId === itemId);
  if (entry) {
    entry.qty += qty;
  } else {
    player.inventory.push({ itemId, qty });
  }
}

function removeItem(player, itemId, qty = 1) {
  const entry = player.inventory.find((i) => i.itemId === itemId);
  if (!entry || entry.qty < qty) {
    throw new Error("You do not have that item.");
  }
  entry.qty -= qty;
  if (entry.qty <= 0) {
    player.inventory = player.inventory.filter((i) => i.itemId !== itemId);
  }
}

function hasItem(player, itemId, qty = 1) {
  const entry = player.inventory.find((i) => i.itemId === itemId);
  return !!(entry && entry.qty >= qty);
}

function applyStatDelta(player, stats, sign) {
  for (const [key, val] of Object.entries(stats || {})) {
    const n = Number(val) || 0;
    if (key === "maxHp" || key === "hp") {
      player.maxHp += sign * n;
      player.hp = Math.min(player.hp, player.maxHp);
    } else if (key === "mana") {
      player.maxMana += sign * n;
      player.mana = Math.min(player.mana, player.maxMana);
    } else if (key === "attack") {
      player.attack += sign * n;
    } else if (key === "resistance") {
      player.resistance += sign * n;
    } else if (key === "magicPower") {
      player.magicPower += sign * n;
    } else if (key === "healPower") {
      player.healPower += sign * n;
    } else if (key === "speed") {
      player.speed += sign * n;
    } else if (key === "manaRegen") {
      player.manaRegen += sign * n;
    }
  }
}

function equipItem(player, itemId) {
  const item = getItem(itemId);
  if (!item) {
    throw new Error("Unknown item.");
  }
  if (item.slot === "consumable") {
    throw new Error("That cannot be equipped.");
  }
  const owned = player.inventory.find((i) => i.itemId === itemId);
  if (!owned || owned.qty < 1) {
    throw new Error("You do not own that item.");
  }
  let slot = item.slot;
  if (slot === "ring") {
    if (!player.equipment.ring1) slot = "ring1";
    else if (!player.equipment.ring2) slot = "ring2";
    else throw new Error("Both ring slots are full.");
  }
  if (player.equipment[slot]) {
    unequipSlot(player, slot);
  }
  removeItem(player, itemId, 1);
  player.equipment[slot] = itemId;
  applyStatDelta(player, item.stats, 1);
  return { slot, item };
}

function unequipSlot(player, slot) {
  const itemId = player.equipment[slot];
  if (!itemId) {
    throw new Error("Nothing is equipped there.");
  }
  const item = getItem(itemId);
  if (item) applyStatDelta(player, item.stats, -1);
  addItem(player, itemId, 1);
  player.equipment[slot] = null;
  return itemId;
}

function healForFood(player) {
  const { healBase, healPct } = CONTENT.food;
  return Math.round(healBase + healPct * player.maxHp);
}

function eatFood(player) {
  if (player.food < 1) {
    throw new Error("You have no food.");
  }
  player.food -= 1;
  return heal(player, healForFood(player));
}

function setSkillLoadout(player, ids) {
  const arr = Array.isArray(ids) ? ids.slice(0, 5) : [];
  for (const id of arr) {
    if (!player.unlockedSkills.includes(id)) {
      throw new Error("That skill is not unlocked.");
    }
  }
  player.skillLoadout = arr;
}

module.exports = {
  createPlayer,
  rollStats,
  publicPlayer,
  addXp,
  xpToNext,
  onNewDay,
  randomInt,
  dealDamage,
  heal,
  loseLife,
  addItem,
  removeItem,
  hasItem,
  applyStatDelta,
  equipItem,
  unequipSlot,
  healForFood,
  eatFood,
  setSkillLoadout,
};
