"use strict";

const state = {
  defs: null,
  data: null,
  pageId: null,
  dirty: false,
  token: null,
};

const MODAL_ROOT = document.getElementById("modal-root");

const STAT_LABELS = {
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
const statLabel = (k) => STAT_LABELS[k] || k;

/* ---------- tiny DOM + data helpers ---------- */

function el(tag, attrs, ...children) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") node.className = v;
      else if (k === "value") node.value = v;
      else if (k === "checked") node.checked = !!v;
      else if (k === "selected") node.selected = !!v;
      else if (k.startsWith("on")) node.addEventListener(k.slice(2).toLowerCase(), v);
      else node.setAttribute(k, v);
    }
  }
  for (const c of children) {
    if (c == null) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

function mkButton(label, kind, onClick) {
  return el("button", { class: "btn " + (kind || ""), onclick: onClick }, label);
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function deepClone(x) {
  return JSON.parse(JSON.stringify(x));
}

function getPath(obj, dotted) {
  if (!dotted) return undefined;
  return dotted.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function setPath(obj, dotted, value) {
  const keys = dotted.split(".");
  let o = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (o[keys[i]] == null || typeof o[keys[i]] !== "object") o[keys[i]] = {};
    o = o[keys[i]];
  }
  o[keys[keys.length - 1]] = value;
}

function formatItemLabel(template, item) {
  if (!template) return "";
  return template.replace(/\{(\w+)\}/g, (m, k) => {
    const v = getPath(item, k);
    return v === undefined || v === null ? "" : String(v);
  });
}

function fmtPct(v) {
  if (v == null) return "";
  return String(Math.round((v || 0) * 1000) / 10);
}

/* ---------- API ---------- */

function apiHeaders() {
  const h = { "Content-Type": "application/json" };
  if (state.token) h["x-edit-token"] = state.token;
  return h;
}

async function apiGet(url) {
  const res = await fetch(url, { headers: apiHeaders() });
  if (res.status === 401) {
    showTokenPrompt();
    throw new Error("unauthorized");
  }
  if (res.status === 403) {
    showLocked();
    throw new Error("locked");
  }
  if (!res.ok) throw new Error("Request failed (" + res.status + ")");
  return res.json();
}

async function init() {
  const urlToken = new URLSearchParams(location.search).get("token");
  if (urlToken) state.token = urlToken;
  else {
    const saved = sessionStorage.getItem("editToken");
    if (saved) state.token = saved;
  }
  try {
    const payload = await apiGet("/editor/api/editor");
    state.defs = payload.defs;
    state.data = payload.data;
    if (state.pageId == null) state.pageId = state.defs[0] ? state.defs[0].id : null;
    state.dirty = false;
    renderAll();
  } catch (e) {
    // handled inside apiGet (token prompt / locked)
  }
}

function showTokenPrompt() {
  MODAL_ROOT.replaceChildren(
    el("div", { class: "modal-overlay" },
      el("div", { class: "modal" },
        el("h3", {}, "Enter edit token"),
        el("p", {}, "This server requires a content edit token to make changes."),
        el("input", { type: "text", id: "token-input", placeholder: "CONTENT_EDIT_TOKEN" }),
        el("div", { class: "modal-actions" },
          mkButton("Unlock", "primary", async () => {
            const t = document.getElementById("token-input").value.trim();
            if (!t) return;
            state.token = t;
            sessionStorage.setItem("editToken", t);
            MODAL_ROOT.replaceChildren();
            await init();
          })
        )
      )
    )
  );
  document.getElementById("token-input").focus();
}

function showLocked() {
  MODAL_ROOT.replaceChildren(
    el("div", { class: "modal-overlay" },
      el("div", { class: "modal locked-card" },
        el("h2", {}, "Editor locked"),
        el("p", {}, "The content editor is only open on this computer (localhost). On the live site it is locked so nobody can tamper with the game."),
        el("p", {}, "To enable it remotely, set the CONTENT_EDIT_TOKEN environment variable on the server and visit /editor?token=YOURTOKEN.")
      )
    )
  );
}

function closeModal() {
  MODAL_ROOT.replaceChildren();
}

/* ---------- banner + save ---------- */

function setBanner(kind, text) {
  const banner = document.getElementById("banner");
  banner.classList.remove("hidden", "unsaved", "saved", "error");
  if (kind) banner.classList.add(kind);
  banner.textContent = text || "";
}

function updateBanner() {
  const save = document.getElementById("btn-save");
  save.disabled = !state.dirty;
  if (state.dirty) setBanner("unsaved", "Unsaved changes — click Save to write them to content.js.");
}

function markDirty() {
  state.dirty = true;
  updateBanner();
}

async function saveAll() {
  const saveBtn = document.getElementById("btn-save");
  saveBtn.disabled = true;
  try {
    const res = await fetch("/editor/api/editor/save", {
      method: "POST",
      headers: apiHeaders(),
      body: JSON.stringify({ data: state.data }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      setBanner("error", "Save failed: " + (json.error || "Unknown error"));
      saveBtn.disabled = false;
      return;
    }
    state.dirty = false;
    setBanner("saved", "Saved to content.js. " + (json.note || ""));
    saveBtn.disabled = true;
  } catch (e) {
    setBanner("error", "Save failed: " + e.message);
    saveBtn.disabled = false;
  }
}

function discard() {
  if (state.dirty && !window.confirm("Discard all unsaved changes and reload?")) return;
  location.reload();
}

/* ---------- rendering ---------- */

function renderAll() {
  renderSidebar();
  renderPage();
  updateBanner();
}

function renderSidebar() {
  const nav = document.getElementById("sidebar");
  nav.replaceChildren(el("h3", {}, "Content"));
  for (const p of state.defs) {
    nav.appendChild(
      el("button", {
        class: "nav-btn" + (p.id === state.pageId ? " active" : ""),
        onclick: () => {
          state.pageId = p.id;
          renderAll();
        },
      }, p.label)
    );
  }
}

function renderPage() {
  const page = state.defs.find((p) => p.id === state.pageId) || state.defs[0];
  const main = document.getElementById("content");
  if (!page) {
    main.replaceChildren(el("div", { class: "empty-note" }, "No content pages."));
    return;
  }
  let body;
  if (page.kind === "collection") body = renderCollection(page);
  else if (page.kind === "form") body = renderForm(page);
  else if (page.kind === "loot") body = renderLoot(page);
  else if (page.kind === "anomalies") body = renderAnomalies(page);
  else if (page.kind === "story") body = renderStory(page);
  else body = el("div", { class: "empty-note" }, "Unknown page kind: " + page.kind);

  main.replaceChildren(
    el("div", { class: "page-head" }, el("h2", {}, page.label)),
    body
  );
}

/* ---------- collections ---------- */

function renderCollection(page) {
  const items = getPath(state.data, page.path) || [];
  const list = el("div", { class: "entry-list" });
  for (const item of items) {
    const label = formatItemLabel(page.itemLabelTemplate, item) || "(unnamed)";
    list.appendChild(
      el("div", { class: "entry-row" },
        el("div", { class: "label" }, esc(label)),
        el("div", { class: "actions" },
          mkButton("Edit", "mini", () => openEntryEditor(item, page)),
          mkButton("Delete", "mini danger", () => deleteEntry(page, item))
        )
      )
    );
  }
  if (!items.length) list.appendChild(el("div", { class: "empty-note" }, "No entries yet."));

  const copySelect = el("select", {}, el("option", { value: "" }, "Blank new entry"));
  items.forEach((item, i) => {
    copySelect.appendChild(
      el("option", { value: String(i) }, "Copy of: " + (formatItemLabel(page.itemLabelTemplate, item) || "item " + i))
    );
  });
  const addBar = el("div", { class: "add-bar" },
    copySelect,
    mkButton("Add", "primary", () => addEntry(page, copySelect.value))
  );
  return el("div", {}, list, addBar);
}

function uniqueId(page, items) {
  const existing = items.map((i) => i && i[page.idField]);
  const allNumeric = existing.every((v) => v === undefined || v === null ||
    typeof v === "number" || (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))));
  if (allNumeric && existing.length) {
    let max = 0;
    for (const v of existing) {
      const n = Number(v);
      if (Number.isFinite(n) && n > max) max = n;
    }
    return max + 1;
  }
  const base = (page.idField || "id").replace(/[^a-z0-9_]/gi, "").toLowerCase() || "item";
  let n = existing.length + 1;
  const set = new Set(existing);
  let id = base + "_" + n;
  while (set.has(id)) { n++; id = base + "_" + n; }
  return id;
}

function makeNewEntry(page, copyOf) {
  if (!copyOf) return {};
  const clone = deepClone(copyOf);
  if (Array.isArray(page.newStrips)) {
    for (const k of page.newStrips) delete clone[k];
  }
  if (page.nameField && clone[page.nameField] != null) {
    clone[page.nameField] = clone[page.nameField] + " II";
  }
  return clone;
}

function addEntry(page, copyIndex) {
  const items = getPath(state.data, page.path);
  const base = makeNewEntry(page, copyIndex === "" ? null : items[Number(copyIndex)]);
  base[page.idField] = uniqueId(page, items);
  if (page.nameField && base[page.nameField] === undefined) {
    base[page.nameField] = "New " + page.label.replace(/s$/, "") + " " + base[page.idField];
  }
  items.push(base);
  markDirty();
  renderPage();
}

function deleteEntry(page, item) {
  const label = formatItemLabel(page.itemLabelTemplate, item) || "(unnamed)";
  if (!window.confirm('Delete "' + label + '"? This cannot be undone until you Discard.')) return;
  const items = getPath(state.data, page.path);
  const idx = items.indexOf(item);
  if (idx !== -1) items.splice(idx, 1);
  markDirty();
  renderPage();
}

function openEntryEditor(entry, page) {
  const snapshot = deepClone(entry);
  const fieldsBox = el("div", {});
  for (const field of page.fields) fieldsBox.appendChild(renderField(entry, field));

  MODAL_ROOT.replaceChildren(
    el("div", { class: "modal-overlay" },
      el("div", { class: "modal" },
        el("h3", {}, "Edit " + (formatItemLabel(page.itemLabelTemplate, entry) || page.idLabel || "entry")),
        fieldsBox,
        el("div", { class: "modal-actions" },
          mkButton("Cancel", "ghost", () => {
            for (const k of Object.keys(entry)) delete entry[k];
            Object.assign(entry, deepClone(snapshot));
            closeModal();
            renderPage();
          }),
          mkButton("Done", "primary", () => {
            const items = getPath(state.data, page.path);
            const id = entry[page.idField];
            if (page.idField && id != null && id !== "") {
              const clash = items.find((x) => x !== entry && x[page.idField] === id);
              if (clash) {
                window.alert('That ' + (page.idLabel || "id") + ' is already in use: "' + id + '". Pick a different one.');
                return;
              }
            }
            closeModal();
            markDirty();
            renderPage();
          })
        )
      )
    )
  );
}

/* ---------- fields ---------- */

function renderField(dataObj, field) {
  const accessor = field.key || field.path;
  const wrap = el("div", { class: "field" });
  let control;

  const mark = () => markDirty();

  switch (field.type) {
    case "string": {
      const input = el("input", { type: "text", value: getPath(dataObj, accessor) ?? "" });
      input.addEventListener("change", () => { setPath(dataObj, accessor, input.value); mark(); });
      control = input;
      break;
    }
    case "number": {
      const input = el("input", { type: "number", value: getPath(dataObj, accessor) ?? "" });
      input.addEventListener("change", () => {
        const n = parseFloat(input.value);
        setPath(dataObj, accessor, Number.isFinite(n) ? n : 0);
        mark();
      });
      control = input;
      break;
    }
    case "percent": {
      const input = el("input", { type: "number", step: "0.01", min: "0", max: "1", value: fmtPct(getPath(dataObj, accessor)) });
      input.addEventListener("change", () => {
        const n = parseFloat(input.value);
        setPath(dataObj, accessor, Number.isFinite(n) ? n / 100 : 0);
        mark();
      });
      control = input;
      break;
    }
    case "array": {
      const input = el("input", { type: "text", value: (getPath(dataObj, accessor) || []).join(", ") });
      input.addEventListener("change", () => {
        setPath(dataObj, accessor, input.value.split(",").map((s) => s.trim()).filter(Boolean));
        mark();
      });
      control = input;
      break;
    }
    case "choice": {
      const current = getPath(dataObj, accessor);
      const sel = el("select", {},
        ...(field.options || []).map((o) =>
          el("option", { value: String(o), selected: String(o) === String(current) }, esc(o))
        )
      );
      sel.addEventListener("change", () => { setPath(dataObj, accessor, sel.value); mark(); });
      control = sel;
      break;
    }
    case "bool": {
      const cb = el("input", { type: "checkbox", checked: !!getPath(dataObj, accessor) });
      cb.addEventListener("change", () => { setPath(dataObj, accessor, cb.checked); mark(); });
      control = el("div", { class: "check-row" }, cb);
      break;
    }
    case "statmap": {
      const value = getPath(dataObj, accessor);
      const target = {};
      if (value && typeof value === "object") for (const k of Object.keys(value)) target[k] = value[k];
      const box = el("div", {});
      box.appendChild(renderStatMap(target, field.statKeys || [], () => {
        setPath(dataObj, accessor, target);
        mark();
      }));
      control = box;
      break;
    }
    default:
      control = el("div", { class: "empty-note" }, "Unknown field type: " + field.type);
  }

  wrap.appendChild(el("label", {}, el("b", {}, esc(field.label))));
  wrap.appendChild(control);
  return wrap;
}

function renderStatMap(target, statKeys, onChange) {
  const box = el("div", {});
  const draw = () => {
    box.replaceChildren();
    for (const stat of Object.keys(target)) {
      const row = el("div", { class: "statmap-row" });
      const sel = el("select", {},
        ...statKeys.map((s) => el("option", { value: s, selected: s === stat }, esc(statLabel(s))))
      );
      sel.addEventListener("change", () => {
        if (sel.value === stat) return;
        const v = target[stat];
        delete target[stat];
        target[sel.value] = v;
        onChange();
        draw();
      });
      const num = el("input", { type: "number", value: String(target[stat]) });
      num.addEventListener("change", () => {
        const n = parseFloat(num.value);
        target[stat] = Number.isFinite(n) ? n : 0;
        onChange();
      });
      row.appendChild(sel);
      row.appendChild(num);
      row.appendChild(mkButton("Remove", "mini danger", () => { delete target[stat]; onChange(); draw(); }));
      box.appendChild(row);
    }
    const add = el("div", { class: "statmap-row" });
    const addSel = el("select", {},
      ...statKeys.filter((s) => !(s in target)).map((s) => el("option", { value: s }, esc(statLabel(s))))
    );
    add.appendChild(addSel);
    add.appendChild(mkButton("Add", "mini", () => {
      if (!addSel.value) return;
      target[addSel.value] = 0;
      onChange();
      draw();
    }));
    box.appendChild(add);
  };
  draw();
  return box;
}

/* ---------- form / loot / anomalies / story ---------- */

function renderForm(page) {
  const box = el("div", {});
  for (const field of page.fields) box.appendChild(renderField(state.data, field));
  return box;
}

function renderLoot(page) {
  const rarities = page.rarities || [];
  const grades = page.grades || [];
  const dropChance = getPath(state.data, page.dropChancePath) || {};
  const gradeWeights = getPath(state.data, page.gradeWeightsPath) || {};
  const buyable = getPath(state.data, page.buyablePath) || [];

  const out = el("div", {});

  out.appendChild(el("h3", {}, "Drop chance (per monster rarity)"));
  const dcTable = el("table", { class: "mini-table" });
  dcTable.appendChild(el("thead", {}, el("tr", {}, el("th", {}, "Monster rarity"), el("th", {}, "Chance (%)"))));
  const dcBody = el("tbody", {});
  for (const r of rarities) {
    const row = el("tr", {});
    const input = el("input", { type: "number", step: "0.01", min: "0", max: "1", value: fmtPct(dropChance[r]) });
    input.addEventListener("change", () => {
      const n = parseFloat(input.value);
      dropChance[r] = Number.isFinite(n) ? n / 100 : 0;
      markDirty();
    });
    row.appendChild(el("td", {}, esc(r)));
    row.appendChild(el("td", {}, input));
    dcBody.appendChild(row);
  }
  dcTable.appendChild(dcBody);
  out.appendChild(dcTable);

  out.appendChild(el("h3", {}, "Grade weights (dungeon grade → item rarity)"));
  const gw = el("table", { class: "mini-table" });
  gw.appendChild(el("thead", {}, el("tr", {}, el("th", {}, "Grade"), ...rarities.map((r) => el("th", {}, esc(r))))));
  const gwBody = el("tbody", {});
  for (const g of grades) {
    const row = el("tr", {});
    row.appendChild(el("td", {}, esc(g)));
    for (const r of rarities) {
      const w = (gradeWeights[g] || {})[r];
      const input = el("input", { type: "number", value: w == null ? "" : String(w) });
      input.addEventListener("change", () => {
        if (!gradeWeights[g]) gradeWeights[g] = {};
        const n = parseFloat(input.value);
        gradeWeights[g][r] = Number.isFinite(n) ? n : 0;
        markDirty();
      });
      row.appendChild(el("td", {}, input));
    }
    gwBody.appendChild(row);
  }
  gw.appendChild(gwBody);
  out.appendChild(gw);

  out.appendChild(el("h3", {}, "Sold in the shop / blacksmith"));
  for (const r of rarities) {
    const cb = el("input", { type: "checkbox", checked: buyable.indexOf(r) !== -1 });
    cb.addEventListener("change", () => {
      const idx = buyable.indexOf(r);
      if (cb.checked && idx === -1) buyable.push(r);
      if (!cb.checked && idx !== -1) buyable.splice(idx, 1);
      markDirty();
    });
    out.appendChild(el("div", { class: "check-row" }, cb, el("label", {}, esc(r))));
  }

  return out;
}

function renderAnomalies(page) {
  const box = el("div", {});
  for (const field of page.fields) box.appendChild(renderField(state.data, field));

  box.appendChild(el("h3", {}, page.traits.label));
  const items = getPath(state.data, page.traits.path) || [];
  const list = el("div", { class: "entry-list" });
  for (const item of items) {
    list.appendChild(
      el("div", { class: "entry-row" },
        el("div", { class: "label" }, esc(formatItemLabel(page.traits.itemLabelTemplate, item) || "(unnamed)")),
        el("div", { class: "actions" },
          mkButton("Edit", "mini", () => openEntryEditor(item, page.traits)),
          mkButton("Delete", "mini danger", () => deleteEntry(page.traits, item))
        )
      )
    );
  }
  if (!items.length) list.appendChild(el("div", { class: "empty-note" }, "No traits yet."));

  const copySelect = el("select", {}, el("option", { value: "" }, "Blank new trait"));
  items.forEach((item, i) => {
    copySelect.appendChild(
      el("option", { value: String(i) }, "Copy of: " + (formatItemLabel(page.traits.itemLabelTemplate, item) || "trait " + i))
    );
  });
  const addBar = el("div", { class: "add-bar" },
    copySelect,
    mkButton("Add", "primary", () => addEntry(page.traits, copySelect.value))
  );
  box.appendChild(list);
  box.appendChild(addBar);
  return box;
}

function renderStory(page) {
  const title = getPath(state.data, page.titlePath) || "";
  const paragraphs = getPath(state.data, page.paragraphsPath) || [];
  const cta = getPath(state.data, page.ctaPath) || "";

  const titleInput = el("input", { type: "text", value: title });
  titleInput.addEventListener("change", () => { setPath(state.data, page.titlePath, titleInput.value); markDirty(); });

  const paraArea = el("textarea", { class: "textarea" });
  paraArea.value = paragraphs.join("\n");
  paraArea.addEventListener("change", () => {
    setPath(state.data, page.paragraphsPath, paraArea.value.split("\n").map((s) => s.trim()).filter(Boolean));
    markDirty();
  });

  const ctaInput = el("input", { type: "text", value: cta });
  ctaInput.addEventListener("change", () => { setPath(state.data, page.ctaPath, ctaInput.value); markDirty(); });

  return el("div", {},
    el("div", { class: "field" }, el("label", {}, el("b", {}, "Title")), titleInput),
    el("div", { class: "field" }, el("label", {}, el("b", {}, "Paragraphs")), el("div", { class: "sub" }, "One paragraph per line."), paraArea),
    el("div", { class: "field" }, el("label", {}, el("b", {}, "Button text")), ctaInput)
  );
}

/* ---------- boot ---------- */

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-save").addEventListener("click", saveAll);
  document.getElementById("btn-discard").addEventListener("click", discard);
  init();
});
