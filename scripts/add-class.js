#!/usr/bin/env node
/**
 * Class adder — scaffolds a new class straight into content.js.
 *
 *   node scripts/add-class.js
 *
 * It walks you through every field, validates what it can, and inserts the
 * finished class block right before the classes array closes. Restart the
 * server afterwards and the new class shows up on the character screen.
 *
 * Non-interactive mode: pipe one answer per line.
 */
const fs = require("fs");
const path = require("path");
const { stdin, stdout } = require("process");

const FILE = path.join(__dirname, "..", "content.js");
const isTTY = !!stdin.isTTY;

const readline = isTTY ? require("readline/promises") : null;
const rl = isTTY ? readline.createInterface({ input: stdin, output: stdout }) : null;

let queue = [];
let stdinEnded = false;
if (!isTTY) {
  let data = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => (data += chunk));
  process.stdin.on("end", () => {
    stdinEnded = true;
    queue = data.split(/\r?\n/).map((s) => s.trim());
  });
}

async function question(text, fallback) {
  const suffix = fallback !== undefined ? ` [${fallback}]` : "";
  if (isTTY) {
    return (await rl.question(`  ${text}${suffix}: `)).trim();
  }
  const next = queue.shift();
  if (next !== undefined && next !== "") return next;
  return fallback !== undefined ? String(fallback) : "";
}

function num(raw, min, max, name) {
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n)) throw new Error(`${name} must be a number, got "${raw}".`);
  if (min !== undefined && n < min) throw new Error(`${name} must be at least ${min}.`);
  if (max !== undefined && n > max) throw new Error(`${name} must be at most ${max}.`);
  return n;
}

function range(raw, name, min, max) {
  const parts = String(raw).trim().split(/[\s,]+/).filter(Boolean);
  if (parts.length !== 2) throw new Error(`${name} needs two numbers, e.g. 400 480`);
  const lo = num(parts[0], min, max, name + " min");
  const hi = num(parts[1], min, max, name + " max");
  if (lo > hi) throw new Error(`${name} min (${lo}) is greater than max (${hi}).`);
  return { min: lo, max: hi };
}

function drainStdin() {
  return new Promise((resolve) => {
    if (isTTY) return resolve();
    if (stdinEnded) return resolve();
    stdin.on("end", () => resolve());
  });
}

