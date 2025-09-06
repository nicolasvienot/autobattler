import { makeBattle } from "./factory";
import { teamPresets } from "./data/teams";
import type { UnitInstance } from "./types";
import { simulate } from "./engine";

function toInstances(
  preset: (typeof teamPresets)[number],
  team: "A" | "B"
): UnitInstance[] {
  return preset.members.map((m) => ({
    uid: "",
    team,
    defId: m.defId,
    level: m.level,
    pos: { row: m.row, col: m.col },
    itemIds: m.itemIds ?? [],
  })) as any;
}

const seed = "demo-001";
const A = toInstances(teamPresets[0], "A");
const B = toInstances(teamPresets[1], "B");
const state = makeBattle(seed, A, B);
const result = simulate(state);
console.log("winner:", result.log[result.log.length - 1]);
console.log("last 10 events:", result.log.slice(-10));
