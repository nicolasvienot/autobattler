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
  shield?: number;
  statuses?: { [key: string]: number };
};

export type VisualState = {
  units: Map<string, VisualUnit>;
  onStartEffectsApplied?: boolean;
  lastEventWasSpawn?: boolean;
};

export function emptyVisualState(): VisualState {
  return {
    units: new Map(),
    onStartEffectsApplied: false,
    lastEventWasSpawn: false,
  };
}

function applyMultiTargetOnStartEffects(
  state: VisualState,
  unitsById: Record<string, UnitDef>
): void {
  if (state.onStartEffectsApplied) return;

  // Get all units with multi-target onStart abilities
  const unitsWithOnStartAbilities = Array.from(state.units.values())
    .filter((unit) => {
      const unitId = uidToUnitId(unit.uid);
      if (!unitId || !unitsById[unitId]) return false;
      const unitDef = unitsById[unitId];
      return (
        unitDef.ability &&
        unitDef.ability.trigger === "onStart" &&
        unitDef.ability.effects.some((e) => e.target !== "self")
      );
    })
    .sort((a, b) => {
      // Apply in order: Team A first, then by position
      if (a.team !== b.team) return a.team === "A" ? -1 : 1;
      return a.pos.row - b.pos.row || a.pos.col - b.pos.col;
    });

  // Apply multi-target onStart effects
  for (const unit of unitsWithOnStartAbilities) {
    const unitId = uidToUnitId(unit.uid);
    if (unitId && unitsById[unitId]) {
      const unitDef = unitsById[unitId];

      if (unitDef.ability && unitDef.ability.trigger === "onStart") {
        for (const effect of unitDef.ability.effects) {
          if (effect.kind === "buff" && effect.target !== "self") {
            const targets = getTargetUnits(effect.target, unit, state.units);

            for (const target of targets) {
              if (effect.atk) target.atk += effect.atk;
              if (effect.hp) {
                target.hp += effect.hp;
                target.baseHp += effect.hp;
              }
            }
            // Shield effects are handled via status events in the battle log
            // Removing manual processing to prevent double application
          }
        }
      }
    }
  }

  state.onStartEffectsApplied = true;
}

function uidToUnitId(uid: string): string | null {
  const parts = uid.split("-");
  if (parts.length < 3) return null;
  return parts.slice(1, parts.length - 2).join("-");
}

function getTargetUnits(
  target: string,
  caster: VisualUnit,
  allUnits: Map<string, VisualUnit>
): VisualUnit[] {
  const units = Array.from(allUnits.values()).filter((u) => u.alive);
  const allies = units.filter((u) => u.team === caster.team);
  const enemies = units.filter((u) => u.team !== caster.team);

  switch (target) {
    case "self":
      return [caster];
    case "allyFront":
      // Get front-most ally (lowest row, then lowest col)
      return allies
        .filter((u) => u.uid !== caster.uid)
        .sort((a, b) => a.pos.row - b.pos.row || a.pos.col - b.pos.col)
        .slice(0, 1);
    case "allyRandom":
      // Get random ally (for simplicity, just get first available ally)
      const availableAllies = allies.filter((u) => u.uid !== caster.uid);
      return availableAllies.length > 0 ? [availableAllies[0]] : [];
    case "allyLowestHP":
      // Get ally with lowest HP
      const lowestHPAlly = allies
        .filter((u) => u.uid !== caster.uid)
        .sort((a, b) => a.hp - b.hp)[0];
      return lowestHPAlly ? [lowestHPAlly] : [];
    case "enemyFront":
      // Get front-most enemy
      return enemies
        .sort((a, b) => a.pos.row - b.pos.row || a.pos.col - b.pos.col)
        .slice(0, 1);
    case "enemyRandom":
      // Get random enemy (for simplicity, just get first available enemy)
      return enemies.length > 0 ? [enemies[0]] : [];
    case "enemyBack":
      // Get back-most enemy
      return enemies
        .sort((a, b) => b.pos.row - a.pos.row || b.pos.col - a.pos.col)
        .slice(0, 1);
    case "allAllies":
      return allies;
    case "allEnemies":
      return enemies;
    default:
      return [];
  }
}

