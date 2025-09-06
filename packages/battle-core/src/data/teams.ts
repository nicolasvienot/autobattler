import type { Position } from "../types";

export type TeamPreset = {
  name: string;
  members: {
    defId: string;
    level: 1 | 2 | 3;
    row: 0 | 1;
    col: number;
    itemIds?: string[];
  }[];
};

export const teamPresets: TeamPreset[] = [
  {
    name: "beast brigade",
    members: [
      { defId: "shield_rat", level: 1, row: 0, col: 0 },
      { defId: "berserker", level: 1, row: 0, col: 1 },
      { defId: "venom_frog", level: 1, row: 0, col: 2 },
      { defId: "wolf_pup", level: 1, row: 1, col: 0 },
      { defId: "tortoise", level: 1, row: 1, col: 1 },
      { defId: "banner_captain", level: 1, row: 1, col: 2 },
      { defId: "ranger", level: 1, row: 1, col: 3 },
    ],
  },
  {
    name: "mecha line",
    members: [
      { defId: "steel_beetle", level: 1, row: 0, col: 0 },
      { defId: "golem", level: 1, row: 0, col: 1 },
      { defId: "war_golem", level: 1, row: 0, col: 2 },
      { defId: "spark_bot", level: 1, row: 1, col: 0 },
      { defId: "spark_bot", level: 1, row: 1, col: 1 },
      { defId: "ranger", level: 1, row: 1, col: 2 },
      { defId: "pyromancer", level: 1, row: 1, col: 3 },
    ],
  },
  {
    name: "undead rising",
    members: [
      { defId: "bone_archer", level: 1, row: 0, col: 0 },
      { defId: "necromancer", level: 1, row: 0, col: 1 },
      { defId: "warlock", level: 1, row: 0, col: 2 },
      { defId: "skeleton", level: 1, row: 1, col: 0 },
      { defId: "skeleton", level: 1, row: 1, col: 1 },
      { defId: "banner_captain", level: 1, row: 1, col: 2 },
      { defId: "ranger", level: 1, row: 1, col: 3 },
    ],
  },
  {
    name: "mages only",
    members: [
      { defId: "apprentice", level: 1, row: 0, col: 0 },
      { defId: "pyromancer", level: 1, row: 0, col: 1 },
      { defId: "warlock", level: 1, row: 0, col: 2 },
      { defId: "necromancer", level: 1, row: 1, col: 0 },
      { defId: "apprentice", level: 1, row: 1, col: 1 },
      { defId: "banner_captain", level: 1, row: 1, col: 2 },
      { defId: "ranger", level: 1, row: 1, col: 3 },
    ],
  },
  {
    name: "shields up",
    members: [
      { defId: "steel_beetle", level: 1, row: 0, col: 0 },
      { defId: "tortoise", level: 1, row: 0, col: 1 },
      { defId: "golem", level: 1, row: 0, col: 2 },
      { defId: "shield_rat", level: 1, row: 1, col: 0 },
      { defId: "cleric", level: 1, row: 1, col: 1 },
      { defId: "banner_captain", level: 1, row: 1, col: 2 },
      { defId: "ranger", level: 1, row: 1, col: 3 },
    ],
  },
  {
    name: "ranged pressure",
    members: [
      { defId: "ranger", level: 1, row: 0, col: 0 },
      { defId: "bone_archer", level: 1, row: 0, col: 1 },
      { defId: "pyromancer", level: 1, row: 0, col: 2 },
      { defId: "cleric", level: 1, row: 1, col: 0 },
      { defId: "apprentice", level: 1, row: 1, col: 1 },
      { defId: "banner_captain", level: 1, row: 1, col: 2 },
      { defId: "spark_bot", level: 1, row: 1, col: 3 },
    ],
  },
  {
    name: "assassin strike",
    members: [
      { defId: "assassin", level: 1, row: 0, col: 0 },
      { defId: "assassin", level: 1, row: 0, col: 1 },
      { defId: "ranger", level: 1, row: 0, col: 2 },
      { defId: "wolf_pup", level: 1, row: 1, col: 0 },
      { defId: "cleric", level: 1, row: 1, col: 1 },
      { defId: "banner_captain", level: 1, row: 1, col: 2 },
      { defId: "spark_bot", level: 1, row: 1, col: 3 },
    ],
  },
  {
    name: "balanced seven",
    members: [
      { defId: "shield_rat", level: 1, row: 0, col: 0 },
      { defId: "ranger", level: 1, row: 0, col: 1 },
      { defId: "venom_frog", level: 1, row: 0, col: 2 },
      { defId: "wolf_pup", level: 1, row: 1, col: 0 },
      { defId: "golem", level: 1, row: 1, col: 1 },
      { defId: "banner_captain", level: 1, row: 1, col: 2 },
      { defId: "pyromancer", level: 1, row: 1, col: 3 },
    ],
  },
  {
    name: "phoenix trial",
    members: [
      { defId: "phoenix", level: 1, row: 0, col: 0 },
      { defId: "golem", level: 1, row: 0, col: 1 },
      { defId: "war_golem", level: 1, row: 0, col: 2 },
      { defId: "pyromancer", level: 1, row: 0, col: 3 },
      { defId: "cleric", level: 1, row: 1, col: 0 },
      { defId: "apprentice", level: 1, row: 1, col: 1 },
      { defId: "banner_captain", level: 1, row: 1, col: 2 },
      { defId: "ranger", level: 1, row: 1, col: 3 },
    ],
  },
  {
    name: "starter gauntlet",
    members: [
      { defId: "wolf_pup", level: 1, row: 0, col: 0 },
      { defId: "shield_rat", level: 1, row: 0, col: 1 },
      { defId: "bone_archer", level: 1, row: 0, col: 2 },
      { defId: "apprentice", level: 1, row: 1, col: 0 },
      { defId: "ranger", level: 1, row: 1, col: 1 },
      { defId: "spark_bot", level: 1, row: 1, col: 2 },
      { defId: "steel_beetle", level: 1, row: 1, col: 3 },
    ],
  },
  {
    name: "full army",
    members: [
      { defId: "shield_rat", level: 1, row: 0, col: 0 },
      { defId: "wolf_pup", level: 1, row: 0, col: 1 },
      { defId: "berserker", level: 1, row: 0, col: 2 },
      { defId: "tortoise", level: 1, row: 0, col: 3 },
      { defId: "golem", level: 1, row: 0, col: 4 },
      { defId: "war_golem", level: 1, row: 0, col: 5 },
      { defId: "assassin", level: 1, row: 0, col: 6 },
      { defId: "phoenix", level: 1, row: 0, col: 7 },
      { defId: "ranger", level: 1, row: 1, col: 0 },
      { defId: "bone_archer", level: 1, row: 1, col: 1 },
      { defId: "pyromancer", level: 1, row: 1, col: 2 },
      { defId: "warlock", level: 1, row: 1, col: 3 },
      { defId: "necromancer", level: 1, row: 1, col: 4 },
      { defId: "cleric", level: 1, row: 1, col: 5 },
      { defId: "apprentice", level: 1, row: 1, col: 6 },
      { defId: "banner_captain", level: 1, row: 1, col: 7 },
    ],
  },
];