async function main() {
  await drainStdin();
  console.log("\n  Class adder — scaffolds a class into content.js\n");
  let content = fs.readFileSync(FILE, "utf8");

  const baseSkillsMatch = content.match(/baseSkills:\s*\[\s*([\s\S]*?)\s*\]/);
  const baseSkills = baseSkillsMatch
    ? [...baseSkillsMatch[1].matchAll(/"([a-z0-9_]+)"/g)].map((m) => m[1])
    : [];
  const slugs = [...content.matchAll(/slug:\s*"([a-z0-9_]+)"/g)].map((m) => m[1]);

  try {
    let slug = (await question("Class slug (lowercase, no spaces)", "mystic")).trim().toLowerCase();
    while (!/^[a-z][a-z0-9_]*$/.test(slug) || slugs.includes(slug)) {
      if (!isTTY) throw new Error(`Invalid or taken slug "${slug}".`);
      console.log("    Invalid or taken. Use lowercase letters, numbers, underscores — not already in use.");
      slug = (await question("Class slug")).trim().toLowerCase();
    }

    const label = (await question("Display name", "Mystic")).trim();

    const baId = (await question("Basic attack id", slug + "_strike")).trim().toLowerCase();
    const baName = (await question("Basic attack name", "Strike")).trim();
    const baPower = num(await question("Basic attack power", "0.95"), 0.5, 3, "power");

    console.log("    Available skills: " + (baseSkills.join(", ") || "(none)"));
    const skillsRaw = (await question("Starting skills (comma separated)", "defend")).trim();
    const startingSkills = skillsRaw.split(",").map((s) => s.trim()).filter(Boolean);
    for (const s of startingSkills) {
      if (!baseSkills.includes(s)) throw new Error(`Unknown skill "${s}". Pick from: ${baseSkills.join(", ")}`);
    }
    if (startingSkills.length > 5) throw new Error("At most 5 starting skills (the 6th slot is your basic attack).");

    const speed = num(await question("Speed (1-20)", "8"), 1, 20, "speed");

    const hp = range(await question("HP range (min max)", "400 480"), "HP", 50, 5000);
    const attack = range(await question("Attack range (min max)", "30 40"), "Attack", 1, 200);
    const mana = range(await question("Mana range (min max)", "40 60"), "Mana", 0, 300);
    const resistance = range(await question("Resistance range (min max)", "20 30"), "Resistance", 0, 150);
    const magicPower = range(await question("Magic Power range (min max)", "20 32"), "Magic Power", 0, 200);
    const healPower = range(await question("Heal Power range (min max) — 10 = +25% healing", "4 10"), "Heal Power", 0, 100);

    console.log("    Growth = added each level-up.");
    const gh = num(await question("Growth HP", "12"), 0, 100, "Growth HP");
    const ga = num(await question("Growth Attack", "3"), 0, 100, "Growth Attack");
    const gm = num(await question("Growth Mana", "3"), 0, 100, "Growth Mana");
    const gr = num(await question("Growth Resistance", "2"), 0, 100, "Growth Resistance");
    const gmg = num(await question("Growth Magic Power", "2"), 0, 100, "Growth Magic Power");
    const ghp = num(await question("Growth Heal Power", "1"), 0, 100, "Growth Heal Power");

    const image = (await question("Portrait image path", `/images/characters/${slug}.png`)).trim();

    const eol = content.includes("\r\n") ? "\r\n" : "\n";
    const block = [
      "    {",
      `      slug: "${slug}",`,
      `      label: "${label}",`,
      `      image: "${image}",`,
      `      basicAttack: { id: "${baId}", name: "${baName}", power: ${baPower}, image: "/images/skills/${baId}.png", description: "Deals ${baPower}× attack damage." },`,
      `      startingSkills: ${JSON.stringify(startingSkills)},`,
      `      speed: ${speed},`,
      `      hp: { min: ${hp.min}, max: ${hp.max} },`,
      `      attack: { min: ${attack.min}, max: ${attack.max} },`,
      `      mana: { min: ${mana.min}, max: ${mana.max} },`,
      `      resistance: { min: ${resistance.min}, max: ${resistance.max} },`,
      `      magicPower: { min: ${magicPower.min}, max: ${magicPower.max} },`,
      `      healPower: { min: ${healPower.min}, max: ${healPower.max} },`,
      `      growth: { hp: ${gh}, attack: ${ga}, mana: ${gm}, resistance: ${gr}, magicPower: ${gmg}, healPower: ${ghp} },`,
      "    },",
    ].join(eol);
    const printed = block.replace(/\r/g, "");

    const m = content.match(/^  \],$(\r?\n)(\r?\n)(  images:)/m);
    if (!m) throw new Error("Could not find the classes array close in content.js.");
    content = content.slice(0, m.index) + eol + block + content.slice(m.index);

    console.log("\n  Generated class block:\n" + printed + "\n");
    const ok = (await question("Write this class into content.js? (y/n)", "y")).trim().toLowerCase();
    if (ok !== "y" && ok !== "yes") {
      console.log("  Aborted — nothing changed.");
      if (rl) rl.close();
      return;
    }

    fs.writeFileSync(FILE, content, "utf8");
    console.log(`\n  Done! Class "${label}" (${slug}) added.`);
    console.log(`  Drop art at public${image} (or leave it — a colored placeholder shows).`);
    console.log("  Restart the server with `npm start` and it appears on the character screen.\n");
  } catch (err) {
    console.error("\n  " + err.message);
    process.exitCode = 1;
  } finally {
    if (rl) rl.close();
  }
}

main();
