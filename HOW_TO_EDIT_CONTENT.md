# How to add or change content

**Easiest way: the web editor.** With the server running, open **http://localhost:3000/editor** in a browser. You get clickable forms for Classes, Monsters, Items & Shop, Skills, Dungeons, Loot & Drop Rates, Combat, Starting values, Anomalies and Story text — no terminal needed. Changes apply to `content.js` when you press **Save to content.js** (each save makes a backup first). Restart the server (`npm start`) afterwards.

Two other ways to edit:

- **Terminal editor:** run `npm run edit` for guided menus (same content, older interface).
- **By hand:** open `content.js` directly. Everything below documents the fields.

**Where is the editor allowed?** On your own computer (`localhost`) it is always open. On the published site it is **locked** so nobody else can tamper with the game. To enable it remotely, set a password on the server:

```
set CONTENT_EDIT_TOKEN=YourPassword
npm start
```

then visit `https://your-game.onrender.com/editor?token=YourPassword`.

Drag picture files into `public/images/...`. If a file is missing, the game still runs with a colored fallback.

Drag picture files into `public/images/...`. If a file is missing, the game still runs with a colored fallback.

## Change a class (HP, attack, mana, resistance, magic power)

Open `content.js` → `classes`. Find the class (`warrior`, `mage`, …). The setup screen shows the **8 base classes**: Warrior, Ranger, Mage, Rogue, Paladin, Assassin, Tank, Support Mage — each of which evolves into stronger forms at levels 20 and 40 (see the Class evolution section). The `content.js` roster also contains those evolved classes (marked with `baseClass`), which never appear on the setup screen.

- `hp.min` / `hp.max` — rolled once at character create (level 1). Tank example: 650–750.
- Same for `attack`, `mana`, `resistance`, `magicPower`, `healPower`.
- `healPower` — boosts **ally-targeted skill healing only** (food, potions, and lifesteal are unaffected). Formula: `multiplier = 1 + healPower / 40`. So `10` → +25% healing, `20` → +50%. Support classes (Paladin, Support Mage) start around 8–15.
- `growth` — added **each time they level up** (not on create).
- `speed` — used later in combat (fastest players act first).
- `image` — path after you drop a PNG, e.g. `public/images/characters/tank.png`.

## Add a new class (easy way)

Run `npm run edit` → **Classes** → **Add new…** (or in the web editor: **Classes** → **Add**, pick an existing class to copy from), then edit its fields. It appears on the setup screen automatically once you restart.

Or add a class by hand:

1. Copy an existing class object in `classes`.
2. Change `slug` (lowercase, no spaces), `label`, ranges, `growth`, `image`, `basicAttack`, `startingSkills`.
3. Drop art at `public/images/characters/<slug>.png`.
4. Restart. It appears on the setup screen automatically.

## Change starting gold, wood, lives, stamina

`starting` at the top of `content.js`.

## XP and max level

`leveling`:

- `maxLevel` (default 50)
- `xpBase` (default 500) — XP from level 1 → 2 is exactly this when exponent math is `500 * 1^exp`
- `xpExponent` (default 1.45) — higher = steeper curve at high levels

Formula used by the server:

`xp needed to go from level L to L+1` = `round(xpBase * L ^ xpExponent)`

Most XP will come from dungeon clears later. You can set `town.search.xp` if you want Search to grant a little XP now (default 0).

## Anomalies (traits)

`anomalies.anomalyChance` — chance of a **normal** trait (default `0.06` = 6%).  
`anomalies.pureBloodChance` — chance of a **pure-blood** trait (default `0.02` = 2%).

Examples: `0.04` and `0.005` for 4% / 0.5%.

Roll order: pure-blood first, else normal, else none.

To add a trait, push an object onto `anomalies.traits`:

- `id` — unique, lowercase
- `name`, `description`
- `pureBlood` — `true` only for the rare version
- `rarity` — `uncommon` | `rare` | `pureblood` (or your own label)
- `frameColor` — portrait border, e.g. `"#c45c6a"`
- `effect` — stored on the character; combat will use it later (`lifesteal`, etc.)

Sanguine Thirst (`lifesteal` 10%) and Primeval Bloodlust (`lifesteal` 20%) are already listed.

## Town costs and Search loot

