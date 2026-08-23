const CATALOG = {
  classes: [],
  sizes: [],
  skills: [],
  monsters: [],
  dungeons: [],
  town: { tavern: { bets: [5, 10, 25] } },
};

function applyCatalog(cat) {
  Object.assign(CATALOG, cat);
}

function $(id) {
  return document.getElementById(id);
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.add("hidden"));
  $(id).classList.remove("hidden");
  const edge = $("edge-buttons");
  if (edge) edge.classList.toggle("hidden", id === "screen-mode" || id === "screen-setup");
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add("hidden"), 3200);
}

// ---- Feedback: sounds, floating text, hit effects ----

let sfxEnabled = localStorage.getItem("setra-sfx-enabled") !== "0";
function setSfxEnabled(on) {
  sfxEnabled = on;
  localStorage.setItem("setra-sfx-enabled", on ? "1" : "0");
}

let sfxVolume = Number(localStorage.getItem("setra-sfx-volume")) || 100;
function setSfxVolume(v) {
  const n = Math.min(100, Math.max(1, Math.round(Number(v) || 100)));
  sfxVolume = n;
  localStorage.setItem("setra-sfx-volume", String(n));
}

let sfxCtx = null;
function ensureSfx() {
  if (!sfxCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) sfxCtx = new AC();
  }
  if (sfxCtx && sfxCtx.state === "suspended") sfxCtx.resume().catch(() => {});
  return sfxCtx;
}

function sfxTone(freq, dur, type, vol, when, slideTo) {
  const ctx = sfxCtx;
  if (!ctx) return;
  const t0 = ctx.currentTime + (when || 0);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || "sine";
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol * (sfxVolume / 100), t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function sfxNoise(dur, vol, when, filterFreq) {
  const ctx = sfxCtx;
  if (!ctx) return;
  const t0 = ctx.currentTime + (when || 0);
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = filterFreq || 800;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol * (sfxVolume / 100), t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start(t0);
}

function playSfx(name) {
  if (!sfxEnabled) return;
  ensureSfx();
  if (!sfxCtx) return;
  switch (name) {
    case "hit":
      sfxNoise(0.16, 0.45, 0, 850);
      sfxTone(150, 0.15, "square", 0.22, 0, 70);
      break;
    case "heal":
      sfxTone(520, 0.12, "sine", 0.22, 0);
      sfxTone(660, 0.14, "sine", 0.18, 0.09);
      sfxTone(880, 0.18, "sine", 0.14, 0.18);
      break;
    case "block":
      sfxTone(230, 0.1, "square", 0.16, 0, 140);
      sfxNoise(0.06, 0.22, 0, 1400);
      break;
    case "coin":
      sfxTone(880, 0.09, "sine", 0.18, 0);
      sfxTone(1320, 0.2, "sine", 0.16, 0.07);
      break;
    case "item":
      sfxTone(440, 0.07, "square", 0.12, 0, 520);
      sfxTone(660, 0.09, "square", 0.1, 0.06, 720);
      break;
    case "turn":
      sfxTone(600, 0.06, "sine", 0.1, 0, 740);
      break;
    case "win":
      sfxTone(523, 0.13, "triangle", 0.2, 0);
      sfxTone(659, 0.13, "triangle", 0.2, 0.1);
      sfxTone(784, 0.26, "triangle", 0.2, 0.2);
      break;
    case "lose":
      sfxTone(392, 0.16, "sawtooth", 0.16, 0, 320);
      sfxTone(262, 0.28, "sawtooth", 0.16, 0.14, 210);
      break;
    case "arcane":
      sfxTone(760, 0.09, "sine", 0.16, 0, 980);
      sfxTone(620, 0.1, "sine", 0.14, 0.06, 520);
      break;
    case "holy":
      sfxTone(880, 0.09, "triangle", 0.14, 0);
      sfxTone(1174, 0.14, "triangle", 0.12, 0.07);
      sfxTone(1568, 0.2, "triangle", 0.1, 0.15);
      break;
    case "shadow":
      sfxTone(180, 0.18, "sawtooth", 0.18, 0, 90);
      sfxTone(110, 0.22, "sawtooth", 0.14, 0.08, 60);
      sfxNoise(0.1, 0.3, 0, 300);
      break;
    case "crit":
      sfxNoise(0.2, 0.6, 0, 900);
      sfxTone(120, 0.18, "square", 0.26, 0, 60);
      sfxTone(1320, 0.16, "sine", 0.14, 0.02, 1760);
      break;
    default:
      break;
  }
}

// ---- Real sound files (public/sounds/) ----

let soundMap = new Map();
const audioCache = {};
const SYNTH_FALLBACK = {
  slash: "hit", heavy: "hit", axe: "hit", crush: "crit", arcane: "arcane",
  fire: "arcane", frost: "arcane", holy: "holy", shadow: "shadow",
  heal: "heal", defend: "block", monster: "hit", crit: "crit",
};

async function loadSounds() {
  try {
    const res = await fetch("/api/sounds");
    const data = await res.json();
    soundMap = new Map((data.sounds || []).map((s) => [s.id, s.url]));
  } catch (e) {
    soundMap = new Map();
  }
}
loadSounds();

function sfxPlay(names, vol) {
  if (!sfxEnabled) return;
  const group = Array.isArray(names) ? names : names ? [names] : [];
  const available = group.filter((id) => soundMap.has(id));
  const id = available.length ? available[Math.floor(Math.random() * available.length)] : null;
  if (id) {
    if (!audioCache[id]) audioCache[id] = new Audio(soundMap.get(id));
    const a = audioCache[id].cloneNode();
    a.volume = (vol == null ? 0.9 : vol) * (sfxVolume / 100);
    a.play().catch(() => {});
    return;
  }
  const name = SYNTH_FALLBACK[group[0]] || (group.length ? group[0] : null);
  if (name) playSfx(name);
}

const INTERACTIVE_SELECTOR =
  ".btn, .action-card, .class-card, .room-row, .dungeon-card, .size-card, .bet-btn, .skill-slot, .item-btn, .enemy, .fighter, .equip-slot, .bag-row, .shop-card, .temple-card, .btn-chest-action, .btn-chest-confirm";
let lastHoverEl = null;
document.addEventListener("mouseover", (e) => {
  if (!sfxEnabled) return;
  const el = e.target && e.target.closest ? e.target.closest(INTERACTIVE_SELECTOR) : null;
  if (el && el !== lastHoverEl) {
    lastHoverEl = el;
    sfxPlay("hoversound", 0.3);
  }
});
document.addEventListener("mouseout", (e) => {
  const el = e.target && e.target.closest ? e.target.closest(INTERACTIVE_SELECTOR) : null;
  if (el === lastHoverEl) lastHoverEl = null;
});
document.addEventListener("click", (e) => {
  if (!sfxEnabled) return;
  const el = e.target && e.target.closest ? e.target.closest(INTERACTIVE_SELECTOR) : null;
  if (el) sfxPlay("clicksound");
});

function spawnPopup(el, text, kind, color) {
  if (!el) return;
  const pop = document.createElement("span");
  pop.className = "fx-popup" + (kind ? " fx-popup--" + kind : "");
  if (color) pop.style.color = color;
  pop.textContent = text;
  el.appendChild(pop);
  setTimeout(() => pop.remove(), 950);
}

const FX_CLASSES = ["fx-hit", "fx-heal", "fx-defend", "fx-hit-arcane", "fx-hit-holy", "fx-hit-shadow", "fx-hit-crit"];

const ELEMENT_SOUNDS = {
  physical: ["slash1", "slash2", "slash3", "slash4"],
  fire: "firemagic",
  frost: "frostmagic",
  heal: "healingmagic",
  shadow: ["bloodmagic1", "bloodmagic2"],
  arcane: "normalmagic",
  defend: "shield",
  monster: "monstersound",
};

function applyTargetFx(el, kind) {
  if (!el) return;
  el.classList.remove(...FX_CLASSES);
  void el.offsetWidth;
  el.classList.add("fx-" + (kind || "hit"));
  setTimeout(() => el.classList.remove(...FX_CLASSES), 600);
}

function shakeCombat(root) {
  const wrap = root.querySelector(".combat-wrap");
  if (!wrap) return;
  wrap.classList.remove("combat-shake");
  void wrap.offsetWidth;
  wrap.classList.add("combat-shake");
  setTimeout(() => wrap.classList.remove("combat-shake"), 550);
}

const BUFF_META = {
  attack: { label: "Atk+", color: "#8fe08a" },
  defense: { label: "Def+", color: "#7fb4ff" },
  regen: { label: "Regen", color: "#8fe08a" },
  weaken: { label: "Weaken", color: "#ff9d7a" },
  expose: { label: "Vuln", color: "#ffb84d" },
  dot: { label: "Bleed", color: "#ff6b6b" },
};

function buffBadges(d, targetType, targetId) {
  const list = (d && d.buffs || []).filter(
    (b) => b.targetType === targetType && String(b.targetId) === String(targetId)
  );
  if (!list.length) return "";
  return `<span class="buff-badges">${list
    .map((b) => {
      const meta = BUFF_META[b.kind] || { label: b.kind || "?", color: "#ffffff" };
      const name = escapeHtml(b.name || meta.label);
      return `<span class="buff-badge" style="--bc:${meta.color}" title="${name} · ${b.turns} turn${b.turns === 1 ? "" : "s"}" data-buff="${escapeHtml(b.kind)}"><em>${escapeHtml(meta.label)}</em><i>${b.turns}</i></span>`;
    })
    .join("")}</span>`;
}

function fxRecipe(effect) {
  const effects = (CATALOG && CATALOG.effects) || {};
  return effects[effect] || effects.slash || { animation: "hit", color: "#ff7a5c", particles: "slash" };
}

function spawnParticles(el, type, color) {
  if (!el) return;
  const c = color || "#ffffff";
  const wrap = document.createElement("span");
  wrap.className = "fx-particles fx-particles--" + (type || "slash");
  wrap.style.setProperty("--pe", c);
  if (type === "shatter" || type === "burst") {
    const n = type === "shatter" ? 5 : 8;
    for (let i = 0; i < n; i++) {
      const shard = document.createElement("i");
      const ang = (Math.PI * 2 * i) / n + (Math.random() * 0.6 - 0.3);
      const dist = 24 + Math.random() * 20;
      shard.style.setProperty("--dx", (Math.cos(ang) * dist).toFixed(1) + "px");
      shard.style.setProperty("--dy", (Math.sin(ang) * dist).toFixed(1) + "px");
      shard.style.setProperty("--rot", (Math.random() * 240 - 120).toFixed(0) + "deg");
      wrap.appendChild(shard);
    }
  }
  el.appendChild(wrap);
  setTimeout(() => wrap.remove(), 800);
}

function drainCombatFx(root) {
  const pending = state.pendingFx || [];
  const fx = pending.splice(0, pending.length);
  for (const ev of fx) {
    if (!ev) continue;
    if (ev.type === "mana") {
      if (ev.restore) {
        const targetEl = root.querySelector('.fighter[data-fighter="' + ev.actor + '"]');
        spawnPopup(targetEl, "+" + ev.amount + " Mana", "heal", "#7fb4ff");
        applyTargetFx(targetEl, "heal");
        playSfx("arcane");
      }
      continue;
    }
    if (ev.type === "loot") {
      sfxPlay("lootsound");
      continue;
    }
    if (ev.type === "chest") {
      sfxPlay("lootsound");
      continue;
    }
    let el = null;
    if (ev.target === "enemy") el = root.querySelector('.enemy[data-enemy="' + ev.targetId + '"]');
    else if (ev.target === "player") el = root.querySelector('.fighter[data-fighter="' + ev.targetId + '"]');
    if (ev.type === "damage") {
      const r = fxRecipe(ev.effect);
      if (ev.crit) {
        spawnPopup(el, "CRIT " + ev.amount, "crit", r.color);
        applyTargetFx(el, "hit-crit");
        spawnParticles(el, "burst", r.color);
        sfxPlay(["skull_crush"]);
        shakeCombat(root);
      } else {
        spawnPopup(el, "-" + ev.amount, "damage", r.color);
        applyTargetFx(el, r.animation);
        spawnParticles(el, r.particles, r.color);
        const monsterDefault = ev.source === "monster" && (!ev.elem || ev.elem === "physical");
        sfxPlay(monsterDefault ? ELEMENT_SOUNDS.monster : ELEMENT_SOUNDS[ev.elem] || r.sound);
      }
    } else if (ev.type === "heal") {
      const r = fxRecipe("heal");
      spawnPopup(el, "+" + ev.amount, "heal", r.color);
      applyTargetFx(el, "heal");
      spawnParticles(el, "glow", r.color);
      sfxPlay(ELEMENT_SOUNDS.heal || r.sound);
    } else if (ev.type === "defend") {
      const r = fxRecipe("defend");
      spawnPopup(el, "Defended", "defend", r.color);
      applyTargetFx(el, "defend");
      spawnParticles(el, "ring", r.color);
      sfxPlay(ELEMENT_SOUNDS.defend || r.sound);
    } else if (ev.type === "buff") {
      const r = fxRecipe("buff");
      const meta = BUFF_META[ev.kind] || { label: ev.kind || "Buff", color: r.color };
      const txt = meta.label + (ev.turns && ev.turns > 1 ? " ×" + ev.turns : "");
      spawnPopup(el, txt, "buff", meta.color);
      applyTargetFx(el, "buff");
      spawnParticles(el, "ring", meta.color);
      sfxPlay(ELEMENT_SOUNDS.defend || r.sound);
    }
  }
  const last = fx[fx.length - 1];
  if (last && last.type === "result") {
    if (last.outcome === "victory") sfxPlay(["winningsound"]);
    else sfxPlay(["losingsound"]);
  }
}

function showNotice(kind, title, subtitle) {
  const el = $("notice");
  if (!el) return;
  el.innerHTML = `<div class="notice-card notice-card--${escapeHtml(kind)}">
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(subtitle)}</p>
    <button type="button" class="btn btn--gold" id="btn-notice-ok">Continue</button>
  </div>`;
  el.classList.remove("hidden");
  const ok = el.querySelector("#btn-notice-ok");
  if (ok) ok.addEventListener("click", () => el.classList.add("hidden"));
  if (kind === "win") playSfx("win");
  else if (kind === "lose") playSfx("lose");
  else if (kind === "search") playSfx("coin");
}

function showStoryIntro() {
  const el = $("story-overlay");
  if (!el) return;
  const story = CATALOG.story || {};
  const title = story.title || "The Setra Game";
  const paragraphs = Array.isArray(story.paragraphs) ? story.paragraphs : [];
  const cta = story.cta || "Set Forth";
  el.innerHTML = `<div class="notice-card story-card">
    <h2>${escapeHtml(title)}</h2>
    ${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("")}
    <button type="button" class="btn btn--gold" id="btn-story-go">${escapeHtml(cta)}</button>
  </div>`;
  el.classList.remove("hidden");
  const ok = el.querySelector("#btn-story-go");
  if (ok) ok.addEventListener("click", () => el.classList.add("hidden"));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function classLabel(slug) {
  const c = CATALOG.classes.find((x) => x.slug === slug);
  return c ? c.label : slug;
}

function sizeLabel(id) {
  const s = CATALOG.sizes.find((x) => x.id === id);
  return s ? s.label : id;
}

function imgFor(slug, kind) {
  const src =
    kind === "class"
      ? CATALOG.classes
      : kind === "monster"
      ? CATALOG.monsters
      : CATALOG.dungeons;
  const found = src.find((x) => x.slug === slug || x.id === slug);
  return found ? found.image : "";
}

function initImages(root) {
  root.querySelectorAll("[data-img]").forEach((el) => {
    const path = el.getAttribute("data-img");
    if (!path) return;
    const img = new Image();
    img.onload = () => {
      el.style.backgroundImage = `url('${path}')`;
      el.classList.add("portrait--img");
    };
    img.src = path;
  });
}

function skillIconEl(skill) {
  return `<span class="skill-icon" data-img="${escapeHtml(skill.image || "")}" data-variant="${escapeHtml(skill.id || "")}"></span>`;
}

function itemIconEl(item) {
  if (item.slot === "chest") {
    const meta = (CATALOG.loot && CATALOG.loot.rarityMeta) || {};
    const m = meta[item.rarity] || {};
    return `<span class="item-icon item-icon--chest" style="--rarity:${m.color || "#9aa7b5"}">${icon("chest")}</span>`;
  }
  return `<span class="item-icon" data-img="${escapeHtml(item.image || "")}" data-variant="${escapeHtml(item.id || "")}"></span>`;
}

let combatTimerInterval = null;
function startCombatTimer() {
  if (combatTimerInterval) return;
  combatTimerInterval = setInterval(() => {
    const bar = $("turn-timer-fill");
    const d = myDungeon(state.room);
    if (!d || d.status !== "fighting") {
      stopCombatTimer();
      return;
    }
    if (!state.timerDeadline) {
      if (bar) bar.style.width = "0%";
      return;
    }
    const total = 10000;
    const remaining = state.timerDeadline - Date.now();
    const pct = Math.max(0, Math.min(100, (remaining / total) * 100));
    if (bar) bar.style.width = pct + "%";
    if (remaining <= 0 && !state.timerFired) {
      state.timerFired = true;
      state.timerDeadline = null;
      socket.emit("combat:endTurn");
    }
  }, 100);
}
function stopCombatTimer() {
  if (combatTimerInterval) {
    clearInterval(combatTimerInterval);
    combatTimerInterval = null;
  }
}

function renderClassGrid(selected, onSelect) {
  const grid = $("class-grid");
  grid.innerHTML = "";
  CATALOG.classes.filter((c) => !c.baseClass).forEach((cls) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "class-card" + (selected === cls.slug ? " is-selected" : "");
    const portrait = document.createElement("span");
    portrait.className = "portrait portrait--" + cls.slug;
    portrait.setAttribute("data-img", cls.image);
    portrait.setAttribute("data-variant", cls.slug);
    const name = document.createElement("span");
    name.className = "class-card-name";
    name.textContent = cls.label;
    btn.appendChild(portrait);
    btn.appendChild(name);
    btn.addEventListener("click", () => onSelect(cls.slug));
    grid.appendChild(btn);
  });
  initImages(grid);
}

function setLobbyView(inRoom) {
  $("lobby-browser").classList.toggle("hidden", inRoom);
  $("lobby-room").classList.toggle("hidden", !inRoom);
}

function renderRoomList(list, onJoin) {
  const root = $("room-list");
  root.innerHTML = "";
  if (!list.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No open halls. Found one, and others may join.";
    root.appendChild(empty);
    return;
  }
  list.forEach((room) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "room-row";
    btn.innerHTML = `<strong>${escapeHtml(room.name)}</strong><span class="player-meta">${room.playerCount}/${room.maxPlayers} · ${escapeHtml(room.status)}</span>`;
    btn.addEventListener("click", () => onJoin(room.id));
    root.appendChild(btn);
  });
}

