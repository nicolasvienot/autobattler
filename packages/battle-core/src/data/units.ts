import type { UnitDef } from "../types";

export const units: UnitDef[] = [
  {
    id: "wolf_pup",
    name: "Wolf pup",
    tier: 1,
    tribe: ["Beast"],
    base: { hp: 3, atk: 2 },
    ability: {
      trigger: "onStart",
      effects: [{ kind: "buff", target: "self", atk: 1 }],
    },
  },
  {
    id: "shield_rat",
    name: "Shield rat",
    tier: 1,
    tribe: ["Beast", "Guardian"],
    base: { hp: 3, atk: 1 },
    ability: {
      trigger: "onStart",
      effects: [{ kind: "shield", target: "allyFront", amount: 2 }],
    },
  },
  {
    id: "spark_bot",
    name: "Spark bot",
    tier: 1,
    tribe: ["Mech"],
    base: { hp: 3, atk: 2 },
    ability: {
      trigger: "onAttack",
      effects: [{ kind: "status", target: "self", status: "chain", amount: 1 }],
    },
  },
  {
    id: "bone_archer",
    name: "Bone archer",
    tier: 1,
    tribe: ["Undead"],
    base: { hp: 2, atk: 3 },
    ability: {
      trigger: "onFaint",
      effects: [{ kind: "damage", target: "enemyFront", amount: 2 }],
    },
  },
  {
    id: "apprentice",
    name: "Apprentice",
    tier: 1,
    tribe: ["Mage"],
    base: { hp: 2, atk: 2 },
    ability: {
      trigger: "onStart",
      effects: [{ kind: "buff", target: "allyRandom", atk: 1 }],
    },
  },
  {
    id: "berserker",
    name: "Berserker",
    tier: 2,
    tribe: ["Beast"],
    base: { hp: 4, atk: 3 },
    ability: {
      trigger: "onHurt",
      effects: [{ kind: "buff", target: "self", atk: 1 }],
    },
  },
  {
    id: "cleric",
    name: "Cleric",
    tier: 2,
    tribe: ["Guardian", "Mage"],
    base: { hp: 3, atk: 2 },
    ability: {
      trigger: "onAttack",
      effects: [{ kind: "heal", target: "allyLowestHP", amount: 2 }],
    },
  },
  {
    id: "venom_frog",
    name: "Venom frog",
    tier: 2,
    tribe: ["Beast"],
    base: { hp: 3, atk: 2 },
    ability: {
      trigger: "onAttack",
      effects: [
        { kind: "status", target: "enemyFront", status: "poison", amount: 1 },
      ],
    },
  },
  {
    id: "steel_beetle",
    name: "Steel beetle",
    tier: 2,
    tribe: ["Mech", "Guardian"],
    base: { hp: 4, atk: 2 },
    ability: {
      trigger: "onStart",
      effects: [{ kind: "shield", target: "self", amount: 3 }],
    },
  },
  {
    id: "ranger",
    name: "Ranger",
    tier: 2,
    tribe: [],
    base: { hp: 3, atk: 3 },
    ability: {
      trigger: "onAttack",
      effects: [{ kind: "damage", target: "enemyBack", amount: 1 }],
    },
  },
  {
    id: "necromancer",
    name: "Necromancer",
    tier: 3,
    tribe: ["Undead", "Mage"],
    base: { hp: 3, atk: 1 },
    ability: {
      trigger: "onFaint",
      effects: [
        {
          kind: "summon",
          target: "self",
          unitId: "skeleton",
          count: 1,
          position: "front",
        },
      ] as any,
    },
  },
  {
    id: "golem",
    name: "Golem",
    tier: 3,
    tribe: ["Mech", "Guardian"],
    base: { hp: 6, atk: 2 },
    ability: {
      trigger: "onHurt",
      effects: [{ kind: "shield", target: "self", amount: 2 }],
    },
  },
  {
    id: "assassin",
    name: "Assassin",
    tier: 3,
    tribe: [],
    base: { hp: 2, atk: 4 },
    ability: {
      trigger: "onAttack",
      effects: [{ kind: "damage", target: "enemyBack", amount: 2 }],
    },
  },
  {
    id: "banner_captain",
    name: "Banner captain",
    tier: 3,
    tribe: ["Guardian"],
    base: { hp: 3, atk: 2 },
    ability: {
      trigger: "onStart",
      effects: [{ kind: "buff", target: "allAllies", atk: 1 }],
    },
  },
  {
    id: "pyromancer",
    name: "Pyromancer",
    tier: 4,
    tribe: ["Mage"],
    base: { hp: 3, atk: 3 },
    ability: {
      trigger: "onAttack",
      effects: [{ kind: "damage", target: "allEnemies", amount: 1 }],
    },
  },
  {
    id: "tortoise",
    name: "Tortoise",
    tier: 4,
    tribe: ["Beast", "Guardian"],
    base: { hp: 5, atk: 1 },
    ability: {
      trigger: "onStart",
      effects: [{ kind: "shield", target: "allAllies", amount: 2 }],
    },
  },
  {
    id: "warlock",
    name: "Warlock",
    tier: 4,
    tribe: ["Mage", "Undead"],
    base: { hp: 3, atk: 3 },
    ability: {
      trigger: "onStart",
      effects: [
        {
          kind: "status",
          target: "self",
          status: "lifestealPct",
          amount: 0.5 as any,
        },
      ],
    },
  },
  {
    id: "war_golem",
    name: "War golem",
    tier: 4,
    tribe: ["Mech"],
    base: { hp: 6, atk: 3 },
    ability: {
      trigger: "onStart",
      effects: [{ kind: "buff", target: "allAllies", atk: 1, hp: 1 }],
    },
  },
  {
    id: "phoenix",
    name: "Phoenix",
    tier: 5,
    tribe: ["Mage", "Beast"],
    base: { hp: 4, atk: 4 },
    ability: {
      trigger: "onFaint",
      effects: [
        {
          kind: "status",
          target: "self",
          status: "revivePct",
          amount: 0.5 as any,
        },
      ],
    },
  },
  {
    id: "skeleton",
    name: "Skeleton",
    tier: 1,
    tribe: ["Undead"],
    base: { hp: 1, atk: 1 },
  },
];

export const unitsById: Record<string, UnitDef> = Object.fromEntries(
  units.map((u) => [u.id, u])
);
