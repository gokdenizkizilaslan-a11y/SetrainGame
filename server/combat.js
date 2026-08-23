const {
  CONTENT,
  getDungeon,
  getDungeonSize,
  getSkill,
  getItem,
  getMonster,
  getClassBasicAttack,
} = require("../content");
const { dealDamage, heal, loseLife, addXp, removeItem, healForFood, addItem } = require("./players");

function randVariance(variance) {
  return 1 + (Math.random() * 2 - 1) * variance;
}

function defaultEffectFor(elem) {
  if (elem === "arcane") return "arcane";
  if (elem === "holy") return "holy";
  if (elem === "shadow") return "shadow";
  return "slash";
}

function myDungeon(room, player) {
  return (room.dungeons || []).find((d) => d.memberIds.includes(player.id)) || null;
}

function livingMembers(room, d) {
  return (d.memberIds || [])
    .map((id) => room.players.find((p) => p.id === id))
    .filter((p) => p && p.hp > 0);
}

function allMembers(room, d) {
  return (d.memberIds || [])
    .map((id) => room.players.find((p) => p.id === id))
    .filter(Boolean);
}

function currentPlayerName(room, d) {
  const p = room.players.find((q) => q.id === d.currentTurnId);
  return p ? p.name : "The party";
}

function clearTurnTimer(d) {
  if (d.turnTimer) {
    clearTimeout(d.turnTimer);
    d.turnTimer = null;
  }
}

function clearMonsterTimer(d) {
  if (d.monsterTimer) {
    clearTimeout(d.monsterTimer);
    d.monsterTimer = null;
  }
}

function addFx(d, evt) {
  if (!d.fx) d.fx = [];
  d.fx.push(evt);
}