`town.search.stamina` and `outcomes` (gold/wood ranges, `food` range, text, `weight`). An outcome with `food: [1, 2]` grants 1–2 food when you hit it. **Search never costs HP** — the combat health bar belongs to dungeon fights only; your real lives are the hearts.

`town.blacksmith` — just `stamina` (how many shops can visit in a day).  
`town.tavern.bets` — allowed gold bets.  
`town.tavern.provisions` — `foodPrice` (gold) and `foodAmount` for buying Field Rations at the Tavern.  
`town.rest.stamina` — stamina gained by pressing **Rest** (default `6`), capped at your max. Pressing Rest doesn't end your day — it's for waiting players to top up while others dawdle.

## Sleep vs Rest

To pass the day in multiplayer, **everyone presses Sleep** (it ends your day — stamina drops to 0 and returns at dawn). If someone is slow, waiting players can press **Rest** any number of times to gain `town.rest.stamina` stamina (capped at max) and keep doing town actions. Once you've pressed Sleep you can no longer Rest or act, until the day turns.

## Dungeons

`dungeons` array: `rank`, `label`, `image`, `stamina`, `xpReward` (for later combat), `goldScale` / `woodScale`, `loot` percents (Legendary / Epic / Mythic / Remnant). F-rank stays the weakest.

Add a rank by copying a row and dropping art in `public/images/dungeons/`.

## Skills and the 6-slot combat bar

Every character fights with a **3-column × 2-row grid of 6 skill slots** in combat:

- **Slot 1** is always the class **basic attack** (free, no mana, targets an enemy). It's set per class: `basicAttack: { id: "slash", name: "Slash", power: 1.0, image: "/images/skills/slash.png", description: "Deals 1× attack damage." }`. Change it to give a class a different signature move.
- **Slots 2–6** are the class's unlocked skills (`startingSkills` — a list of skill **ids**, up to 5). Every class starts with **2** — so the whole bar is **basic attack + 2 skills = 3 filled slots**, and 3 empty placeholders. A player with no skills sees empty placeholder slots only.
- **Hover a filled slot in battle** to see a tooltip with its name, what it does, and its scale (e.g. "Deals 1.6× attack damage." or "Deals 2× attack damage and heals for half the damage dealt."). That text comes from each skill's `description`.

**Each skill can be used once per turn** — including the basic attack. After you use it, the slot greys out until that character's turn comes around again (the used state resets when your next turn starts).

A class example (each class has its own starting skills):

```js
{
  slug: "warrior",
  label: "Warrior",
  basicAttack: { id: "slash", name: "Slash", power: 1.0, image: "/images/skills/slash.png", description: "Deals 1× attack damage." },
  startingSkills: ["heavy_strike", "defend"],
  ...
}
```

A skill row in the `skills` array has:

- `id`, `name`, `image`, `description` (shown in the hover tooltip)
- `target` — `enemy` (pick a monster), `ally` (pick a teammate, yourself included), `self` (no target pick), or `party` (every living member, yourself included — no target pick)
- `mana` — cost to use
- `power` — damage multiplier: `attack × power` (with a ±`combat.damageVariance` roll)
- `lifesteal` — optional; heals you for this fraction of the damage dealt (e.g. `0.5` = heal half the damage). Combined with `power` for "deals 2× and heals half".
- `healSelfPct` — for `enemy`-target skills that heal the **caster**: fraction of your own `maxHp` restored when the skill lands (e.g. `0.4` = 40%). No target pick for yourself.
- `heal` — fraction of the target's `maxHp` restored (e.g. `0.35` = 35%). With `target: "party"` this heals **every** living member.
- `manaRestore` / `manaRestorePct` — optional mana refunded to the caster (flat, or a fraction of max mana). With `target: "party"` it restores **every** living member, capped at their max. Example: `spirit_surge` restores 30% of each ally's max mana.
- `defense` — fraction of incoming monster damage blocked for the round (e.g. `0.5` = 50%)
- `element` — optional damage type that changes the hit animation, damage-number color, and sound: `physical` (default), `arcane`, `holy`, `shadow`. Arcane wobbles the target, holy pulses it, shadow jitters it. Class basic attacks and monsters can also carry `element`.

Add a new skill by pushing a row onto `skills` (give it a `description`), then adding its `id` to a class's `startingSkills`.

Add a new skill by pushing a row onto `skills` (give it a `description`), then adding its `id` to a class's `startingSkills`.