function renderPlayerList(room, selfId) {
  const ul = $("player-list");
  ul.innerHTML = "";
  room.players.forEach((p) => {
    const li = document.createElement("li");
    const left = document.createElement("div");
    left.innerHTML = `<span class="player-name${p.connected === false ? " player--offline" : ""}">${escapeHtml(p.name)}</span>${
      p.id === selfId ? ' <span class="badge">You</span>' : ""
    }${p.isHost ? ' <span class="badge badge--host">Host</span>' : ""}${
      p.ready ? ' <span class="badge badge--ready">Ready</span>' : ""
    }${p.connected === false ? ' <span class="badge badge--offline">Away</span>' : ""}`;
    const right = document.createElement("div");
    right.className = "player-meta";
    right.textContent = `${classLabel(p.character)} · ${p.lives} lives · ${p.gold} gold · ${p.wood} wood`;
    li.appendChild(left);
    li.appendChild(right);
    ul.appendChild(li);
  });
}

// ---- Town ----

function icon(name) {
  const common = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  const paths = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>',
    dungeon: '<path d="M3 21V10l4-3V5h3v2l3-1V4h4v2l4 4v11H3z"/><path d="M9 21v-6h6v6"/>',
    smith: '<rect x="3" y="12" width="11" height="5" rx="1.5"/><path d="M14 14.5h7"/>',
    tavern: '<path d="M4 8h12v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z"/><path d="M16 10h2a3 3 0 0 1 0 6h-2"/><path d="M7 4v2"/><path d="M11 4v2"/>',
    rest: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
    hp: '<path d="M12 20.5S4 16 4 10.5A4.5 4.5 0 0 1 12 8a4.5 4.5 0 0 1 8 2.5C20 16 12 20.5 12 20.5z"/>',
    stamina: '<path d="M13 2 5 13h5l-1 9 8-11h-5l1-9z"/>',
    gold: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 5v3"/><path d="M12 16v3"/>',
    wood: '<rect x="4" y="11" width="16" height="4" rx="2"/><rect x="7" y="15" width="12" height="3" rx="1.5"/>',
    lives: '<path d="M12 20.5S4 16 4 10.5A4.5 4.5 0 0 1 12 8a4.5 4.5 0 0 1 8 2.5C20 16 12 20.5 12 20.5z"/>',
    level: '<path d="M12 2l2.6 6.2L21 9.2l-5 4.4L17.4 20 12 16.4 6.6 20 8 13.6 3 9.2l6.4-1L12 2z"/>',
    xp: '<path d="M12 3l1.9 5.3L19 10l-5.1 1.7L12 17l-1.9-5.3L5 10l5.1-1.7L12 3z"/>',
    atk: '<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/>',
    mana: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    res: '<path d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z"/>',
    magic: '<path d="M12 3l1.9 5.3L19 10l-5.1 1.7L12 17l-1.9-5.3L5 10l5.1-1.7L12 3z"/>',
    heal: '<path d="M12 5v14M5 12h14"/><path d="M12 5v14" opacity="0.35"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>',
    food: '<path d="M3 12h18a9 9 0 0 1-9 9h-2a7 7 0 0 1-7-7z"/><path d="M12 12c0-3 2-5 4-5 0 2-2 5-4 5z"/>',
    temple: '<path d="M4 21v-8l-2-3 10-6 10 6-2 3v8H4z"/><path d="M8 21v-6h8v6"/><path d="M3 10l9-5 9 5"/>',
    craft: '<path d="M14 4l6 6-3 3-6-6 3-3z"/><path d="M11 7 4 14l3 3 7-7"/>',
    weapon: '<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/>',
    helmet: '<path d="M12 3a7 7 0 0 1 7 7c0 2-1 3-1 3H6s-1-1-1-3a7 7 0 0 1 7-7z"/><path d="M6 13h12v3a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-3z"/>',
    armor: '<path d="M12 3l6 2v6c0 4-2.5 7-6 8-3.5-1-6-4-6-8V5l6-2z"/>',
    legs: '<path d="M6 21v-7l2-9h8l2 9v7h-4v-5h-4v5H6z"/>',
    boots: '<path d="M5 21v-6c0-3 2-5 6-5s6 2 6 5v6H5z"/><path d="M9 21v-4"/>',
    amulet: '<circle cx="12" cy="7" r="4"/><path d="M12 11v10"/><path d="M9 18h6"/>',
    ring: '<rect x="7" y="7" width="10" height="10" rx="2" transform="rotate(45 12 12)"/>',
    crit: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1z"/>',
    chest: '<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M3 9l9-6 9 6"/><path d="M12 3v6"/><path d="M12 9v6"/><path d="M9 13h6"/>',
    merchant: '<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M3 8l2-4h14l2 4"/><path d="M8 8a4 4 0 0 0 8 0"/><path d="M9 15h6"/>',
  };
  return `<svg viewBox="0 0 24 24" ${common} aria-hidden="true">${paths[name] || ""}</svg>`;
}

function statLabel(key) {
  const map = {
    attack: "Atk",
    maxHp: "HP",
    resistance: "Res",
    mana: "Mana",
    maxMana: "Mana",
    magicPower: "Mgc",
    healPower: "Heal",
    speed: "Spd",
    manaRegen: "Regen",
    critChance: "Crit",
    critDamage: "Crit Dmg",
  };
  return map[key] || key;
}

function pct(value, max) {
  if (!max) return 0;
  return Math.max(0, Math.min(100, Math.round((value / max) * 100)));
}

