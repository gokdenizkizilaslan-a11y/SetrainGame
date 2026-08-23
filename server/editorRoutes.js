// Web content editor routes. The UI lives in public/editor/ and edits content.js.
//
// Safety: on your own machine (localhost) the editor is open. Anywhere else it is
// locked unless you set the CONTENT_EDIT_TOKEN environment variable and use that
// token (as `?token=...` or the `x-edit-token` header). Without a token the editor
// works only locally, so the deployed game cannot be tampered with remotely.
"use strict";

const express = require("express");
const path = require("path");

const { CONTENT } = require("../content.js");
const { writeContent } = require("../editor-save.js");
const defs = require("../editor-defs.js");

const router = express.Router();

// The editor keeps its own working copy of the content data so the page stays in
// sync after a save, without touching the game's live in-memory copy (which only
// updates on a server restart).
let editorData = CONTENT;

function isLocal(req) {
  const host = (req.headers.host || "").split(":")[0].toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "0.0.0.0";
}

function auth(req, res, next) {
  const token = process.env.CONTENT_EDIT_TOKEN;
  if (!token) {
    if (isLocal(req)) return next();
    return res
      .status(403)
      .json({ error: "The content editor is locked on the live site. Set the CONTENT_EDIT_TOKEN environment variable and visit /editor?token=YOURTOKEN to enable it." });
  }
  const provided = req.query.token || req.headers["x-edit-token"];
  if (provided === token) return next();
  return res.status(401).json({ error: "Invalid editor token." });
}

function resolveDefs(data) {
  const resolveField = (f) => {
    const out = { ...f };
    if (out.options !== undefined) {
      out.options = typeof out.options === "function" ? out.options(data) : out.options;
    }
    delete out.if; // client renders every field; predicates are terminal-only
    return out;
  };
  const resolveCollection = (c) => ({
    id: c.id,
    label: c.label,
    kind: "collection",
    path: c.path,
    idField: c.idField,
    idLabel: c.idLabel,
    nameField: c.nameField,
    nameLabel: c.nameLabel,
    itemLabelTemplate: c.itemLabelTemplate,
    newStrips: c.newStrips,
    fields: c.fields.map(resolveField),
  });

  return defs.pages.map((p) => {
    if (p.kind === "collection") return resolveCollection(p);
    if (p.kind === "form") return { id: p.id, label: p.label, kind: "form", fields: p.fields.map(resolveField) };
    if (p.kind === "loot") {
      return {
        id: p.id,
        label: p.label,
        kind: "loot",
        dropChancePath: p.dropChancePath,
        gradeWeightsPath: p.gradeWeightsPath,
        buyablePath: p.buyablePath,
        rarities: data.loot.rarityOrder,
        grades: Object.keys(data.loot.gradeWeights),
      };
    }
    if (p.kind === "anomalies") {
      return {
        id: p.id,
        label: p.label,
        kind: "anomalies",
        fields: p.fields.map(resolveField),
        traits: resolveCollection(p.traits),
      };
    }
    if (p.kind === "story") {
      return {
        id: p.id,
        label: p.label,
        kind: "story",
        titlePath: p.titlePath,
        paragraphsPath: p.paragraphsPath,
        ctaPath: p.ctaPath,
      };
    }
    return p;
  });
}

router.use(express.static(path.join(__dirname, "..", "public", "editor")));

router.get("/api/editor", auth, (req, res) => {
  res.json({ defs: resolveDefs(editorData), data: editorData });
});

router.post("/api/editor/save", auth, (req, res) => {
  const data = req.body && req.body.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return res.status(400).json({ ok: false, error: "Expected a JSON body of the form { data: { ... } }." });
  }
  try {
    const result = writeContent(data, { backup: true });
    editorData = data;
    res.json({
      ok: true,
      backup: result.backup,
      note: "Saved to content.js. Restart the server (Ctrl+C, then npm start) for the game to use it.",
    });
  } catch (e) {
    res.status(400).json({ ok: false, error: String(e.message).slice(0, 1200) });
  }
});

module.exports = router;
