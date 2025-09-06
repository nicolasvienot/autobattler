import type {
  BattleState,
  ItemDef,
  RuntimeUnit,
  TeamId,
  UnitDef,
  UnitInstance,
  Position,
} from "./types";
import { unitsById } from "./data/units";
import { itemsById } from "./data/items";

let __spawnCounter = 0;

export function getUnitDef(id: string): UnitDef {
  const u = unitsById[id];
  if (!u) throw new Error("Unknown unit id " + id);
  return structuredClone(u);
}

export function getItemDef(id: string): ItemDef {
  const it = itemsById[id];
  if (!it) throw new Error("Unknown item id " + id);
  return structuredClone(it);
}

export function spawnUnitInstance(
  team: TeamId,
  unitId: string,
  level: 1 | 2 | 3,
  pos: Position,
  itemIds: string[]
): RuntimeUnit {
  const def = getUnitDef(unitId);
  const baseHp = def.base.hp;
  const baseAtk = def.base.atk;
  return {
    uid: `${team}-${unitId}-${pos.row}${pos.col}-${__spawnCounter++}`,
    team,
    def,
    level,
    pos,
    atk: baseAtk,
    hp: baseHp,
    baseHp,
    baseAtk,
    speed: def.base.speed ?? 1,
    alive: true,
    statuses: {},
    items: itemIds.map(getItemDef),
  };
}

export function makeBattle(
  seed: string,
  teamA: UnitInstance[],
  teamB: UnitInstance[]
): BattleState {
  // Reset spawn counter for each battle to ensure deterministic UIDs
  __spawnCounter = 0;

  const teams: Record<TeamId, { id: TeamId; units: RuntimeUnit[] }> = {
    A: { id: "A", units: [] },
    B: { id: "B", units: [] },
  };
  const add = (inst: UnitInstance) => {
    const u = spawnUnitInstance(
      inst.team,
      inst.defId,
      inst.level,
      inst.pos,
      inst.itemIds ?? []
    );
    teams[inst.team].units.push(u);
  };
  for (const u of teamA) add(u);
  for (const u of teamB) add(u);
  const state: BattleState = {
    seed,
    turn: 0,
    teams: teams as any,
    log: [{ t: "start" }],
  };
  for (const t of ["A", "B"] as const) {
    for (const u of teams[t].units) {
      state.log.push({
        t: "spawn",
        unit: u.uid,
        team: u.team,
        row: u.pos.row,
        col: u.pos.col,
      });
    }
  }
  return state;
}