function statRow(iconName, label, value, barClass, barPct) {
  const bar = barClass
    ? `<span class="stat-bar ${barClass}"><span class="stat-bar-fill" style="width:${barPct}%"></span></span>`
    : "";
  return `<div class="profile-stat">
    <span class="stat-icon">${icon(iconName)}</span>
    <span class="stat-label">${escapeHtml(label)}</span>
    <span class="stat-value">${escapeHtml(String(value))}</span>
    ${bar}
  </div>`;
}

function chip(iconSvg, text) {
  return `<span class="chip">${iconSvg}<span>${escapeHtml(text)}</span></span>`;
}

function renderProfileCard(room, selfId) {
  const el = $("profile-card");
  const me = room.players.find((p) => p.id === selfId);
  if (!me) {
    el.innerHTML = "";
    return;
  }
  const trait = me.anomaly;
  const frame = trait ? ` style="--frame:${trait.frameColor}"` : "";
  const traitHtml = trait
    ? `<span style="color:${trait.frameColor};font-weight:700">${escapeHtml(trait.name)}</span> — ${escapeHtml(trait.description)}`
    : `<span class="muted">No anomaly</span>`;
  el.innerHTML = `
    <div class="profile-avatar">
      <span class="portrait portrait--${me.character} profile-portrait" data-img="${imgFor(me.character, "class")}" data-variant="${me.character}"${frame}></span>
    </div>
    <div class="profile-name">${escapeHtml(me.name)}${me.isHost ? ' <span class="badge badge--host">Host</span>' : ""}</div>
    <div class="profile-class">${classLabel(me.character)} · Lv ${me.level}</div>
    <div class="profile-trait">${traitHtml}</div>
    <div class="profile-stats">
      ${statRow("hp", "HP", `${me.maxHp}/${me.maxHp}`, "bar-hp", pct(me.maxHp, me.maxHp))}
      ${statRow("stamina", "Stamina", `${me.stamina}/${me.maxStamina}`, "bar-stamina", pct(me.stamina, me.maxStamina))}
      ${statRow("xp", "XP", `${me.xp}/${me.xpToNext}`, "bar-xp", pct(me.xp, me.xpToNext))}
      ${statRow("gold", "Gold", me.gold)}
      ${statRow("wood", "Wood", me.wood)}
    </div>
    <div class="profile-chips">
      ${chip(icon("lives"), `Lives ${me.lives}`)}
      ${chip(icon("level"), `Lv ${me.level}`)}
      ${chip(icon("atk"), `Atk ${me.attack}`)}
      ${chip(icon("mana"), `${me.maxMana}/${me.maxMana} Mana`)}
      ${chip(icon("mana"), `Regen ${me.manaRegen}`)}
      ${chip(icon("res"), `Res ${me.resistance}`)}
      ${chip(icon("magic"), `Mgc ${me.magicPower}`)}
      ${chip(icon("heal"), `Heal ${me.healPower}`)}
      ${chip(icon("crit"), `Crit ${me.critChance}%`)}
      ${chip(icon("crit"), `Crit Dmg +${me.critDamage}%`)}
      ${chip(icon("food"), `${me.food} Food`)}
    </div>
    <button type="button" class="btn btn--bronze btn--inventory" id="btn-open-inventory">Inventory & Equipment</button>`;
  const invBtn = el.querySelector("#btn-open-inventory");
  if (invBtn) {
    invBtn.addEventListener("click", () => {
      sfxPlay("inventorysound");
      state.inventoryOpen = true;
      renderTown(state.room);
    });
  }
  initImages(el);
}

const ACTIONS = [
  { id: "dungeon", icon: "dungeon", title: "Dungeon", sub: "Ranked delve · High risk", kind: "open" },
  { id: "search", icon: "search", title: "Search", sub: null, kind: "emit", event: "town:search" },
  { id: "blacksmith", icon: "smith", title: "Blacksmith", sub: "Armor, weapons & gear", kind: "open" },
  { id: "merchant", icon: "merchant", title: "Merchant", sub: "Chests, potions & materials", kind: "open" },
  { id: "tavern", icon: "tavern", title: "Tavern", sub: "Bet gold · Coin flip, blackjack & food", kind: "open" },
  { id: "temple", icon: "temple", title: "Ancient Temple", sub: "Ascend, mend hearts & craft", kind: "open" },
  { id: "rest", icon: "rest", title: "Rest", sub: null, kind: "emit", event: "town:rest" },
  { id: "sleep", icon: "rest", title: "Sleep", sub: "End the day · Stamina returns at dawn", kind: "emit", event: "town:endDay" },
];

function renderActionCards(room, selfId) {
  const el = $("action-cards");
  const me = room.players.find((p) => p.id === selfId);
  const canAct = me && !me.endedDay;
  const searchCost = (CATALOG.town && CATALOG.town.search && CATALOG.town.search.stamina) || 2;
  const restAmt = (CATALOG.town && CATALOG.town.rest && CATALOG.town.rest.stamina) || 6;
  ACTIONS.forEach((a) => {
    if (a.id === "search") a.sub = `${searchCost} stamina · Explore the wilds`;
    if (a.id === "rest") a.sub = `+${restAmt} stamina · Wait for your party`;
  });
  el.innerHTML = ACTIONS.map((a) => `
    <button type="button" class="action-card${a.id === "dungeon" ? " action-card--hero" : ""}${canAct ? "" : " action-card--locked"}" data-action="${a.id}">
      <span class="action-icon">${icon(a.icon)}</span>
      <span class="action-body">
        <span class="action-title-text">${escapeHtml(a.title)}</span>
        <span class="action-sub">${escapeHtml(a.sub)}</span>
      </span>
      <span class="action-arrow">${icon("chevron")}</span>
    </button>`).join("");
  el.querySelectorAll("[data-action]").forEach((b) => {
    b.addEventListener("click", () => {
      if (!canAct) {
        showToast("You have already ended this day.");
        return;
      }
      const a = ACTIONS.find((x) => x.id === b.getAttribute("data-action"));
      if (a.kind === "open") {
        state.dungeonOpen = a.id === "dungeon";
        state.tavernOpen = a.id === "tavern";
        state.blacksmithOpen = a.id === "blacksmith";
        state.merchantOpen = a.id === "merchant";
        state.templeOpen = a.id === "temple";
        state.inventoryOpen = false;
        renderTown(state.room);
      } else {
        if (a.id === "sleep") state.justSlept = true;
        socket.emit(a.event);
      }
    });
  });
}

function renderTownParty(room) {
  const el = $("town-party");
  if (!room.players || room.players.length <= 1) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML =
    `<div class="party-strip">` +
    room.players
      .map((p) => {
        const frame = p.anomaly ? ` style="--frame:${p.anomaly.frameColor}"` : "";
        return `<span class="party-chip${p.id === state.playerId ? " party-chip--me" : ""}${p.endedDay ? " party-chip--done" : ""}" title="${escapeHtml(p.name)}">
          <span class="portrait portrait--${p.character} party-portrait" data-img="${imgFor(p.character, "class")}" data-variant="${p.character}"${frame}></span>
          <span class="party-chip-name">${escapeHtml(p.name)}${p.endedDay ? " ✓" : ""}</span>
        </span>`;
      })
      .join("") +
    `</div>`;
  initImages(el);
}

function renderTownLog(room) {
  const el = $("town-log");
  el.innerHTML = room.log && room.log.text
    ? `<div class="log-line">${escapeHtml(room.log.text)}</div>`
    : `<div class="log-line muted">The town is quiet. Spend stamina, then end the day.</div>`;
}

// ---- Dungeon ----

// The dungeon the local player belongs to (solo or a shared party).
function myDungeon(room) {
  if (!room || !room.dungeons || !state.playerId) return null;
  const me = room.players.find((p) => p.id === state.playerId);
  if (!me || !me.dungeonId) return null;
  return room.dungeons.find((d) => d.id === me.dungeonId) || null;
}

function renderDungeonView(room) {
  const d = myDungeon(room);
  if (!d || d.status === "idle") return renderDungeonMenu(room);
  if (d.status === "forming") return renderDungeonParty(room);
  if (d.status === "fighting" || d.status === "done") return renderCombat(room);
}

function rarityMetaOf(r) {
  return (CATALOG.loot && CATALOG.loot.rarityMeta && CATALOG.loot.rarityMeta[r]) || {};
}

// What a dungeon of `rank` can drop, computed from the same data the server
// rolls with (combat.js victory): per-monster dropChance + gradeWeights[rank].
function dungeonDrops(rank) {
  const dg = CATALOG.dungeons.find((x) => x.rank === rank) || {};
  const pool = (dg.monsterPool || [])
    .map((id) => CATALOG.monsters.find((m) => m.id === id))
    .filter(Boolean);
  const loot = CATALOG.loot || {};
  const dropChance = loot.dropChance || {};
  const perKill = [...new Set(pool.map((m) => m.rarity))]
    .filter(Boolean)
    .map((r) => ({ rarity: r, chance: dropChance[r] || 0 }));
  const order = loot.rarityOrder || [];
  const weights = (loot.gradeWeights || {})[rank] || (loot.gradeWeights || {}).f || {};
  const total = order.reduce((s, r) => s + (weights[r] || 0), 0);
  const odds = order
    .map((r) => ({ rarity: r, pct: total ? Math.round(((weights[r] || 0) / total) * 1000) / 10 : 0 }))
    .filter((o) => o.pct > 0);
  return { pool, perKill, odds };
}

function renderDungeonMenu(room) {
  const sortedDungeons = [...CATALOG.dungeons].sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
  const listRoot = $("dungeon-list");
  const roomsRoot = $("dungeon-rooms-list");
  
  // Left: 3x5 dungeon grid
  listRoot.innerHTML =
    `<div class="dungeon-menu-header">
      <p class="eyebrow">Dungeons</p>
      <h2>Choose a Delve</h2>
      <p class="lead">Pick a dungeon, then a size. Match a friend's choice to join their party.</p>
    </div>` +
    `<div class="dungeon-grid">` +
    sortedDungeons
      .map((dg) => {
        const top = [...dungeonDrops(dg.rank).odds].sort((a, b) => b.pct - a.pct).slice(0, 3);
        const hint = top
          .map((o) => `${escapeHtml(rarityMetaOf(o.rarity).label || o.rarity)} ${o.pct}%`)
          .join(" · ");
        const isSpecial = dg.isSpecial;
        return `
      <button type="button" class="dungeon-card${isSpecial ? " dungeon-card--special" : ""}" data-rank="${dg.rank}">
        <span class="portrait portrait--dungeon dungeon-tile" data-img="${dg.image}" data-variant="dungeon"></span>
        <span class="dungeon-card-label">${escapeHtml(dg.label)}</span>
        <span class="dungeon-card-drops">${hint}</span>
        ${isSpecial ? '<span class="dungeon-card-badge">Special</span>' : ''}
      </button>`;
      })
      .join("") +
    `</div>`;
  
  listRoot.querySelectorAll("[data-rank]").forEach((b) =>
    b.addEventListener("click", () => renderDungeonSizeModal(room, b.getAttribute("data-rank")))
  );
  
  // Right: Forming parties panel (all ranks)
  renderDungeonRoomsPanel(room, roomsRoot);
  
  initImages(listRoot);
  initImages(roomsRoot);
}

