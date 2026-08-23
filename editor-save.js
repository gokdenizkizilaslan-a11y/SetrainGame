// Shared logic to write content.js safely. Used by both the terminal editor
// (edit-content.js) and the web editor (/editor). Always validates the new file
// before replacing the real one, and backs up the previous version first.
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const CONTENT_FILE = path.join(__dirname, "content.js");

function buildContentFile(data) {
  const src = fs.readFileSync(CONTENT_FILE, "utf8");
  const objStart = src.indexOf("const CONTENT =");
  if (objStart === -1) throw new Error("Could not find the CONTENT block in content.js.");
  const fnIdx = src.indexOf("\nfunction getClass");
  if (fnIdx === -1) throw new Error("Could not find the end of the CONTENT block.");
  const closeIdx = src.lastIndexOf("};", fnIdx);
  if (closeIdx === -1) throw new Error("Could not find the end of the CONTENT block.");
  const head = src.slice(0, objStart);
  const tail = src.slice(closeIdx + 2);
  return head + "const CONTENT = " + JSON.stringify(data, null, 2) + ";" + tail;
}

function validateContentJs(content) {
  const tmp = path.join(os.tmpdir(), `setra-content-check-${Date.now()}-${Math.floor(Math.random() * 1e6)}.js`);
  fs.writeFileSync(tmp, content, "utf8");
  const res = spawnSync(process.execPath, ["-e", "require(process.argv[1])", tmp], { encoding: "utf8" });
  fs.unlinkSync(tmp);
  if (res.status !== 0) {
    throw new Error((res.stderr || res.stdout || "Validation failed.").trim().slice(0, 1200));
  }
}

// Returns { ok: true, backup?: <name> } or throws on validation failure.
function writeContent(data, opts = {}) {
  const content = buildContentFile(data);
  validateContentJs(content);
  let backupName = null;
  if (opts.backup !== false) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    backupName = `content.backup-${stamp}.js`;
    fs.copyFileSync(CONTENT_FILE, path.join(__dirname, backupName));
  }
  fs.writeFileSync(CONTENT_FILE, content, "utf8");
  return { ok: true, backup: backupName };
}

module.exports = { CONTENT_FILE, buildContentFile, validateContentJs, writeContent };
