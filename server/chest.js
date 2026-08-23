const { CONTENT, getItem } = require("../content");
const { requirePlaying } = require("./town");
const { hasItem, removeItem, addItem } = require("./players");

const TIER_ORDER = ["f", "d", "c", "b", "a", "s"];

// Dungeon rank -> chest id (f-rank gives a Wooden Chest, etc.)
const RANK_TO_CHEST = {
  f: "wooden_chest",
  d: "iron_chest",
  c: "gold_chest",
  b: "emerald_chest",
  a: "obsidian_chest",
  s: "mythic_chest",
  ss: "mythic_chest",
  ssplus: "mythic_chest",
  fast: "wooden_chest",
};

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

function chestForRank(rank) {
  return RANK_TO_CHEST[rank] || "wooden_chest";
}

// Reusable per-floor hook: give every dungeon member a chest.
function awardToMembers(room, d, chestId) {
  const members = (d.memberIds || []).map((id) => room.players.find((p) => p.id === id)).filter(Boolean);
  for (const p of members) {
    addItem(p, chestId, 1);
  }
}

function openChest(room, player, itemId) {
  requirePlaying(room, player);
  const chest = getItem(itemId);
  if (!chest || chest.slot !== "chest") {
    throw new Error("That is not a chest.");
  }
  if (!hasItem(player, itemId, 1)) {
    throw new Error("You do not have that chest.");
  }

  const tier = TIER_ORDER.includes(chest.chestTier) ? chest.chestTier : "f";
  const tierIndex = TIER_ORDER.indexOf(tier);
  const rollCount = Math.min(3, 1 + tierIndex);
  const gradeWeights = ((CONTENT.loot || {}).gradeWeights || {})[tier] || CONTENT.loot.gradeWeights.f;
  const dropChance = (CONTENT.loot && CONTENT.loot.dropChance) || {};

  const poolForRarity = (rarity) =>
    CONTENT.items.filter((it) => it.rarity === rarity && it.slot !== "chest" && it.slot !== "material");
  const pickOne = (rarity) => {
    const pool = poolForRarity(rarity);
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  };

  const items = [];
  for (let i = 0; i < rollCount; i++) {
    const rarity = weightedPick(gradeWeights);
    if (!rarity) continue;
    if (Math.random() >= (dropChance[rarity] || 0)) continue;
    const item = pickOne(rarity);
    if (!item) continue;
    addItem(player, item.id, 1);
    items.push({
      id: item.id,
      name: item.name,
      rarity: item.rarity || "common",
      description: item.description || "",
      image: item.image || "",
    });
  }
  if (!items.length) {
    // A chest should never feel empty — guarantee one item on the tier's odds.
    const rarity = weightedPick(gradeWeights);
    const item = rarity ? pickOne(rarity) : null;
    if (item) {
      addItem(player, item.id, 1);
      items.push({
        id: item.id,
        name: item.name,
        rarity: item.rarity || "common",
        description: item.description || "",
        image: item.image || "",
      });
    }
  }

  removeItem(player, itemId, 1);

  const gold = tierIndex * 12 + Math.floor(Math.random() * 12);
  const wood = tierIndex * 3;
  player.gold += gold;
  player.wood += wood;

  return { items, gold, wood };
}

module.exports = { openChest, awardToMembers, chestForRank };