export function applyLogEvent(
  state: VisualState,
  e: BattleLogEvent,
  unitsById: Record<string, UnitDef>
): VisualState {
  const next: VisualState = {
    units: new Map(state.units),
    onStartEffectsApplied: state.onStartEffectsApplied,
    lastEventWasSpawn: state.lastEventWasSpawn,
  };

  // Apply multi-target onStart effects when we transition from spawn events to other events
  // This ensures all units are spawned before applying team-wide buffs
  if (
    state.lastEventWasSpawn &&
    e.t !== "spawn" &&
    !next.onStartEffectsApplied
  ) {
    applyMultiTargetOnStartEffects(next, unitsById);
  }

  // Update spawn tracking
  next.lastEventWasSpawn = e.t === "spawn";

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

      // Apply self-targeting onStart buffs immediately when unit spawns
      // Note: Shield effects are handled by status events, not here
      if (def.ability && def.ability.trigger === "onStart") {
        const spawnedUnit = next.units.get(e.unit)!;

        for (const effect of def.ability.effects) {
          if (effect.kind === "buff" && effect.target === "self") {
            if (effect.atk) {
              spawnedUnit.atk += effect.atk;
            }
            if (effect.hp) {
              spawnedUnit.hp += effect.hp;
              spawnedUnit.baseHp += effect.hp;
            }
          }
          // Shield effects are handled by status events from the battle engine
          // Don't apply them here to avoid duplication
        }
      }

      break;
    }
    case "damage": {
      const u = next.units.get(e.target);
      if (u) {
        // Simulate shield consumption before applying HP damage
        let damageAmount = e.amount;
        if (u.shield && u.shield > 0) {
          const shieldAbsorbed = Math.min(u.shield, damageAmount);
          u.shield -= shieldAbsorbed;
          damageAmount -= shieldAbsorbed;

          // Update shield status
          if (!u.statuses) u.statuses = {};
          if (u.shield <= 0) {
            u.shield = 0;
            delete u.statuses["shield"];
          } else {
            u.statuses["shield"] = u.shield;
          }
        }

        // Apply remaining damage to HP
        if (damageAmount > 0) {
          u.hp = Math.max(0, u.hp - damageAmount);
        }

        // Handle unit death - clear shield and statuses when HP reaches 0
        if (u.hp <= 0) {
          u.alive = false;
          u.shield = 0;
          if (u.statuses) {
            delete u.statuses["shield"];
            // Clear other statuses on death if needed
          }
        }

        // Handle onHurt abilities after damage is applied
        if (u.alive) {
          const unitId = uidToUnitId(u.uid);
          if (unitId && unitsById[unitId]) {
            const unitDef = unitsById[unitId];
            if (unitDef.ability && unitDef.ability.trigger === "onHurt") {
              // Apply onHurt effects (like Berserker's attack buff when hurt)
              for (const effect of unitDef.ability.effects) {
                if (effect.kind === "buff") {
                  const targets = getTargetUnits(effect.target, u, next.units);
                  for (const buffTarget of targets) {
                    if (effect.atk) buffTarget.atk += effect.atk;
                    if (effect.hp) {
                      buffTarget.hp += effect.hp;
                      buffTarget.baseHp += effect.hp;
                    }
                  }
                }
              }
            }
          }
        }
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
    case "status": {
      const u = next.units.get(e.target);
      if (u) {
        // Initialize statuses if not present
        if (!u.statuses) u.statuses = {};

        // Handle different status effects
        switch (e.status) {
          case "attackBonus":
            // Add attack bonus to current attack and track status
            u.statuses[e.status] = (u.statuses[e.status] || 0) + e.amount;
            u.atk = u.baseAtk + u.statuses[e.status];
            break;
          case "shield":
            // Add shield amount and track it visually
            u.shield = (u.shield || 0) + e.amount;
            u.statuses[e.status] = u.shield;
            break;
          case "poison":
          case "chain":
          case "lifestealPct":
          case "thorns":
          case "poisonOnHit":
          case "onAttackHeal":
          case "revivePct":
            // Track other status effects for potential visual indicators
            u.statuses[e.status] = e.amount;
            break;
          default:
            // Track unknown status effects
            u.statuses[e.status] = e.amount;
            break;
        }
      }
      break;
    }
    case "start": {
      // Note: onStart abilities are now handled during spawn events
      // This ensures proper timing and unit availability
      break;
    }
    case "attack": {
      // Handle onAttack abilities
      const attacker = next.units.get(e.attacker);
      if (attacker) {
        const unitId = uidToUnitId(attacker.uid);
        if (unitId && unitsById[unitId]) {
          const unitDef = unitsById[unitId];
          if (unitDef.ability && unitDef.ability.trigger === "onAttack") {
            // Apply onAttack effects (like Berserker's self-buff on hurt)
            for (const effect of unitDef.ability.effects) {
              if (effect.kind === "buff") {
                const targets = getTargetUnits(
                  effect.target,
                  attacker,
                  next.units
                );
                for (const target of targets) {
                  if (effect.atk) target.atk += effect.atk;
                  if (effect.hp) {
                    target.hp += effect.hp;
                    target.baseHp += effect.hp;
                  }
                }
              }
            }
          }
        }
      }
      break;
    }
    case "end":
      break;
  }
  return next;
}
