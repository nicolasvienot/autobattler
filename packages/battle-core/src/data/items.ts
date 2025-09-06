import type { ItemDef } from "../types";

export const items: ItemDef[] = [
  {
    id: "apple",
    name: "Apple",
    description: "Buff: +1/+1 this battle",
    ability: {
      trigger: "onStart",
      effects: [{ kind: "buff", target: "self", atk: 1, hp: 1 }],
    },
  },
  {
    id: "armor_plate",
    name: "Armor plate",
    description: "Gain shield(3)",
    ability: {
      trigger: "onStart",
      effects: [{ kind: "shield", target: "self", amount: 3 }],
    },
  },
  {
    id: "venom_vial",
    name: "Venom vial",
    description: "Next hits apply poison(1)",
    ability: {
      trigger: "onStart",
      effects: [
        { kind: "status", target: "self", status: "poisonOnHit", amount: 1 },
      ],
    },
  },
  {
    id: "spikes",
    name: "Spikes",
    description: "Thorns(1)",
    ability: {
      trigger: "onStart",
      effects: [
        { kind: "status", target: "self", status: "thorns", amount: 1 },
      ],
    },
  },
  {
    id: "war_banner",
    name: "War banner",
    description: "+1 atk to all allies",
    ability: {
      trigger: "onStart",
      effects: [{ kind: "buff", target: "allAllies", atk: 1 }],
    },
  },
  {
    id: "quick_glove",
    name: "Quick glove",
    description: "+1 attack bonus damage",
    ability: {
      trigger: "onStart",
      effects: [
        { kind: "status", target: "self", status: "attackBonus", amount: 1 },
      ],
    },
  },
  {
    id: "leech_fang",
    name: "Leech fang",
    description: "Lifesteal 30%",
    ability: {
      trigger: "onStart",
      effects: [
        {
          kind: "status",
          target: "self",
          status: "lifestealPct",
          amount: 0.3 as any,
        },
      ],
    },
  },
  {
    id: "storm_rod",
    name: "Storm rod",
    description: "Chain(1) on attack",
    ability: {
      trigger: "onStart",
      effects: [{ kind: "status", target: "self", status: "chain", amount: 1 }],
    },
  },
  {
    id: "summon_charm",
    name: "Summon charm",
    description: "On faint, summon a Skeleton",
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
    id: "healer_kit",
    name: "Healer kit",
    description: "Heal self 1 on attack",
    ability: {
      trigger: "onAttack",
      effects: [
        { kind: "status", target: "self", status: "onAttackHeal", amount: 1 },
      ],
    },
  },
  {
    id: "guardian_oil",
    name: "Guardian oil",
    description: "Shield 1 to ally front",
    ability: {
      trigger: "onStart",
      effects: [{ kind: "shield", target: "allyFront", amount: 1 }],
    },
  },
  {
    id: "arcane_focus",
    name: "Arcane focus",
    description: "Empower: +1 atk",
    ability: {
      trigger: "onStart",
      effects: [{ kind: "buff", target: "self", atk: 1 }],
    },
  },
];

export const itemsById: Record<string, ItemDef> = Object.fromEntries(
  items.map((i) => [i.id, i])
);
