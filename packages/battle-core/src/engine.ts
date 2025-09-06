import type { BattleState, RuntimeUnit, TeamId } from "./types";
import { enemyTeam, frontMost, living } from "./targeting";
import { applyDamage, heal, faint } from "./effects";
import { runTrigger } from "./triggers";

function nextActor(state: BattleState, side: TeamId): RuntimeUnit | undefined {
  const list = living(state, side);
  if (list.length === 0) return undefined;
  return frontMost(list);
}

function applyStartOfTurn(state: BattleState, u: RuntimeUnit) {
  const poison = u.statuses["poison"] ?? 0;
  if (poison > 0 && u.alive) {
    const before = u.hp;
    u.hp = Math.max(0, u.hp - poison);
    state.log.push({ t: "damage", target: u.uid, amount: poison });
    if (u.hp <= 0) {
      faint(state, u);
    }
  }
}

export function simulate(state: BattleState, maxTurns = 500): BattleState {
  for (const side of ["A", "B"] as const) {
    for (const u of living(state, side)) {
      runTrigger(state, u, "onStart");
    }
  }

  let side: TeamId = "A";
  for (let t = 0; t < maxTurns; t++) {
    state.turn = t + 1;
    if (living(state, "A").length === 0 || living(state, "B").length === 0)
      break;

    let actor = nextActor(state, side);
    if (!actor) {
      side = side === "A" ? "B" : "A";
      actor = nextActor(state, side);
      if (!actor) break;
    }

    applyStartOfTurn(state, actor);
    if (!actor.alive) {
      side = side === "A" ? "B" : "A";
      continue;
    }

    const enemy = nextActor(state, enemyTeam(actor.team));
    if (!enemy) {
      // Check if the current actor's team still has units after processing deaths
      // This handles cases where units summon on death
      side = side === "A" ? "B" : "A";
      continue;
    }

    const base = Math.max(0, actor.atk);
    const bonus = actor.statuses["attackBonus"] ?? 0;
    const dmg = base + bonus;
    applyDamage(state, enemy, dmg, actor);
    state.log.push({
      t: "attack",
      attacker: actor.uid,
      defender: enemy.uid,
      amount: dmg,
    });

    const ls = actor.statuses["lifestealPct"] ?? 0;
    if (ls > 0) {
      const healAmt = Math.floor(dmg * ls);
      if (healAmt > 0) heal(state, actor, healAmt, actor);
    }

    const chain = actor.statuses["chain"] ?? 0;
    if (chain > 0) {
      const enemies = living(state, enemy.team).filter(
        (e) => e.uid !== enemy.uid
      );
      if (enemies.length > 0) {
        const idx = (t * 9301 + 49297) % enemies.length;
        const extra = enemies[idx];
        applyDamage(state, extra, chain, actor);
      }
    }

    const p = actor.statuses["poisonOnHit"] ?? 0;
    if (p > 0 && enemy.alive) {
      enemy.statuses["poison"] = (enemy.statuses["poison"] ?? 0) + p;
      state.log.push({
        t: "status",
        target: enemy.uid,
        status: "poison",
        amount: p,
      });
    }

    runTrigger(state, actor, "onAttack");

    const onAtkHeal = actor.statuses["onAttackHeal"] ?? 0;
    if (onAtkHeal > 0) heal(state, actor, onAtkHeal, actor);

    side = side === "A" ? "B" : "A";
  }

  const a = living(state, "A").length;
  const b = living(state, "B").length;
  const winner = a > 0 && b === 0 ? "A" : b > 0 && a === 0 ? "B" : "Draw";
  state.log.push({ t: "end", winner });
  return state;
}
