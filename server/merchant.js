const { CONTENT, getItem } = require("../content");
const { requirePlaying, spendStamina } = require("./town");
const { addItem } = require("./players");
const stock = require("./stock");

const SELLABLE_SLOTS = ["chest", "consumable", "material"];

function buy(room, player, itemId) {
  requirePlaying(room, player);
  const item = getItem(itemId);
  if (!item || !item.price || !SELLABLE_SLOTS.includes(item.slot)) {
    throw new Error("The merchant has no such wares.");
  }
  if (!stock.inStock(room, "merchant", itemId)) {
    throw new Error("The merchant doesn't have that today.");
  }
  if (player.gold < item.price.gold || player.wood < item.price.wood) {
    throw new Error("The merchant needs more gold and wood.");
  }
  spendStamina(player, CONTENT.town.merchant.stamina);
  player.gold -= item.price.gold;
  player.wood -= item.price.wood;
  if (item.food) {
    player.food = (player.food || 0) + item.food;
  } else {
    addItem(player, item.id, 1);
  }
  return { type: "merchant", text: `You buy ${item.name}.`, item: item.id };
}

module.exports = { buy };
