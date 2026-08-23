const { CONTENT, getClass, getItem } = require("../content");
const { requirePlaying, spendStamina } = require("./town");
const { hasItem, removeItem, addItem, applyStatDelta } = require("./players");

function evolve(room, player) {
  requirePlaying(room, player);
  const baseCls = getClass(player.character);
  if (!baseCls || !baseCls.evolution) {
    throw new Error("Your class has no ascension.");
  }
  if (player.level < (baseCls.evolution.level || 20)) {
    throw new Error(`You must reach level ${baseCls.evolution.level || 20} to ascend.`);
  }
  if (!hasItem(player, "ancient_relic", 1)) {
    throw new Error("You need an Ancient Relic to ascend.");
  }
  const evolvedCls = getClass(baseCls.evolution.to);
  if (!evolvedCls) {
    throw new Error("That ascension is not written in the temple.");
  }
  spendStamina(player, CONTENT.town.temple.stamina);
  removeItem(player, "ancient_relic", 1);
  applyStatDelta(player, evolvedCls.evolveBonus || {}, 1);
  player.manaRegen += (evolvedCls.manaRegen || 0) - (baseCls.manaRegen || 0);
  player.hp = player.maxHp;
  player.mana = player.maxMana;
  player.character = evolvedCls.slug;
  for (const id of evolvedCls.startingSkills || []) {
    if (!player.unlockedSkills.includes(id)) {
      player.unlockedSkills.push(id);
    }
    if (!player.skillLoadout.includes(id)) {
      if (player.skillLoadout.length >= 5) player.skillLoadout.pop();
      player.skillLoadout.push(id);
    }
  }
  return { type: "temple", text: `You ascend into ${evolvedCls.label}!` };
}

function restoreHeart(room, player) {
  requirePlaying(room, player);
  if (player.lives >= CONTENT.starting.lives) {
    throw new Error("Your hearts are already full.");
  }
  if (!hasItem(player, CONTENT.temple.restore.item, 1)) {
    throw new Error("You need a Heart of Golem to mend a heart.");
  }
  spendStamina(player, CONTENT.town.temple.stamina);
  removeItem(player, CONTENT.temple.restore.item, 1);
  player.lives += 1;
  return { type: "temple", text: "You mend a lost heart. A life returns." };
}

function craft(room, player, recipeId) {
  requirePlaying(room, player);
  const recipe = (CONTENT.temple.recipes || []).find((r) => r.id === recipeId);
  if (!recipe) {
    throw new Error("That is not a known rite.");
  }
  for (const input of recipe.inputs || []) {
    if (!hasItem(player, input.item, input.qty)) {
      throw new Error("You lack the materials for this rite.");
    }
  }
  const cost = recipe.cost || {};
  if (player.gold < (cost.gold || 0) || player.wood < (cost.wood || 0)) {
    throw new Error("The temple needs more gold and wood.");
  }
  spendStamina(player, CONTENT.town.temple.stamina);
  for (const input of recipe.inputs || []) {
    removeItem(player, input.item, input.qty);
  }
  player.gold -= cost.gold || 0;
  player.wood -= cost.wood || 0;
  addItem(player, recipe.output.item, recipe.output.qty || 1);
  const out = getItem(recipe.output.item);
  return { type: "temple", text: `You forge ${out ? out.name : recipe.output.item}.` };
}

module.exports = { evolve, restoreHeart, craft };