function renderDungeonRoomsPanel(room, root) {
  if (!root) return;
  
  const formingDungeons = (room.dungeons || []).filter(
    (d) => d.status === "forming" && d.open && d.memberIds.length > 0
  );
  
  if (!formingDungeons.length) {
    root.innerHTML = `<div class="dungeon-rooms-empty">No forming parties. Create one by selecting a dungeon.</div>`;
    return;
  }
  
  const me = room.players.find((p) => p.id === state.playerId);
  
  root.innerHTML = formingDungeons.map((d) => {
    const def = CATALOG.dungeons.find((x) => x.rank === d.rank);
    const sizeDef = CATALOG.sizes.find((x) => x.id === d.size);
    const leader = room.players.find((p) => p.id === d.leaderId);
    const isLeader = d.leaderId === state.playerId;
    const isMember = d.memberIds.includes(state.playerId);
    const memberCount = d.memberIds.length;
    const maxPlayers = room.maxPlayers || 8;
    
    return `
      <div class="dungeon-room-card" data-dungeon-id="${d.id}">
        <div class="dungeon-room-header">
          <span class="dungeon-room-rank">
            ${escapeHtml(def?.label || d.rank)}
            <span class="rank-badge">${escapeHtml(sizeDef?.label || d.size)}</span>
          </span>
          <span class="dungeon-room-size">${escapeHtml(sizeDef?.label || d.size)}</span>
        </div>
        <div class="dungeon-room-meta">
          <span class="dungeon-room-leader">Leader: ${escapeHtml(leader?.name || "Unknown")}</span>
          <span class="dungeon-room-count">${memberCount}/${maxPlayers}</span>
        </div>
        <div class="dungeon-room-players">
          ${d.memberIds.map((id) => {
            const p = room.players.find((pl) => pl.id === id);
            return p ? `<span class="dungeon-room-player-tag">${escapeHtml(p.name)}${p.id === state.playerId ? " (You)" : ""}</span>` : "";
          }).join("")}
        </div>
        <div class="dungeon-room-actions">
          ${isLeader ? `
            <button type="button" class="btn btn--mini dungeon-room-btn start" data-action="start" data-dungeon-id="${d.id}">Start Delve</button>
            <button type="button" class="btn btn--mini dungeon-room-btn leave" data-action="leave" data-dungeon-id="${d.id}">Leave</button>
          ` : isMember ? `
            <button type="button" class="btn btn--mini dungeon-room-btn leave" data-action="leave" data-dungeon-id="${d.id}">Leave Party</button>
          ` : `
            <button type="button" class="btn btn--mini dungeon-room-btn join" data-action="join" data-dungeon-id="${d.id}" ${memberCount >= maxPlayers ? "disabled" : ""}>Join Party</button>
          `}
        </div>
      </div>
    `;
  }).join("");
  
  root.querySelectorAll(".dungeon-room-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      const dungeonId = btn.getAttribute("data-dungeon-id");
      const dungeon = room.dungeons.find((d) => d.id === dungeonId);
      if (!dungeon) return;
      
      if (action === "join") {
        socket.emit("dungeon:join", { rank: dungeon.rank, size: dungeon.size });
      } else if (action === "leave") {
        socket.emit("dungeon:leave");
      } else if (action === "start") {
        socket.emit("dungeon:start");
      }
    });
  });
}

function renderDungeonSizeModal(room, rank) {
  const dg = CATALOG.dungeons.find((x) => x.rank === rank);
  const drops = dungeonDrops(rank);
  const listRoot = $("dungeon-list");
  const roomsRoot = $("dungeon-rooms-list");
  
  const chip = (o, text) =>
    `<span class="drop-chip" style="--drop:${rarityMetaOf(o.rarity).color || "#9aa7b5"}">${escapeHtml(text)}</span>`;
  const monsterChips = drops.pool
    .map((m) => chip({ rarity: m.rarity }, m.name))
    .join("");
  const perKillLine = drops.perKill
    .map((p) => chip(p, `${rarityMetaOf(p.rarity).label || p.rarity} ${Math.round(p.chance * 100)}%`))
    .join("");
  const oddsLine = drops.odds
    .map((o) => chip(o, `${rarityMetaOf(o.rarity).label || o.rarity} ${o.pct}%`))
    .join("");
  const panel = drops.pool.length
    ? `<div class="drop-panel">
        <div class="drop-panel-title">Possible Drops</div>
        <div class="drop-row"><span class="drop-label">Monsters</span><span class="drop-chips">${monsterChips}</span></div>
        <div class="drop-row"><span class="drop-label">Per kill</span><span class="drop-chips">${perKillLine}</span></div>
        <div class="drop-row"><span class="drop-label">Item rarity</span><span class="drop-chips">${oddsLine}</span></div>
      </div>`
    : "";
  
  listRoot.innerHTML =
    `<button type="button" class="btn btn--ghost" id="btn-back-dungeons">← All Dungeons</button>` +
    `<p class="subhead">${escapeHtml(dg.label)} — choose a size</p>` +
    `<div class="size-grid">` +
    CATALOG.sizes
      .map(
        (s) => `
      <button type="button" class="size-card" data-size="${s.id}">
        <span class="size-card-label">${escapeHtml(s.label)}</span>
        <span class="muted">Stamina ${s.stamina}</span>
      </button>`
      )
      .join("") +
    `</div>` +
    panel;
  
  listRoot.querySelectorAll("[data-size]").forEach((b) =>
    b.addEventListener("click", () => socket.emit("dungeon:join", { rank, size: b.getAttribute("data-size") }))
  );
  listRoot.querySelector("#btn-back-dungeons").addEventListener("click", () => renderDungeonMenu(room));
  
  // Right panel: show forming parties for this specific rank
  const formingForRank = (room.dungeons || []).filter(
    (d) => d.status === "forming" && d.open && d.rank === rank && d.memberIds.length > 0
  );
  
  if (!formingForRank.length) {
    roomsRoot.innerHTML = `<div class="dungeon-rooms-empty">No parties forming for this dungeon yet. Be the first!</div>`;
    return;
  }
  
  const me = room.players.find((p) => p.id === state.playerId);
  
  roomsRoot.innerHTML = formingForRank.map((d) => {
    const sizeDef = CATALOG.sizes.find((x) => x.id === d.size);
    const leader = room.players.find((p) => p.id === d.leaderId);
    const isLeader = d.leaderId === state.playerId;
    const isMember = d.memberIds.includes(state.playerId);
    const memberCount = d.memberIds.length;
    const maxPlayers = room.maxPlayers || 8;
    
    return `
      <div class="dungeon-room-card" data-dungeon-id="${d.id}">
        <div class="dungeon-room-header">
          <span class="dungeon-room-rank">${escapeHtml(dg.label)} <span class="rank-badge">${escapeHtml(sizeDef?.label || d.size)}</span></span>
        </div>
        <div class="dungeon-room-meta">
          <span class="dungeon-room-leader">Leader: ${escapeHtml(leader?.name || "Unknown")}</span>
          <span class="dungeon-room-count">${memberCount}/${maxPlayers}</span>
        </div>
        <div class="dungeon-room-players">
          ${d.memberIds.map((id) => {
            const p = room.players.find((pl) => pl.id === id);
            return p ? `<span class="dungeon-room-player-tag">${escapeHtml(p.name)}${p.id === state.playerId ? " (You)" : ""}</span>` : "";
          }).join("")}
        </div>
        <div class="dungeon-room-actions">
          ${isLeader ? `
            <button type="button" class="btn btn--mini dungeon-room-btn start" data-action="start" data-dungeon-id="${d.id}">Start Delve</button>
            <button type="button" class="btn btn--mini dungeon-room-btn leave" data-action="leave" data-dungeon-id="${d.id}">Leave</button>
          ` : isMember ? `
            <button type="button" class="btn btn--mini dungeon-room-btn leave" data-action="leave" data-dungeon-id="${d.id}">Leave Party</button>
          ` : `
            <button type="button" class="btn btn--mini dungeon-room-btn join" data-action="join" data-dungeon-id="${d.id}" ${memberCount >= maxPlayers ? "disabled" : ""}>Join Party</button>
          `}
        </div>
      </div>
    `;
  }).join("");
  
  roomsRoot.querySelectorAll(".dungeon-room-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      const dungeonId = btn.getAttribute("data-dungeon-id");
      const dungeon = room.dungeons.find((d) => d.id === dungeonId);
      if (!dungeon) return;
      
      if (action === "join") {
        socket.emit("dungeon:join", { rank: dungeon.rank, size: dungeon.size });
      } else if (action === "leave") {
        socket.emit("dungeon:leave");
      } else if (action === "start") {
        socket.emit("dungeon:start");
      }
    });
  });
  
  initImages(listRoot);
  initImages(roomsRoot);
}

function renderDungeonParty(room) {
  const d = myDungeon(room);
  if (!d) return;
  
  const members = (d.memberIds || []).map((id) => room.players.find((p) => p.id === id)).filter(Boolean);
  const isLeader = d.leaderId === state.playerId;
  const def = CATALOG.dungeons.find((x) => x.rank === d.rank);
  const sizeDef = CATALOG.sizes.find((x) => x.id === d.size);
  
  const listRoot = $("dungeon-list");
  const roomsRoot = $("dungeon-rooms-list");
  
  // Left: Dungeon info
  listRoot.innerHTML = `
    <div class="dungeon-menu-header">
      <p class="eyebrow">${escapeHtml(d.label || def?.label || "")}</p>
      <h2>${escapeHtml(sizeDef?.label || d.size)}</h2>
      <p class="lead">The first to join leads. The leader starts the delve; allies need only be here. Others can join by choosing the same dungeon + size.</p>
    </div>
    <div class="dungeon-info-panel">
      <ul class="party-list">
        ${members
          .map(
            (m) => `<li>
              <span class="party-list-name">${escapeHtml(m.name)}</span>
              ${m.id === d.leaderId ? ' <span class="badge badge--host">Leader</span>' : ""}
              ${m.id === state.playerId ? ' <span class="badge">You</span>' : ""}
              <span class="player-meta">${classLabel(m.character)} · ${m.hp}/${m.maxHp} HP</span>
            </li>`
          )
          .join("")}
      </ul>
      <div class="btn-row">
        <button type="button" class="btn btn--ghost" id="btn-party-leave">Leave Party</button>
        ${isLeader ? `<button type="button" class="btn btn--gold" id="btn-party-start">Start Delve (${d.stamina} stamina)</button>` : ""}
      </div>`;
  
  listRoot.querySelector("#btn-party-leave").addEventListener("click", () => socket.emit("dungeon:leave"));
  const start = listRoot.querySelector("#btn-party-start");
  if (start) start.addEventListener("click", () => socket.emit("dungeon:start"));
  
  // Right: Other forming parties for this rank+size
  const formingForRank = (room.dungeons || []).filter(
    (dg) => dg.status === "forming" && dg.open && dg.rank === d.rank && dg.size === d.size && dg.id !== d.id && dg.memberIds.length > 0
  );
  
  if (!formingForRank.length) {
    roomsRoot.innerHTML = `<div class="dungeon-rooms-empty">No other parties forming for this dungeon.</div>`;
    return;
  }
  
  const me = room.players.find((p) => p.id === state.playerId);
  
  roomsRoot.innerHTML = formingForRank.map((dg) => {
    const leader = room.players.find((p) => p.id === dg.leaderId);
    const isLeaderOther = dg.leaderId === state.playerId;
    const isMemberOther = dg.memberIds.includes(state.playerId);
    const memberCount = dg.memberIds.length;
    const maxPlayers = room.maxPlayers || 8;
    
    return `
      <div class="dungeon-room-card" data-dungeon-id="${dg.id}">
        <div class="dungeon-room-header">
          <span class="dungeon-room-rank">${escapeHtml(sizeDef?.label || d.size)}</span>
          <span class="dungeon-room-size">Other Party</span>
        </div>
        <div class="dungeon-room-meta">
          <span class="dungeon-room-leader">Leader: ${escapeHtml(leader?.name || "Unknown")}</span>
          <span class="dungeon-room-count">${memberCount}/${maxPlayers}</span>
        </div>
        <div class="dungeon-room-players">
          ${dg.memberIds.map((id) => {
            const p = room.players.find((pl) => pl.id === id);
            return p ? `<span class="dungeon-room-player-tag">${escapeHtml(p.name)}${p.id === state.playerId ? " (You)" : ""}</span>` : "";
          }).join("")}
        </div>
        <div class="dungeon-room-actions">
          ${isMemberOther ? `
            <button type="button" class="btn btn--mini dungeon-room-btn leave" data-action="leave" data-dungeon-id="${dg.id}">Leave Party</button>
          ` : `
            <button type="button" class="btn btn--mini dungeon-room-btn join" data-action="join" data-dungeon-id="${dg.id}" ${memberCount >= maxPlayers ? "disabled" : ""}>Join</button>
          `}
        </div>
      </div>
    `;
  }).join("");
  
  roomsRoot.querySelectorAll(".dungeon-room-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      const dungeonId = btn.getAttribute("data-dungeon-id");
      const dungeon = room.dungeons.find((d) => d.id === dungeonId);
      if (!dungeon) return;
      
      if (action === "join") {
        socket.emit("dungeon:join", { rank: dungeon.rank, size: dungeon.size });
      } else if (action === "leave") {
        socket.emit("dungeon:leave");
      }
    });
  });
  
  initImages(listRoot);
  initImages(roomsRoot);
}