## Monsters

The roster is **30 monsters**, each with an `id`, `name`, `hp`, `attack`, `speed`, `image`, and a `rarity` (`common` → `mythic`). Optional `element` sets the damage type of its attacks (see Skills section) — otherwise it defaults to `physical`. Dungeon waves pull monster ids from each dungeon's `monsterPool`; bigger dungeons scale a monster's HP and attack up (see below).

**Rarity drives loot:** a monster's `rarity` sets how likely it is to drop a loot item at all (see the Loot section). Common monsters barely drop anything; rare ones drop more often. Golem is `rare` and appears even in the F-rank pool so you can find its **Heart of Golem** early.

Examples: common (slime, goblin, giant_rat, …), uncommon (skeleton, orc, griffin, …), rare (golem, stone_warden, wraith, …), epic+ (wyvern, lich, hydra, ancient_golem).

## Dungeon sizes

`dungeonSizes` in `content.js` — Small / Normal / Big / Huge. Each has:

- `stamina` — stamina each party member pays to start a delve of this size (currently **3 for every size** — flat cost, change any row to change it)
- `count` — wave-size multiplier for ranks with `sizeProfile: "more"` (bigger = more monsters)
- `fewerCount` — wave-size multiplier for ranks with `sizeProfile: "fewerStronger"` (bigger = **fewer** monsters)
- `power` — monster HP/attack multiplier for this size
- `goldScale` / `woodScale` / `xpScale` — reward multipliers

## Dungeons: rewards and waves

Each row in `dungeons` controls its own fight:

- `goldBase` / `woodBase` — base reward for a Normal-size delve (× size `goldScale`/`woodScale`, split among the party)
- `xpReward` — base XP per delve (× size `xpScale`, split among the party)
- `monsterPool` — list of monster ids that may appear in the wave
- `monsterCount` — base number of foes; scaled by the size `count`/`fewerCount`
- `monsterPower` — HP/attack multiplier that grows with rank (SS+ hits much harder)
- `sizeProfile` — `"more"` for F–A (bigger = more monsters) or `"fewerStronger"` for S/SS/SS+ (bigger = fewer but stronger foes)

Example: `SS+` `huge` uses `monsterCount 5 × fewerCount 0.5 = ~3` monsters, each with `monsterPower 5.5 × size.power 1.3 ≈ 7×` base HP/attack — few, terrifying foes.

## Combat tuning

`combat` in `content.js`:

- `damageVariance` — ±random spread on every damage roll (`0.2` = ±20%)
- `resistanceMitigation` — each point of a player's `resistance` reduces incoming monster damage (`0.25` means 25% of resistance is subtracted)
- `manaRegenPerRound` — **base** mana restored to each party member after every round. The real per-player value is this base **plus** class `manaRegen` plus item `stats.manaRegen` plus any `manaRegenBonus` trait (see the Mana section). Default `3`.
- `monsterAttackDelayMs` — pause between **each monster's** attack when the monsters take their turn (default `900`). Monsters now act **one by one** with the HP bars ticking down between attacks, instead of all at once.
- `turnTimeoutMs` — **server** safety timeout (ms). If the active player stalls (client died), the server auto-ends their turn after this. The **client** shows a 10-second bar during your turn; keep this server value above 10,000 so it only catches real stalls.
- `critChance` — chance any hit (player or monster) lands a critical hit (default `0.12` = 12%). Set to `0` to disable crits.
- `critMult` — damage multiplier on a critical hit (default `1.6`). Crits flash a bigger "CRIT!" number, play a crunch, and shake the whole combat view.
- `monsterScale` — global multiplier on monster HP **and** attack (default `5.0`, so monsters are 5× base strength). Applied on top of the dungeon rank/size `power`. Set to `1` for the original difficulty, or `2.5` for the pre-2× tune.

Combat is **turn-based**: the fastest living member acts first, then the rest in speed order. A player may act multiple times per turn (attack, skill, or eat — each one resets their turn bar). When every living player has ended their turn, the monsters act **one at a time** (each attack broadcasts its own hit, `monsterAttackDelayMs` apart), then the round counter ticks up and everyone regains mana for the next round. Downed players are skipped automatically.

## Food

