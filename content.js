/**
 * THE SETRA GAME — all tunable data lives here.
 * Easy editing: run `npm run edit` (node edit-content.js) for a guided editor.
 * Manual editing: see HOW_TO_EDIT_CONTENT.md
 */

const CONTENT = {
  "nameMin": 2,
  "nameMax": 20,
  "maxPlayersMultiplayer": 8,
  "maxPlayersSingleplayer": 1,
  "roomCodeLength": 5,
  "roomCodeChars": "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
  "starting": {
    "lives": 3,
    "wood": 0,
    "gold": 50,
    "stamina": 10,
    "maxStamina": 10
  },
  "leveling": {
    "maxLevel": 50,
    "xpBase": 500,
    "xpExponent": 1.45
  },
  "story": {
    "title": "The Setra Game",
    "paragraphs": [
      "The realm of Setra stirs. Old roads vanish into mist, and the town square hums with whispered tales of the fallen.",
      "Gather what you can, delve the ruins, and grow strong enough to face what waits beyond the hills.",
      "They say the Ancient Temple remembers a purpose older than the kingdom. If you find its relic, it may remember you too."
    ],
    "cta": "Set Forth"
  },
  "food": {
    "healBase": 10,
    "healPct": 0.02
  },
  "anomalies": {
    "anomalyChance": 0.06,
    "pureBloodChance": 0.02,
    "traits": [
      {
        "id": "sanguine_thirst",
        "name": "Sanguine Thirst",
        "pureBlood": false,
        "rarity": "rare",
        "frameColor": "#c45c6a",
        "description": "Heal for 10% of all damage dealt.",
        "effect": {
          "type": "lifesteal",
          "percent": 0.1
        }
      },
      {
        "id": "iron_bark",
        "name": "Iron Bark",
        "pureBlood": false,
        "rarity": "uncommon",
        "frameColor": "#7a9e6a",
        "description": "Gain a little extra resistance.",
        "effect": {
          "type": "resistanceBonus",
          "amount": 8
        }
      },
      {
        "id": "ember_well",
        "name": "Ember Well",
        "pureBlood": false,
        "rarity": "rare",
        "frameColor": "#d4893a",
        "description": "Mana recovers more generously in town rest.",
        "effect": {
          "type": "manaOnDay",
          "amount": 12
        }
      },
      {
        "id": "arcane_reservoir",
        "name": "Arcane Reservoir",
        "pureBlood": false,
        "rarity": "rare",
        "frameColor": "#7a9ec4",
        "description": "Mana regenerates a little faster each round.",
        "effect": {
          "type": "manaRegenBonus",
          "amount": 1
        }
      },
      {
        "id": "primeval_bloodlust",
        "name": "Primeval Bloodlust",
        "pureBlood": true,
        "rarity": "pureblood",
        "frameColor": "#e8c547",
        "description": "Heal for 20% of all damage dealt.",
        "effect": {
          "type": "lifesteal",
          "percent": 0.2
        }
      },
      {
        "id": "first_dawn",
        "name": "First Dawn",
        "pureBlood": true,
        "rarity": "pureblood",
        "frameColor": "#f4e6a8",
        "description": "Start each day with bonus stamina.",
        "effect": {
          "type": "staminaOnDay",
          "amount": 1
        }
      }
    ]
  },
  "classes": [
    {
      "slug": "warrior",
      "label": "Warrior",
      "image": "/images/characters/warrior.png",
      "basicAttack": {
        "id": "slash",
        "name": "Slash",
        "power": 1,
        "element": "physical",
        "image": "/images/skills/slash.png",
        "description": "Deals 1× attack damage."
      },
      "startingSkills": [
        "heavy_strike",
        "defend"
      ],
      "evolution": {
        "level": 20,
        "to": "warlord"
      },
      "speed": 8,
      "hp": {
        "min": 520,
        "max": 600
      },
      "attack": {
        "min": 42,
        "max": 52
      },
      "mana": {
        "min": 20,
        "max": 35
      },
      "resistance": {
        "min": 28,
        "max": 38
      },
      "magicPower": {
        "min": 8,
        "max": 16
      },
      "healPower": {
        "min": 2,
        "max": 6
      },
      "growth": {
        "hp": 18,
        "attack": 4,
        "mana": 1,
        "resistance": 3,
        "magicPower": 1,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "critChance": {
        "min": 8,
        "max": 14
      },
      "critDamage": {
        "min": 40,
        "max": 80
      }
    },
    {
      "slug": "ranger",
      "label": "Ranger",
      "image": "/images/characters/ranger.png",
      "basicAttack": {
        "id": "quick_shot",
        "name": "Quick Shot",
        "power": 0.9,
        "element": "physical",
        "image": "/images/skills/quick_shot.png",
        "description": "Deals 0.9× attack damage."
      },
      "startingSkills": [
        "aimed_shot",
        "piercing_shot"
      ],
      "evolution": {
        "level": 20,
        "to": "warden"
      },
      "speed": 12,
      "hp": {
        "min": 430,
        "max": 500
      },
      "attack": {
        "min": 40,
        "max": 50
      },
      "mana": {
        "min": 30,
        "max": 45
      },
      "resistance": {
        "min": 18,
        "max": 28
      },
      "magicPower": {
        "min": 12,
        "max": 22
      },
      "healPower": {
        "min": 2,
        "max": 6
      },
      "growth": {
        "hp": 12,
        "attack": 4,
        "mana": 2,
        "resistance": 2,
        "magicPower": 2,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "critChance": {
        "min": 8,
        "max": 14
      },
      "critDamage": {
        "min": 40,
        "max": 80
      }
    },
    {
      "slug": "mage",
      "label": "Mage",
      "image": "/images/characters/mage.png",
      "basicAttack": {
        "id": "arcane_bolt",
        "name": "Arcane Bolt",
        "power": 0.95,
        "element": "arcane",
        "image": "/images/skills/arcane_bolt.png",
        "description": "Deals 0.95× magic damage."
      },
      "startingSkills": [
        "arcane_barrage",
        "mana_shield"
      ],
      "evolution": {
        "level": 20,
        "to": "archmage"
      },
      "speed": 7,
      "manaRegen": 2,
      "hp": {
        "min": 340,
        "max": 410
      },
      "attack": {
        "min": 16,
        "max": 24
      },
      "mana": {
        "min": 70,
        "max": 90
      },
      "resistance": {
        "min": 12,
        "max": 20
      },
      "magicPower": {
        "min": 48,
        "max": 62
      },
      "healPower": {
        "min": 4,
        "max": 10
      },
      "growth": {
        "hp": 8,
        "attack": 1,
        "mana": 5,
        "resistance": 1,
        "magicPower": 6,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "critChance": {
        "min": 8,
        "max": 14
      },
      "critDamage": {
        "min": 40,
        "max": 80
      }
    },
    {
      "slug": "rogue",
      "label": "Rogue",
      "image": "/images/characters/rogue.png",
      "basicAttack": {
        "id": "stab",
        "name": "Stab",
        "power": 1,
        "element": "physical",
        "image": "/images/skills/stab.png",
        "description": "Deals 1× attack damage."
      },
      "startingSkills": [
        "vampiric_strike",
        "shadow_meld"
      ],
      "evolution": {
        "level": 20,
        "to": "nightblade"
      },
      "speed": 14,
      "hp": {
        "min": 380,
        "max": 450
      },
      "attack": {
        "min": 46,
        "max": 58
      },
      "mana": {
        "min": 25,
        "max": 40
      },
      "resistance": {
        "min": 14,
        "max": 22
      },
      "magicPower": {
        "min": 10,
        "max": 18
      },
      "healPower": {
        "min": 2,
        "max": 5
      },
      "growth": {
        "hp": 10,
        "attack": 5,
        "mana": 2,
        "resistance": 1,
        "magicPower": 1,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "critChance": {
        "min": 8,
        "max": 14
      },
      "critDamage": {
        "min": 40,
        "max": 80
      }
    },
    {
      "slug": "paladin",
      "label": "Paladin",
      "image": "/images/characters/paladin.png",
      "basicAttack": {
        "id": "smite",
        "name": "Smite",
        "power": 0.95,
        "element": "holy",
        "image": "/images/skills/smite.png",
        "description": "Deals 0.95× attack damage."
      },
      "startingSkills": [
        "holy_strike",
        "mend"
      ],
      "evolution": {
        "level": 20,
        "to": "crusader"
      },
      "speed": 7,
      "hp": {
        "min": 560,
        "max": 640
      },
      "attack": {
        "min": 34,
        "max": 44
      },
      "mana": {
        "min": 40,
        "max": 55
      },
      "resistance": {
        "min": 32,
        "max": 44
      },
      "magicPower": {
        "min": 22,
        "max": 32
      },
      "healPower": {
        "min": 8,
        "max": 12
      },
      "growth": {
        "hp": 16,
        "attack": 3,
        "mana": 3,
        "resistance": 4,
        "magicPower": 3,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "critChance": {
        "min": 8,
        "max": 14
      },
      "critDamage": {
        "min": 40,
        "max": 80
      }
    },
    {
      "slug": "assassin",
      "label": "Assassin",
      "image": "/images/characters/assassin.png",
      "basicAttack": {
        "id": "lunge",
        "name": "Lunge",
        "power": 1.05,
        "element": "physical",
        "image": "/images/skills/lunge.png",
        "description": "Deals 1.05× attack damage."
      },
      "startingSkills": [
        "execute",
        "shadow_step"
      ],
      "evolution": {
        "level": 20,
        "to": "reaper"
      },
      "speed": 15,
      "hp": {
        "min": 360,
        "max": 430
      },
      "attack": {
        "min": 50,
        "max": 64
      },
      "mana": {
        "min": 22,
        "max": 36
      },
      "resistance": {
        "min": 12,
        "max": 20
      },
      "magicPower": {
        "min": 8,
        "max": 16
      },
      "healPower": {
        "min": 2,
        "max": 5
      },
      "growth": {
        "hp": 9,
        "attack": 6,
        "mana": 1,
        "resistance": 1,
        "magicPower": 1,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "critChance": {
        "min": 8,
        "max": 14
      },
      "critDamage": {
        "min": 40,
        "max": 80
      }
    },
    {
      "slug": "support",
      "label": "Support Mage",
      "image": "/images/characters/support.png",
      "basicAttack": {
        "id": "sanct_bolt",
        "name": "Sanct Bolt",
        "power": 0.9,
        "element": "holy",
        "image": "/images/skills/sanct_bolt.png",
        "description": "Deals 0.9× magic damage."
      },
      "startingSkills": [
        "mend",
        "greater_mend",
        "spirit_surge"
      ],
      "evolution": {
        "level": 20,
        "to": "high_priest"
      },
      "speed": 9,
      "manaRegen": 1,
      "hp": {
        "min": 390,
        "max": 460
      },
      "attack": {
        "min": 18,
        "max": 28
      },
      "mana": {
        "min": 70,
        "max": 90
      },
      "resistance": {
        "min": 18,
        "max": 28
      },
      "magicPower": {
        "min": 40,
        "max": 54
      },
      "healPower": {
        "min": 10,
        "max": 16
      },
      "growth": {
        "hp": 11,
        "attack": 2,
        "mana": 5,
        "resistance": 2,
        "magicPower": 5,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "critChance": {
        "min": 8,
        "max": 14
      },
      "critDamage": {
        "min": 40,
        "max": 80
      }
    },
    {
      "slug": "tank",
      "label": "Tank",
      "image": "/images/characters/tank.png",
      "basicAttack": {
        "id": "shield_bash",
        "name": "Shield Bash",
        "power": 0.85,
        "element": "physical",
        "effect": "crush",
        "image": "/images/skills/shield_bash.png",
        "description": "Deals 0.85× attack damage."
      },
      "startingSkills": [
        "cleave",
        "shield_wall"
      ],
      "evolution": {
        "level": 20,
        "to": "juggernaut"
      },
      "speed": 6,
      "hp": {
        "min": 650,
        "max": 750
      },
      "attack": {
        "min": 28,
        "max": 38
      },
      "mana": {
        "min": 18,
        "max": 30
      },
      "resistance": {
        "min": 40,
        "max": 55
      },
      "magicPower": {
        "min": 6,
        "max": 14
      },
      "healPower": {
        "min": 3,
        "max": 7
      },
      "growth": {
        "hp": 22,
        "attack": 2,
        "mana": 1,
        "resistance": 5,
        "magicPower": 1,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "critChance": {
        "min": 8,
        "max": 14
      },
      "critDamage": {
        "min": 40,
        "max": 80
      }
    },
    {
      "slug": "warlord",
      "label": "War Lord",
      "baseClass": "warrior",
      "evolution": {
        "level": 40,
        "to": "war_emperor"
      },
      "image": "/images/characters/warlord.png",
      "basicAttack": {
        "id": "great_slash",
        "name": "Great Slash",
        "power": 1.2,
        "element": "physical",
        "image": "/images/skills/great_slash.png",
        "description": "Deals 1.2× attack damage."
      },
      "startingSkills": [
        "war_cry"
      ],
      "speed": 9,
      "hp": {
        "min": 520,
        "max": 600
      },
      "attack": {
        "min": 42,
        "max": 52
      },
      "mana": {
        "min": 20,
        "max": 35
      },
      "resistance": {
        "min": 28,
        "max": 38
      },
      "magicPower": {
        "min": 8,
        "max": 16
      },
      "healPower": {
        "min": 2,
        "max": 6
      },
      "growth": {
        "hp": 22,
        "attack": 5,
        "mana": 2,
        "resistance": 4,
        "magicPower": 1,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 60,
        "attack": 8,
        "mana": 10,
        "resistance": 6,
        "magicPower": 3
      }
    },
    {
      "slug": "warden",
      "label": "Warden",
      "baseClass": "ranger",
      "evolution": {
        "level": 40,
        "to": "storm_warden"
      },
      "image": "/images/characters/warden.png",
      "basicAttack": {
        "id": "hunter_shot",
        "name": "Hunter Shot",
        "power": 1.05,
        "element": "physical",
        "image": "/images/skills/hunter_shot.png",
        "description": "Deals 1.05× attack damage."
      },
      "startingSkills": [
        "volley"
      ],
      "speed": 13,
      "hp": {
        "min": 430,
        "max": 500
      },
      "attack": {
        "min": 40,
        "max": 50
      },
      "mana": {
        "min": 30,
        "max": 45
      },
      "resistance": {
        "min": 18,
        "max": 28
      },
      "magicPower": {
        "min": 12,
        "max": 22
      },
      "healPower": {
        "min": 2,
        "max": 6
      },
      "growth": {
        "hp": 15,
        "attack": 5,
        "mana": 3,
        "resistance": 2,
        "magicPower": 2,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 40,
        "attack": 9,
        "mana": 12,
        "resistance": 4,
        "magicPower": 4
      }
    },
    {
      "slug": "archmage",
      "label": "Archmage",
      "baseClass": "mage",
      "evolution": {
        "level": 40,
        "to": "archon"
      },
      "image": "/images/characters/archmage.png",
      "basicAttack": {
        "id": "arcane_blast",
        "name": "Arcane Blast",
        "power": 1.1,
        "element": "arcane",
        "image": "/images/skills/arcane_blast.png",
        "description": "Deals 1.1× magic damage."
      },
      "startingSkills": [
        "meteor"
      ],
      "speed": 8,
      "manaRegen": 3,
      "hp": {
        "min": 340,
        "max": 410
      },
      "attack": {
        "min": 16,
        "max": 24
      },
      "mana": {
        "min": 70,
        "max": 90
      },
      "resistance": {
        "min": 12,
        "max": 20
      },
      "magicPower": {
        "min": 48,
        "max": 62
      },
      "healPower": {
        "min": 4,
        "max": 10
      },
      "growth": {
        "hp": 10,
        "attack": 1,
        "mana": 6,
        "resistance": 1,
        "magicPower": 7,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 30,
        "attack": 3,
        "mana": 25,
        "resistance": 3,
        "magicPower": 10
      }
    },
    {
      "slug": "nightblade",
      "label": "Nightblade",
      "baseClass": "rogue",
      "evolution": {
        "level": 40,
        "to": "shade_king"
      },
      "image": "/images/characters/nightblade.png",
      "basicAttack": {
        "id": "shadow_stab",
        "name": "Shadow Stab",
        "power": 1.1,
        "element": "shadow",
        "image": "/images/skills/shadow_stab.png",
        "description": "Deals 1.1× attack damage."
      },
      "startingSkills": [
        "shadow_veil"
      ],
      "speed": 15,
      "hp": {
        "min": 380,
        "max": 450
      },
      "attack": {
        "min": 46,
        "max": 58
      },
      "mana": {
        "min": 25,
        "max": 40
      },
      "resistance": {
        "min": 14,
        "max": 22
      },
      "magicPower": {
        "min": 10,
        "max": 18
      },
      "healPower": {
        "min": 2,
        "max": 5
      },
      "growth": {
        "hp": 12,
        "attack": 6,
        "mana": 3,
        "resistance": 1,
        "magicPower": 1,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 35,
        "attack": 10,
        "mana": 10,
        "resistance": 3,
        "magicPower": 3
      }
    },
    {
      "slug": "crusader",
      "label": "Crusader",
      "baseClass": "paladin",
      "evolution": {
        "level": 40,
        "to": "lightbringer"
      },
      "image": "/images/characters/crusader.png",
      "basicAttack": {
        "id": "blessed_blade",
        "name": "Blessed Blade",
        "power": 1.1,
        "element": "holy",
        "image": "/images/skills/blessed_blade.png",
        "description": "Deals 1.1× attack damage."
      },
      "startingSkills": [
        "holy_judgement"
      ],
      "speed": 8,
      "hp": {
        "min": 560,
        "max": 640
      },
      "attack": {
        "min": 34,
        "max": 44
      },
      "mana": {
        "min": 40,
        "max": 55
      },
      "resistance": {
        "min": 32,
        "max": 44
      },
      "magicPower": {
        "min": 22,
        "max": 32
      },
      "healPower": {
        "min": 8,
        "max": 12
      },
      "growth": {
        "hp": 19,
        "attack": 4,
        "mana": 4,
        "resistance": 5,
        "magicPower": 4,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 55,
        "attack": 6,
        "mana": 15,
        "resistance": 7,
        "magicPower": 5,
        "healPower": 1
      }
    },
    {
      "slug": "reaper",
      "label": "Reaper",
      "baseClass": "assassin",
      "evolution": {
        "level": 40,
        "to": "death_lord"
      },
      "image": "/images/characters/reaper.png",
      "basicAttack": {
        "id": "reap",
        "name": "Reap",
        "power": 1.2,
        "element": "shadow",
        "image": "/images/skills/reap.png",
        "description": "Deals 1.2× attack damage."
      },
      "startingSkills": [
        "death_mark"
      ],
      "speed": 16,
      "hp": {
        "min": 360,
        "max": 430
      },
      "attack": {
        "min": 50,
        "max": 64
      },
      "mana": {
        "min": 22,
        "max": 36
      },
      "resistance": {
        "min": 12,
        "max": 20
      },
      "magicPower": {
        "min": 8,
        "max": 16
      },
      "healPower": {
        "min": 2,
        "max": 5
      },
      "growth": {
        "hp": 11,
        "attack": 7,
        "mana": 2,
        "resistance": 1,
        "magicPower": 1,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 30,
        "attack": 12,
        "mana": 8,
        "resistance": 3,
        "magicPower": 3
      }
    },
    {
      "slug": "high_priest",
      "label": "High Priest",
      "baseClass": "support",
      "evolution": {
        "level": 40,
        "to": "divine_saint"
      },
      "image": "/images/characters/high_priest.png",
      "basicAttack": {
        "id": "hallowed_bolt",
        "name": "Hallowed Bolt",
        "power": 1,
        "element": "holy",
        "image": "/images/skills/hallowed_bolt.png",
        "description": "Deals 1× magic damage."
      },
      "startingSkills": [
        "divine_blessing"
      ],
      "speed": 9,
      "manaRegen": 2,
      "hp": {
        "min": 390,
        "max": 460
      },
      "attack": {
        "min": 18,
        "max": 28
      },
      "mana": {
        "min": 70,
        "max": 90
      },
      "resistance": {
        "min": 18,
        "max": 28
      },
      "magicPower": {
        "min": 40,
        "max": 54
      },
      "healPower": {
        "min": 10,
        "max": 16
      },
      "growth": {
        "hp": 13,
        "attack": 2,
        "mana": 6,
        "resistance": 2,
        "magicPower": 6,
        "healPower": 2,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 35,
        "attack": 4,
        "mana": 20,
        "resistance": 4,
        "magicPower": 7,
        "healPower": 3
      }
    },
    {
      "slug": "juggernaut",
      "label": "Juggernaut",
      "baseClass": "tank",
      "evolution": {
        "level": 40,
        "to": "colossus"
      },
      "image": "/images/characters/juggernaut.png",
      "basicAttack": {
        "id": "adamant_bash",
        "name": "Adamant Bash",
        "power": 0.95,
        "element": "physical",
        "effect": "crush",
        "image": "/images/skills/adamant_bash.png",
        "description": "Deals 0.95× attack damage."
      },
      "startingSkills": [
        "bastion"
      ],
      "speed": 6,
      "hp": {
        "min": 650,
        "max": 750
      },
      "attack": {
        "min": 28,
        "max": 38
      },
      "mana": {
        "min": 18,
        "max": 30
      },
      "resistance": {
        "min": 40,
        "max": 55
      },
      "magicPower": {
        "min": 6,
        "max": 14
      },
      "healPower": {
        "min": 3,
        "max": 7
      },
      "growth": {
        "hp": 26,
        "attack": 3,
        "mana": 1,
        "resistance": 6,
        "magicPower": 1,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 90,
        "attack": 5,
        "mana": 8,
        "resistance": 9,
        "magicPower": 2
      }
    },
    {
      "slug": "war_emperor",
      "label": "War Emperor",
      "baseClass": "warlord",
      "image": "/images/characters/war_emperor.png",
      "basicAttack": {
        "id": "colossal_slash",
        "name": "Colossal Slash",
        "power": 1.3,
        "element": "physical",
        "image": "/images/skills/colossal_slash.png",
        "description": "Deals 1.3× attack damage."
      },
      "startingSkills": [
        "cataclysm"
      ],
      "speed": 10,
      "hp": {
        "min": 520,
        "max": 600
      },
      "attack": {
        "min": 42,
        "max": 52
      },
      "mana": {
        "min": 20,
        "max": 35
      },
      "resistance": {
        "min": 28,
        "max": 38
      },
      "magicPower": {
        "min": 8,
        "max": 16
      },
      "healPower": {
        "min": 2,
        "max": 6
      },
      "growth": {
        "hp": 24,
        "attack": 6,
        "mana": 2,
        "resistance": 5,
        "magicPower": 1,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 80,
        "attack": 10,
        "mana": 12,
        "resistance": 8,
        "magicPower": 4
      }
    },
    {
      "slug": "storm_warden",
      "label": "Storm Warden",
      "baseClass": "warden",
      "image": "/images/characters/storm_warden.png",
      "basicAttack": {
        "id": "storm_shot",
        "name": "Storm Shot",
        "power": 1.15,
        "element": "physical",
        "image": "/images/skills/storm_shot.png",
        "description": "Deals 1.15× attack damage."
      },
      "startingSkills": [
        "storm_barrage"
      ],
      "speed": 15,
      "hp": {
        "min": 430,
        "max": 500
      },
      "attack": {
        "min": 40,
        "max": 50
      },
      "mana": {
        "min": 30,
        "max": 45
      },
      "resistance": {
        "min": 18,
        "max": 28
      },
      "magicPower": {
        "min": 12,
        "max": 22
      },
      "healPower": {
        "min": 2,
        "max": 6
      },
      "growth": {
        "hp": 16,
        "attack": 6,
        "mana": 3,
        "resistance": 2,
        "magicPower": 3,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 50,
        "attack": 11,
        "mana": 15,
        "resistance": 5,
        "magicPower": 5
      }
    },
    {
      "slug": "archon",
      "label": "Archon",
      "baseClass": "archmage",
      "image": "/images/characters/archon.png",
      "basicAttack": {
        "id": "primordial_bolt",
        "name": "Primordial Bolt",
        "power": 1.2,
        "element": "arcane",
        "image": "/images/skills/primordial_bolt.png",
        "description": "Deals 1.2× magic damage."
      },
      "startingSkills": [
        "comet"
      ],
      "speed": 9,
      "manaRegen": 4,
      "hp": {
        "min": 340,
        "max": 410
      },
      "attack": {
        "min": 16,
        "max": 24
      },
      "mana": {
        "min": 70,
        "max": 90
      },
      "resistance": {
        "min": 12,
        "max": 20
      },
      "magicPower": {
        "min": 48,
        "max": 62
      },
      "healPower": {
        "min": 4,
        "max": 10
      },
      "growth": {
        "hp": 10,
        "attack": 1,
        "mana": 7,
        "resistance": 1,
        "magicPower": 8,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 35,
        "attack": 4,
        "mana": 30,
        "resistance": 4,
        "magicPower": 13
      }
    },
    {
      "slug": "shade_king",
      "label": "Shade King",
      "baseClass": "nightblade",
      "image": "/images/characters/shade_king.png",
      "basicAttack": {
        "id": "eclipse_strike",
        "name": "Eclipse Strike",
        "power": 1.2,
        "element": "shadow",
        "image": "/images/skills/eclipse_strike.png",
        "description": "Deals 1.2× attack damage."
      },
      "startingSkills": [
        "soul_thief"
      ],
      "speed": 16,
      "hp": {
        "min": 380,
        "max": 450
      },
      "attack": {
        "min": 46,
        "max": 58
      },
      "mana": {
        "min": 25,
        "max": 40
      },
      "resistance": {
        "min": 14,
        "max": 22
      },
      "magicPower": {
        "min": 10,
        "max": 18
      },
      "healPower": {
        "min": 2,
        "max": 5
      },
      "growth": {
        "hp": 12,
        "attack": 7,
        "mana": 3,
        "resistance": 1,
        "magicPower": 2,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 45,
        "attack": 13,
        "mana": 12,
        "resistance": 4,
        "magicPower": 4
      }
    },
    {
      "slug": "lightbringer",
      "label": "Lightbringer",
      "baseClass": "crusader",
      "image": "/images/characters/lightbringer.png",
      "basicAttack": {
        "id": "radiant_edge",
        "name": "Radiant Edge",
        "power": 1.2,
        "element": "holy",
        "image": "/images/skills/radiant_edge.png",
        "description": "Deals 1.2× attack damage."
      },
      "startingSkills": [
        "radiance"
      ],
      "speed": 9,
      "hp": {
        "min": 560,
        "max": 640
      },
      "attack": {
        "min": 34,
        "max": 44
      },
      "mana": {
        "min": 40,
        "max": 55
      },
      "resistance": {
        "min": 32,
        "max": 44
      },
      "magicPower": {
        "min": 22,
        "max": 32
      },
      "healPower": {
        "min": 8,
        "max": 12
      },
      "growth": {
        "hp": 20,
        "attack": 5,
        "mana": 4,
        "resistance": 6,
        "magicPower": 4,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 70,
        "attack": 7,
        "mana": 18,
        "resistance": 9,
        "magicPower": 6,
        "healPower": 1
      }
    },
    {
      "slug": "death_lord",
      "label": "Death Lord",
      "baseClass": "reaper",
      "image": "/images/characters/death_lord.png",
      "basicAttack": {
        "id": "scythe_sweep",
        "name": "Scythe Sweep",
        "power": 1.3,
        "element": "shadow",
        "image": "/images/skills/scythe_sweep.png",
        "description": "Deals 1.3× attack damage."
      },
      "startingSkills": [
        "soul_reap"
      ],
      "speed": 17,
      "hp": {
        "min": 360,
        "max": 430
      },
      "attack": {
        "min": 50,
        "max": 64
      },
      "mana": {
        "min": 22,
        "max": 36
      },
      "resistance": {
        "min": 12,
        "max": 20
      },
      "magicPower": {
        "min": 8,
        "max": 16
      },
      "healPower": {
        "min": 2,
        "max": 5
      },
      "growth": {
        "hp": 11,
        "attack": 8,
        "mana": 2,
        "resistance": 1,
        "magicPower": 2,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 38,
        "attack": 15,
        "mana": 10,
        "resistance": 4,
        "magicPower": 4
      }
    },
    {
      "slug": "divine_saint",
      "label": "Divine Saint",
      "baseClass": "high_priest",
      "image": "/images/characters/divine_saint.png",
      "basicAttack": {
        "id": "divine_light",
        "name": "Divine Light",
        "power": 1.1,
        "element": "holy",
        "image": "/images/skills/divine_light.png",
        "description": "Deals 1.1× magic damage."
      },
      "startingSkills": [
        "resurgence"
      ],
      "speed": 10,
      "manaRegen": 3,
      "hp": {
        "min": 390,
        "max": 460
      },
      "attack": {
        "min": 18,
        "max": 28
      },
      "mana": {
        "min": 70,
        "max": 90
      },
      "resistance": {
        "min": 18,
        "max": 28
      },
      "magicPower": {
        "min": 40,
        "max": 54
      },
      "healPower": {
        "min": 10,
        "max": 16
      },
      "growth": {
        "hp": 14,
        "attack": 2,
        "mana": 7,
        "resistance": 3,
        "magicPower": 7,
        "healPower": 2,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 45,
        "attack": 5,
        "mana": 25,
        "resistance": 5,
        "magicPower": 9,
        "healPower": 4
      }
    },
    {
      "slug": "colossus",
      "label": "Colossus",
      "baseClass": "juggernaut",
      "image": "/images/characters/colossus.png",
      "basicAttack": {
        "id": "titan_slam",
        "name": "Titan Slam",
        "power": 1.05,
        "element": "physical",
        "effect": "crush",
        "image": "/images/skills/titan_slam.png",
        "description": "Deals 1.05× attack damage."
      },
      "startingSkills": [
        "immovable"
      ],
      "speed": 7,
      "hp": {
        "min": 650,
        "max": 750
      },
      "attack": {
        "min": 28,
        "max": 38
      },
      "mana": {
        "min": 18,
        "max": 30
      },
      "resistance": {
        "min": 40,
        "max": 55
      },
      "magicPower": {
        "min": 6,
        "max": 14
      },
      "healPower": {
        "min": 3,
        "max": 7
      },
      "growth": {
        "hp": 28,
        "attack": 4,
        "mana": 1,
        "resistance": 7,
        "magicPower": 1,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 110,
        "attack": 6,
        "mana": 10,
        "resistance": 11,
        "magicPower": 3
      }
    }
  ],
  "images": {
    "backgrounds": {
      "menu": "/images/backgrounds/menu.png",
      "setup": "/images/backgrounds/setup.png",
      "lobby": "/images/backgrounds/lobby.png",
      "town": "/images/backgrounds/town.png",
      "dungeon": "/images/backgrounds/dungeon.png",
      "tavern": "/images/backgrounds/tavern.png"
    },
    "ui": {
      "panel": "/images/ui/panel.png"
    }
  },
  "town": {
    "search": {
      "stamina": 2,
      "xp": 0,
      "outcomes": [
        {
          "weight": 30,
          "gold": [
            8,
            16
          ],
          "wood": [
            0,
            2
          ],
          "text": "You find a pouch of coins in the grass."
        },
        {
          "weight": 25,
          "gold": [
            0,
            6
          ],
          "wood": [
            3,
            7
          ],
          "text": "A fallen branch yields useful timber."
        },
        {
          "weight": 15,
          "gold": [
            12,
            22
          ],
          "wood": [
            0,
            0
          ],
          "text": "You push through thorns and find a glint of gold."
        },
        {
          "weight": 15,
          "gold": [
            0,
            4
          ],
          "wood": [
            0,
            1
          ],
          "text": "A passing shade leads you to forgotten coin."
        },
        {
          "weight": 15,
          "gold": [
            0,
            2
          ],
          "wood": [
            0,
            1
          ],
          "food": [
            1,
            2
          ],
          "text": "You forage and find edible roots."
        }
      ]
    },
    "blacksmith": {
      "stamina": 2
    },
    "tavern": {
      "stamina": 1,
      "bets": [
        5,
        10,
        25
      ],
      "provisions": {
        "foodPrice": 10,
        "foodAmount": 2
      }
    },
    "rest": {
      "stamina": 6
    },
    "temple": {
      "stamina": 2
    },
    "endDay": {},
    "dungeon": {
      "rankedStamina": 4,
      "fastStamina": 2
    }
  },
  "temple": {
    "restore": {
      "item": "golem_heart",
      "itemName": "Heart of Golem",
      "text": "Offer a Heart of Golem to mend a lost heart."
    },
    "recipes": [
      {
        "id": "fire_ash_sword",
        "name": "Fire Ash Sword",
        "inputs": [
          {
            "item": "stone_ash_sword",
            "qty": 1
          },
          {
            "item": "fire_essence",
            "qty": 1
          }
        ],
        "output": {
          "item": "fire_ash_sword",
          "qty": 1
        },
        "cost": {
          "gold": 25,
          "wood": 0
        },
        "description": "Forge a sword that still smoulders."
      },
      {
        "id": "molten_cleaver",
        "name": "Molten Cleaver",
        "inputs": [
          {
            "item": "fire_ash_sword",
            "qty": 1
          },
          {
            "item": "heart_of_fire",
            "qty": 1
          }
        ],
        "output": {
          "item": "molten_cleaver",
          "qty": 1
        },
        "cost": {
          "gold": 60,
          "wood": 10
        },
        "description": "Bond the heart of a fire spirit to the blade."
      },
      {
        "id": "frost_gladius",
        "name": "Frost Gladius",
        "inputs": [
          {
            "item": "stone_ash_sword",
            "qty": 1
          },
          {
            "item": "frost_essence",
            "qty": 1
          }
        ],
        "output": {
          "item": "frost_gladius",
          "qty": 1
        },
        "cost": {
          "gold": 25,
          "wood": 0
        },
        "description": "Temper the blade in hoarfrost."
      },
      {
        "id": "arcane_rod",
        "name": "Arcane Rod",
        "inputs": [
          {
            "item": "apprentice_staff",
            "qty": 1
          },
          {
            "item": "arcane_essence",
            "qty": 1
          }
        ],
        "output": {
          "item": "arcane_rod",
          "qty": 1
        },
        "cost": {
          "gold": 30,
          "wood": 0
        },
        "description": "Weave raw magic into the staff."
      },
      {
        "id": "shadow_knife",
        "name": "Shadow Knife",
        "inputs": [
          {
            "item": "poison_dagger",
            "qty": 1
          },
          {
            "item": "shadow_essence",
            "qty": 1
          }
        ],
        "output": {
          "item": "shadow_knife",
          "qty": 1
        },
        "cost": {
          "gold": 30,
          "wood": 0
        },
        "description": "Fold shadow itself into the edge."
      }
    ]
  },
  "baseSkills": [
    "heavy_strike",
    "defend",
    "arcane_barrage",
    "mana_shield",
    "aimed_shot",
    "piercing_shot",
    "vampiric_strike",
    "shadow_meld",
    "holy_strike",
    "divine_guard",
    "execute",
    "shadow_step",
    "mend",
    "greater_mend",
    "fortify",
    "war_banner",
    "cleave",
    "shield_wall",
    "spirit_surge"
  ],
  "combat": {
    "damageVariance": 0.2,
    "resistanceMitigation": 0.25,
    "manaRegenPerRound": 3,
    "turnTimeoutMs": 15000,
    "critChance": 0.12,
    "critMult": 1.6,
    "monsterScale": 5,
    "monsterAttackDelayMs": 900
  },
  "loot": {
    "buyable": [
      "common",
      "uncommon",
      "rare"
    ],
    "rarityOrder": [
      "common",
      "uncommon",
      "rare",
      "epic",
      "legendary",
      "mythic",
      "ancient_relic"
    ],
    "rarityMeta": {
      "common": {
        "label": "Common",
        "color": "#9aa7b5"
      },
      "uncommon": {
        "label": "Uncommon",
        "color": "#6fbf6a"
      },
      "rare": {
        "label": "Rare",
        "color": "#4aa3d6"
      },
      "epic": {
        "label": "Epic",
        "color": "#b07fe8"
      },
      "legendary": {
        "label": "Legendary",
        "color": "#ffb347"
      },
      "mythic": {
        "label": "Mythic",
        "color": "#ff5c8a"
      },
      "ancient_relic": {
        "label": "Ancient Relic",
        "color": "#ffe14d"
      }
    },
    "dropChance": {
      "common": 0.2,
      "uncommon": 0.28,
      "rare": 0.36,
      "epic": 0.45,
      "legendary": 0.55,
      "mythic": 0.65,
      "ancient_relic": 0.75
    },
    "gradeWeights": {
      "f": {
        "common": 100,
        "uncommon": 35,
        "rare": 10,
        "epic": 2,
        "legendary": 0.4,
        "mythic": 0,
        "ancient_relic": 0
      },
      "d": {
        "common": 90,
        "uncommon": 45,
        "rare": 15,
        "epic": 4,
        "legendary": 0.8,
        "mythic": 0.1,
        "ancient_relic": 0
      },
      "c": {
        "common": 70,
        "uncommon": 50,
        "rare": 22,
        "epic": 8,
        "legendary": 1.5,
        "mythic": 0.3,
        "ancient_relic": 0.02
      },
      "b": {
        "common": 50,
        "uncommon": 55,
        "rare": 30,
        "epic": 14,
        "legendary": 3,
        "mythic": 0.8,
        "ancient_relic": 0.05
      },
      "a": {
        "common": 30,
        "uncommon": 50,
        "rare": 38,
        "epic": 22,
        "legendary": 6,
        "mythic": 1.6,
        "ancient_relic": 0.12
      },
      "s": {
        "common": 15,
        "uncommon": 40,
        "rare": 45,
        "epic": 32,
        "legendary": 10,
        "mythic": 3,
        "ancient_relic": 0.25
      },
      "ss": {
        "common": 8,
        "uncommon": 30,
        "rare": 48,
        "epic": 42,
        "legendary": 15,
        "mythic": 5,
        "ancient_relic": 0.5
      },
      "ssplus": {
        "common": 5,
        "uncommon": 22,
        "rare": 50,
        "epic": 55,
        "legendary": 22,
        "mythic": 8,
        "ancient_relic": 1
      },
      "fast": {
        "common": 100,
        "uncommon": 30,
        "rare": 8,
        "epic": 2,
        "legendary": 0.5,
        "mythic": 0,
        "ancient_relic": 0
      }
    }
  },
  "effects": {
    "slash": {
      "animation": "hit",
      "color": "#ff7a5c",
      "particles": "slash",
      "sound": [
        "slash1",
        "slash2",
        "slash3",
        "slash4"
      ]
    },
    "heavy": {
      "animation": "hit-crit",
      "color": "#ffb347",
      "particles": "shatter",
      "sound": [
        "strongattack1",
        "strongattack2"
      ]
    },
    "axe": {
      "animation": "hit",
      "color": "#ff9b4a",
      "particles": "shatter",
      "sound": [
        "battleaxe"
      ]
    },
    "crush": {
      "animation": "hit-crit",
      "color": "#ffd23e",
      "particles": "burst",
      "sound": [
        "skull_crush"
      ]
    },
    "arcane": {
      "animation": "hit-arcane",
      "color": "#c9a0ff",
      "particles": "orb",
      "sound": [
        "normalmagic",
        "bloodmagic1",
        "bloodmagic2"
      ]
    },
    "fire": {
      "animation": "hit-arcane",
      "color": "#ff7a3c",
      "particles": "fire",
      "sound": [
        "firemagic"
      ]
    },
    "frost": {
      "animation": "hit-arcane",
      "color": "#9fd4ff",
      "particles": "frost",
      "sound": [
        "frostmagic"
      ]
    },
    "holy": {
      "animation": "hit-holy",
      "color": "#ffe9a8",
      "particles": "rays",
      "sound": [
        "healingmagic"
      ]
    },
    "shadow": {
      "animation": "hit-shadow",
      "color": "#b98cff",
      "particles": "pulse",
      "sound": [
        "bloodmagic1",
        "bloodmagic2"
      ]
    },
    "heal": {
      "animation": "heal",
      "color": "#8fe08a",
      "particles": "glow",
      "sound": [
        "healingmagic"
      ]
    },
    "defend": {
      "animation": "defend",
      "color": "#8fc9ff",
      "particles": "ring",
      "sound": [
        "shield"
      ]
    },
    "monster": {
      "animation": "hit",
      "color": "#ff7a5c",
      "particles": "slash",
      "sound": [
        "monstersound"
      ]
    },
    "crit": {
      "animation": "hit-crit",
      "color": "#ffd23e",
      "particles": "burst",
      "sound": [
        "skull_crush"
      ]
    }
  },
  "dungeonSizes": [
    {
      "id": "small",
      "label": "Small",
      "stamina": 3,
      "count": 0.6,
      "fewerCount": 1.5,
      "power": 0.85,
      "goldScale": 0.8,
      "woodScale": 0.8,
      "xpScale": 0.8
    },
    {
      "id": "normal",
      "label": "Normal",
      "stamina": 3,
      "count": 1,
      "fewerCount": 1,
      "power": 1,
      "goldScale": 1,
      "woodScale": 1,
      "xpScale": 1
    },
    {
      "id": "big",
      "label": "Big",
      "stamina": 3,
      "count": 1.6,
      "fewerCount": 0.7,
      "power": 1.15,
      "goldScale": 1.2,
      "woodScale": 1.2,
      "xpScale": 1.2
    },
    {
      "id": "huge",
      "label": "Huge",
      "stamina": 3,
      "count": 2.2,
      "fewerCount": 0.5,
      "power": 1.3,
      "goldScale": 1.5,
      "woodScale": 1.5,
      "xpScale": 1.5
    }
  ],
  "dungeons": [
    {
      "rank": "f",
      "label": "F-Rank",
      "image": "/images/dungeons/f.png",
      "stamina": 4,
      "xpReward": 40,
      "goldScale": 0.4,
      "woodScale": 0.4,
      "goldBase": 30,
      "woodBase": 20,
      "monsterPool": [
        "slime",
        "goblin",
        "giant_rat",
        "cave_bat",
        "wolf",
        "golem"
      ],
      "monsterCount": 2,
      "monsterPower": 1,
      "sizeProfile": "more",
      "loot": {
        "legendary": 0.5,
        "epic": 1.5,
        "mythic": 0.2,
        "remnant": 0.05
      }
    },
    {
      "rank": "d",
      "label": "D-Rank",
      "image": "/images/dungeons/d.png",
      "stamina": 4,
      "xpReward": 70,
      "goldScale": 0.6,
      "woodScale": 0.55,
      "goldBase": 45,
      "woodBase": 30,
      "monsterPool": [
        "goblin",
        "wolf",
        "bandit",
        "spider",
        "wild_boar",
        "golem"
      ],
      "monsterCount": 2,
      "monsterPower": 1.3,
      "sizeProfile": "more",
      "loot": {
        "legendary": 1,
        "epic": 3,
        "mythic": 0.4,
        "remnant": 0.08
      }
    },
    {
      "rank": "c",
      "label": "C-Rank",
      "image": "/images/dungeons/c.png",
      "stamina": 4,
      "xpReward": 110,
      "goldScale": 0.8,
      "woodScale": 0.7,
      "goldBase": 70,
      "woodBase": 45,
      "monsterPool": [
        "goblin_warrior",
        "skeleton",
        "dire_wolf",
        "harpy",
        "thorn_viper",
        "grove_sprite"
      ],
      "monsterCount": 3,
      "monsterPower": 1.6,
      "sizeProfile": "more",
      "loot": {
        "legendary": 2,
        "epic": 5,
        "mythic": 0.8,
        "remnant": 0.12
      }
    },
    {
      "rank": "b",
      "label": "B-Rank",
      "image": "/images/dungeons/b.png",
      "stamina": 4,
      "xpReward": 160,
      "goldScale": 1,
      "woodScale": 0.9,
      "goldBase": 100,
      "woodBase": 60,
      "monsterPool": [
        "skeleton",
        "dire_wolf",
        "orc",
        "swamp_troll",
        "griffin",
        "grove_sprite"
      ],
      "monsterCount": 3,
      "monsterPower": 2,
      "sizeProfile": "more",
      "loot": {
        "legendary": 3.5,
        "epic": 8,
        "mythic": 1.5,
        "remnant": 0.2
      }
    },
    {
      "rank": "a",
      "label": "A-Rank",
      "image": "/images/dungeons/a.png",
      "stamina": 4,
      "xpReward": 230,
      "goldScale": 1.3,
      "woodScale": 1.1,
      "goldBase": 150,
      "woodBase": 85,
      "monsterPool": [
        "stone_warden",
        "wraith",
        "manticore",
        "ogre",
        "dark_knight"
      ],
      "monsterCount": 3,
      "monsterPower": 2.6,
      "sizeProfile": "more",
      "loot": {
        "legendary": 6,
        "epic": 12,
        "mythic": 3,
        "remnant": 0.4
      }
    },
    {
      "rank": "s",
      "label": "S-Rank",
      "image": "/images/dungeons/s.png",
      "stamina": 4,
      "xpReward": 320,
      "goldScale": 1.7,
      "woodScale": 1.3,
      "goldBase": 220,
      "woodBase": 110,
      "monsterPool": [
        "wraith",
        "manticore",
        "ogre",
        "witch",
        "wyvern"
      ],
      "monsterCount": 4,
      "monsterPower": 3.3,
      "sizeProfile": "fewerStronger",
      "loot": {
        "legendary": 10,
        "epic": 18,
        "mythic": 6,
        "remnant": 0.8
      }
    },
    {
      "rank": "ss",
      "label": "SS-Rank",
      "image": "/images/dungeons/ss.png",
      "stamina": 4,
      "xpReward": 430,
      "goldScale": 2.1,
      "woodScale": 1.6,
      "goldBase": 320,
      "woodBase": 150,
      "monsterPool": [
        "dark_knight",
        "witch",
        "wyvern",
        "ancient_golem",
        "lich"
      ],
      "monsterCount": 4,
      "monsterPower": 4.2,
      "sizeProfile": "fewerStronger",
      "loot": {
        "legendary": 14,
        "epic": 24,
        "mythic": 10,
        "remnant": 1.4
      }
    },
    {
      "rank": "ssplus",
      "label": "SS+",
      "image": "/images/dungeons/ssplus.png",
      "stamina": 4,
      "xpReward": 560,
      "goldScale": 2.6,
      "woodScale": 1.9,
      "goldBase": 460,
      "woodBase": 200,
      "monsterPool": [
        "lich",
        "hydra",
        "ancient_golem",
        "wyvern"
      ],
      "monsterCount": 5,
      "monsterPower": 5.5,
      "sizeProfile": "fewerStronger",
      "loot": {
        "legendary": 18,
        "epic": 30,
        "mythic": 14,
        "remnant": 2.2
      }
    },
    {
      "rank": "fast",
      "label": "Fast Dungeon",
      "image": "/images/dungeons/fast.png",
      "stamina": 2,
      "xpReward": 55,
      "goldScale": 0.5,
      "woodScale": 0.45,
      "goldBase": 25,
      "woodBase": 15,
      "monsterPool": [
        "slime",
        "goblin",
        "goblin_archer"
      ],
      "monsterCount": 1,
      "monsterPower": 1,
      "sizeProfile": "more",
      "loot": {
        "legendary": 0.8,
        "epic": 2,
        "mythic": 0.3,
        "remnant": 0.06
      }
    }
  ],
  "items": [
    {
      "id": "rusty_sword",
      "name": "Rusty Sword",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 30,
        "wood": 5
      },
      "stats": {
        "attack": 4
      },
      "image": "/images/items/rusty_sword.png",
      "description": "+4 Attack"
    },
    {
      "id": "leather_helm",
      "name": "Leather Helm",
      "slot": "head",
      "rarity": "common",
      "price": {
        "gold": 35,
        "wood": 8
      },
      "stats": {
        "maxHp": 30,
        "resistance": 4
      },
      "image": "/images/items/leather_helm.png",
      "description": "+30 Max HP, +4 Resistance"
    },
    {
      "id": "leather_chest",
      "name": "Leather Chest",
      "slot": "armor",
      "rarity": "common",
      "price": {
        "gold": 50,
        "wood": 12
      },
      "stats": {
        "maxHp": 50,
        "resistance": 6
      },
      "image": "/images/items/leather_chest.png",
      "description": "+50 Max HP, +6 Resistance"
    },
    {
      "id": "leather_pants",
      "name": "Leather Pants",
      "slot": "legs",
      "rarity": "common",
      "price": {
        "gold": 40,
        "wood": 10
      },
      "stats": {
        "maxHp": 35,
        "resistance": 5
      },
      "image": "/images/items/leather_pants.png",
      "description": "+35 Max HP, +5 Resistance"
    },
    {
      "id": "leather_boots",
      "name": "Leather Boots",
      "slot": "boots",
      "rarity": "common",
      "price": {
        "gold": 30,
        "wood": 8
      },
      "stats": {
        "speed": 1
      },
      "image": "/images/items/leather_boots.png",
      "description": "+1 Speed"
    },
    {
      "id": "iron_amulet",
      "name": "Iron Amulet",
      "slot": "amulet",
      "rarity": "uncommon",
      "price": {
        "gold": 45,
        "wood": 10
      },
      "stats": {
        "mana": 10,
        "magicPower": 3
      },
      "image": "/images/items/iron_amulet.png",
      "description": "+10 Mana, +3 Magic Power"
    },
    {
      "id": "iron_ring",
      "name": "Iron Ring",
      "slot": "ring",
      "rarity": "common",
      "price": {
        "gold": 40,
        "wood": 9
      },
      "stats": {
        "attack": 2,
        "mana": 5
      },
      "image": "/images/items/iron_ring.png",
      "description": "+2 Attack, +5 Mana"
    },
    {
      "id": "mana_talisman",
      "name": "Mana Talisman",
      "slot": "amulet",
      "rarity": "rare",
      "price": {
        "gold": 160,
        "wood": 30
      },
      "stats": {
        "mana": 20,
        "manaRegen": 1
      },
      "image": "/images/items/mana_talisman.png",
      "description": "+20 Mana, +1 Mana Regen"
    },
    {
      "id": "battle_axe",
      "name": "Battle Axe",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 75,
        "wood": 15
      },
      "stats": {
        "attack": 8
      },
      "image": "/images/items/battle_axe.png",
      "description": "+8 Attack"
    },
    {
      "id": "war_hammer",
      "name": "War Hammer",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 90,
        "wood": 20
      },
      "stats": {
        "attack": 12
      },
      "image": "/images/items/war_hammer.png",
      "description": "+12 Attack"
    },
    {
      "id": "longbow",
      "name": "Longbow",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 80,
        "wood": 18
      },
      "stats": {
        "attack": 7,
        "speed": 1
      },
      "image": "/images/items/longbow.png",
      "description": "+7 Attack, +1 Speed"
    },
    {
      "id": "shortbow",
      "name": "Shortbow",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 60,
        "wood": 12
      },
      "stats": {
        "attack": 5,
        "speed": 2
      },
      "image": "/images/items/shortbow.png",
      "description": "+5 Attack, +2 Speed"
    },
    {
      "id": "apprentice_staff",
      "name": "Apprentice Staff",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 70,
        "wood": 15
      },
      "stats": {
        "magicPower": 8
      },
      "image": "/images/items/apprentice_staff.png",
      "description": "+8 Magic Power"
    },
    {
      "id": "archon_staff",
      "name": "Archon Staff",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 130,
        "wood": 30
      },
      "stats": {
        "magicPower": 14,
        "mana": 10
      },
      "image": "/images/items/archon_staff.png",
      "description": "+14 Magic Power, +10 Mana"
    },
    {
      "id": "dagger",
      "name": "Dagger",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 55,
        "wood": 10
      },
      "stats": {
        "attack": 5,
        "speed": 2
      },
      "image": "/images/items/dagger.png",
      "description": "+5 Attack, +2 Speed"
    },
    {
      "id": "poison_dagger",
      "name": "Poison Dagger",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 65,
        "wood": 12
      },
      "stats": {
        "attack": 7
      },
      "image": "/images/items/poison_dagger.png",
      "description": "+7 Attack"
    },
    {
      "id": "mace",
      "name": "Mace",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 70,
        "wood": 15
      },
      "stats": {
        "attack": 6,
        "magicPower": 3
      },
      "image": "/images/items/mace.png",
      "description": "+6 Attack, +3 Magic Power"
    },
    {
      "id": "holy_sword",
      "name": "Holy Sword",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 120,
        "wood": 25
      },
      "stats": {
        "attack": 8,
        "magicPower": 5
      },
      "image": "/images/items/holy_sword.png",
      "description": "+8 Attack, +5 Magic Power"
    },
    {
      "id": "kris_blade",
      "name": "Kris Blade",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 115,
        "wood": 22
      },
      "stats": {
        "attack": 10
      },
      "image": "/images/items/kris_blade.png",
      "description": "+10 Attack"
    },
    {
      "id": "whisper_blade",
      "name": "Whisper Blade",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 125,
        "wood": 25
      },
      "stats": {
        "attack": 8,
        "speed": 2
      },
      "image": "/images/items/whisper_blade.png",
      "description": "+8 Attack, +2 Speed"
    },
    {
      "id": "scepter",
      "name": "Scepter",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 110,
        "wood": 20
      },
      "stats": {
        "magicPower": 10,
        "healPower": 2
      },
      "image": "/images/items/scepter.png",
      "description": "+10 Magic Power, +2 Heal Power"
    },
    {
      "id": "cleric_staff",
      "name": "Cleric Staff",
      "slot": "weapon",
      "rarity": "rare",
      "price": {
        "gold": 190,
        "wood": 40
      },
      "stats": {
        "magicPower": 12,
        "healPower": 4
      },
      "image": "/images/items/cleric_staff.png",
      "description": "+12 Magic Power, +4 Heal Power"
    },
    {
      "id": "maul",
      "name": "Maul",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 85,
        "wood": 18
      },
      "stats": {
        "attack": 11,
        "maxHp": 20
      },
      "image": "/images/items/maul.png",
      "description": "+11 Attack, +20 Max HP"
    },
    {
      "id": "bulwark_hammer",
      "name": "Bulwark Hammer",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 130,
        "wood": 28
      },
      "stats": {
        "attack": 8,
        "resistance": 5
      },
      "image": "/images/items/bulwark_hammer.png",
      "description": "+8 Attack, +5 Resistance"
    },
    {
      "id": "stone_ash_sword",
      "name": "Stone Ash Sword",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 60,
        "wood": 10
      },
      "stats": {
        "attack": 8
      },
      "image": "/images/items/stone_ash_sword.png",
      "description": "+8 Attack. A base for temple crafting."
    },
    {
      "id": "hearth_tea",
      "name": "Hearth Tea",
      "slot": "consumable",
      "rarity": "common",
      "price": {
        "gold": 8,
        "wood": 0
      },
      "heal": 40,
      "image": "/images/items/hearth_tea.png",
      "description": "Heals 40 HP when used."
    },
    {
      "id": "field_rations",
      "name": "Field Rations",
      "slot": "consumable",
      "rarity": "common",
      "price": {
        "gold": 10,
        "wood": 0
      },
      "food": 2,
      "image": "/images/items/field_rations.png",
      "description": "+2 Food."
    },
    {
      "id": "fire_essence",
      "name": "Fire Essence",
      "slot": "material",
      "rarity": "common",
      "price": {
        "gold": 40,
        "wood": 0
      },
      "image": "/images/items/fire_essence.png",
      "description": "A spark of bottled flame. Used in crafting."
    },
    {
      "id": "frost_essence",
      "name": "Frost Essence",
      "slot": "material",
      "rarity": "common",
      "price": {
        "gold": 40,
        "wood": 0
      },
      "image": "/images/items/frost_essence.png",
      "description": "Cold condensed to a droplet. Used in crafting."
    },
    {
      "id": "arcane_essence",
      "name": "Arcane Essence",
      "slot": "material",
      "rarity": "common",
      "price": {
        "gold": 40,
        "wood": 0
      },
      "image": "/images/items/arcane_essence.png",
      "description": "Raw magic held in a vial. Used in crafting."
    },
    {
      "id": "shadow_essence",
      "name": "Shadow Essence",
      "slot": "material",
      "rarity": "common",
      "price": {
        "gold": 40,
        "wood": 0
      },
      "image": "/images/items/shadow_essence.png",
      "description": "Light that never arrives. Used in crafting."
    },
    {
      "id": "heart_of_fire",
      "name": "Heart of Fire",
      "slot": "material",
      "rarity": "rare",
      "price": {
        "gold": 150,
        "wood": 0
      },
      "image": "/images/items/heart_of_fire.png",
      "description": "The still-burning heart of a fire spirit."
    },
    {
      "id": "golem_heart",
      "name": "Heart of Golem",
      "slot": "material",
      "rarity": "rare",
      "price": {
        "gold": 200,
        "wood": 0
      },
      "image": "/images/items/golem_heart.png",
      "description": "Offer it at the Ancient Temple to mend a lost heart."
    },
    {
      "id": "ancient_relic",
      "name": "Ancient Relic",
      "slot": "material",
      "rarity": "ancient_relic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "image": "/images/items/ancient_relic.png",
      "description": "An artifact older than the kingdom. The temple remembers."
    },
    {
      "id": "fire_ash_sword",
      "name": "Fire Ash Sword",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 12
      },
      "image": "/images/items/fire_ash_sword.png",
      "description": "+12 Attack. Still warm to the touch."
    },
    {
      "id": "molten_cleaver",
      "name": "Molten Cleaver",
      "slot": "weapon",
      "rarity": "rare",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 20
      },
      "image": "/images/items/molten_cleaver.png",
      "description": "+20 Attack. It hums with fire."
    },
    {
      "id": "frost_gladius",
      "name": "Frost Gladius",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 12,
        "resistance": 3
      },
      "image": "/images/items/frost_gladius.png",
      "description": "+12 Attack, +3 Resistance."
    },
    {
      "id": "arcane_rod",
      "name": "Arcane Rod",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "magicPower": 14,
        "mana": 10
      },
      "image": "/images/items/arcane_rod.png",
      "description": "+14 Magic Power, +10 Mana."
    },
    {
      "id": "shadow_knife",
      "name": "Shadow Knife",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 11,
        "speed": 2
      },
      "image": "/images/items/shadow_knife.png",
      "description": "+11 Attack, +2 Speed."
    },
    {
      "id": "ember_sword",
      "name": "Ember Sword",
      "slot": "weapon",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 18
      },
      "image": "/images/items/ember_sword.png",
      "description": "+18 Attack. Found only in the deep ruins."
    },
    {
      "id": "phoenix_staff",
      "name": "Phoenix Staff",
      "slot": "weapon",
      "rarity": "legendary",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "magicPower": 22,
        "healPower": 6
      },
      "image": "/images/items/phoenix_staff.png",
      "description": "+22 Magic Power, +6 Heal Power."
    },
    {
      "id": "void_cleaver",
      "name": "Void Cleaver",
      "slot": "weapon",
      "rarity": "mythic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 30
      },
      "image": "/images/items/void_cleaver.png",
      "description": "+30 Attack. The edge drinks the dark."
    }
  ],
  "equipmentSlots": [
    {
      "id": "weapon",
      "label": "Weapon"
    },
    {
      "id": "head",
      "label": "Helmet"
    },
    {
      "id": "armor",
      "label": "Armor"
    },
    {
      "id": "legs",
      "label": "Pants"
    },
    {
      "id": "boots",
      "label": "Boots"
    },
    {
      "id": "amulet",
      "label": "Amulet"
    },
    {
      "id": "ring1",
      "label": "Ring 1",
      "ring": true
    },
    {
      "id": "ring2",
      "label": "Ring 2",
      "ring": true
    }
  ],
  "monsters": [
    {
      "id": "slime",
      "name": "Slime",
      "hp": 40,
      "attack": 10,
      "speed": 4,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/slime.png"
    },
    {
      "id": "goblin",
      "name": "Goblin",
      "hp": 60,
      "attack": 14,
      "speed": 8,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/goblin.png"
    },
    {
      "id": "giant_rat",
      "name": "Giant Rat",
      "hp": 45,
      "attack": 12,
      "speed": 9,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/giant_rat.png"
    },
    {
      "id": "cave_bat",
      "name": "Cave Bat",
      "hp": 35,
      "attack": 11,
      "speed": 14,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/cave_bat.png"
    },
    {
      "id": "wolf",
      "name": "Wolf",
      "hp": 70,
      "attack": 15,
      "speed": 11,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/wolf.png"
    },
    {
      "id": "bandit",
      "name": "Bandit",
      "hp": 65,
      "attack": 16,
      "speed": 9,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/bandit.png"
    },
    {
      "id": "spider",
      "name": "Spider",
      "hp": 50,
      "attack": 13,
      "speed": 10,
      "rarity": "common",
      "element": "shadow",
      "image": "/images/monsters/spider.png"
    },
    {
      "id": "wild_boar",
      "name": "Wild Boar",
      "hp": 80,
      "attack": 17,
      "speed": 7,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/wild_boar.png"
    },
    {
      "id": "goblin_archer",
      "name": "Goblin Archer",
      "hp": 55,
      "attack": 16,
      "speed": 10,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/goblin_archer.png"
    },
    {
      "id": "rat_king",
      "name": "Rat King",
      "hp": 90,
      "attack": 14,
      "speed": 12,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/rat_king.png"
    },
    {
      "id": "grove_sprite",
      "name": "Grove Sprite",
      "hp": 80,
      "attack": 12,
      "speed": 10,
      "rarity": "uncommon",
      "element": "arcane",
      "image": "/images/monsters/grove_sprite.png"
    },
    {
      "id": "goblin_warrior",
      "name": "Goblin Warrior",
      "hp": 100,
      "attack": 19,
      "speed": 8,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/goblin_warrior.png"
    },
    {
      "id": "skeleton",
      "name": "Skeleton",
      "hp": 95,
      "attack": 20,
      "speed": 7,
      "rarity": "uncommon",
      "element": "shadow",
      "image": "/images/monsters/skeleton.png"
    },
    {
      "id": "dire_wolf",
      "name": "Dire Wolf",
      "hp": 110,
      "attack": 21,
      "speed": 12,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/dire_wolf.png"
    },
    {
      "id": "harpy",
      "name": "Harpy",
      "hp": 85,
      "attack": 18,
      "speed": 15,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/harpy.png"
    },
    {
      "id": "orc",
      "name": "Orc",
      "hp": 140,
      "attack": 22,
      "speed": 6,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/orc.png"
    },
    {
      "id": "thorn_viper",
      "name": "Thorn Viper",
      "hp": 75,
      "attack": 19,
      "speed": 13,
      "rarity": "uncommon",
      "element": "shadow",
      "image": "/images/monsters/thorn_viper.png"
    },
    {
      "id": "swamp_troll",
      "name": "Swamp Troll",
      "hp": 160,
      "attack": 20,
      "speed": 4,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/swamp_troll.png"
    },
    {
      "id": "griffin",
      "name": "Griffin",
      "hp": 150,
      "attack": 23,
      "speed": 11,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/griffin.png"
    },
    {
      "id": "golem",
      "name": "Golem",
      "hp": 300,
      "attack": 30,
      "speed": 3,
      "rarity": "rare",
      "element": "physical",
      "image": "/images/monsters/golem.png"
    },
    {
      "id": "stone_warden",
      "name": "Stone Warden",
      "hp": 220,
      "attack": 22,
      "speed": 4,
      "rarity": "rare",
      "element": "physical",
      "image": "/images/monsters/stone_warden.png"
    },
    {
      "id": "wraith",
      "name": "Wraith",
      "hp": 130,
      "attack": 26,
      "speed": 12,
      "rarity": "rare",
      "element": "shadow",
      "image": "/images/monsters/wraith.png"
    },
    {
      "id": "manticore",
      "name": "Manticore",
      "hp": 180,
      "attack": 28,
      "speed": 10,
      "rarity": "rare",
      "element": "physical",
      "image": "/images/monsters/manticore.png"
    },
    {
      "id": "ogre",
      "name": "Ogre",
      "hp": 250,
      "attack": 29,
      "speed": 5,
      "rarity": "rare",
      "element": "physical",
      "image": "/images/monsters/ogre.png"
    },
    {
      "id": "dark_knight",
      "name": "Dark Knight",
      "hp": 200,
      "attack": 30,
      "speed": 9,
      "rarity": "rare",
      "element": "shadow",
      "image": "/images/monsters/dark_knight.png"
    },
    {
      "id": "witch",
      "name": "Witch",
      "hp": 140,
      "attack": 27,
      "speed": 8,
      "rarity": "rare",
      "element": "arcane",
      "image": "/images/monsters/witch.png"
    },
    {
      "id": "wyvern",
      "name": "Wyvern",
      "hp": 260,
      "attack": 34,
      "speed": 12,
      "rarity": "epic",
      "element": "arcane",
      "image": "/images/monsters/wyvern.png"
    },
    {
      "id": "ancient_golem",
      "name": "Ancient Golem",
      "hp": 400,
      "attack": 35,
      "speed": 3,
      "rarity": "epic",
      "element": "physical",
      "image": "/images/monsters/ancient_golem.png"
    },
    {
      "id": "lich",
      "name": "Lich",
      "hp": 240,
      "attack": 36,
      "speed": 8,
      "rarity": "legendary",
      "element": "shadow",
      "image": "/images/monsters/lich.png"
    },
    {
      "id": "hydra",
      "name": "Hydra",
      "hp": 340,
      "attack": 32,
      "speed": 6,
      "rarity": "mythic",
      "element": "physical",
      "image": "/images/monsters/hydra.png"
    }
  ],
  "skills": [
    {
      "id": "heavy_strike",
      "name": "Heavy Strike",
      "target": "enemy",
      "mana": 6,
      "power": 1.6,
      "element": "physical",
      "effect": "heavy",
      "image": "/images/skills/heavy_strike.png",
      "description": "Deals 1.6× attack damage."
    },
    {
      "id": "defend",
      "name": "Defend",
      "target": "self",
      "mana": 4,
      "defense": 0.5,
      "image": "/images/skills/defend.png",
      "description": "Block 50% of incoming damage this round."
    },
    {
      "id": "arcane_barrage",
      "name": "Arcane Barrage",
      "target": "enemy",
      "mana": 8,
      "power": 1.9,
      "element": "arcane",
      "image": "/images/skills/arcane_barrage.png",
      "description": "Deals 1.9× magic damage."
    },
    {
      "id": "mana_shield",
      "name": "Mana Shield",
      "target": "self",
      "mana": 6,
      "defense": 0.55,
      "image": "/images/skills/mana_shield.png",
      "description": "Block 55% of incoming damage this round."
    },
    {
      "id": "aimed_shot",
      "name": "Aimed Shot",
      "target": "enemy",
      "mana": 10,
      "power": 2,
      "element": "physical",
      "image": "/images/skills/aimed_shot.png",
      "description": "Deals 2× attack damage."
    },
    {
      "id": "piercing_shot",
      "name": "Piercing Shot",
      "target": "enemy",
      "mana": 5,
      "power": 1.3,
      "element": "physical",
      "image": "/images/skills/piercing_shot.png",
      "description": "Deals 1.3× attack damage."
    },
    {
      "id": "vampiric_strike",
      "name": "Vampiric Strike",
      "target": "enemy",
      "mana": 9,
      "power": 2,
      "lifesteal": 0.5,
      "element": "shadow",
      "effect": "shadow",
      "image": "/images/skills/vampiric_strike.png",
      "description": "Deals 2× attack damage and heals for half the damage dealt."
    },
    {
      "id": "shadow_meld",
      "name": "Shadow Meld",
      "target": "self",
      "mana": 5,
      "defense": 0.5,
      "image": "/images/skills/shadow_meld.png",
      "description": "Block 50% of incoming damage this round."
    },
    {
      "id": "holy_strike",
      "name": "Holy Strike",
      "target": "enemy",
      "mana": 7,
      "power": 1.5,
      "element": "holy",
      "image": "/images/skills/holy_strike.png",
      "description": "Deals 1.5× attack damage."
    },
    {
      "id": "divine_guard",
      "name": "Divine Guard",
      "target": "self",
      "mana": 6,
      "defense": 0.6,
      "image": "/images/skills/divine_guard.png",
      "description": "Block 60% of incoming damage this round."
    },
    {
      "id": "execute",
      "name": "Execute",
      "target": "enemy",
      "mana": 12,
      "power": 2.5,
      "element": "shadow",
      "effect": "shadow",
      "image": "/images/skills/execute.png",
      "description": "Deals 2.5× attack damage."
    },
    {
      "id": "shadow_step",
      "name": "Shadow Step",
      "target": "self",
      "mana": 5,
      "defense": 0.5,
      "image": "/images/skills/shadow_step.png",
      "description": "Block 50% of incoming damage this round."
    },
    {
      "id": "mend",
      "name": "Mend",
      "target": "ally",
      "mana": 8,
      "heal": 0.35,
      "image": "/images/skills/mend.png",
      "description": "Restore 35% of an ally's max HP."
    },
    {
      "id": "greater_mend",
      "name": "Greater Mend",
      "target": "ally",
      "mana": 14,
      "heal": 0.55,
      "image": "/images/skills/greater_mend.png",
      "description": "Restore 55% of an ally's max HP."
    },
    {
      "id": "fortify",
      "name": "Fortify",
      "target": "self",
      "mana": 6,
      "defense": 0.6,
      "image": "/images/skills/fortify.png",
      "description": "Block 60% of incoming damage this round."
    },
    {
      "id": "war_banner",
      "name": "War Banner",
      "target": "self",
      "mana": 5,
      "defense": 0.5,
      "image": "/images/skills/war_banner.png",
      "description": "Block 50% of incoming damage this round."
    },
    {
      "id": "cleave",
      "name": "Cleave",
      "target": "enemy",
      "mana": 7,
      "power": 1.5,
      "element": "physical",
      "effect": "axe",
      "image": "/images/skills/cleave.png",
      "description": "Deals 1.5× attack damage."
    },
    {
      "id": "shield_wall",
      "name": "Shield Wall",
      "target": "self",
      "mana": 7,
      "defense": 0.7,
      "image": "/images/skills/shield_wall.png",
      "description": "Block 70% of incoming damage this round."
    },
    {
      "id": "spirit_surge",
      "name": "Spirit Surge",
      "target": "party",
      "mana": 6,
      "manaRestorePct": 0.3,
      "image": "/images/skills/spirit_surge.png",
      "description": "Restore 30% of each ally's max mana."
    },
    {
      "id": "war_cry",
      "name": "War Cry",
      "target": "enemy",
      "mana": 10,
      "power": 2.6,
      "element": "physical",
      "effect": "heavy",
      "image": "/images/skills/war_cry.png",
      "description": "Deals 2.6× attack damage."
    },
    {
      "id": "volley",
      "name": "Volley",
      "target": "enemy",
      "mana": 12,
      "power": 2.4,
      "element": "physical",
      "image": "/images/skills/volley.png",
      "description": "Deals 2.4× attack damage."
    },
    {
      "id": "meteor",
      "name": "Meteor",
      "target": "enemy",
      "mana": 14,
      "power": 2.8,
      "element": "arcane",
      "effect": "heavy",
      "image": "/images/skills/meteor.png",
      "description": "Deals 2.8× magic damage."
    },
    {
      "id": "shadow_veil",
      "name": "Shadow Veil",
      "target": "enemy",
      "mana": 10,
      "power": 2.6,
      "lifesteal": 0.4,
      "element": "shadow",
      "effect": "shadow",
      "image": "/images/skills/shadow_veil.png",
      "description": "Deals 2.6× attack damage and heals for 40% of the damage dealt."
    },
    {
      "id": "holy_judgement",
      "name": "Holy Judgement",
      "target": "enemy",
      "mana": 10,
      "power": 2.2,
      "healSelfPct": 0.4,
      "element": "holy",
      "image": "/images/skills/holy_judgement.png",
      "description": "Deals 2.2× holy damage and restores 40% of your max HP."
    },
    {
      "id": "death_mark",
      "name": "Death Mark",
      "target": "enemy",
      "mana": 14,
      "power": 3,
      "element": "shadow",
      "effect": "shadow",
      "image": "/images/skills/death_mark.png",
      "description": "Deals 3× attack damage."
    },
    {
      "id": "divine_blessing",
      "name": "Divine Blessing",
      "target": "party",
      "mana": 16,
      "heal": 0.45,
      "image": "/images/skills/divine_blessing.png",
      "description": "Restore 45% of each ally's max HP."
    },
    {
      "id": "bastion",
      "name": "Bastion",
      "target": "self",
      "mana": 8,
      "defense": 0.85,
      "image": "/images/skills/bastion.png",
      "description": "Block 85% of incoming damage this round."
    },
    {
      "id": "cataclysm",
      "name": "Cataclysm",
      "target": "enemy",
      "mana": 16,
      "power": 3,
      "element": "physical",
      "effect": "heavy",
      "image": "/images/skills/cataclysm.png",
      "description": "Deals 3× attack damage."
    },
    {
      "id": "storm_barrage",
      "name": "Storm Barrage",
      "target": "enemy",
      "mana": 15,
      "power": 2.9,
      "element": "physical",
      "image": "/images/skills/storm_barrage.png",
      "description": "Deals 2.9× attack damage."
    },
    {
      "id": "comet",
      "name": "Comet",
      "target": "enemy",
      "mana": 18,
      "power": 3.2,
      "element": "arcane",
      "effect": "heavy",
      "image": "/images/skills/comet.png",
      "description": "Deals 3.2× magic damage."
    },
    {
      "id": "soul_thief",
      "name": "Soul Thief",
      "target": "enemy",
      "mana": 14,
      "power": 3,
      "lifesteal": 0.5,
      "element": "shadow",
      "effect": "shadow",
      "image": "/images/skills/soul_thief.png",
      "description": "Deals 3× attack damage and heals for half the damage dealt."
    },
    {
      "id": "radiance",
      "name": "Radiance",
      "target": "enemy",
      "mana": 14,
      "power": 2.5,
      "healSelfPct": 0.6,
      "element": "holy",
      "image": "/images/skills/radiance.png",
      "description": "Deals 2.5× holy damage and restores 60% of your max HP."
    },
    {
      "id": "soul_reap",
      "name": "Soul Reap",
      "target": "enemy",
      "mana": 18,
      "power": 3.4,
      "element": "shadow",
      "effect": "shadow",
      "image": "/images/skills/soul_reap.png",
      "description": "Deals 3.4× attack damage."
    },
    {
      "id": "resurgence",
      "name": "Resurgence",
      "target": "party",
      "mana": 20,
      "heal": 0.6,
      "manaRestorePct": 0.2,
      "image": "/images/skills/resurgence.png",
      "description": "Restore 60% of each ally's max HP and 20% of their max mana."
    },
    {
      "id": "immovable",
      "name": "Immovable",
      "target": "self",
      "mana": 10,
      "defense": 0.95,
      "image": "/images/skills/immovable.png",
      "description": "Block 95% of incoming damage this round."
    }
  ]
};

