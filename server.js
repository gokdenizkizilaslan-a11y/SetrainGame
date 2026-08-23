const fs = require("fs");
const http = require("http");
const path = require("path");
const express = require("express");
const { Server } = require("socket.io");
const { registerSocketHandlers } = require("./server/socketHandlers");
const editorRoutes = require("./server/editorRoutes");

const PORT = process.env.PORT || 3000;
const MUSIC_DIR = path.join(__dirname, "public", "music");
const SOUND_DIR = path.join(__dirname, "public", "sounds");
const AUDIO_EXT = [".mp3", ".ogg", ".wav", ".m4a", ".flac"];

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/editor", editorRoutes);

app.get("/api/music", (req, res) => {
  let tracks = [];
  try {
    tracks = fs
      .readdirSync(MUSIC_DIR)
      .filter((f) => AUDIO_EXT.includes(path.extname(f).toLowerCase()))
      .sort();
  } catch (e) {
    // music folder may not exist yet
  }
  res.json({ tracks });
});

app.get("/api/sounds", (req, res) => {
  let sounds = [];
  try {
    sounds = fs
      .readdirSync(SOUND_DIR)
      .filter((f) => AUDIO_EXT.includes(path.extname(f).toLowerCase()))
      .sort()
      .map((f) => ({
        id: path.basename(f, path.extname(f)),
        url: "/sounds/" + f,
      }));
  } catch (e) {
    // sounds folder may not exist yet
  }
  res.json({ sounds });
});

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

registerSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`The Setra Game listening on port ${PORT}`);
});
