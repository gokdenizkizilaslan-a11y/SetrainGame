// Declarative definitions for everything the content editors can change.
// Used by BOTH the terminal editor (edit-content.js) and the web editor (/editor).
//
// Field types:
//   number  — plain number
//   percent — shown as %, stored as 0..1
//   string  — single line text
//   array   — comma separated strings
//   choice  — pick one of `options` (an array, or a function(data) returning an array)
//   bool    — yes / no
//   statmap — a set of stat bonuses; `statKeys` lists the available stats
//
// In a collection, `key` is a dotted path within one entry. In a form page,
// `path` is a dotted path into the whole CONTENT object.
"use strict";

const statLabels = {
  maxHp: "Max HP",
  hp: "Max HP",
  attack: "Attack",
  mana: "Mana",
  manaRegen: "Mana Regen",
  resistance: "Resistance",
  magicPower: "Magic Power",
  healPower: "Heal Power",
  speed: "Speed",
};

const ELEMENTS = ["physical", "arcane", "shadow", "holy"];
const SLOTS = ["weapon", "head", "armor", "legs", "boots", "amulet", "ring", "consumable", "material"];

const rarityOptions = (data) =>
  (data && data.loot && data.loot.rarityOrder) ||
  ["common", "uncommon", "rare", "epic", "legendary", "mythic", "ancient_relic"];

function formatLabel(template, item) {
  return (template || "{name}").replace(/\{(\w+)\}/g, (m, k) =>
    item && item[k] !== undefined ? String(item[k]) : ""
  );
}

