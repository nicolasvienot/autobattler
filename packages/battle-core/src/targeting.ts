import { BOARD_WIDTH } from "./constants";
import type { BattleState, RuntimeUnit, Target, TeamId } from "./types";

export function living(state: BattleState, team: TeamId): RuntimeUnit[] {
  return state.teams[team].units.filter((u) => u.alive);
}

export function enemyTeam(team: TeamId): TeamId {
  return team === "A" ? "B" : "A";
}

export function frontMost(units: RuntimeUnit[]): RuntimeUnit | undefined {
  const alive = units.filter((u) => u.alive);
  if (alive.length === 0) return undefined;
  let best = alive[0];
  for (const u of alive) {
    if (u.pos.row < best.pos.row) best = u;
    else if (u.pos.row === best.pos.row && u.pos.col < best.pos.col) best = u;
  }
  return best;
}

export function backMost(units: RuntimeUnit[]): RuntimeUnit | undefined {
  const alive = units.filter((u) => u.alive);
  if (alive.length === 0) return undefined;
  let best = alive[0];
  for (const u of alive) {
    if (u.pos.row > best.pos.row) best = u;
    else if (u.pos.row === best.pos.row && u.pos.col < best.pos.col) best = u;
  }
  return best;
}

export function lowestHP(units: RuntimeUnit[]): RuntimeUnit | undefined {
  const alive = units.filter((u) => u.alive);
  if (alive.length === 0) return undefined;
  return alive.reduce((a, b) => (a.hp <= b.hp ? a : b));
}

export function targets(
  state: BattleState,
  actor: RuntimeUnit,
  target: Target
): RuntimeUnit[] {
  const allies = living(state, actor.team);
  const enemies = living(state, actor.team === "A" ? "B" : "A");
  switch (target) {
    case "self":
      return [actor];
    case "allyFront": {
      const t = frontMost(allies);
      return t ? [t] : [];
    }
    case "allyRandom":
      if (allies.length === 0) return [];
      return [allies[Math.floor(Math.random() * allies.length)]];
    case "allyLowestHP": {
      const t = lowestHP(allies);
      return t ? [t] : [];
    }
    case "enemyFront": {
      const t = frontMost(enemies);
      return t ? [t] : [];
    }
    case "enemyBack": {
      const t = backMost(enemies);
      return t ? [t] : [];
    }
    case "enemyRandom":
      if (enemies.length === 0) return [];
      return [enemies[Math.floor(Math.random() * enemies.length)]];
    case "allAllies":
      return allies;
    case "allEnemies":
      return enemies;
  }
}

export function findSummonSlot(
  state: BattleState,
  team: TeamId,
  rowPref: 0 | 1,
  colPref: number
): { row: 0 | 1; col: number } | null {
  // Check ALL units (alive or dead) to avoid spawning on corpses
  const occupied = new Set(
    state.teams[team].units.map((u) => `${u.pos.row}:${u.pos.col}`)
  );

  // For summons, try to find the first available (leftmost) empty slot in the preferred row
  // This fills in gaps in the formation from left to right
  for (let c = 0; c < BOARD_WIDTH; c++) {
    const k = `${rowPref}:${c}`;
    if (!occupied.has(k)) return { row: rowPref, col: c as any };
  }

  // If preferred row is full, try the other row from left to right
  const otherRow = (rowPref === 0 ? 1 : 0) as 0 | 1;
  for (let c = 0; c < BOARD_WIDTH; c++) {
    const k = `${otherRow}:${c}`;
    if (!occupied.has(k)) return { row: otherRow, col: c as any };
  }

  return null;
}
