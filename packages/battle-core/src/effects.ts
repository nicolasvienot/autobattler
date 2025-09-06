import { clamp } from "./constants";
import { findSummonSlot } from "./targeting";
import type { BattleState, Effect, RuntimeUnit, StatusName } from "./types";
import { spawnUnitInstance } from "./factory";
import { RNG } from "./rng";
import { runTrigger } from "./triggers";

export function addStatus(u: RuntimeUnit, name: StatusName, amount: number) {
  const cur = u.statuses[name] ?? 0;
  u.statuses[name] = cur + amount;
}

export function setStatus(u: RuntimeUnit, name: StatusName, amount: number) {
  u.statuses[name] = amount;
}

export function consumeShield(u: RuntimeUnit, amount: number): number {
  const s = u.statuses["shield"] ?? 0;
  if (s <= 0) return amount;
  const remain = s - amount;
  if (remain <= 0) {
    delete u.statuses["shield"];
    return Math.max(0, -remain);
  } else {
    u.statuses["shield"] = remain;
    return 0;
  }
}

export function applyDamage(
  state: BattleState,
  target: RuntimeUnit,
  amount: number,
  source?: RuntimeUnit
) {
  if (!target.alive) return;
  amount = consumeShield(target, amount);
  if (amount <= 0) return;
  target.hp = clamp(target.hp - amount, 0, 9999);
  state.log.push({
    t: "damage",
    target: target.uid,
    amount,
    source: source?.uid,
  });
  if (source && source.alive) {
    const th = target.statuses["thorns"] ?? 0;
    if (th > 0) {
      applyDamage(state, source, th, target);
    }
  }
  if (target.hp <= 0) faint(state, target, source);
}

export function heal(
  state: BattleState,
  target: RuntimeUnit,
  amount: number,
  source?: RuntimeUnit
) {
  if (!target.alive) return;
  const before = target.hp;
  target.hp = clamp(target.hp + amount, 0, target.baseHp);
  const healed = target.hp - before;
  if (healed > 0)
    state.log.push({
      t: "heal",
      target: target.uid,
      amount: healed,
      source: source?.uid,
    });
}

export function summon(
  state: BattleState,
  spawner: RuntimeUnit,
  unitId: string,
  count: number,
  position: "front" | "back"
) {
  for (let i = 0; i < count; i++) {
    const rowPref = position === "front" ? 0 : 1;
    const slot = findSummonSlot(state, spawner.team, rowPref, spawner.pos.col);
    if (!slot) return;
    const spawned = spawnUnitInstance(spawner.team, unitId, 1, slot, []);
    state.teams[spawner.team].units.push(spawned);
    state.log.push({
      t: "summon",
      unit: spawner.uid,
      spawnedUid: spawned.uid,
      team: spawner.team,
      unitId,
      row: slot.row,
      col: slot.col,
    });
  }
}

export function faint(state: BattleState, unit: RuntimeUnit, by?: RuntimeUnit) {
  if (!unit.alive) return;
  const revivePct = unit.statuses["revivePct"] ?? 0;
  if (revivePct > 0 && !unit.revived) {
    unit.revived = true;
    const reviveHP = Math.max(1, Math.floor(unit.baseHp * revivePct));
    unit.hp = reviveHP;
    unit.alive = true;
    state.log.push({ t: "revive", unit: unit.uid, hp: reviveHP });
    delete unit.statuses["revivePct"];
    return;
  }
  unit.alive = false;
  state.log.push({ t: "faint", unit: unit.uid, by: by?.uid });
  runTrigger(state, unit, "onFaint", by);
}

export function applyEffect(
  state: BattleState,
  actor: RuntimeUnit,
  effect: Effect,
  rng: RNG
) {
  // Handle summon effects separately since they don't have targets
  if (effect.kind === "summon") {
    summon(state, actor, effect.unitId, effect.count, effect.position);
    return;
  }

  let targets: RuntimeUnit[] = [];
  const allies = state.teams[actor.team].units.filter((u) => u.alive);
  const enemies = state.teams[actor.team === "A" ? "B" : "A"].units.filter(
    (u) => u.alive
  );

  const pickRandom = (arr: RuntimeUnit[]) =>
    arr.length ? [arr[rng.int(arr.length)]] : [];

  switch (effect.target) {
    case "self":
      targets = [actor];
      break;
    case "allyFront":
      targets = allies
        .sort((a, b) => a.pos.row - b.pos.row || a.pos.col - b.pos.col)
        .slice(0, 1);
      break;
    case "allyRandom":
      targets = pickRandom(allies);
      break;
    case "allyLowestHP":
      targets = allies.length
        ? [allies.reduce((a, b) => (a.hp <= b.hp ? a : b))]
        : [];
      break;
    case "enemyFront":
      targets = enemies
        .sort((a, b) => a.pos.row - b.pos.row || a.pos.col - b.pos.col)
        .slice(0, 1);
      break;
    case "enemyBack":
      targets = enemies
        .sort((a, b) => b.pos.row - a.pos.row || a.pos.col - b.pos.col)
        .slice(0, 1);
      break;
    case "enemyRandom":
      targets = pickRandom(enemies);
      break;
    case "allAllies":
      targets = allies;
      break;
    case "allEnemies":
      targets = enemies;
      break;
  }

  for (const t of targets) {
    switch (effect.kind) {
      case "buff": {
        const da = effect.atk ?? 0;
        const dh = effect.hp ?? 0;
        t.atk += da;
        t.hp = clamp(t.hp + dh, 0, 9999);
        if (dh !== 0)
          state.log.push({
            t: "heal",
            target: t.uid,
            amount: dh,
            source: actor.uid,
          });
        break;
      }
      case "damage":
        applyDamage(state, t, effect.amount, actor);
        break;
      case "heal":
        heal(state, t, effect.amount, actor);
        break;
      case "shield":
        addStatus(t, "shield", effect.amount);
        state.log.push({
          t: "status",
          target: t.uid,
          status: "shield",
          amount: effect.amount,
        });
        break;
      case "status":
        addStatus(t, effect.status, effect.amount);
        state.log.push({
          t: "status",
          target: t.uid,
          status: effect.status,
          amount: effect.amount,
        });
        break;
    }
  }
}
