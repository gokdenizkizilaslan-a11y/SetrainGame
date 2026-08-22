const { CONTENT } = require("../content");
const { spendStamina } = require("./town");

function validBet(bet) {
  const n = Number(bet);
  if (!CONTENT.town.tavern.bets.includes(n)) {
    throw new Error("Choose a wager of 5, 10, or 25 gold.");
  }
  return n;
}

function drawCard() {
  const v = 1 + Math.floor(Math.random() * 13);
  if (v === 1) return { rank: "A", value: 11 };
  if (v >= 11) return { rank: ["J", "Q", "K"][v - 11], value: 10 };
  return { rank: String(v), value: v };
}

function handTotal(hand) {
  let total = hand.reduce((s, c) => s + c.value, 0);
  let aces = hand.filter((c) => c.rank === "A").length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

function startCoinFlip(player, bet) {
  if (player.tavern && player.tavern.status === "playing") {
    throw new Error("Finish your current game first.");
  }
  const amount = validBet(bet);
  if (player.gold < amount) {
    throw new Error("Not enough gold.");
  }
  spendStamina(player, CONTENT.town.tavern.stamina);
  player.gold -= amount;
  const win = Math.random() < 0.5;
  if (win) {
    player.gold += amount * 2;
  }
  player.tavern = {
    game: "coinflip",
    bet: amount,
    playerHand: [],
    dealerHand: [],
    dealerShown: true,
    status: "done",
    won: win,
    message: win ? `The coin favors you. +${amount} gold.` : `The coin falls against you. -${amount} gold.`,
  };
  return player.tavern;
}

function startBlackjack(player, bet) {
  if (player.tavern && player.tavern.status === "playing") {
    throw new Error("Finish your current game first.");
  }
  const amount = validBet(bet);
  if (player.gold < amount) {
    throw new Error("Not enough gold.");
  }
  spendStamina(player, CONTENT.town.tavern.stamina);
  player.gold -= amount;
  const playerHand = [drawCard(), drawCard()];
  const dealerHand = [drawCard(), drawCard()];
  player.tavern = {
    game: "blackjack",
    bet: amount,
    playerHand,
    dealerHand,
    dealerShown: false,
    status: "playing",
    message: "Hit or stand.",
  };
  const p = handTotal(playerHand);
  const d = handTotal(dealerHand);
  if (p === 21 && d === 21) {
    settleBlackjack(player, "push");
  } else if (p === 21) {
    settleBlackjack(player, "blackjack");
  }
  return player.tavern;
}

function settleBlackjack(player, result) {
  const bet = player.tavern.bet;
  player.tavern.dealerShown = true;
  player.tavern.status = "done";
  player.tavern.won =
    result === "win" || result === "blackjack" ? true : result === "push" ? null : false;
  if (result === "blackjack") {
    const win = Math.floor(bet * 2.5);
    player.gold += win;
    player.tavern.message = `Blackjack. +${win - bet} gold.`;
  } else if (result === "win") {
    player.gold += bet * 2;
    player.tavern.message = `You win. +${bet} gold.`;
  } else if (result === "push") {
    player.gold += bet;
    player.tavern.message = "Push. Your gold is returned.";
  } else if (result === "bust") {
    player.tavern.message = "Bust. The house keeps the wager.";
  } else {
    player.tavern.message = "Dealer wins.";
  }
}

function dealerPlay(player) {
  while (handTotal(player.tavern.dealerHand) < 17) {
    player.tavern.dealerHand.push(drawCard());
  }
}

function blackjackMove(player, move) {
  if (!player.tavern || player.tavern.game !== "blackjack" || player.tavern.status !== "playing") {
    throw new Error("No blackjack hand in play.");
  }
  if (move === "hit") {
    player.tavern.playerHand.push(drawCard());
    const total = handTotal(player.tavern.playerHand);
    if (total > 21) {
      settleBlackjack(player, "bust");
    } else {
      player.tavern.message = `You have ${total}. Hit or stand.`;
    }
  } else if (move === "stand") {
    dealerPlay(player);
    const p = handTotal(player.tavern.playerHand);
    const d = handTotal(player.tavern.dealerHand);
    if (d > 21 || p > d) settleBlackjack(player, "win");
    else if (p === d) settleBlackjack(player, "push");
    else settleBlackjack(player, "lose");
  } else {
    throw new Error("Hit or stand.");
  }
  return player.tavern;
}

function buyProvisions(player) {
  const prov = CONTENT.town.tavern.provisions;
  if (player.gold < prov.foodPrice) {
    throw new Error("Not enough gold.");
  }
  player.gold -= prov.foodPrice;
  player.food = (player.food || 0) + prov.foodAmount;
  return {
    type: "tavern",
    text: `You stock ${prov.foodAmount} food for ${prov.foodPrice} gold.`,
  };
}

module.exports = { startCoinFlip, startBlackjack, blackjackMove, handTotal, buyProvisions };