function combatLoadout(me) {
  const cls = CATALOG.classes.find((c) => c.slug === me.character) || {};
  const raw = cls.basicAttack;
  const basic = raw ? { ...raw, target: "enemy", mana: 0 } : { id: "auto_attack", name: "Basic Attack", target: "enemy", power: 1.0, mana: 0, image: "" };
  const ids = me.skillLoadout || [];
  const skills = [basic, ...ids.map((id) => CATALOG.skills.find((s) => s.id === id)).filter(Boolean)];
  while (skills.length < 6) skills.push(null);
  return skills.slice(0, 6);
}

function skillTipEl(s) {
  const desc = s.description || "";
  return `<span class="skill-tip">
    <strong>${escapeHtml(s.name)}</strong>
    <span>${escapeHtml(desc)}</span>
    <em>${s.mana ? s.mana + " mana" : "Free"}</em>
  </span>`;
}

function renderCombat(room, root) {
  const d = myDungeon(room);
  const me = room.players.find((p) => p.id === state.playerId);
  const members = (d.memberIds || []).map((id) => room.players.find((p) => p.id === id)).filter(Boolean);
  const isMyTurn = d.status === "fighting" && d.phase === "players" && d.currentTurnId === state.playerId;
  const canAct = isMyTurn && me && me.hp > 0;
  const current = members.find((p) => p.id === d.currentTurnId);

  if (!canAct && state.selectedSkill) state.selectedSkill = null;

  if (canAct) {
    if (state.timerReset || state.timerDeadline == null) {
      state.timerDeadline = Date.now() + 10000;
      state.timerFired = false;
      state.timerReset = false;
    }
  } else {
    state.timerDeadline = null;
    state.timerFired = false;
  }
  startCombatTimer();

  if (d.currentTurnId && d.currentTurnId !== state.lastTurnId) {
    if (d.currentTurnId === state.playerId && me && me.hp > 0) playSfx("turn");
    state.lastTurnId = d.currentTurnId;
  }

  const enemiesHtml = d.wave
    .map((m, i) => {
      const dead = m.hp <= 0;
      const targetable = canAct && state.selectedSkill && state.selectedSkill.target === "enemy" && !dead;
      return `<button type="button" class="enemy${dead ? " enemy--dead" : ""}${targetable ? " enemy--targetable" : ""}" data-enemy="${i}">
        <span class="portrait portrait--monster monster-portrait" data-img="${imgFor(m.kind, "monster")}" data-variant="monster"></span>
        <span class="enemy-meta">
          <span class="enemy-name">${escapeHtml(m.name)}</span>
          <span class="hpbar"><span class="hpbar-fill" style="width:${Math.round((m.hp / m.maxHp) * 100)}%"></span></span>
          <span class="hpnum">${m.hp}/${m.maxHp}</span>
          ${buffBadges(d, "monster", i)}
        </span>
      </button>`;
    })
    .join("");

  const partyHtml = members
    .map((p) => {
      const frame = p.anomaly ? ` style="--frame:${p.anomaly.frameColor}"` : "";
      const targetable = canAct && state.selectedSkill && state.selectedSkill.target === "ally" && p.hp > 0;
      const isCurrent = d.phase === "players" && d.currentTurnId === p.id;
      return `<button type="button" class="fighter${p.hp <= 0 ? " fighter--down" : ""}${isCurrent ? " fighter--turn" : ""}${targetable ? " fighter--targetable" : ""}" data-fighter="${p.id}">
        <span class="portrait portrait--${p.character} fighter-portrait" data-img="${imgFor(p.character, "class")}" data-variant="${p.character}"${frame}></span>
        <span class="fighter-name">${escapeHtml(p.name)}${p.id === d.leaderId ? " ★" : ""}${isCurrent ? ' <span class="turn-tag">turn</span>' : ""}</span>
        <span class="hpbar"><span class="hpbar-fill hpbar-fill--party" style="width:${Math.round((p.hp / p.maxHp) * 100)}%"></span></span>
        <span class="hpnum">${p.hp}/${p.maxHp}</span>
        <span class="fighter-stats">Atk ${p.attack} · Res ${p.resistance} · Mgc ${p.magicPower} · Heal ${p.healPower} · Spd ${p.speed} · Crit ${p.critChance}%</span>
        <span class="fighter-mana">Mana ${p.mana}/${p.maxMana}</span>
        ${buffBadges(d, "player", p.id)}
      </button>`;
    })
    .join("");

  const usedIds = (d.usedSkills && d.usedSkills[me.id]) || [];
  const skillsHtml = combatLoadout(me)
    .map((s) => {
      if (!s) {
        return `<div class="skill-slot skill-slot--empty"></div>`;
      }
      const affordable = me.mana >= (s.mana || 0);
      const usedNow = usedIds.includes(s.id);
      const picked = state.selectedSkill && state.selectedSkill.id === s.id;
      const disabled = !canAct || !affordable || usedNow;
      return `<button type="button" class="skill-slot${disabled ? " skill-slot--disabled" : ""}${picked ? " skill-slot--picked" : ""}${usedNow ? " skill-slot--used" : ""}" data-skill="${s.id}" data-target="${s.target}">
        ${skillTipEl(s)}
        ${skillIconEl(s)}
        <span class="skill-name">${escapeHtml(s.name)}</span>
        <span class="skill-mana">${s.mana || 0} mana</span>
        ${usedNow ? '<span class="skill-used-tag">Used</span>' : ""}
      </button>`;
    })
    .join("");

  const itemButtons = [`<button type="button" class="item-btn${canAct && me.food > 0 ? "" : " item-btn--disabled"}" data-item="food">
    ${itemIconEl({ id: "food", image: "" })}
    <span>Eat Food (${me.food})</span>
  </button>`];
  (me.inventory || []).forEach((inv) => {
    const item = CATALOG.items.find((x) => x.id === inv.itemId);
    if (!item || item.slot !== "consumable" || inv.qty < 1) return;
    itemButtons.push(`<button type="button" class="item-btn${canAct ? "" : " item-btn--disabled"}" data-item="${inv.itemId}">
      ${itemIconEl(item)}
      <span>${escapeHtml(item.name)} (${inv.qty})</span>
    </button>`);
  });
  const itemsHtml = itemButtons.join("");

  let hint;
  if (d.status === "done") hint = d.result ? d.result.text : "";
  else if (d.phase === "monsters") hint = "The monsters are acting…";
  else if (!isMyTurn) hint = current ? `Waiting for ${current.name}…` : "…";
  else if (me.hp <= 0) hint = "You are down — wait to be revived.";
  else if (state.selectedSkill)
    hint = state.selectedSkill.target === "self" ? "Click the skill again to use it." : "Choose a target.";
  else if (canAct && combatLoadout(me).filter(Boolean).every((s) => usedIds.includes(s.id)))
    hint = "All skills used — end your turn when ready.";
  else hint = "Your turn — choose an action.";

  const endTurnBtn = canAct ? `<button type="button" class="btn btn--gold" id="btn-end-turn">End Turn</button>` : "";
  const fleeBtn = (canAct && me.hp > Math.floor(me.maxHp * 0.2)) 
    ? `<button type="button" class="btn btn--bronze" id="btn-flee">Flee</button>` 
    : "";
  const timerHtml = `<div class="turn-timer${canAct ? "" : " turn-timer--idle"}"><div class="turn-timer-fill" id="turn-timer-fill"></div></div>`;
  const logHtml = `<div class="combat-log">${d.log.slice(-8).map((l) => `<div class="log-line">${escapeHtml(l)}</div>`).join("")}</div>`;

  root.innerHTML = `
    <div class="combat-wrap">
      <p class="subhead">${escapeHtml(d.label || "")} — ${sizeLabel(d.size)} · Round ${d.round}</p>
      <div class="enemy-wave">${enemiesHtml || '<div class="muted">No foes remain.</div>'}</div>
      <div class="party-row">${partyHtml}</div>
      <div class="skill-bar">${skillsHtml}</div>
      <div class="item-bar">${itemsHtml}</div>
      <div class="combat-hint">${escapeHtml(hint)}</div>
      <div class="combat-actions">${fleeBtn}${endTurnBtn}</div>
      ${timerHtml}
      ${logHtml}
    </div>
    ${d.result ? renderResultOverlay(d.result, firstChestId(me)) : ""}
  `;
  initImages(root);
  drainCombatFx(root);

  root.querySelectorAll("[data-skill]").forEach((b) => {
    b.addEventListener("click", () => {
      const id = b.getAttribute("data-skill");
      const basic = (CATALOG.classes.find((c) => c.slug === me.character) || {}).basicAttack;
      const chosen = basic && basic.id === id ? { ...basic, target: "enemy", mana: 0 } : CATALOG.skills.find((s) => s.id === id);
      if (!chosen || !canAct || me.hp <= 0 || me.mana < (chosen.mana || 0) || usedIds.includes(id)) return;
      if (chosen.target === "self" || chosen.target === "party") {
        socket.emit("combat:act", { skillId: chosen.id, targetId: me.id });
        state.selectedSkill = null;
        state.timerReset = true;
      } else {
        state.selectedSkill = chosen;
        renderCombat(room, root);
      }
    });
  });
  root.querySelectorAll("[data-enemy]").forEach((b) => {
    b.addEventListener("click", () => {
      if (!canAct || me.hp <= 0 || !state.selectedSkill || state.selectedSkill.target !== "enemy") return;
      socket.emit("combat:act", { skillId: state.selectedSkill.id, targetId: b.getAttribute("data-enemy") });
      state.selectedSkill = null;
      state.timerReset = true;
    });
  });
  root.querySelectorAll("[data-fighter]").forEach((b) => {
    b.addEventListener("click", () => {
      if (!canAct || me.hp <= 0 || !state.selectedSkill || state.selectedSkill.target !== "ally") return;
      socket.emit("combat:act", { skillId: state.selectedSkill.id, targetId: b.getAttribute("data-fighter") });
      state.selectedSkill = null;
      state.timerReset = true;
    });
  });
  root.querySelectorAll("[data-item]").forEach((b) => {
    b.addEventListener("click", () => {
      if (!canAct || me.hp <= 0) return;
      const itemId = b.getAttribute("data-item");
      socket.emit("combat:useItem", { itemId });
      if (itemId === "food") sfxPlay("eatingsound");
      else sfxPlay("potiondrinksound");
      state.timerReset = true;
    });
  });
  const endBtn = root.querySelector("#btn-end-turn");
  if (endBtn) {
    endBtn.addEventListener("click", () => {
      if (me.hp <= 0) return;
      state.timerDeadline = null;
      socket.emit("combat:endTurn");
    });
  }
  const fleeBtnEl = root.querySelector("#btn-flee");
  if (fleeBtnEl) {
    fleeBtnEl.addEventListener("click", () => {
      if (me.hp <= 0) return;
      if (me.hp <= Math.floor(me.maxHp * 0.2)) return;
      state.timerDeadline = null;
      socket.emit("combat:flee");
    });
  }
  const openChestBtn = root.querySelector("#btn-result-open-chest");
  if (openChestBtn) {
    openChestBtn.addEventListener("click", () => {
      sfxPlay("lootsound");
      socket.emit("chest:open", { itemId: openChestBtn.getAttribute("data-chest-id") });
    });
  }
  const ret = root.querySelector("#btn-result-return");
  if (ret) {
    ret.addEventListener("click", () => {
      state.dungeonOpen = false;
      state.selectedSkill = null;
      state.pendingFx = [];
      stopCombatTimer();
      socket.emit("dungeon:return");
    });
  }
}

function renderResultOverlay(result, chestId) {
  const chestBtn = result.outcome === "victory" && chestId
    ? `<button type="button" class="btn btn--bronze" id="btn-result-open-chest" data-chest-id="${escapeHtml(chestId)}">Open Chest</button>`
    : "";
  return `<div class="result-overlay">
    <div class="result-card${result.outcome === "victory" ? " result-card--victory" : " result-card--defeat"}">
      <h3>${result.outcome === "victory" ? "Victory!" : "Defeat"}</h3>
      <p>${escapeHtml(result.text)}</p>
      ${chestBtn}
      <button type="button" class="btn btn--gold" id="btn-result-return">Return to Town</button>
    </div>
  </div>`;
}