const collections = [
  {
    id: "classes",
    label: "Classes",
    kind: "collection",
    path: "classes",
    idField: "slug",
    idLabel: "slug",
    nameField: "label",
    nameLabel: "Display name",
    itemLabelTemplate: "{label} ({slug})",
    newStrips: ["evolution", "baseClass"],
    fields: [
      { key: "label", label: "Name", type: "string" },
      { key: "speed", label: "Speed", type: "number" },
      { key: "hp.min", label: "Base HP (min)", type: "number" },
      { key: "hp.max", label: "Base HP (max)", type: "number" },
      { key: "attack.min", label: "Base Attack (min)", type: "number" },
      { key: "attack.max", label: "Base Attack (max)", type: "number" },
      { key: "mana.min", label: "Base Mana (min)", type: "number" },
      { key: "mana.max", label: "Base Mana (max)", type: "number" },
      { key: "resistance.min", label: "Base Resistance (min)", type: "number" },
      { key: "resistance.max", label: "Base Resistance (max)", type: "number" },
      { key: "magicPower.min", label: "Base Magic Power (min)", type: "number" },
      { key: "magicPower.max", label: "Base Magic Power (max)", type: "number" },
      { key: "healPower.min", label: "Base Heal Power (min)", type: "number" },
      { key: "healPower.max", label: "Base Heal Power (max)", type: "number" },
      { key: "manaRegen", label: "Extra mana per round", type: "number" },
      { key: "growth.hp", label: "HP gained per level", type: "number" },
      { key: "growth.attack", label: "Attack per level", type: "number" },
      { key: "growth.mana", label: "Mana per level", type: "number" },
      { key: "growth.resistance", label: "Resistance per level", type: "number" },
      { key: "growth.magicPower", label: "Magic Power per level", type: "number" },
      { key: "growth.healPower", label: "Heal Power per level", type: "number" },
      {
        key: "evolveBonus",
        label: "Evolution stat bonus",
        type: "statmap",
        statKeys: ["hp", "attack", "mana", "resistance", "magicPower", "healPower"],
        if: (c) => !!c.evolveBonus,
      },
    ],
  },

  {
    id: "monsters",
    label: "Monsters",
    kind: "collection",
    path: "monsters",
    idField: "id",
    idLabel: "id",
    nameField: "name",
    itemLabelTemplate: "{name} ({rarity}, {hp}hp)",
    fields: [
      { key: "name", label: "Name", type: "string" },
      { key: "hp", label: "HP", type: "number" },
      { key: "attack", label: "Attack", type: "number" },
      { key: "speed", label: "Speed", type: "number" },
      { key: "rarity", label: "Rarity (higher = rarer drops)", type: "choice", options: rarityOptions },
      { key: "element", label: "Element", type: "choice", options: ELEMENTS },
      { key: "image", label: "Image path", type: "string" },
    ],
  },

  {
    id: "items",
    label: "Items & Shop",
    kind: "collection",
    path: "items",
    idField: "id",
    idLabel: "id",
    nameField: "name",
    itemLabelTemplate: "{name} ({rarity})",
    fields: [
      { key: "name", label: "Name", type: "string" },
      { key: "slot", label: "Slot", type: "choice", options: SLOTS },
      { key: "rarity", label: "Rarity", type: "choice", options: rarityOptions },
      { key: "price.gold", label: "Gold price (0 = not sold)", type: "number" },
      { key: "price.wood", label: "Wood price", type: "number" },
      {
        key: "stats",
        label: "Stats",
        type: "statmap",
        statKeys: ["attack", "maxHp", "mana", "manaRegen", "resistance", "magicPower", "healPower", "speed"],
      },
      { key: "heal", label: "HP healed when used (consumables)", type: "number", if: (i) => i.slot === "consumable" },
      { key: "food", label: "Food gained when used (consumables)", type: "number", if: (i) => i.slot === "consumable" },
      { key: "description", label: "Description", type: "string" },
      { key: "image", label: "Image path", type: "string" },
    ],
  },

  {
    id: "skills",
    label: "Skills",
    kind: "collection",
    path: "skills",
    idField: "id",
    idLabel: "id",
    nameField: "name",
    itemLabelTemplate: "{name} ({mana} mana)",
    fields: [
      { key: "name", label: "Name", type: "string" },
      { key: "target", label: "Target", type: "choice", options: ["enemy", "ally", "self", "party"] },
      { key: "mana", label: "Mana cost", type: "number" },
      { key: "power", label: "Damage (1.6 = 1.6×)", type: "number" },
      { key: "element", label: "Element", type: "choice", options: ELEMENTS },
      { key: "heal", label: "Heal % of target's max HP", type: "percent" },
      { key: "healSelfPct", label: "Heal % of own max HP", type: "percent" },
      { key: "defense", label: "Damage blocked %", type: "percent" },
      { key: "lifesteal", label: "Lifesteal % of damage dealt", type: "percent" },
      { key: "manaRestorePct", label: "Restore % of max mana", type: "percent" },
      { key: "manaRestore", label: "Flat mana restored", type: "number" },
      { key: "description", label: "Description", type: "string" },
      { key: "image", label: "Image path", type: "string" },
    ],
  },

  {
    id: "dungeons",
    label: "Dungeons",
    kind: "collection",
    path: "dungeons",
    idField: "rank",
    idLabel: "rank",
    itemLabelTemplate: "{label} ({rank})",
    fields: [
      { key: "label", label: "Label", type: "string" },
      { key: "stamina", label: "Stamina to enter", type: "number" },
      { key: "xpReward", label: "Base XP reward", type: "number" },
      { key: "goldBase", label: "Base gold", type: "number" },
      { key: "woodBase", label: "Base wood", type: "number" },
      { key: "goldScale", label: "Gold multiplier", type: "number" },
      { key: "woodScale", label: "Wood multiplier", type: "number" },
      { key: "monsterCount", label: "Monster count", type: "number" },
      { key: "monsterPower", label: "Monster power multiplier", type: "number" },
      { key: "sizeProfile", label: "Size profile", type: "choice", options: ["more", "fewerStronger"] },
      { key: "monsterPool", label: "Monster ids (use names from the Monsters page)", type: "array" },
    ],
  },
];

