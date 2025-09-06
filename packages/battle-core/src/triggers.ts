import type { Ability, BattleState, RuntimeUnit, Trigger } from "./types";
import { applyEffect } from "./effects";
import { RNG } from "./rng";

export function runAbility(
  state: BattleState,
  actor: RuntimeUnit,
  ability: Ability | undefined,
  rng: RNG
) {
  if (!ability) return;
  if (ability.chance !== undefined && !rng.chance(ability.chance)) return;
  for (const eff of ability.effects) {
    applyEffect(state, actor, eff, rng);
  }
}

export function runTrigger(
  state: BattleState,
  actor: RuntimeUnit,
  trigger: Trigger,
  other?: RuntimeUnit,
  rngOverride?: RNG
) {
  const rng =
    rngOverride ??
    new RNG(state.seed + ":" + state.turn + ":" + actor.uid + ":" + trigger);
  if (actor.def.ability && actor.def.ability.trigger === trigger) {
    runAbility(state, actor, actor.def.ability, rng);
  }
  for (const item of actor.items) {
    if (item.ability && item.ability.trigger === trigger) {
      runAbility(state, actor, item.ability, rng);
    }
  }
}
