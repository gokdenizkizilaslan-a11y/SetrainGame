const socket = io();

const state = {
  mode: null,
  selectedClass: null,
  playerId: null,
  room: null,
  selectedSkill: null,
  bet: 5,
  dungeonOpen: false,
  tavernOpen: false,
  blacksmithOpen: false,
  templeOpen: false,
  inventoryOpen: false,
  timerDeadline: null,
  timerReset: false,
  timerFired: false,
  pendingFx: [],
  tavernResultKey: "",
  searchResultKey: "",
  restNoticeKey: "",
  sleepNoticeKey: "",
  dayNoticeKey: "",
  justSlept: false,
  lastTurnId: null,
  leavingToMenu: false,
  prevStatus: null,
  introShownForRoom: null,
};

const SESSION_KEY = "setra-session";
const ACTIVE_KEY = "setra-active";

function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function updateContinue() {
  const name = $("player-name").value.trim();
  $("btn-continue").disabled = !(name.length >= 2 && state.selectedClass);
}

function selectClass(slug) {
  state.selectedClass = slug;
  renderClassGrid(state.selectedClass, selectClass);
  updateContinue();
}

function renderLobby(room) {
  showScreen("screen-lobby");
  setLobbyView(true);

  $("room-title").textContent = room.name;
  $("room-code-display").textContent = room.code;
  $("room-status-badge").textContent = room.status === "playing" ? "Playing" : "Lobby";

  renderPlayerList(room, state.playerId);

  const me = room.players.find((p) => p.id === state.playerId);
  const isHost = me && me.isHost;
  const allReady = room.players.length > 0 && room.players.every((p) => p.ready);
  const inLobby = room.status === "lobby";

  $("btn-ready").textContent = me && me.ready ? "Unready" : "Ready";
  $("btn-ready").classList.toggle("btn--ready", Boolean(me && me.ready));
  $("btn-ready").disabled = !inLobby;
  $("btn-start").classList.toggle("hidden", !isHost);
  $("btn-start").disabled = !(isHost && allReady && inLobby);
}

function renderTown(room) {
  showScreen("screen-town");

  const me = room.players.find((p) => p.id === state.playerId);
  const myD = me && me.dungeonId && (room.dungeons || []).find((d) => d.id === me.dungeonId);
  const inCombat = myD && (myD.status === "fighting" || myD.status === "done");
  $("btn-dungeon-close").style.display = inCombat ? "none" : "";

  if (me && room.log && room.log.type === "search" && room.log.name === me.name && state.searchResultKey !== room.log.ts) {
    state.searchResultKey = room.log.ts;
    const parts = [];
    if (room.log.gold) parts.push("+" + room.log.gold + " gold");
    if (room.log.wood) parts.push("+" + room.log.wood + " wood");
    if (room.log.food) parts.push("+" + room.log.food + " food");
    showNotice("search", "You explore the wilds", room.log.text + (parts.length ? "  (" + parts.join(", ") + ")" : ""));
  }

  if (me && room.log && room.log.type === "rest" && room.log.name === me.name && state.restNoticeKey !== room.log.ts) {
    state.restNoticeKey = room.log.ts;
    showToast("🪹 " + room.log.text);
  }

  if (me && room.log && room.log.type === "endDay" && room.log.name === me.name && state.sleepNoticeKey !== room.log.ts) {
    state.sleepNoticeKey = room.log.ts;
    state.justSlept = false;
    showToast("💤 You slept. Stamina returns at dawn.");
  }
  if (me && room.log && room.log.type === "day" && state.dayNoticeKey !== room.log.ts) {
    state.dayNoticeKey = room.log.ts;
    const slept = state.justSlept;
    state.justSlept = false;
    showNotice("day", `Day ${room.day}`, slept ? "You slept through the night. Stamina is restored." : "A new day dawns. Stamina is restored.");
  }

  const inOverlay = state.dungeonOpen || state.tavernOpen || state.blacksmithOpen || state.templeOpen || state.inventoryOpen;
  $("town-main").classList.toggle("hidden", inOverlay);
  $("dungeon-view").classList.toggle("hidden", !state.dungeonOpen);
  $("tavern-view").classList.toggle("hidden", !state.tavernOpen);
  $("blacksmith-view").classList.toggle("hidden", !state.blacksmithOpen);
  $("temple-view").classList.toggle("hidden", !state.templeOpen);
  $("inventory-view").classList.toggle("hidden", !state.inventoryOpen);

  if (!inOverlay) {
    $("town-day").textContent = room.day;
    renderProfileCard(room, state.playerId);
    renderActionCards(room, state.playerId);
    renderTownParty(room);
    renderTownLog(room);
  } else if (state.dungeonOpen) {
    renderDungeonView(room);
  } else if (state.tavernOpen) {
    renderTavernView(room);
  } else if (state.blacksmithOpen) {
    renderBlacksmithView(room);
  } else if (state.templeOpen) {
    renderTempleView(room);
  } else if (state.inventoryOpen) {
    renderInventory(room);
  }
}