const pages = [
  ...collections,
  {
    id: "combat",
    label: "Combat Tuning",
    kind: "form",
    fields: [
      { path: "combat.manaRegenPerRound", label: "Mana restored each round (all players)", type: "number" },
      { path: "combat.damageVariance", label: "Damage variance (0.2 = ±20%)", type: "number" },
      { path: "combat.resistanceMitigation", label: "Resistance mitigation", type: "percent" },
      { path: "combat.critChance", label: "Crit chance", type: "percent" },
      { path: "combat.critMult", label: "Crit damage multiplier", type: "number" },
      { path: "combat.monsterScale", label: "Monster HP & attack scale (5 = 5×)", type: "number" },
      { path: "combat.monsterAttackDelayMs", label: "Delay between monster attacks (ms)", type: "number" },
      { path: "combat.turnTimeoutMs", label: "Turn timeout (ms)", type: "number" },
    ],
  },
  {
    id: "starting",
    label: "Starting, Leveling & Town",
    kind: "form",
    fields: [
      { path: "starting.lives", label: "Starting lives (hearts)", type: "number" },
      { path: "starting.gold", label: "Starting gold", type: "number" },
      { path: "starting.wood", label: "Starting wood", type: "number" },
      { path: "starting.stamina", label: "Starting stamina", type: "number" },
      { path: "starting.maxStamina", label: "Max stamina", type: "number" },
      { path: "leveling.maxLevel", label: "Max level", type: "number" },
      { path: "leveling.xpBase", label: "XP base (first level needs this)", type: "number" },
      { path: "leveling.xpExponent", label: "XP exponent (higher = slower leveling)", type: "number" },
      { path: "food.healBase", label: "Food heal — flat amount", type: "number" },
      { path: "food.healPct", label: "Food heal — % of max HP", type: "percent" },
      { path: "town.search.stamina", label: "Search stamina cost", type: "number" },
      { path: "town.blacksmith.stamina", label: "Blacksmith stamina cost", type: "number" },
      { path: "town.tavern.stamina", label: "Tavern stamina cost", type: "number" },
      { path: "town.rest.stamina", label: "Rest stamina cost", type: "number" },
      { path: "town.temple.stamina", label: "Temple stamina cost", type: "number" },
      { path: "town.dungeon.rankedStamina", label: "Ranked dungeon stamina cost", type: "number" },
      { path: "town.dungeon.fastStamina", label: "Fast dungeon stamina cost", type: "number" },
    ],
  },
  {
    id: "loot",
    label: "Loot & Drop Rates",
    kind: "loot",
    dropChancePath: "loot.dropChance",
    gradeWeightsPath: "loot.gradeWeights",
    buyablePath: "loot.buyable",
  },
  {
    id: "anomalies",
    label: "Anomalies",
    kind: "anomalies",
    fields: [
      { path: "anomalies.anomalyChance", label: "Chance a new character gets a regular trait", type: "percent" },
      { path: "anomalies.pureBloodChance", label: "Chance they get a pure-blood trait", type: "percent" },
    ],
    traits: {
      label: "Traits",
      path: "anomalies.traits",
      idField: "id",
      idLabel: "id",
      nameField: "name",
      itemLabelTemplate: "{name} — {description}",
      fields: [
        { key: "name", label: "Name", type: "string" },
        { key: "rarity", label: "Rarity", type: "choice", options: ["common", "uncommon", "rare", "pureblood"] },
        { key: "description", label: "Description", type: "string" },
        {
          key: "effect.type",
          label: "Effect type",
          type: "choice",
          options: ["lifesteal", "resistanceBonus", "manaOnDay", "manaRegenBonus", "staminaOnDay"],
        },
        { key: "effect.percent", label: "Heal % of damage dealt (lifesteal)", type: "percent", if: (t) => t.effect && t.effect.type === "lifesteal" },
        { key: "effect.amount", label: "Amount (non-lifesteal effects)", type: "number", if: (t) => t.effect && t.effect.type !== "lifesteal" },
      ],
    },
  },
  {
    id: "story",
    label: "Story Text",
    kind: "story",
    titlePath: "story.title",
    paragraphsPath: "story.paragraphs",
    ctaPath: "story.cta",
  },
];

module.exports = { statLabels, formatLabel, collections, pages };