function weightedPick(weights) {
  const entries = Object.entries(weights || {});
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  if (total <= 0) return null;
  let roll = Math.random() * total;
  for (const [key, w] of entries) {
    roll -= w;
    if (roll <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

function resetUsedSkills(d, playerId) {
  if (!d.usedSkills) d.usedSkills = {};
  d.usedSkills[playerId] = new Set();
}

function armTurnTimer(room, d) {
  clearTurnTimer(d);
  if (d.status !== "fighting" || d.phase !== "players" || !d.currentTurnId) return;
  d.turnTimer = setTimeout(() => {
    d.turnTimer = null;
    if (d.status !== "fighting") return;
    const asyncMonster = advanceTurn(room, d);
    if (!asyncMonster && typeof room.broadcast === "function") room.broadcast();
  }, CONTENT.combat.turnTimeoutMs);
}

function buildTurnOrder(room, d) {
  d.turnOrder = livingMembers(room, d)
    .sort((a, b) => b.speed - a.speed)
    .map((p) => p.id);
  d.turnIndex = 0;
  d.currentTurnId = d.turnOrder[0] || null;
  d.endedTurns = new Set();
  if (d.currentTurnId) resetUsedSkills(d, d.currentTurnId);
}

function spawnWave(room, d) {
  const def = getDungeon(d.rank);
  const size = getDungeonSize(d.size);
  const fewer = def.sizeProfile === "fewerStronger";
  const countScale = fewer ? size.fewerCount : size.count;
  const count = Math.max(1, Math.round(def.monsterCount * countScale));
  const power = def.monsterPower * size.power * (CONTENT.combat.monsterScale || 1);

  const wave = [];
  for (let i = 0; i < count; i++) {
    const m = getMonster(def.monsterPool[Math.floor(Math.random() * def.monsterPool.length)]);
    wave.push({
      id: `${m.id}_${i}`,
      kind: m.id,
      name: m.name,
      image: m.image,
      element: m.element || "physical",
      hp: Math.max(1, Math.round(m.hp * power)),
      maxHp: Math.max(1, Math.round(m.hp * power)),
      attack: Math.max(1, Math.round(m.attack * power)),
      speed: m.speed,
    });
  }

  d.wave = wave;
  d.round = 1;
  d.phase = "players";
  d.defending = {};
  d.endedTurns = new Set();
  d.result = null;
  d.status = "fighting";
  d.fx = [];
  d.usedSkills = {};
  d.monsterQueue = [];
  d.monsterTimer = null;
  for (const p of allMembers(room, d)) {
    p.hp = p.maxHp;
    p.mana = p.maxMana;
  }
  d.log = [`${def.label} ${size.label} — ${count} foe${count === 1 ? "" : "s"} bar the way.`];
  buildTurnOrder(room, d);
  d.log.push(`Round 1 — ${currentPlayerName(room, d)} moves first.`);
  armTurnTimer(room, d);
  return d;
}

function resolveSkill(player, skillId) {
  const basic = getClassBasicAttack(player.character);
  if (basic && (basic.id === skillId || skillId === "auto_attack")) {
    return { ...basic, target: "enemy", mana: 0 };
  }
  if (!player.skillLoadout.includes(skillId)) return null;
  return getSkill(skillId);
}

function act(room, player, skillId, targetId) {
  const d = myDungeon(room, player);
  if (!d || d.status !== "fighting") {
    throw new Error("No combat in progress.");
  }
  if (d.phase !== "players") {
    throw new Error("The monsters are acting.");
  }
  if (d.currentTurnId !== player.id) {
    throw new Error("It is not your turn.");
  }
  if (player.hp <= 0) {
    throw new Error("You are down.");
  }
  const skill = resolveSkill(player, skillId);
  if (!skill) {
    throw new Error("Unknown skill.");
  }
  const mana = skill.mana || 0;
  const used = (d.usedSkills && d.usedSkills[player.id]) || new Set();
  if (used.has(skillId)) {
    throw new Error("That skill is spent for this turn.");
  }
  if (player.mana < mana) {
    throw new Error("Not enough mana.");
  }
  if (skill.target === "enemy") {
    const mon = d.wave[Number(targetId)];
    if (!mon || mon.hp <= 0) {
      throw new Error("Choose a living monster.");
    }
  } else if (skill.target === "ally") {
    const target = room.players.find((p) => p.id === targetId);
    if (!target) {
      throw new Error("Choose an ally to heal.");
    }
  }

  player.mana -= mana;
  used.add(skillId);
  d.usedSkills[player.id] = used;
  if (mana > 0) addFx(d, { type: "mana", actor: player.id, amount: mana, skill: skill.id });
  if (skill.target === "enemy") {
    const mon = d.wave[Number(targetId)];
    const crit = Math.random() < (CONTENT.combat.critChance || 0);
    const critMult = crit ? CONTENT.combat.critMult || 1.5 : 1;
    const dmg = Math.max(
      1,
      Math.round(player.attack * skill.power * randVariance(CONTENT.combat.damageVariance) * critMult)
    );
    dealDamage(mon, dmg);
    addFx(d, { type: "damage", actor: player.id, target: "enemy", targetId: Number(targetId), amount: dmg, skill: skill.id, elem: skill.element || "physical", effect: skill.effect || defaultEffectFor(skill.element), crit });
    if (skill.lifesteal) {
      const healed = heal(player, Math.max(1, Math.round(dmg * skill.lifesteal)));
      addFx(d, { type: "heal", actor: player.id, target: player.id, amount: healed, source: "lifesteal", skill: skill.id, effect: "heal" });
    }
    if (skill.healSelfPct) {
      const healed = heal(player, Math.max(1, Math.round(player.maxHp * skill.healSelfPct)));
      addFx(d, { type: "heal", actor: player.id, target: player.id, amount: healed, source: "skill", skill: skill.id, effect: "heal" });
    }
  } else if (skill.target === "self") {
    if (skill.defense) {
      d.defending[player.id] = skill.defense;
      addFx(d, { type: "defend", actor: player.id, value: skill.defense, skill: skill.id, effect: "defend" });
    }
  } else if (skill.target === "ally") {
    const target = room.players.find((p) => p.id === targetId);
    if (target.hp > 0) {
      const mult = 1 + (player.healPower || 0) / 40;
      const healed = heal(target, Math.max(1, Math.round(target.maxHp * skill.heal * mult)));
      addFx(d, { type: "heal", actor: player.id, target: target.id, amount: healed, source: "skill", skill: skill.id, effect: "heal" });
    }
  } else if (skill.target === "party") {
    for (const p of livingMembers(room, d)) {
      if (skill.heal) {
        const mult = 1 + (player.healPower || 0) / 40;
        const healed = heal(p, Math.max(1, Math.round(p.maxHp * skill.heal * mult)));
        addFx(d, { type: "heal", actor: player.id, target: p.id, amount: healed, source: "skill", skill: skill.id, effect: "heal" });
      }
      if (skill.defense) {
        d.defending[p.id] = skill.defense;
        addFx(d, { type: "defend", actor: p.id, value: skill.defense, skill: skill.id, effect: "defend" });
      }
    }
  }

  if (skill.manaRestore || skill.manaRestorePct) {
    const restoreTo = skill.target === "party" ? livingMembers(room, d) : [player];
    for (const p of restoreTo) {
      const amount = Math.round((skill.manaRestorePct || 0) * p.maxMana + (skill.manaRestore || 0));
      const gained = Math.min(p.maxMana, p.mana + amount) - p.mana;
      if (gained > 0) {
        p.mana += gained;
        addFx(d, { type: "mana", actor: p.id, amount: gained, skill: skill.id, restore: true });
      }
    }
  }

  armTurnTimer(room, d);
  checkEnd(room, d);
  return d;
}

function useItem(room, player, itemId) {
  const d = myDungeon(room, player);
  if (!d || d.status !== "fighting") {
    throw new Error("No combat in progress.");
  }
  if (d.phase !== "players") {
    throw new Error("The monsters are acting.");
  }
  if (d.currentTurnId !== player.id) {
    throw new Error("It is not your turn.");
  }
  if (player.hp <= 0) {
    throw new Error("You are down.");
  }
  if (itemId === "food") {
    if (player.food < 1) {
      throw new Error("You have no food.");
    }
    player.food -= 1;
    const healed = heal(player, healForFood(player));
    addFx(d, { type: "heal", actor: player.id, target: player.id, amount: healed, source: "food", effect: "heal" });
  } else {
    const item = getItem(itemId);
    if (!item || item.slot !== "consumable") {
      throw new Error("Unknown consumable.");
    }
    removeItem(player, itemId, 1);
    const healed = heal(player, item.heal || 0);
    addFx(d, { type: "heal", actor: player.id, target: player.id, amount: healed, source: "item", item: item.id, effect: "heal" });
  }
  armTurnTimer(room, d);
  checkEnd(room, d);
  return d;
}

function endTurn(room, player) {
  const d = myDungeon(room, player);
  if (!d || d.status !== "fighting") {
    throw new Error("No combat in progress.");
  }
  if (d.phase !== "players") {
    throw new Error("The monsters are acting.");
  }
  if (d.currentTurnId !== player.id) {
    throw new Error("It is not your turn.");
  }
  if (player.hp <= 0) {
    throw new Error("You are down.");
  }
  return advanceTurn(room, d);
}

function advanceTurn(room, d) {
  clearTurnTimer(d);
  d.endedTurns.add(d.currentTurnId);
  d.turnIndex += 1;
  if (d.turnIndex < d.turnOrder.length) {
    d.currentTurnId = d.turnOrder[d.turnIndex];
    resetUsedSkills(d, d.currentTurnId);
    armTurnTimer(room, d);
    return false;
  }
  startMonsterPhase(room, d);
  return true;
}

function startMonsterPhase(room, d) {
  if (d.status !== "fighting") return;
  d.phase = "monsters";
  d.currentTurnId = null;
  clearTurnTimer(d);
  d.monsterQueue = d.wave
    .map((mon, index) => ({ mon, index }))
    .filter((x) => x.mon.hp > 0);
  clearMonsterTimer(d);
  d.monsterTimer = setTimeout(() => runNextMonster(room, d), 0);
}

function runNextMonster(room, d) {
  if (d.status !== "fighting" || d.phase !== "monsters") return;
  d.monsterTimer = null;
  if (livingMembers(room, d).length === 0 || (d.monsterQueue || []).length === 0) {
    finishMonsterPhase(room, d);
    return;
  }
  const { mon } = d.monsterQueue.shift();
  if (mon.hp > 0) {
    const targets = livingMembers(room, d);
    const target = targets[Math.floor(Math.random() * targets.length)];
    const combat = CONTENT.combat;
    const crit = Math.random() < (combat.critChance || 0);
    const critMult = crit ? combat.critMult || 1.5 : 1;
    let dmg = Math.round(mon.attack * randVariance(combat.damageVariance) * critMult);
    const def = d.defending[target.id];
    if (def) dmg = Math.round(dmg * (1 - def));
    dmg -= Math.round(target.resistance * combat.resistanceMitigation);
    dmg = Math.max(1, dmg);
    dealDamage(target, dmg);
    addFx(d, { type: "damage", actor: target.id, target: "player", targetId: target.id, amount: dmg, source: "monster", monster: mon.kind, elem: mon.element || "physical", effect: "monster", crit });
    if (typeof room.broadcast === "function") room.broadcast();
    if (livingMembers(room, d).length === 0) {
      clearMonsterTimer(d);
      defeat(room, d);
      if (typeof room.broadcast === "function") room.broadcast();
      return;
    }
  }
  if (d.status !== "fighting" || d.phase !== "monsters") return;
  clearMonsterTimer(d);
  d.monsterTimer = setTimeout(() => runNextMonster(room, d), CONTENT.combat.monsterAttackDelayMs || 900);
}

function finishMonsterPhase(room, d) {
  clearMonsterTimer(d);
  d.monsterQueue = [];
  d.defending = {};
  if (d.status !== "fighting") return;
  if (livingMembers(room, d).length === 0) {
    defeat(room, d);
    if (typeof room.broadcast === "function") room.broadcast();
    return;
  }
  d.round += 1;
  d.phase = "players";
  buildTurnOrder(room, d);
  for (const p of allMembers(room, d)) {
    const regen = p.manaRegen || CONTENT.combat.manaRegenPerRound || 3;
    p.mana = Math.min(p.maxMana, p.mana + regen);
  }
  d.log.push(`Round ${d.round} — ${currentPlayerName(room, d)} moves first.`);
  armTurnTimer(room, d);
  if (typeof room.broadcast === "function") room.broadcast();
}

function checkEnd(room, d) {
  if (d.status !== "fighting") return;
  const aliveMonsters = d.wave.filter((m) => m.hp > 0);
  if (aliveMonsters.length === 0) {
    victory(room, d);
  } else if (livingMembers(room, d).length === 0) {
    defeat(room, d);
  }
}

function victory(room, d) {
  clearTurnTimer(d);
  clearMonsterTimer(d);
  const def = getDungeon(d.rank);
  const size = getDungeonSize(d.size);
  const members = allMembers(room, d);

  const gold = Math.round(def.goldBase * size.goldScale);
  const wood = Math.round(def.woodBase * size.woodScale);
  const xp = Math.round(def.xpReward * size.xpScale);

  for (const p of members) {
    p.gold += gold;
    p.wood += wood;
    addXp(p, xp);
    if (p.hp <= 0) {
      loseLife(p);
      p.hp = p.maxHp;
    } else {
      p.hp = Math.max(1, p.hp);
    }
  }

  const lootNotes = [];
  for (const mon of d.wave) {
    if (mon.hp > 0) continue;
    const mdef = getMonster(mon.kind);
    if (!mdef) continue;
    const dropChance = (CONTENT.loot && CONTENT.loot.dropChance) || {};
    if (Math.random() >= (dropChance[mdef.rarity] || 0)) continue;
    const weights = ((CONTENT.loot || {}).gradeWeights || {})[d.rank] || CONTENT.loot.gradeWeights.f;
    const rarity = weightedPick(weights);
    if (!rarity) continue;
    const pool = CONTENT.items.filter((i) => i.rarity === rarity && i.slot !== "consumable");
    if (!pool.length) continue;
    const item = pool[Math.floor(Math.random() * pool.length)];
    const receivers = livingMembers(room, d).length ? livingMembers(room, d) : members;
    const receiver = receivers[Math.floor(Math.random() * receivers.length)];
    addItem(receiver, item.id, 1);
    lootNotes.push(`${receiver.name} found ${item.name}.`);
  }

  d.status = "done";
  d.result = {
    outcome: "victory",
    text: `Victory! The ${def.label} is clear. Each adventurer gains ${gold} gold, ${wood} wood, ${xp} XP.`,
  };
  if (lootNotes.length) {
    d.result.text += " " + lootNotes.join(" ");
    d.log.push(...lootNotes);
  }
  addFx(d, { type: "result", outcome: "victory" });
  d.log.push(d.result.text);
}

function defeat(room, d) {
  clearTurnTimer(d);
  clearMonsterTimer(d);
  const members = allMembers(room, d);
  for (const p of members) {
    loseLife(p);
    p.hp = p.maxHp;
  }
  d.status = "done";
  d.result = {
    outcome: "defeat",
    text: "Defeat... the party is routed. Each adventurer loses 1 life.",
  };
  addFx(d, { type: "result", outcome: "defeat" });
  d.log.push(d.result.text);
}

module.exports = {
  spawnWave,
  act,
  useItem,
  endTurn,
};