function onRoomState(room) {
  state.room = room;
  $("chat").classList.remove("hidden");
  if (state.prevStatus === "lobby" && room.status === "playing" && state.introShownForRoom !== room.id) {
    state.introShownForRoom = room.id;
    showStoryIntro();
  }
  state.prevStatus = room.status;
  if (room.status === "playing") {
    const myD = myDungeon(room);
    const inCombat = myD && (myD.status === "fighting" || myD.status === "done");
    if (inCombat) state.dungeonOpen = true;
    if (!inCombat) state.pendingFx = [];
    renderTown(room);
  } else {
    renderLobby(room);
  }
}

// ---- Chat ----

function sendChat() {
  const input = $("chat-text");
  const text = input.value.trim();
  if (!text) return;
  socket.emit("chat:send", { text });
  input.value = "";
}

function toggleChat() {
  const collapsed = $("chat-body").classList.toggle("hidden");
  $("chat-input").classList.toggle("hidden", collapsed);
  $("chat-toggle").textContent = collapsed ? "+" : "−";
}

// ---- Setup / room wiring ----

document.querySelectorAll("[data-mode]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.mode = btn.getAttribute("data-mode");
    showScreen("screen-setup");
  });
});

$("btn-back-mode").addEventListener("click", () => {
  state.mode = null;
  showScreen("screen-mode");
});

$("player-name").addEventListener("input", updateContinue);

$("btn-continue").addEventListener("click", () => {
  const name = $("player-name").value.trim();
  socket.emit("player:setup", {
    mode: state.mode,
    name,
    character: state.selectedClass,
    sessionId: getSessionId(),
  });
});

$("btn-back-setup").addEventListener("click", () => {
  showScreen("screen-setup");
});

$("btn-create-room").addEventListener("click", () => {
  socket.emit("room:create", { name: $("room-name").value.trim() });
});

$("btn-join-code").addEventListener("click", () => {
  socket.emit("room:joinByCode", { code: $("room-code").value.trim() });
});

$("btn-leave-room").addEventListener("click", () => {
  socket.emit("room:leave");
});

$("btn-ready").addEventListener("click", () => {
  if (!state.room || !state.playerId) return;
  const me = state.room.players.find((p) => p.id === state.playerId);
  socket.emit("player:ready", { ready: !(me && me.ready) });
});

$("btn-start").addEventListener("click", () => {
  socket.emit("game:start");
});

$("btn-dungeon-close").addEventListener("click", () => {
  state.dungeonOpen = false;
  state.pendingFx = [];
  stopCombatTimer();
  renderTown(state.room);
});

$("btn-tavern-close").addEventListener("click", () => {
  state.tavernOpen = false;
  renderTown(state.room);
});

$("btn-blacksmith-close").addEventListener("click", () => {
  state.blacksmithOpen = false;
  renderTown(state.room);
});

$("btn-temple-close").addEventListener("click", () => {
  state.templeOpen = false;
  renderTown(state.room);
});

$("btn-inventory-close").addEventListener("click", () => {
  state.inventoryOpen = false;
  renderTown(state.room);
});

$("chat-send").addEventListener("click", sendChat);
$("chat-text").addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendChat();
});
$("chat-toggle").addEventListener("click", toggleChat);

// ---- Edge buttons: main menu + sound ----

function leaveToMainMenu() {
  state.leavingToMenu = true;
  localStorage.setItem(ACTIVE_KEY, "0");
  state.room = null;
  state.dungeonOpen = false;
  state.tavernOpen = false;
  state.blacksmithOpen = false;
  state.templeOpen = false;
  state.inventoryOpen = false;
  state.pendingFx = [];
  stopCombatTimer();
  $("chat").classList.add("hidden");
  showScreen("screen-mode");
  socket.emit("room:leave");
}

function updateSoundButton(on) {
  const btn = $("btn-sound");
  btn.textContent = on ? "♪ On" : "♪ Off";
  btn.classList.toggle("sound-off", !on);
  btn.title = on ? "Toggle sound effects" : "Toggle sound effects (currently off)";
}

$("btn-main-menu").addEventListener("click", leaveToMainMenu);

$("btn-sound").addEventListener("click", () => {
  setSfxEnabled(!sfxEnabled);
  updateSoundButton(sfxEnabled);
  if (sfxEnabled) playSfx("coin");
});