// ---- Tavern ----

function renderTavernView(room) {
  const me = room.players.find((p) => p.id === state.playerId);
  const root = $("tavern-content");
  const t = me.tavern;
  if (t && t.status === "done" && t.won !== undefined) {
    const key = t.game + ":" + (t.message || "");
    if (state.tavernResultKey !== key) {
      state.tavernResultKey = key;
      const title = t.won ? "You Win!" : t.won === null ? "Push" : "You Lose";
      showNotice(t.won ? "win" : t.won === null ? "push" : "lose", title, t.message || "");
    }
  }
  const inGame = t && t.game === "blackjack" && t.status === "playing";

  if (inGame) {
    const handHtml = (hand) => (hand || []).map((c) => `<span class="card">${escapeHtml(c.rank)}</span>`).join("");
    const dealerShown = t.dealerShown || t.status === "done";
    const dealerCards = dealerShown ? t.dealerHand : t.dealerHand.slice(0, 1);
    root.innerHTML = `
      <p class="subhead">Blackjack — ${t.bet} gold</p>
      <div class="card-area">
        <div class="card-row"><span class="muted">Dealer:</span> ${handHtml(dealerCards)}</div>
        <div class="card-row"><span class="muted">You:</span> ${handHtml(t.playerHand)}</div>
      </div>
      <div class="btn-row">
        <button type="button" class="btn" id="btn-hit">Hit</button>
        <button type="button" class="btn btn--bronze" id="btn-stand">Stand</button>
      </div>
      <div class="log-line">${escapeHtml(t.message || "")}</div>`;
    root.querySelector("#btn-hit").addEventListener("click", () => socket.emit("tavern:move", { move: "hit" }));
    root.querySelector("#btn-stand").addEventListener("click", () => socket.emit("tavern:move", { move: "stand" }));
    return;
  }

  const result = t && t.status === "done" ? `<div class="log-line">${escapeHtml(t.message || "")}</div>` : "";
  const prov = (CATALOG.town && CATALOG.town.tavern && CATALOG.town.tavern.provisions) || { foodPrice: 10, foodAmount: 2 };
  root.innerHTML = `
    <p class="subhead">Wagering</p>
    <p class="lead">Pick a wager, then a game. A winning coin flip doubles it; blackjack pays 2.5&times; on a natural.</p>
    ${result}
    <div class="bet-row">
      ${(CATALOG.town.tavern.bets || [5, 10, 25])
        .map((b) => `<button type="button" class="bet-btn${state.bet === b ? " is-selected" : ""}" data-bet="${b}">${b} gold</button>`)
        .join("")}
    </div>
    <div class="btn-row">
      <button type="button" class="btn" id="btn-flip">Coin Flip</button>
      <button type="button" class="btn btn--bronze" id="btn-bj">Blackjack</button>
    </div>
    <div class="provisions-row">
      <span class="muted">Field Rations — ${prov.foodAmount} food</span>
      <button type="button" class="btn btn--bronze btn--mini" id="btn-buy-food">Buy (${prov.foodPrice} gold)</button>
    </div>`;
  root.querySelectorAll("[data-bet]").forEach((b) =>
    b.addEventListener("click", () => {
      state.bet = Number(b.getAttribute("data-bet"));
      renderTavernView(room);
    })
  );
  root.querySelector("#btn-flip").addEventListener("click", () => socket.emit("tavern:start", { game: "coinflip", bet: state.bet }));
  root.querySelector("#btn-bj").addEventListener("click", () => socket.emit("tavern:start", { game: "blackjack", bet: state.bet }));
  root.querySelector("#btn-buy-food").addEventListener("click", () => socket.emit("tavern:buyFood"));
}

// ---- Ancient Temple ----

function rarityBadge(item) {
  const meta = (CATALOG.loot && CATALOG.loot.rarityMeta) || {};
  const r = (item && item.rarity) || "common";
  const m = meta[r];
  return `<span class="rarity-badge" style="--rarity:${m ? m.color : "#9aa7b5"}">${escapeHtml(m ? m.label : r)}</span>`;
}

function itemOwnedQty(me, itemId) {
  const e = (me.inventory || []).find((i) => i.itemId === itemId);
  return e ? e.qty : 0;
}

function firstChestId(me) {
  const e = (me.inventory || []).find((inv) => {
    const item = CATALOG.items.find((x) => x.id === inv.itemId);
    return item && item.slot === "chest" && inv.qty > 0;
  });
  return e ? e.itemId : null;
}

function renderTempleView(room) {
  const me = room.players.find((p) => p.id === state.playerId);
  const root = $("temple-content");
  if (!me) {
    root.innerHTML = "";
    return;
  }
  const temple = CATALOG.temple || {};
  const st = (CATALOG.town && CATALOG.town.temple && CATALOG.town.temple.stamina) || 2;
  const staminaOk = me.stamina >= st;
  const maxLives = (CATALOG.temple && CATALOG.temple.maxLives) || 3;
  const baseCls = CATALOG.classes.find((c) => c.slug === me.character);
  const evo = (temple.evolutions || []).find((e) => e.from === me.character);
  const canEvolve = staminaOk && me.level >= (evo ? evo.level : 20) && itemOwnedQty(me, "ancient_relic") >= 1;
  const relicQty = itemOwnedQty(me, "ancient_relic");
  const restoreItem = temple.restore || {};
  const canRestore = staminaOk && me.lives < maxLives && itemOwnedQty(me, restoreItem.item) >= 1;
  const heartQty = itemOwnedQty(me, restoreItem.item);
  const recipes = temple.recipes || [];

  const evolveHtml = `<div class="temple-card">
    <p class="subhead">Ascension</p>
    ${baseCls && evo ? `
      <p>At level ${evo.level}, ${escapeHtml(baseCls.label)} may ascend into <strong>${escapeHtml(evo.to.label)}</strong>.</p>
      ${evo.skill ? `<p class="temple-skill">Gains <strong>${escapeHtml(evo.skill.name)}</strong> — ${escapeHtml(evo.skill.description)}</p>` : ""}
      ${evo.bonusText ? `<p class="temple-bonus">${escapeHtml(evo.bonusText)}</p>` : ""}
    ` : `<p>Your class holds no further form.</p>`}
    <p class="temple-req">Requires level ${evo ? evo.level : 20}+ · Ancient Relic (${relicQty} owned)</p>
    <button type="button" class="btn btn--gold${canEvolve && baseCls && evo ? "" : " btn--mini-disabled"}" id="btn-temple-evolve">Ascend</button>
  </div>`;

  const restoreHtml = `<div class="temple-card">
    <p class="subhead">Mend a Heart</p>
    <p>Offer ${escapeHtml(restoreItem.itemName || "a Heart of Golem")} to restore one of your ${maxLives} hearts. You have <strong>${me.lives}/${maxLives}</strong>.</p>
    <p class="temple-req">${escapeHtml(restoreItem.itemName || "Heart of Golem")} owned: ${heartQty}</p>
    <button type="button" class="btn btn--bronze${canRestore ? "" : " btn--mini-disabled"}" id="btn-temple-restore">Restore a Heart</button>
  </div>`;

  const craftHtml = `<div class="temple-card">
    <p class="subhead">Craft</p>
    <div class="craft-grid">${recipes.map((r) => {
      const owned = (r.inputs || []).every((inp) => itemOwnedQty(me, inp.item) >= inp.qty);
      const can = staminaOk && owned && me.gold >= (r.cost.gold || 0) && me.wood >= (r.cost.wood || 0);
      const inputNames = (r.inputs || []).map((inp) => {
        const it = CATALOG.items.find((x) => x.id === inp.item);
        return `${it ? escapeHtml(it.name) : escapeHtml(inp.item)} ×${inp.qty} (${itemOwnedQty(me, inp.item)})`;
      }).join(" + ");
      const out = CATALOG.items.find((x) => x.id === r.output.item);
      return `<div class="craft-row">
        <span class="craft-out">${out ? escapeHtml(out.name) : escapeHtml(r.output.item)} ${out ? rarityBadge(out) : ""}</span>
        <span class="craft-in">${inputNames}</span>
        <span class="craft-cost">${icon("gold")} ${r.cost.gold || 0}${r.cost.wood ? ` ${icon("wood")} ${r.cost.wood}` : ""} · ${escapeHtml(r.description || "")}</span>
        <button type="button" class="btn btn--mini${can ? "" : " btn--mini-disabled"}" data-craft="${escapeHtml(r.id)}">Craft</button>
      </div>`;
    }).join("")}</div>
  </div>`;

  root.innerHTML = `
    <div class="shop-resources">
      ${chip(icon("gold"), `Gold ${me.gold}`)}
      ${chip(icon("wood"), `Wood ${me.wood}`)}
      ${chip(icon("lives"), `Lives ${me.lives}/${maxLives}`)}
      ${chip(icon("stamina"), `Stamina ${me.stamina}`)}
    </div>
    <p class="subhead">The Ancient Temple remembers a purpose older than the kingdom.</p>
    <div class="temple-grid">${evolveHtml}${restoreHtml}${craftHtml}</div>`;

  const evBtn = root.querySelector("#btn-temple-evolve");
  if (evBtn) evBtn.addEventListener("click", () => socket.emit("temple:evolve"));
  const rsBtn = root.querySelector("#btn-temple-restore");
  if (rsBtn) rsBtn.addEventListener("click", () => socket.emit("temple:restore"));
  root.querySelectorAll("[data-craft]").forEach((b) =>
    b.addEventListener("click", () => socket.emit("temple:craft", { recipeId: b.getAttribute("data-craft") }))
  );
}

// ---- Shop & Inventory ----

function shopCardHtml(me, staminaOk, item, buyEvent) {
  const afford = staminaOk && me.gold >= item.price.gold && me.wood >= item.price.wood;
  const owned = itemOwnedQty(me, item.id);
  const equipped = !!(me.equipment && Object.values(me.equipment).includes(item.id));
  const consumable = item.slot === "consumable" || item.slot === "material" || item.slot === "chest";
  let action;
  if (consumable) {
    action = `<button type="button" class="btn btn--mini${afford ? "" : " btn--mini-disabled"}" data-buy="${item.id}">Buy</button>`;
  } else if (equipped) {
    action = `<button type="button" class="btn btn--mini btn--mini-disabled" disabled>Equipped ✓</button>`;
  } else if (owned) {
    action = `<button type="button" class="btn btn--mini" data-equip="${item.id}">Equip</button>`;
  } else {
    action = `<button type="button" class="btn btn--mini${afford ? "" : " btn--mini-disabled"}" data-buy="${item.id}">Buy</button>`;
  }
  const ownedBadge = owned > 0
    ? `<span class="purchased-badge">${equipped ? "Equipped" : `Owned ×${owned}`}</span>`
    : "";
  return `<div class="shop-card">
    <span class="shop-card-top">${itemIconEl(item)}<span class="shop-card-name">${escapeHtml(item.name)}</span></span>
    <span class="shop-card-badges">${rarityBadge(item)}${ownedBadge}</span>
    <span class="shop-card-desc">${escapeHtml(item.description)}</span>
    <span class="shop-card-price">
      <span class="price-chip">${icon("gold")}<span>${item.price.gold}</span></span>
      ${item.price.wood ? `<span class="price-chip price-chip--wood">${icon("wood")}<span>${item.price.wood}</span></span>` : ""}
    </span>
    ${action}
  </div>`;
}

function shopResources(me) {
  return `
    <div class="shop-resources">
      ${chip(icon("gold"), `Gold ${me.gold}`)}
      ${chip(icon("wood"), `Wood ${me.wood}`)}
      ${chip(icon("food"), `Food ${me.food}`)}
      ${chip(icon("stamina"), `Stamina ${me.stamina}`)}
    </div>`;
}

