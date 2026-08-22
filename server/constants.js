const { CONTENT } = require("../content");

const CLASSES = CONTENT.classes;
const CLASS_SLUGS = CLASSES.map((c) => c.slug);
const MAX_PLAYERS_MULTIPLAYER = CONTENT.maxPlayersMultiplayer;
const MAX_PLAYERS_SINGLEPLAYER = CONTENT.maxPlayersSingleplayer;
const STARTING = CONTENT.starting;
const NAME_MIN = CONTENT.nameMin;
const NAME_MAX = CONTENT.nameMax;
const ROOM_CODE_LENGTH = CONTENT.roomCodeLength;
const ROOM_CODE_CHARS = CONTENT.roomCodeChars;

module.exports = {
  CLASSES,
  CLASS_SLUGS,
  MAX_PLAYERS_MULTIPLAYER,
  MAX_PLAYERS_SINGLEPLAYER,
  STARTING,
  NAME_MIN,
  NAME_MAX,
  ROOM_CODE_LENGTH,
  ROOM_CODE_CHARS,
};