- `food: { healBase, healPct }` in `content.js` — each food eaten in battle heals `round(healBase + healPct × maxHp)`. Default `10` and `0.02`: 10 food ≈ 100 + 20% of max HP.
- Food comes from **Search** (an outcome with `food`) and the **Tavern Provisions** (`town.tavern.provisions`).
- Eating is a combat action on your turn and resets your turn bar.

## Shop items, equipment, and rarities

Every item in the `items` array carries a `rarity` (`common` | `uncommon` | `rare` | `epic` | `legendary` | `mythic` | `ancient_relic`). The color comes from `loot.rarityMeta`. Each item:

```js
{
  id: "leather_helm",
  name: "Leather Helm",
  slot: "head",                       // weapon | head | armor | legs | boots | amulet | ring | consumable | material
  rarity: "common",
  price: { gold: 35, wood: 8 },
  stats: { maxHp: 30, resistance: 4 }, // gear only: attack | maxHp | resistance | mana | magicPower | speed | manaRegen
  heal: 40,                            // consumable only — HP restored when used in combat
  food: 2,                             // consumable only — food granted (bought straight to your food pouch)
  image: "/images/items/leather_helm.png",
  description: "+30 HP, +4 Res",
}
```

**The Blacksmith only sells `common`/`uncommon`/`rare` items** (set `loot.buyable` to change this). Epic, legendary, mythic, and ancient-relic gear is **loot-only** — it only drops from dungeon monsters, never appears in the shop.

- `slot: "material"` items (essences, `golem_heart`, `ancient_relic`) are **crafting/temple materials** — they can drop as loot but can't be equipped and aren't sold by the Blacksmith.
- There are **16 class weapons** (2 per class, e.g. `battle_axe`/`war_hammer` for the Warrior). Any class can equip any weapon; the stat bonuses just feed your `attack`/`magicPower` etc., so they naturally suit the classes whose stats they boost.
- `stats.manaRegen` on an item (e.g. the rare `mana_talisman` amulet) adds to the wearer's per-round mana regen.

Gear you buy goes into your **inventory**; equip it in the Inventory screen. There are **8 equipment slots**: `weapon`, `head`, `armor`, `legs`, `boots`, `amulet`, `ring1`, `ring2` (the labels shown are in `equipmentSlots`). A `slot: "ring"` item can fill either ring1 or ring2. Equipped stats are added to your character and shown on your profile card.

To add an item: push a row onto `items` and drop art in `public/images/items/`. If its rarity is buyable it appears in the shop automatically.

## Victory and defeat

- **Victory** (all monsters dead): gold/wood/XP awarded as above; anyone still at 0 HP loses 1 life and is revived to full.
- **Defeat** (whole party down): every party member loses 1 life and returns to town at full HP.
- `starting.lives` sets how many lives you begin with (default 3 hearts). The only way to restore a lost heart is the Ancient Temple's **Mend Heart** (needs a Heart of Golem).

## Mana

At the **start of every delve** each party member is restored to full HP **and full mana** (`spawnWave`). After each round every living member regains `manaRegen` mana, capped at their max.

A player's `manaRegen` is: **`combat.manaRegenPerRound` (base 3) + class `manaRegen` bonus + item `stats.manaRegen` + any `manaRegenBonus` trait**. Examples:

- `mage` has `manaRegen: 2` on its class object (→ 5 at level 1).
- The rare `mana_talisman` amulet grants `stats: { mana: 20, manaRegen: 1 }`.
- An anomaly trait with `effect: { type: "manaRegenBonus", amount: 1 }` adds 1.
- Evolved classes set a higher `manaRegen` (Archmage 3, Archon 4, High Priest 2, Divine Saint 3) and the difference is applied when you evolve.

Skills can **restore** mana with `manaRestore` (flat) and/or `manaRestorePct` (fraction of max mana). Set `target: "party"` and the heal/mana restore applies to **every living member** (e.g. `spirit_surge`, `resurgence`).

## Loot drops

When a dungeon is won, each **dead monster** independently rolls a drop:

1. Its `rarity` sets the gate: `loot.dropChance[monster.rarity]` is the chance it drops anything (common 20%, ancient relic 75%).
2. If it drops, the dungeon's **grade** (`dungeons[].rank`) picks the item rarity from `loot.gradeWeights` — F is weighted heavily to common; S/SS/SS+ can roll epic/legendary/mythic and even `ancient_relic`.
3. The item is chosen at random from `items` of that rarity (excluding `consumable`), and goes to a random living member's inventory. The result is announced in the victory text and town log.