function renderBlacksmithView(room) {
  const me = room.players.find((p) => p.id === state.playerId);
  const root = $("blacksmith-content");
  if (!me) {
    root.innerHTML = "";
    return;
  }
  const st = (CATALOG.town && CATALOG.town.blacksmith && CATALOG.town.blacksmith.stamina) || 2;
  const staminaOk = me.stamina >= st;
  const buyable = (CATALOG.loot && CATALOG.loot.buyable) || ["common", "uncommon", "rare"];
  const stockArr = (room.shopStock && room.shopStock.blacksmith) || [];
  const gear = stockArr.length
    ? stockArr.map((id) => (CATALOG.items || []).find((x) => x.id === id)).filter(Boolean)
    : (CATALOG.items || []).filter(
        (i) => i.slot !== "consumable" && i.slot !== "material" && i.slot !== "chest" && buyable.includes(i.rarity)
      );

  root.innerHTML = `
    ${shopResources(me)}
    <p class="subhead">Armor & Weapons</p>
    <div class="shop-grid">${gear.map((i) => shopCardHtml(me, staminaOk, i, "blacksmith:buy")).join("") || '<div class="muted">Nothing for sale today.</div>'}</div>
    <div class="btn-row">
      <button type="button" class="btn btn--bronze" id="btn-shop-inventory">Open Inventory</button>
    </div>`;
  initImages(root);

  root.querySelectorAll("[data-buy]").forEach((b) =>
    b.addEventListener("click", () => socket.emit("blacksmith:buy", { itemId: b.getAttribute("data-buy") }))
  );
  root.querySelectorAll("[data-equip]").forEach((b) =>
    b.addEventListener("click", () => {
      sfxPlay("inventorysound");
      socket.emit("inventory:equip", { itemId: b.getAttribute("data-equip") });
    })
  );
  root.querySelector("#btn-shop-inventory").addEventListener("click", () => {
    sfxPlay("inventorysound");
    state.blacksmithOpen = false;
    state.inventoryOpen = true;
    renderTown(state.room);
  });
}

function renderMerchantView(room) {
  const me = room.players.find((p) => p.id === state.playerId);
  const root = $("merchant-content");
  if (!me) {
    root.innerHTML = "";
    return;
  }
  const st = (CATALOG.town && CATALOG.town.merchant && CATALOG.town.merchant.stamina) || 1;
  const staminaOk = me.stamina >= st;
  const buyable = (CATALOG.loot && CATALOG.loot.buyable) || ["common", "uncommon", "rare"];
  const stockArr = (room.shopStock && room.shopStock.merchant) || [];
  const goods = stockArr.length
    ? stockArr.map((id) => (CATALOG.items || []).find((x) => x.id === id)).filter(Boolean)
    : (CATALOG.items || []).filter(
        (i) => (i.slot === "consumable" || i.slot === "material" || i.slot === "chest") && buyable.includes(i.rarity)
      );

  root.innerHTML = `
    ${shopResources(me)}
    <p class="subhead">Chests, Potions & Materials</p>
    <div class="shop-grid">${goods.map((i) => shopCardHtml(me, staminaOk, i, "merchant:buy")).join("") || '<div class="muted">Nothing for sale today.</div>'}</div>
    <div class="btn-row">
      <button type="button" class="btn btn--bronze" id="btn-merchant-inventory">Open Inventory</button>
    </div>`;
  initImages(root);

  root.querySelectorAll("[data-buy]").forEach((b) =>
    b.addEventListener("click", () => socket.emit("merchant:buy", { itemId: b.getAttribute("data-buy") }))
  );
  root.querySelectorAll("[data-equip]").forEach((b) =>
    b.addEventListener("click", () => {
      sfxPlay("inventorysound");
      socket.emit("inventory:equip", { itemId: b.getAttribute("data-equip") });
    })
  );
  root.querySelector("#btn-merchant-inventory").addEventListener("click", () => {
    sfxPlay("inventorysound");
    state.merchantOpen = false;
    state.inventoryOpen = true;
    renderTown(state.room);
  });
}

function renderInventory(room) {
  const me = room.players.find((p) => p.id === state.playerId);
  const root = $("inventory-content");
  if (!me) {
    root.innerHTML = "";
    return;
  }

  const slotGlyphs = { weapon: "weapon", head: "helmet", armor: "armor", legs: "legs", boots: "boots", amulet: "amulet", ring1: "ring", ring2: "ring" };
  const slots = (CATALOG.equipmentSlots || [])
    .map((slot) => {
      const itemId = me.equipment[slot.id];
      const item = itemId ? CATALOG.items.find((x) => x.id === itemId) : null;
      const stats = item && item.stats
        ? Object.entries(item.stats).map(([k, v]) => `${statLabel(k)} ${v}`).join(" · ")
        : "";
      return `<div class="equip-slot${item ? " equip-slot--filled" : " equip-slot--empty"}">
        <span class="equip-slot-label">${escapeHtml(slot.label)}</span>
        <span class="equip-slot-icon">${item ? itemIconEl(item) : `<span class="equip-slot-placeholder">${icon(slotGlyphs[slot.id] || "weapon")}</span>`}</span>
        <span class="equip-slot-item">${item ? escapeHtml(item.name) : '<span class="muted">Empty</span>'}</span>
        <span class="equip-slot-badges">${item ? rarityBadge(item) : ""}</span>
        <span class="equip-slot-stats">${stats}</span>
        ${item ? `<button type="button" class="btn btn--mini" data-unequip="${slot.id}">Unequip</button>` : ""}
      </div>`;
    })
    .join("");

  const bag = (me.inventory || [])
    .map((inv) => {
      const item = CATALOG.items.find((x) => x.id === inv.itemId);
      if (!item) return "";
      const equipable = item.slot !== "consumable" && item.slot !== "material" && item.slot !== "chest";
      const isChest = item.slot === "chest";
      const action = isChest
        ? `<button type="button" class="btn btn--mini" data-open-chest="${inv.itemId}">Open</button>`
        : equipable
        ? `<button type="button" class="btn btn--mini" data-equip="${inv.itemId}">Equip</button>`
        : "";
      return `<div class="bag-row">
        <span class="bag-icon">${itemIconEl(item)}</span>
        <span class="bag-name">${escapeHtml(item.name)} <span class="bag-qty">×${inv.qty}</span> ${rarityBadge(item)}</span>
        <span class="bag-desc">${escapeHtml(item.description)}</span>
        ${action}
      </div>`;
    })
    .join("");

  root.innerHTML = `
    <div class="shop-resources">
      ${chip(icon("food"), `Food ${me.food}`)}
      ${chip(icon("gold"), `Gold ${me.gold}`)}
      ${chip(icon("wood"), `Wood ${me.wood}`)}
    </div>
    <p class="subhead">Equipment</p>
    <div class="equip-grid">${slots}</div>
    <p class="subhead">Pack</p>
    <div class="bag-list">${bag || '<div class="muted">Your pack is empty.</div>'}</div>`;
  initImages(root);

  root.querySelectorAll("[data-unequip]").forEach((b) =>
    b.addEventListener("click", () => {
      sfxPlay("inventorysound");
      socket.emit("inventory:unequip", { slot: b.getAttribute("data-unequip") });
    })
  );
  root.querySelectorAll("[data-equip]").forEach((b) =>
    b.addEventListener("click", () => {
      sfxPlay("inventorysound");
      socket.emit("inventory:equip", { itemId: b.getAttribute("data-equip") });
    })
  );
  root.querySelectorAll("[data-open-chest]").forEach((b) =>
    b.addEventListener("click", () => {
      sfxPlay("lootsound");
      socket.emit("chest:open", { itemId: b.getAttribute("data-open-chest") });
    })
  );
}

// ---- Chat ----

function chatMessageEl(msg) {
  const div = document.createElement("div");
  div.className = "chat-msg" + (msg.senderId === state.playerId ? " chat-msg--me" : "");
  const name = document.createElement("span");
  name.className = "chat-name";
  name.textContent = msg.name;
  const text = document.createElement("span");
  text.className = "chat-text";
  text.textContent = msg.text;
  div.appendChild(name);
  div.appendChild(text);
  return div;
}

function renderChatHistory(msgs) {
  const body = $("chat-body");
  body.innerHTML = "";
  (msgs || []).forEach((m) => body.appendChild(chatMessageEl(m)));
  body.scrollTop = body.scrollHeight;
}

function addChatMessage(msg) {
  const body = $("chat-body");
  body.appendChild(chatMessageEl(msg));
  while (body.children.length > 80) {
    body.removeChild(body.firstChild);
  }
  body.scrollTop = body.scrollHeight;
}

// ---- Party Panel (Multiplayer) ----

function renderPartyPanel(room, selfId) {
  const el = $("party-panel");
  const otherPlayers = room.players.filter((p) => p.id !== selfId);
  
  if (!otherPlayers.length) {
    el.classList.add("hidden");
    return;
  }
  
  el.classList.remove("hidden");
  
  el.innerHTML = `
    <div class="party-panel-title">Party Members</div>
    <div class="party-panel-list">
      ${otherPlayers.map((p) => {
        const frame = p.anomaly ? ` style="--frame:${p.anomaly.frameColor}"` : "";
        return `
        <button type="button" class="party-panel-card" data-player-id="${p.id}">
          <span class="party-panel-avatar portrait portrait--${p.character}" data-img="${imgFor(p.character, "class")}" data-variant="${p.character}"${frame}></span>
          <div class="party-panel-info">
            <div class="party-panel-name">${escapeHtml(p.name)}${p.isHost ? ' <span class="badge badge--host">Host</span>' : ""}</div>
            <div class="party-panel-class">${classLabel(p.character)} · Lv ${p.level}</div>
          </div>
          <div class="party-panel-stats">
            <div class="party-panel-stat">${icon("hp")}<span>${p.hp}/${p.maxHp} HP</span></div>
            <div class="party-panel-stat">${icon("stamina")}<span>${p.stamina}/${p.maxStamina} Stam</span></div>
          </div>
        </button>`;
      }).join("")}
    </div>
  `;
  
  initImages(el);
  
  el.querySelectorAll(".party-panel-card").forEach((card) => {
    card.addEventListener("click", () => {
      const playerId = card.getAttribute("data-player-id");
      const player = room.players.find((p) => p.id === playerId);
      if (player) showPlayerInfo(player, room);
    });
  });
}

function showPlayerInfo(player, room) {
  const overlay = $("player-info-overlay");
  const content = $("player-info-content");
  const frame = player.anomaly ? ` style="border-color:${player.anomaly.frameColor}"` : "";
  const anomalyFrameColor = player.anomaly ? player.anomaly.frameColor : "#e8b45c";
  
  const stats = [
    { label: "HP", value: `${player.hp}/${player.maxHp}`, icon: "hp" },
    { label: "Stamina", value: `${player.stamina}/${player.maxStamina}`, icon: "stamina" },
    { label: "Level", value: player.level, icon: "level" },
    { label: "XP", value: `${player.xp}/${player.xpToNext}`, icon: "xp" },
    { label: "Attack", value: player.attack, icon: "atk" },
    { label: "Resistance", value: player.resistance, icon: "res" },
    { label: "Magic Power", value: player.magicPower, icon: "magic" },
    { label: "Heal Power", value: player.healPower, icon: "heal" },
    { label: "Speed", value: player.speed, icon: "level" },
    { label: "Crit Chance", value: `${player.critChance}%`, icon: "crit" },
    { label: "Crit Damage", value: `+${player.critDamage}%`, icon: "crit" },
    { label: "Mana", value: `${player.mana}/${player.maxMana}`, icon: "mana" },
    { label: "Mana Regen", value: player.manaRegen, icon: "mana" },
    { label: "Gold", value: player.gold, icon: "gold" },
    { label: "Wood", value: player.wood, icon: "wood" },
    { label: "Food", value: player.food, icon: "food" },
    { label: "Lives", value: `${player.lives}/3`, icon: "lives" },
  ];
  
  const equipSlots = (CATALOG.equipmentSlots || []).map((slot) => {
    const itemId = player.equipment?.[slot.id];
    const item = itemId ? CATALOG.items.find((x) => x.id === itemId) : null;
    return `
      <div class="player-info-equip-slot">
        <div class="player-info-equip-label">${escapeHtml(slot.label)}</div>
        <div class="player-info-equip-item">${item ? escapeHtml(item.name) : '<span class="muted">Empty</span>'}</div>
      </div>`;
  }).join("");
  
  const anomalyHtml = player.anomaly ? `
    <div class="player-info-anomaly">
      <div class="player-info-anomaly-frame" style="border-color:${player.anomaly.frameColor}; background-image:url('${imgFor(player.character, "class")}')"></div>
      <div class="player-info-anomaly-details">
        <div class="player-info-anomaly-name" style="color:${player.anomaly.frameColor}">${escapeHtml(player.anomaly.name)}</div>
        <div class="player-info-anomaly-desc">${escapeHtml(player.anomaly.description)}</div>
      </div>
    </div>` : `<div class="player-info-anomaly"><div class="muted">No anomaly</div></div>`;
  
  content.innerHTML = `
    <div class="player-info-header">
      <span class="player-info-avatar portrait portrait--${player.character}" data-img="${imgFor(player.character, "class")}" data-variant="${player.character}"${frame}></span>
      <div>
        <div class="player-info-name">${escapeHtml(player.name)}${player.isHost ? ' <span class="badge badge--host">Host</span>' : ""}</div>
        <div class="player-info-class">${classLabel(player.character)} · Level ${player.level}</div>
      </div>
    </div>
    <div class="player-info-section">
      <div class="player-info-section-title">Stats</div>
      <div class="player-info-stats">
        ${stats.map((s) => `
          <div class="player-info-stat">
            <div class="player-info-stat-label">${escapeHtml(s.label)}</div>
            <div class="player-info-stat-value">${escapeHtml(String(s.value))}</div>
          </div>`).join("")}
      </div>
    </div>
    <div class="player-info-section">
      <div class="player-info-section-title">Anomaly</div>
      ${anomalyHtml}
    </div>
    <div class="player-info-section">
      <div class="player-info-section-title">Equipment</div>
      <div class="player-info-equipment">${equipSlots}</div>
    </div>
  `;
  
  initImages(content);
  overlay.classList.remove("hidden");
  
  const closeBtn = overlay.querySelector("#btn-player-info-close");
  const closeHandler = () => {
    overlay.classList.add("hidden");
    closeBtn.removeEventListener("click", closeHandler);
    overlay.removeEventListener("click", overlayClickHandler);
  };
  const overlayClickHandler = (e) => {
    if (e.target === overlay) closeHandler();
  };
  closeBtn.addEventListener("click", closeHandler);
  overlay.addEventListener("click", overlayClickHandler);
}

