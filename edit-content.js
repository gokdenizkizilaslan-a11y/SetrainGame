#!/usr/bin/env node
/**
 * THE SETRA GAME — content editor
 * ---------------------------------
 * Run with:  node edit-content.js   (or  npm run edit)
 *
 * Edit classes, monsters, items, skills, dungeons, loot odds, combat &
 * anomaly balance, starting values and story text — without hand-editing code.
 * Every save backs up content.js first and validates the new file before
 * writing. Restart the server (Ctrl+C, then npm start) to apply changes.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline/promises");

const { CONTENT } = require("./content.js");
const { writeContent } = require("./editor-save.js");
const { formatLabel, collections: EDITOR_COLLECTIONS } = require("./editor-defs.js");

const FILE = path.join(__dirname, "content.js");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => rl.question(q);

let dirty = false;
let backedUp = false;

// ---------------- generic prompt helpers ----------------

const pct = (x) => `${Math.round((x || 0) * 100)}%`;

async function pick(options, prompt = "Select (Enter to go back)") {
  options.forEach((o, i) => {
    const label = typeof o === "string" ? o : o.label;
    console.log(`  ${i + 1}. ${label}`);
  });
  while (true) {
    const raw = (await ask(`${prompt}: `)).trim();
    if (raw === "") return null;
    const n = parseInt(raw, 10);
    if (n >= 1 && n <= options.length) {
      const item = options[n - 1];
      return typeof item === "string" ? item : item.value;
    }
    console.log("  ⚠ Pick a number from the list.");
  }
}

async function pickIndex(n, prompt) {
  while (true) {
    const raw = (await ask(`${prompt} (1-${n}, Enter to cancel): `)).trim();
    if (raw === "") return null;
    const v = parseInt(raw, 10);
    if (v >= 1 && v <= n) return v - 1;
    console.log("  ⚠ Invalid.");
  }
}

async function askNumber(label, current, o = {}) {
  const cur = current === undefined || current === null || current === "" ? "" : String(current);
  while (true) {
    const raw = (await ask(`${label} [${cur}]: `)).trim();
    if (raw === "") return undefined;
    const v = Number(raw);
    if (Number.isNaN(v)) { console.log("  ⚠ Enter a number."); continue; }
    let out = o.integer ? Math.round(v) : v;
    if (o.min !== undefined) out = Math.max(o.min, out);
    if (o.max !== undefined) out = Math.min(o.max, out);
    return out;
  }
}

async function askString(label, current) {
  const cur = current === undefined || current === null ? "" : String(current);
  const raw = (await ask(`${label} [${cur}]: `)).trim();
  return raw === "" ? undefined : raw;
}

async function askPercent(label, current) {
  const cur = current === undefined || current === null ? "" : pct(current);
  while (true) {
    const raw = (await ask(`${label} [${cur}]: `)).trim();
    if (raw === "") return undefined;
    const v = Number(raw);
    if (Number.isNaN(v)) { console.log("  ⚠ Enter a number (e.g. 15 means 15%)."); continue; }
    let out = v > 1 ? v / 100 : v;
    out = Math.max(0, Math.min(1, out));
    return out;
  }
}

async function askYesNo(label, current) {
  while (true) {
    const raw = (await ask(`${label} (y/n) [${current ? "y" : "n"}]: `)).trim().toLowerCase();
    if (raw === "") return undefined;
    if (raw === "y" || raw === "yes") return true;
    if (raw === "n" || raw === "no") return false;
    console.log("  ⚠ Answer y or n.");
  }
}

async function askArray(label, current) {
  const cur = Array.isArray(current) ? current.join(", ") : "";
  const raw = (await ask(`${label} — comma separated [${cur}]: `)).trim();
  if (raw === "") return undefined;
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

// ---------------- path helpers ----------------

function getPath(obj, key) {
  return key.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
}

function setPath(obj, key, v) {
  const parts = key.split(".");
  const last = parts.pop();
  let o = obj;
  for (const p of parts) {
    if (o[p] == null) o[p] = {};
    o = o[p];
  }
  o[last] = v;
}

function formatValue(v) {
  if (v === undefined || v === null) return "—";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function statLabel(k) {
  const m = { maxHp: "Max HP", hp: "Max HP", attack: "Attack", mana: "Mana", manaRegen: "Mana Regen", resistance: "Resistance", magicPower: "Magic Power", healPower: "Heal Power", speed: "Speed" };
  return m[k] || k;
}

function effectLabel(t) {
  const m = { lifesteal: "Lifesteal", resistanceBonus: "Extra Resistance", manaOnDay: "Mana on a new day", manaRegenBonus: "Mana Regen bonus", staminaOnDay: "Bonus stamina on a new day" };
  return m[t] || t;
}

// ---------------- saving ----------------

function save() {
  try {
    const res = writeContent(CONTENT, { backup: !backedUp });
    if (res.backup) {
      backedUp = true;
      console.log(`  Backup created: ${res.backup}`);
    }
    dirty = false;
    console.log("  ✅ Saved to content.js — restart the server to apply.");
  } catch (e) {
    console.log("  ✖ Validation failed — changes NOT saved.");
    console.log(`  ${String(e.message).slice(0, 1000)}`);
  }
}

// ---------------- stat map editor (for item stats / class evolveBonus) ----------------

async function editStatMap(obj, field) {
  const statKeys = field.statKeys;
  while (true) {
    const lines = statKeys.filter((k) => obj[k] !== undefined).map((k) => `${statLabel(k)} +${obj[k]}`);
    console.log(`\n  ${field.label}  →  ${lines.length ? lines.join("  ·  ") : "none"}`);
    const act = await pick(["Edit…", "Add…", "Remove…", "← Back"], field.label + " — select");
    if (act === null || act === "← Back") return;
    const opts = (keys) => keys.map((s) => ({ label: `${statLabel(s)} (+${obj[s]})`, value: s }));
    if (act === "Edit…") {
      const have = statKeys.filter((k) => obj[k] !== undefined);
      if (!have.length) { console.log("  Nothing set yet — use Add."); continue; }
      const k = await pick(opts(have), "Which stat");
      if (k === null) continue;
      const v = await askNumber(statLabel(k), obj[k], { min: 0, max: 300 });
      if (v === undefined) continue;
      obj[k] = v; dirty = true;
    } else if (act === "Add…") {
      const missing = statKeys.filter((k) => obj[k] === undefined);
      if (!missing.length) { console.log("  All of these stats are already set."); continue; }
      const k = await pick(missing.map((s) => ({ label: statLabel(s), value: s })), "Which stat to add");
      if (k === null) continue;
      const v = await askNumber(statLabel(k), 0, { min: 0, max: 300 });
      if (v === undefined) continue;
      obj[k] = v; dirty = true;
    } else if (act === "Remove…") {
      const have = statKeys.filter((k) => obj[k] !== undefined);
      if (!have.length) { console.log("  Nothing to remove."); continue; }
      const k = await pick(opts(have), "Which stat to remove");
      if (k === null) continue;
      delete obj[k]; dirty = true;
    }
  }
}

// ---------------- field editor ----------------

async function editOneField(item, field) {
  const cur = getPath(item, field.key);
  let val;
  switch (field.type) {
    case "number": val = await askNumber(field.label, cur, field); break;
    case "percent": val = await askPercent(field.label, cur); break;
    case "string": val = await askString(field.label, cur); break;
    case "array": val = await askArray(field.label, cur); break;
    case "choice": {
      const opts = Array.isArray(field.options) ? field.options : field.options(CONTENT);
      val = await pick(opts, `${field.label} (current: ${cur ?? "none"})`);
      if (val === null) return;
      break;
    }
    case "bool": val = await askYesNo(field.label, cur); break;
    case "statmap": {
      let target = getPath(item, field.key);
      if (target == null) { setPath(item, field.key, {}); target = getPath(item, field.key); }
      await editStatMap(target, field);
      return;
    }
  }
  if (val === undefined) return;
  setPath(item, field.key, val);
  dirty = true;
  console.log(`  ↳ ${field.label} = ${formatValue(val)}`);
}

async function editFields(item, section) {
  while (true) {
    const visible = section.fields.filter((f) => !f.if || f.if(item));
    console.log(`\n── Edit: ${section.itemLabel(item)} ──`);
    visible.forEach((f, i) => {
      console.log(`  ${i + 1}. ${f.label}: ${formatValue(getPath(item, f.key))}`);
    });
    console.log(`  ${visible.length + 1}. Done`);
    const raw = (await ask("Pick a field (Enter for Done): ")).trim();
    if (raw === "") return;
    const n = parseInt(raw, 10);
    if (n >= 1 && n <= visible.length) {
      await editOneField(item, visible[n - 1]);
    } else if (n === visible.length + 1) {
      return;
    } else {
      console.log("  ⚠ Invalid.");
    }
  }
}

// ---------------- collection editor (classes / monsters / items / skills / dungeons) ----------------

async function editCollection(section) {
  while (true) {
    const items = section.collection();
    console.log(`\n── ${section.label} ──`);
    items.forEach((it, i) => console.log(`  ${i + 1}. ${section.itemLabel(it)}`));
    const act = await pick(["Edit…", "Add new…", "Remove…", "← Back"], section.label + " — select");
    if (act === null || act === "← Back") return;

    if (act === "Edit…") {
      const idx = await pickIndex(items.length, "Pick an entry to edit");
      if (idx === null) continue;
      await editFields(items[idx], section);
    } else if (act === "Add new…") {
      const srcIdx = await pickIndex(items.length, "Duplicate which entry as a template");
      if (srcIdx === null) continue;
      const clone = JSON.parse(JSON.stringify(items[srcIdx]));
      if (section.onNew) section.onNew(clone);
      const idField = section.idField;
      const base = clone[idField] || "new";
      let nid = (await askString(`New ${section.idLabel || idField}`, `${base}_2`)) || `${base}_2`;
      nid = nid.trim().toLowerCase().replace(/\s+/g, "_");
      while (items.some((i) => i[idField] === nid)) {
        const again = await askString(`That ${idField} is already used — pick another`, `${nid}2`);
        if (again === undefined) break;
        nid = again.trim().toLowerCase().replace(/\s+/g, "_");
      }
      clone[idField] = nid;
      if (section.nameField) {
        const nm = await askString(section.nameLabel || "Display name", `${clone[section.nameField]} II`);
        if (nm !== undefined) clone[section.nameField] = nm;
      }
      items.push(clone);
      console.log(`  ✅ Added "${nid}".`);
      await editFields(clone, section);
    } else if (act === "Remove…") {
      const idx = await pickIndex(items.length, "Pick an entry to remove");
      if (idx === null) continue;
      const target = items[idx];
      if ((await askYesNo(`Remove "${section.itemLabel(target)}"?`)) === true) {
        items.splice(idx, 1);
        dirty = true;
        console.log("  ✅ Removed.");
      }
    }

    if (dirty && (await askYesNo("Save now?")) === true) save();
  }
}

// ---------------- section definitions ----------------

const sections = {};
for (const d of EDITOR_COLLECTIONS) {
  sections[d.id] = {
    label: d.label,
    collection: () => getPath(CONTENT, d.path),
    idField: d.idField,
    idLabel: d.idLabel,
    nameField: d.nameField,
    nameLabel: d.nameLabel,
    itemLabel: (it) => formatLabel(d.itemLabelTemplate, it),
    onNew: d.onNew,
    fields: d.fields,
  };
}

// ---------------- custom section editors ----------------

async function editLoot() {
  while (true) {
    console.log("\n── Loot & Drop Rates ──");
    const act = await pick([
      "Drop chance per monster rarity",
      "Loot rarity weights per dungeon grade",
      "Rarities sold in shops",
      "← Back",
    ]);
    if (act === null || act === "← Back") return;

    if (act === "Drop chance per monster rarity") {
      console.log("  Chance that killing a monster gives loot at all. Higher = more drops.");
      for (const r of CONTENT.loot.rarityOrder) {
        const v = await askPercent(`  ${r} monsters drop loot`, CONTENT.loot.dropChance[r]);
        if (v !== undefined) { CONTENT.loot.dropChance[r] = v; dirty = true; }
      }
    } else if (act === "Loot rarity weights per dungeon grade") {
      console.log("  Higher weight = more likely to roll that rarity. 0 = never in that dungeon.");
      for (const grade of Object.keys(CONTENT.loot.gradeWeights)) {
        console.log(`\n  Grade "${grade}":`);
        for (const r of CONTENT.loot.rarityOrder) {
          const v = await askNumber(`    ${r}`, CONTENT.loot.gradeWeights[grade][r], { min: 0 });
          if (v !== undefined) { CONTENT.loot.gradeWeights[grade][r] = v; dirty = true; }
        }
      }
    } else if (act === "Rarities sold in shops") {
      console.log("  The blacksmith can only sell the rarities you switch on.");
      for (const r of CONTENT.loot.rarityOrder) {
        const on = CONTENT.loot.buyable.includes(r);
        const v = await askYesNo(`    Sell ${r} items in shops?`, on);
        if (v !== undefined && v !== on) {
          CONTENT.loot.buyable = CONTENT.loot.buyable.filter((x) => x !== r);
          if (v) CONTENT.loot.buyable.push(r);
          dirty = true;
        }
      }
      console.log(`    Shop rarities: ${CONTENT.loot.buyable.join(", ")}`);
    }

    if (dirty && (await askYesNo("Save now?")) === true) save();
  }
}

async function editAnomalies() {
  while (true) {
    const curA = CONTENT.anomalies.anomalyChance;
    const curP = CONTENT.anomalies.pureBloodChance;
    console.log(`\n  Regular trait chance: ${pct(curA)}  ·  Pure-blood chance: ${pct(curP)}`);
    const act = await pick(["Set trait chances", "Edit the trait list", "← Back"]);
    if (act === null || act === "← Back") return;

    if (act === "Set trait chances") {
      const a = await askPercent("Chance a new character gets a regular trait", curA);
      if (a !== undefined) { CONTENT.anomalies.anomalyChance = a; dirty = true; }
      const p = await askPercent("Chance they get a pure-blood trait instead", curP);
      if (p !== undefined) { CONTENT.anomalies.pureBloodChance = p; dirty = true; }
    } else if (act === "Edit the trait list") {
      while (true) {
        const traits = CONTENT.anomalies.traits;
        console.log("\n  Traits:");
        traits.forEach((t, i) => console.log(`    ${i + 1}. ${t.name} — ${t.description}`));
        const act2 = await pick(["Edit…", "Add new…", "Remove…", "← Back"], "Traits — select");
        if (act2 === null || act2 === "← Back") break;

        if (act2 === "Edit…") {
          const idx = await pickIndex(traits.length, "Pick a trait");
          if (idx === null) continue;
          const t = traits[idx];
          const nm = await askString("Name", t.name);
          if (nm !== undefined) { t.name = nm; dirty = true; }
          const rar = await pick(["common", "uncommon", "rare", "pureblood"], `Rarity (current: ${t.rarity})`);
          if (rar !== null) { t.rarity = rar; dirty = true; }
          const d = await askString("Description", t.description);
          if (d !== undefined) { t.description = d; dirty = true; }
          const typ = await pick(
            ["lifesteal", "resistanceBonus", "manaOnDay", "manaRegenBonus", "staminaOnDay"].map((x) => ({ label: effectLabel(x), value: x })),
            `Effect type (current: ${effectLabel(t.effect.type)})`
          );
          if (typ !== null) { t.effect.type = typ; dirty = true; }
          if (t.effect.type === "lifesteal") {
            const v = await askPercent("Heal % of damage dealt", t.effect.percent);
            if (v !== undefined) { t.effect.percent = v; dirty = true; }
          } else {
            const v = await askNumber(`${effectLabel(t.effect.type)} amount`, t.effect.amount, { min: 0, max: 50 });
            if (v !== undefined) { t.effect.amount = v; dirty = true; }
          }
        } else if (act2 === "Add new…") {
          const srcIdx = await pickIndex(traits.length, "Duplicate which trait as a template");
          if (srcIdx === null) continue;
          const t = JSON.parse(JSON.stringify(traits[srcIdx]));
          const nm = await askString("Name", `${t.name} II`);
          if (nm !== undefined) t.name = nm;
          let tid = (nm || t.name).trim().toLowerCase().replace(/\s+/g, "_") + (nm === undefined ? "_2" : "");
          while (traits.some((x) => x.id === tid)) {
            const a = await askString("That id is taken — pick another", `${tid}2`);
            if (a === undefined) break;
            tid = a.trim().toLowerCase().replace(/\s+/g, "_");
          }
          t.id = tid;
          traits.push(t);
          dirty = true;
          console.log("  ✅ Added — pick Edit to change its details.");
        } else if (act2 === "Remove…") {
          const idx = await pickIndex(traits.length, "Pick a trait to remove");
          if (idx === null) continue;
          if ((await askYesNo(`Remove "${traits[idx].name}"?`)) === true) {
            traits.splice(idx, 1);
            dirty = true;
            console.log("  ✅ Removed.");
          }
        }
      }
    }
  }
}

async function editCombatAnomalies() {
  while (true) {
    console.log("\n── Combat & Anomalies ──");
    const act = await pick([
      "Combat tuning (mana, crit, monster scale…)",
      "Anomaly chance & traits",
      "← Back",
    ]);
    if (act === null || act === "← Back") return;

    if (act.startsWith("Combat tuning")) {
      const fields = [
        { label: "Mana restored each round (all players)", key: "combat.manaRegenPerRound" },
        { label: "Damage variance (0.2 = ±20%)", key: "combat.damageVariance" },
        { label: "Resistance mitigation", key: "combat.resistanceMitigation", percent: true },
        { label: "Crit chance", key: "combat.critChance", percent: true },
        { label: "Crit damage multiplier", key: "combat.critMult" },
        { label: "Monster HP & attack scale (GLOBAL — 5 = 5×)", key: "combat.monsterScale" },
        { label: "Delay between monster attacks (ms)", key: "combat.monsterAttackDelayMs" },
        { label: "Turn timeout (ms)", key: "combat.turnTimeoutMs" },
      ];
      for (const f of fields) {
        const v = f.percent
          ? await askPercent(f.label, getPath(CONTENT, f.key))
          : await askNumber(f.label, getPath(CONTENT, f.key));
        if (v !== undefined) { setPath(CONTENT, f.key, v); dirty = true; }
      }
    } else if (act.startsWith("Anomaly")) {
      await editAnomalies();
    }

    if (dirty && (await askYesNo("Save now?")) === true) save();
  }
}

async function editStartLevelTown() {
  const fields = [
    { label: "Starting lives (hearts)", key: "starting.lives" },
    { label: "Starting gold", key: "starting.gold" },
    { label: "Starting wood", key: "starting.wood" },
    { label: "Starting stamina", key: "starting.stamina" },
    { label: "Max stamina", key: "starting.maxStamina" },
    { label: "Max level", key: "leveling.maxLevel" },
    { label: "XP base (first level needs this)", key: "leveling.xpBase" },
    { label: "XP exponent (higher = slower leveling)", key: "leveling.xpExponent" },
    { label: "Food heal — flat amount", key: "food.healBase" },
    { label: "Food heal — % of max HP", key: "food.healPct", percent: true },
    { label: "Search stamina cost", key: "town.search.stamina" },
    { label: "Blacksmith stamina cost", key: "town.blacksmith.stamina" },
    { label: "Tavern stamina cost", key: "town.tavern.stamina" },
    { label: "Rest stamina cost", key: "town.rest.stamina" },
    { label: "Temple stamina cost", key: "town.temple.stamina" },
    { label: "Ranked dungeon stamina cost", key: "town.dungeon.rankedStamina" },
    { label: "Fast dungeon stamina cost", key: "town.dungeon.fastStamina" },
  ];
  console.log("\n── Starting, Leveling & Town ──");
  for (const f of fields) {
    const v = f.percent
      ? await askPercent(f.label, getPath(CONTENT, f.key))
      : await askNumber(f.label, getPath(CONTENT, f.key));
    if (v !== undefined) { setPath(CONTENT, f.key, v); dirty = true; }
  }
  if (dirty && (await askYesNo("Save now?")) === true) save();
}

async function editStory() {
  console.log("\n── Story Text ──");
  const t = await askString("Title", CONTENT.story.title);
  if (t !== undefined) { CONTENT.story.title = t; dirty = true; }
  console.log("  Intro paragraphs (Enter keeps each line):");
  for (let i = 0; i < CONTENT.story.paragraphs.length; i++) {
    const p = await askString(`  Paragraph ${i + 1}`, CONTENT.story.paragraphs[i]);
    if (p !== undefined) { CONTENT.story.paragraphs[i] = p; dirty = true; }
  }
  if ((await askYesNo("Add another paragraph?", false)) === true) {
    const p = await askString("  New paragraph", "");
    if (p) { CONTENT.story.paragraphs.push(p); dirty = true; }
  }
  const cta = await askString("Start button text (e.g. \"Set Forth\")", CONTENT.story.cta);
  if (cta !== undefined) { CONTENT.story.cta = cta; dirty = true; }
  if (dirty && (await askYesNo("Save now?")) === true) save();
}

// ---------------- main ----------------

const banner = `
  ${"=".repeat(50)}
   THE SETRA GAME — content editor
  ${"=".repeat(50)}
  Current: monsterScale ${CONTENT.combat.monsterScale}× · trait chance ${pct(CONTENT.anomalies.anomalyChance)}
  · mana regen ${CONTENT.combat.manaRegenPerRound}/round · max level ${CONTENT.leveling.maxLevel}
  · ${CONTENT.classes.length} classes · ${CONTENT.monsters.length} monsters · ${CONTENT.items.length} items
`;

async function main() {
  console.log(banner);
  while (true) {
    console.log("\n── Content Editor — main menu ──");
    const act = await pick([
      "Classes",
      "Monsters",
      "Items & Shop",
      "Skills",
      "Dungeons",
      "Loot & Drop Rates",
      "Combat & Anomalies",
      "Starting, Leveling & Town",
      "Story Text",
      "Save & Quit",
    ], "Choose a category (Enter to quit)");
    if (act === null || act === "Save & Quit") {
      if (dirty) save();
      console.log("\n✨ Done. Restart the server (Ctrl+C, then npm start) to apply changes.");
      break;
    }
    switch (act) {
      case "Classes": await editCollection(sections.classes); break;
      case "Monsters": await editCollection(sections.monsters); break;
      case "Items & Shop": await editCollection(sections.items); break;
      case "Skills": await editCollection(sections.skills); break;
      case "Dungeons": await editCollection(sections.dungeons); break;
      case "Loot & Drop Rates": await editLoot(); break;
      case "Combat & Anomalies": await editCombatAnomalies(); break;
      case "Starting, Leveling & Town": await editStartLevelTown(); break;
      case "Story Text": await editStory(); break;
      default: break;
    }
  }
  rl.close();
  process.exit(0);
}

process.on("SIGINT", () => {
  console.log("\n");
  if (dirty) { console.log("  Saving before you go…"); save(); }
  process.exit(0);
});

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { save, CONTENT };