updateSoundButton(sfxEnabled);

socket.on("catalog", (cat) => {
  applyCatalog(cat);
  renderClassGrid(state.selectedClass, selectClass);
});

socket.on("self", (payload) => {
  state.playerId = payload.playerId;
  state.mode = payload.mode;
  localStorage.setItem(ACTIVE_KEY, "1");
  showScreen("screen-lobby");
  if (payload.mode === "multi") {
    setLobbyView(false);
  }
});

socket.on("room:list", (list) => {
  if (state.room) return;
  renderRoomList(list, (roomId) => socket.emit("room:join", { roomId }));
});

socket.on("room:state", onRoomState);

socket.on("combat:fx", (payload) => {
  if (!payload || !Array.isArray(payload.fx)) return;
  if (payload.dungeonId) {
    const me = (state.room && state.room.players.find((p) => p.id === state.playerId)) || null;
    if (!me || me.dungeonId !== payload.dungeonId) return;
  }
  state.pendingFx.push(...payload.fx);
});

socket.on("chat:history", (msgs) => renderChatHistory(msgs));
socket.on("chat:message", (msg) => addChatMessage(msg));

socket.on("room:left", () => {
  if (state.leavingToMenu) {
    state.leavingToMenu = false;
    return;
  }
  state.room = null;
  state.dungeonOpen = false;
  state.tavernOpen = false;
  state.blacksmithOpen = false;
  state.templeOpen = false;
  state.inventoryOpen = false;
  state.pendingFx = [];
  stopCombatTimer();
  $("chat").classList.add("hidden");
  if (state.mode === "multi") {
    showScreen("screen-lobby");
    setLobbyView(false);
    $("room-list").innerHTML = "";
  } else {
    showScreen("screen-setup");
  }
});

socket.on("server:error", (payload) => {
  showToast(payload.message || "The hall refuses that action.");
});

// ---- Session resume (page-refresh persistence) ----

socket.on("connect", () => {
  if (localStorage.getItem(ACTIVE_KEY) === "1" && getSessionId()) {
    socket.emit("session:resume", { sessionId: getSessionId() });
  }
});

socket.on("session:expired", () => {
  localStorage.setItem(ACTIVE_KEY, "0");
  state.room = null;
  state.dungeonOpen = false;
  state.tavernOpen = false;
  state.blacksmithOpen = false;
  state.templeOpen = false;
  state.inventoryOpen = false;
  state.pendingFx = [];
  stopCombatTimer();
  $("chat").classList.add("hidden");
  showScreen("screen-mode");
});

// ---- Music ----

const music = {
  tracks: [],
  index: 0,
  playing: false,
};

function musicTrackName() {
  return music.tracks[music.index] || "No music";
}

function updateMusicTrack() {
  $("music-track").textContent = musicTrackName();
}

function playMusic() {
  const audio = $("music-audio");
  if (!music.tracks.length) return;
  if (!audio.src) audio.src = "/music/" + music.tracks[music.index];
  audio.play().catch(() => {});
  music.playing = true;
  $("music-toggle").textContent = "⏸";
  localStorage.setItem("setra-music-playing", "1");
}

function pauseMusic() {
  $("music-audio").pause();
  music.playing = false;
  $("music-toggle").textContent = "▶";
  localStorage.setItem("setra-music-playing", "0");
}

function nextTrack() {
  if (!music.tracks.length) return;
  music.index = (music.index + 1) % music.tracks.length;
  const audio = $("music-audio");
  audio.src = "/music/" + music.tracks[music.index];
  updateMusicTrack();
  if (music.playing) audio.play().catch(() => {});
}

async function loadMusic() {
  try {
    const res = await fetch("/api/music");
    const data = await res.json();
    music.tracks = data.tracks || [];
  } catch (e) {
    music.tracks = [];
  }
  if (!music.tracks.length) return;
  $("music").classList.remove("hidden");
  updateMusicTrack();
  const savedVolume = Number(localStorage.getItem("setra-music-volume"));
  if (!Number.isNaN(savedVolume)) {
    $("music-volume").value = savedVolume;
  }
  $("music-audio").volume = $("music-volume").value / 100;
  if (localStorage.getItem("setra-music-playing") === "1") {
    playMusic();
  }
}

$("music-toggle").addEventListener("click", () => {
  if (music.playing) pauseMusic();
  else playMusic();
});

$("music-volume").addEventListener("input", () => {
  $("music-audio").volume = $("music-volume").value / 100;
  localStorage.setItem("setra-music-volume", $("music-volume").value);
});

$("music-audio").addEventListener("ended", nextTrack);

loadMusic();

renderClassGrid(state.selectedClass, selectClass);
showScreen("screen-mode");