function getClass(slug) {
  return CONTENT.classes.find((c) => c.slug === slug) || null;
}

function getDungeon(rank) {
  return CONTENT.dungeons.find((d) => d.rank === String(rank).toLowerCase()) || null;
}

function publicCatalog() {
  const evolutions = CONTENT.classes
    .filter((c) => c.evolution)
    .map((c) => {
      const evolved = getClass(c.evolution.to);
      const skill = evolved ? getSkill(evolved.startingSkills && evolved.startingSkills[0]) : null;
      const bonus = evolved && evolved.evolveBonus ? evolved.evolveBonus : {};
      const bonusText = Object.entries(bonus)
        .map(([k, v]) => `${statLabel(k)} +${v}`)
        .join(" · ");
      return {
        from: c.slug,
        to: { slug: evolved ? evolved.slug : c.evolution.to, label: evolved ? evolved.label : c.evolution.to, image: evolved ? evolved.image : "" },
        level: c.evolution.level || 20,
        skill: skill ? { name: skill.name, description: skill.description || "", mana: skill.mana, image: skill.image } : null,
        bonusText,
      };
    });

  return {
    baseSkills: CONTENT.baseSkills,
    story: CONTENT.story,
    classes: CONTENT.classes.map((c) => ({
      slug: c.slug,
      label: c.label,
      image: c.image,
      baseClass: c.baseClass || null,
      basicAttack: c.basicAttack,
      skills: c.startingSkills || [],
      manaRegen: c.manaRegen || 0,
    })),
    images: CONTENT.images,
    town: {
      search: { stamina: CONTENT.town.search.stamina },
      blacksmith: { stamina: CONTENT.town.blacksmith.stamina },
      tavern: {
        stamina: CONTENT.town.tavern.stamina,
        bets: CONTENT.town.tavern.bets,
        provisions: CONTENT.town.tavern.provisions,
      },
      rest: { stamina: CONTENT.town.rest.stamina },
      temple: { stamina: CONTENT.town.temple.stamina },
    },
    temple: {
      restore: CONTENT.temple.restore,
      recipes: CONTENT.temple.recipes,
      evolutions,
      maxLives: CONTENT.starting.lives,
    },
    effects: CONTENT.effects,
    food: CONTENT.food,
    loot: {
      rarityOrder: CONTENT.loot.rarityOrder,
      rarityMeta: CONTENT.loot.rarityMeta,
      buyable: CONTENT.loot.buyable,
      dropChance: CONTENT.loot.dropChance,
      gradeWeights: CONTENT.loot.gradeWeights,
    },
    sizes: CONTENT.dungeonSizes.map((s) => ({ id: s.id, label: s.label, stamina: s.stamina })),
    dungeons: CONTENT.dungeons.map((d) => ({
      rank: d.rank,
      label: d.label,
      image: d.image,
      monsterPool: d.monsterPool || [],
    })),
    
    bosses: (CONTENT.bosses || []).map((b) => ({
      id: b.id,
      name: b.name,
      title: b.title,
      minLevel: b.minLevel,
      recommendedLevel: b.recommendedLevel,
      image: b.image,
      hp: b.hp,
      attack: b.attack,
      resistance: b.resistance,
      magicPower: b.magicPower,
      speed: b.speed,
      element: b.element,
      skills: b.skills || [],
      description: b.description,
      rewards: b.rewards || {},
      position: b.position || { x: 50, y: 50 }
    })),

    skills: CONTENT.skills.map((s) => ({
      id: s.id,
      name: s.name,
      target: s.target,
      power: s.power,
      heal: s.heal,
      defense: s.defense,
      lifesteal: s.lifesteal,
      manaRestore: s.manaRestore,
      manaRestorePct: s.manaRestorePct,
      healSelfPct: s.healSelfPct,
      element: s.element,
      mana: s.mana,
      image: s.image,
      description: s.description || "",
    })),
    items: CONTENT.items.map((i) => ({
      id: i.id,
      name: i.name,
      slot: i.slot,
      rarity: i.rarity || "common",
      price: i.price,
      stats: i.stats || {},
      heal: i.heal,
      food: i.food,
      image: i.image,
      description: i.description || "",
    })),
    equipmentSlots: CONTENT.equipmentSlots,
    monsters: CONTENT.monsters.map((m) => ({ id: m.id, name: m.name, image: m.image, rarity: m.rarity || "common" })),
    anomalyFrameColors: Object.fromEntries(
      CONTENT.anomalies.traits.map((t) => [t.id, t.frameColor])
    ),
  };
}

function statLabel(key) {
  const map = { maxHp: "Max HP", attack: "Attack", mana: "Mana", manaRegen: "Mana Regen", resistance: "Resistance", magicPower: "Magic Power", healPower: "Heal Power", speed: "Speed" };
  return map[key] || key;
}

function getSkill(id) {
  return CONTENT.skills.find((s) => s.id === id) || null;
}

function getItem(id) {
  return CONTENT.items.find((i) => i.id === id) || null;
}

function getClassBasicAttack(slug) {
  const c = getClass(slug);
  return (c && c.basicAttack) || null;
}

function getMonster(id) {
  return CONTENT.monsters.find((m) => m.id === id) || null;
}

function getDungeonSize(id) {
  return CONTENT.dungeonSizes.find((s) => s.id === id) || null;
}

module.exports = {
  CONTENT,
  getClass,
  getClassBasicAttack,
  getDungeon,
  getDungeonSize,
  getSkill,
  getItem,
  getMonster,
  publicCatalog,
};
