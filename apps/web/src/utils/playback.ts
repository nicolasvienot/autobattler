import type {
  BattleLogEvent,
  TeamId,
  UnitDef,
} from "@nico/autobattler-battle-core";

export type VisualUnit = {
  uid: string;
  team: TeamId;
  name: string;
  pos: { row: 0 | 1; col: number };
  hp: number;
  atk: number;
  baseHp: number;
  baseAtk: number;
  alive: boolean;
};

export type VisualState = { units: Map<string, VisualUnit> };

export function emptyVisualState(): VisualState {
  return { units: new Map() };
}

function uidToUnitId(uid: string): string | null {
  const parts = uid.split("-");
  if (parts.length < 3) return null;
  return parts.slice(1, parts.length - 2).join("-");
}

export function applyLogEvent(
  state: VisualState,
  e: BattleLogEvent,
  unitsById: Record<string, UnitDef>
): VisualState {
  const next: VisualState = { units: new Map(state.units) };
  switch (e.t) {
    case "spawn": {
      const unitId = uidToUnitId(e.unit);
      if (!unitId) return next;
      const def = unitsById[unitId];
      if (!def) return next;
      next.units.set(e.unit, {
        uid: e.unit,
        team: e.team,
        name: def.name,
        pos: { row: e.row as 0 | 1, col: e.col },
        hp: def.base.hp,
        atk: def.base.atk,
        baseHp: def.base.hp,
        baseAtk: def.base.atk,
        alive: true,
      });
      break;
    }
    case "damage": {
      const u = next.units.get(e.target);
      if (u) {
        u.hp = Math.max(0, u.hp - e.amount);
      }
      break;
    }
    case "heal": {
      const u = next.units.get(e.target);
      if (u) {
        u.hp = Math.min(u.baseHp, u.hp + e.amount);
      }
      break;
    }
    case "faint": {
      const u = next.units.get(e.unit);
      if (u) {
        u.alive = false;
        u.hp = 0;
      }
      break;
    }
    case "revive": {
      const u = next.units.get(e.unit);
      if (u) {
        u.alive = true;
        u.hp = e.hp;
      }
      break;
    }
    case "summon": {
      const def = unitsById[e.unitId];
      const uid =
        (e as any).spawnedUid ||
        `${e.team}-${e.unitId}-${e.row}${e.col}-${Math.floor(
          Math.random() * 100000
        )}`;
      next.units.set(uid, {
        uid,
        team: e.team,
        name: def?.name ?? e.unitId,
        pos: { row: e.row as 0 | 1, col: e.col },
        hp: def?.base.hp ?? 1,
        atk: def?.base.atk ?? 1,
        baseHp: def?.base.hp ?? 1,
        baseAtk: def?.base.atk ?? 1,
        alive: true,
      });
      break;
    }
    case "start":
    case "status":
    case "attack":
    case "end":
      break;
  }
  return next;
}