Tunables, all in `content.js` → `loot`:
- `buyable` — rarities the Blacksmith sells (`["common","uncommon","rare"]`). Everything above is loot-only.
- `rarityOrder` / `rarityMeta` — the seven rarities and their label/color.
- `dropChance` — per-monster-rarity drop odds.
- `gradeWeights` — per dungeon rank, the rarity **weights** for the rolled item. Bigger/more-dangerous ranks skew higher. Set a weight to `0` to forbid a rarity in that rank.

To make a monster drop more: raise its `rarity` (in the `monsters` array) or raise `dropChance` for that rarity. To make a rank drop better gear: raise the epic/legendary/mythic weights in its `gradeWeights` row.

## The Ancient Temple

A town location (action card + overlay) offering three rites, each costing `town.temple.stamina` (default 2):

- **Evolve** — requires level 20+ (or 40+ for the second evolution) and an **Ancient Relic** (`ancient_relic`, loot-only, `slot: "material"`). Consumes the relic, changes your class to the evolved form, grants its new skill, applies its `evolveBonus` stats, and fully heals you.
- **Mend a Heart** — requires a **Heart of Golem** (`golem_heart`, a rare drop — the golem monster appears even in F-rank). Restores one of your `starting.lives` hearts.
- **Craft** — combines materials into gear. Each `temple.recipes` entry lists `inputs` (item + qty), a `cost` (gold/wood), and an `output`. Example: `stone_ash_sword + fire_essence → fire_ash_sword`.

Recipe inputs are the `slot: "material"` items (fire/frost/arcane/shadow essences, `heart_of_fire`, etc.). Outputs are real equippable weapons.

## Class evolution (level 20 and 40)

Every class has **two evolutions**: a stronger mid form at **level 20**, and the **strongest apex form at level 40**. The Ancient Temple performs the transformation (requires the matching level and an Ancient Relic).

Each class object that can evolve carries:

```js
evolution: { level: 20, to: "warlord" },   // base class → mid form at 20
```

and the evolved class carries its own:

```js
{
  slug: "warlord",
  label: "War Lord",
  baseClass: "warrior",                    // marks it as an evolution — hidden from the setup screen
  evolution: { level: 40, to: "war_emperor" }, // mid → apex at 40
  startingSkills: ["war_cry"],             // the evolution skill, granted on evolve
  growth: { hp: 22, attack: 5, mana: 2, resistance: 4, magicPower: 1 }, // per-level after evolving
  evolveBonus: { hp: 60, attack: 8, mana: 10, resistance: 6, magicPower: 3 }, // one-time on evolve
  ...
}
```

