const { CONTENT, getItem } = require("../content");

const WEEK_LENGTH = 7;
const STOCK_SIZE = 6;
const MERCHANT_SLOTS = ["chest", "consumable", "material"];

function buyableRarities() {
  return (CONTENT.loot && CONTENT.loot.buyable) || ["common", "uncommon", "rare"];
}

function poolFor(kind) {
  const rarities = buyableRarities();
  return CONTENT.items.filter((i) => {
    if (!i.price || !i.price.gold) return false;
    if (!rarities.includes(i.rarity)) return false;
    if (kind === "merchant") return MERCHANT_SLOTS.includes(i.slot);
    return i.slot !== "consumable" && i.slot !== "material" && i.slot !== "chest";
  });
}

function pick(count) {
  const chosen = [];
  const list = [...count];
  while (list.length && chosen.length < STOCK_SIZE) {
    const item = list.splice(Math.floor(Math.random() * list.length), 1)[0];
    chosen.push(item.id);
  }
  return chosen;
}

function generateStock() {
  return {
    week: 1,
    blacksmith: pick(poolFor("gear")),
    merchant: pick(poolFor("merchant")),
  };
}

function init(room) {
  room.shopStock = generateStock();
  return room.shopStock;
}

function maybeRotate(room) {
  if (!room || !room.shopStock || room.day <= 0) return false;
  if ((room.day - 1) % WEEK_LENGTH !== 0) return false;
  room.shopStock = generateStock();
  room.shopStock.week = Math.ceil(room.day / WEEK_LENGTH);
  return true;
}

function inStock(room, shop, itemId) {
  const stock = room && room.shopStock && room.shopStock[shop];
  if (!stock) return true; // no stock system yet -> allow (safe fallback)
  return stock.includes(itemId);
}

module.exports = { init, maybeRotate, inStock, generateStock };