// ---- Boss Map ----

function renderBossView(room) {
  const me = room.players.find((p) => p.id === state.playerId);
  const root = $("boss-content");
  if (!me) {
    root.innerHTML = "";
    return;
  }
  
  const bosses = CATALOG.bosses || [];
  const availableBosses = bosses.filter((b) => me.level >= b.minLevel);
  const nextBoss = bosses.find((b) => me.level < b.minLevel);
  
  root.innerHTML = `
    <div class="boss-map-container">
      <div class="boss-map-wrapper" id="boss-map-wrapper">
        <div class="boss-map-bg" id="boss-map-bg"></div>
        <div class="boss-path" id="boss-path"></div>
        ${bosses.map((boss, index) => {
          const isUnlocked = me.level >= boss.minLevel;
          const isAvailable = availableBosses.includes(boss);
          const isNext = nextBoss && nextBoss.id === boss.id;
          const progress = isUnlocked ? 100 : Math.min(100, Math.round((me.level / boss.minLevel) * 100));
          return `
          <button type="button" 
            class="boss-node${isUnlocked ? " boss-node--unlocked" : " boss-node--locked"}${isNext ? " boss-node--next" : ""}"
            data-boss-id="${boss.id}"
            style="left: ${boss.position.x}%; top: ${boss.position.y}%;"
            ${!isUnlocked ? "disabled" : ""}>
            <div class="boss-node-inner">
              <span class="boss-node-icon">${isUnlocked ? "⚔" : "🔒"}</span>
              <span class="boss-node-name">${escapeHtml(boss.name)}</span>
              <span class="boss-node-level">Lv ${boss.minLevel}+</span>
            </div>
            ${isNext ? '<span class="boss-node-pulse"></span>' : ''}
          </button>`;
        }).join("")}
      </div>
      <div class="boss-map-controls">
        <button type="button" class="btn btn--mini" id="btn-map-zoom-in" title="Zoom In">+</button>
        <button type="button" class="btn btn--mini" id="btn-map-zoom-out" title="Zoom Out">−</button>
        <button type="button" class="btn btn--mini" id="btn-map-reset" title="Reset View">⌂</button>
      </div>
    </div>
    <div class="boss-detail-panel" id="boss-detail-panel">
      <div class="boss-detail-placeholder">
        <p class="muted">Select a boss to view details</p>
      </div>
    </div>`;
  
  setupBossMapInteractions(root, me, bosses);
}

function setupBossMapInteractions(root, me, bosses) {
  const wrapper = root.querySelector("#boss-map-wrapper");
  const detailPanel = root.querySelector("#boss-detail-panel");
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  
  function updateTransform() {
    wrapper.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }
  
  function showBossDetail(boss) {
    const isUnlocked = me.level >= boss.minLevel;
    const rewards = boss.rewards || {};
    detailPanel.innerHTML = `
      <div class="boss-detail-card">
        <div class="boss-detail-header" style="border-color: ${getElementColor(boss.element)}">
          <span class="boss-detail-icon">${isUnlocked ? "⚔" : "🔒"}</span>
          <div>
            <div class="boss-detail-name">${escapeHtml(boss.name)}</div>
            <div class="boss-detail-title">${escapeHtml(boss.title)}</div>
          </div>
          <span class="boss-detail-level">Min Level: ${boss.minLevel} · Rec: ${boss.recommendedLevel}</span>
        </div>
        <div class="boss-detail-image" style="background-image: url('${boss.image}')"></div>
        <div class="boss-detail-description">${escapeHtml(boss.description)}</div>
        <div class="boss-detail-stats">
          <div class="boss-stat-row">
            <div class="boss-stat">${icon("hp")}<span>HP: ${boss.hp.toLocaleString()}</span></div>
            <div class="boss-stat">${icon("atk")}<span>Atk: ${boss.attack}</span></div>
            <div class="boss-stat">${icon("res")}<span>Res: ${boss.resistance}</span></div>
            <div class="boss-stat">${icon("magic")}<span>Mgc: ${boss.magicPower}</span></div>
            <div class="boss-stat">${icon("level")}<span>Spd: ${boss.speed}</span></div>
          </div>
          <div class="boss-element">Element: <strong style="color: ${getElementColor(boss.element)}">${escapeHtml(boss.element)}</strong></div>
        </div>
        <div class="boss-detail-skills">
          <div class="boss-detail-section-title">Special Abilities</div>
          <div class="boss-skills-list">
            ${(boss.skills || []).map((skillId) => {
              const skill = CATALOG.skills.find((s) => s.id === skillId);
              return skill ? `
                <div class="boss-skill">
                  <span class="boss-skill-icon" data-img="${skill.image}"></span>
                  <div>
                    <div class="boss-skill-name">${escapeHtml(skill.name)}</div>
                    <div class="boss-skill-desc">${escapeHtml(skill.description)}</div>
                  </div>
                </div>` : "";
            }).join("")}
          </div>
        </div>
        <div class="boss-detail-rewards">
          <div class="boss-detail-section-title">Rewards</div>
          <div class="boss-rewards-list">
            <div class="boss-reward-row">
              <span class="boss-reward-label">Gold</span>
              <span class="boss-reward-value">${icon("gold")} ${rewards.gold?.toLocaleString() || 0}</span>
            </div>
            <div class="boss-reward-row">
              <span class="boss-reward-label">XP</span>
              <span class="boss-reward-value">${icon("xp")} ${rewards.xp?.toLocaleString() || 0}</span>
            </div>
            ${rewards.guaranteedDrop ? `
              <div class="boss-reward-row boss-reward--guaranteed">
                <span class="boss-reward-label">Guaranteed</span>
                <span class="boss-reward-value">${escapeHtml(rewards.guaranteedDrop)}</span>
              </div>` : ""}
            ${rewards.possibleDrops ? `
              <div class="boss-reward-row">
                <span class="boss-reward-label">Possible</span>
                <span class="boss-reward-value">${rewards.possibleDrops.map((d) => escapeHtml(d)).join(", ")}</span>
              </div>` : ""}
          </div>
        </div>
        ${isUnlocked ? `
          <button type="button" class="btn btn--gold btn--boss-challenge" data-boss-id="${boss.id}">
            Challenge ${escapeHtml(boss.name)}
          </button>` : `
          <div class="boss-locked-notice">
            <p>Reach level ${boss.minLevel} to challenge this boss.</p>
            <div class="boss-progress-bar">
              <div class="boss-progress-fill" style="width: ${Math.min(100, Math.round((me.level / boss.minLevel) * 100))}%"></div>
            </div>
            <p class="muted">Progress: ${me.level} / ${boss.minLevel}</p>
          </div>`}
      </div>`;
    
    initImages(detailPanel);
    
    const challengeBtn = detailPanel.querySelector(".btn--boss-challenge");
    if (challengeBtn) {
      challengeBtn.addEventListener("click", () => {
        sfxPlay("clicksound");
        socket.emit("boss:challenge", { bossId: challengeBtn.getAttribute("data-boss-id") });
      });
    }
  }
  
  root.querySelectorAll(".boss-node").forEach((node) => {
    node.addEventListener("click", () => {
      const bossId = node.getAttribute("data-boss-id");
      const boss = bosses.find((b) => b.id === bossId);
      if (boss) showBossDetail(boss);
    });
  });
  
  // Zoom controls
  root.querySelector("#btn-map-zoom-in").addEventListener("click", () => {
    scale = Math.min(3, scale + 0.25);
    updateTransform();
  });
  
  root.querySelector("#btn-map-zoom-out").addEventListener("click", () => {
    scale = Math.max(0.5, scale - 0.25);
    updateTransform();
  });
  
  root.querySelector("#btn-map-reset").addEventListener("click", () => {
    scale = 1;
    translateX = 0;
    translateY = 0;
    updateTransform();
  });
  
  // Pan with mouse drag
  wrapper.addEventListener("mousedown", (e) => {
    if (e.target.closest(".boss-node")) return;
    isDragging = true;
    dragStartX = e.clientX - translateX;
    dragStartY = e.clientY - translateY;
    wrapper.style.cursor = "grabbing";
  });
  
  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    translateX = e.clientX - dragStartX;
    translateY = e.clientY - dragStartY;
    updateTransform();
  });
  
  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      wrapper.style.cursor = "grab";
    }
  });
  
  // Wheel zoom
  wrapper.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    scale = Math.max(0.5, Math.min(3, scale + delta));
    updateTransform();
  }, { passive: false });
  
  // Touch support
  let lastTouchDist = 0;
  wrapper.addEventListener("touchstart", (e) => {
    if (e.target.closest(".boss-node")) return;
    if (e.touches.length === 1) {
      isDragging = true;
      dragStartX = e.touches[0].clientX - translateX;
      dragStartY = e.touches[0].clientY - translateY;
    } else if (e.touches.length === 2) {
      lastTouchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: true });
  
  wrapper.addEventListener("touchmove", (e) => {
    if (e.touches.length === 1 && isDragging) {
      e.preventDefault();
      translateX = e.touches[0].clientX - dragStartX;
      translateY = e.touches[0].clientY - dragStartY;
      updateTransform();
    } else if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (lastTouchDist > 0) {
        scale = Math.max(0.5, Math.min(3, scale * (dist / lastTouchDist)));
        lastTouchDist = dist;
        updateTransform();
      }
    }
  }, { passive: false });
  
  wrapper.addEventListener("touchend", () => {
    isDragging = false;
  });
  
  // Show first unlocked boss by default
  const firstUnlocked = root.querySelector(".boss-node--unlocked");
  if (firstUnlocked) {
    const bossId = firstUnlocked.getAttribute("data-boss-id");
    const boss = bosses.find((b) => b.id === bossId);
    if (boss) showBossDetail(boss);
  } else if (bosses.length > 0) {
    showBossDetail(bosses[0]);
  }
}

function getElementColor(element) {
  const colors = {
    physical: "#e8b45c",
    fire: "#e85d2a",
    frost: "#4aa3d6",
    arcane: "#b07fe8",
    shadow: "#c45c6a",
    holy: "#f4e6a8",
    nature: "#6fbf6a"
  };
  return colors[element] || "#e8b45c";
}