Chain: **base @20 → mid → mid @40 → apex**. The apex class has `baseClass` but **no** `evolution` (it's the strongest form). Evolved classes never appear on the character-creation screen, but the temple shows the current class's next form with its level requirement, the skill you'll gain, and the stat bonus.

When you evolve:
- The **Ancient Relic is consumed** and the temple stamina is spent.
- Your `character` becomes the evolved class; the **evolution skill** is added to your skill loadout.
- `evolveBonus` stats are applied **once**, and `manaRegen` adjusts by the class's `manaRegen` difference.
- You're healed to full HP and mana.

Stat notes: evolved classes still list `hp`/`attack`/… ranges, but those are **reference only** — stats are accumulative (rolled once at creation, then `growth` each level), so evolution just adds `evolveBonus` and switches future `growth` to the new class.

## Story intro and day overlay

The `story` block in `content.js` powers the intro screen shown when a game starts:

```js
story: {
  title: "The Setra Game",
  paragraphs: ["…", "…", "…"],
  cta: "Set Forth",
}
```

The `cta` is the button text. When the day changes, a "Day N" overlay appears (you slept through the night, stamina restored). Search, Rest, and Sleep still show their own toasts.

## Images (color placeholders → real art)

Class portraits, monsters, and dungeons render as **colored circles/tiles** (set in `public/style.css` under `.portrait--*`). Drop a PNG/JPG at the path listed in `content.js` and it **automatically replaces the color** — no code change needed.

`images.backgrounds.menu`, `.setup`, `.lobby`, `.town`, `.dungeon`, `.tavern` are reserved for future background art; the UI uses warm parchment gradients for now. `images.ui.panel` is an optional texture for the gold-bordered container.

Suggested folders:

- `public/images/backgrounds/`
- `public/images/ui/`
- `public/images/characters/`
- `public/images/monsters/`
- `public/images/dungeons/`
- `public/images/items/`
- `public/images/skills/`

Set the matching path in `content.js`. PNG or JPG both work.

## Music

Drop audio files (`.mp3`, `.ogg`, `.wav`, `.m4a`, `.flac`) into `public/music/`. The widget in the corner plays them **in filename order, looping back** to the first when the list ends, with a Volume slider and Play/Pause. No audio folder or no files = no widget shown.

## Sound effects and action feedback

Damage/heal/block **pop-ups**, **hit effects** on monsters, and **sound effects** play automatically on every action — no content config needed.

- The **♪ sound button** (top-right of the screen) toggles all sound effects. Your choice is remembered between sessions.
- The **☰ Menu button** (top-left of the screen) leaves the current game and returns to the main menu, so you can start over or pick a different mode.
- Tavern wins/losses and Search results now stay on screen so you can read what happened before they close.
- **Rest** shows a "💤 You slept" toast, and when everyone rests the new day shows a "🌅 Day N dawns" toast.
- Combat hit effects are colored and animated by **damage type** (see `element` under Skills): physical slashes shake sideways, arcane wobbles, holy pulses, shadow jitters — and critical hits shake the whole battle view.

## Effects & sounds (how hits look and sound)

Every combat hit now picks a **recipe** from the `effects` map in `content.js`. The server tags each hit with an effect name, and the client looks up the recipe to animate it. You can add/change/remove effects just by editing `content.js` — no JS changes.

Each recipe has 4 fields:

- `animation` — which shake/wobble the target gets: `hit`, `hit-arcane`, `hit-holy`, `hit-shadow`, `hit-crit`, `heal`, `defend`. (These map to existing CSS classes.)
- `color` — color of the damage number and particles (any CSS color).
- `particles` — a visual burst type: `slash` (diagonal arc), `shatter` (shards fly out), `burst` (radial burst), `orb` (rising sphere), `rays` (golden rays), `pulse` (dark shockwave), `glow` (soft halo), `ring` (expanding ring), `fire`, `frost`.
- `sound` — a filename (without `.mp3`) **or a list** to pick from randomly. Missing files fall back to a synthesized sound automatically.

Example — the sword-slash recipe:

```js
slash: { animation: "hit", color: "#ff7a5c", particles: "slash", sound: ["slash1", "slash2", "slash3", "slash4"] },
```

**Which effect a hit uses:** a skill's `effect` field overrides everything (e.g. `heavy_strike` has `effect: "heavy"`, `cleave` has `effect: "axe"`, the Tank's basic attack `shield_bash` has `effect: "crush"`). Skills without an `effect` tag fall back to their `element` (physical → `slash`, arcane → `arcane`, holy → `holy`, shadow → `shadow`). Monster attacks always use the `monster` recipe. Heals use `heal`, defends use `defend`, crits use `crit`. Crits always shake the whole combat view.

**Adding a new effect:** push a new key onto `effects` (e.g. `lightning: { animation: "hit-arcane", color: "#ffe14d", particles: "burst", sound: ["lightning"] }`), then tag a skill with `effect: "lightning"` (or give it an `element` that maps to it). Restart and it works.

### Where to find sounds

Free, legal sound packs (CC0 / free license — no attribution worries):

- **Kenney.nl** — `impactSounds.rar` and `digitalAudio.rar` are perfect for hits/magic. Drop the files you like into `public/sounds/`.
- **freesound.org** — search "sword slash", "magic spell", "hit". Check each file's license.
- **OpenGameArt.org** — sound effects section, mostly CC0.
- **Pixabay.com** and **Mixkit.co** — free sound effects, no account needed for most.

Name files descriptively — `slash1.mp3`, `slash2.mp3`, `heavy1.mp3`, `firemagic.mp3` — and reference them (without the extension) in an effect's `sound`. Avoid `#`, spaces, or odd characters in filenames (they break URLs). The page lists everything in `public/sounds/` on load; missing files just fall back to a synthesized sound.

## What not to edit for content

You do not need to change `server/` or `public/js/` to add a class, item, or image. Restart after `content.js` changes.
