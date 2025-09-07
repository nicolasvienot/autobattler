import type { UnitDef, Effect } from "@nico/autobattler-battle-core";

// Helper function to get a human-readable description of an effect
export function getEffectDescription(effect: Effect): string {
  switch (effect.kind) {
    case "buff":
      const buffParts = [];
      if (effect.atk) buffParts.push(`+${effect.atk} Attack`);
      if (effect.hp) buffParts.push(`+${effect.hp} Health`);
      return `Give ${getTargetDescription(effect.target)} ${buffParts.join(
        " and "
      )}`;

    case "damage":
      return `Deal ${effect.amount} damage to ${getTargetDescription(
        effect.target
      )}`;

    case "heal":
      return `Heal ${effect.amount} to ${getTargetDescription(effect.target)}`;

    case "shield":
      return `Give ${effect.amount} shield to ${getTargetDescription(
        effect.target
      )}`;

    case "status":
      return `Apply ${effect.status} (${
        effect.amount
      }) to ${getTargetDescription(effect.target)}`;

    case "summon":
      return `Summon ${effect.count} ${effect.unitId}`;

    default:
      return "Unknown effect";
  }
}

// Helper function to get human-readable target descriptions
function getTargetDescription(target: string): string {
  switch (target) {
    case "self":
      return "itself";
    case "allyFront":
      return "front ally";
    case "allyRandom":
      return "random ally";
    case "allyLowestHP":
      return "ally with lowest HP";
    case "enemyFront":
      return "front enemy";
    case "enemyRandom":
      return "random enemy";
    case "enemyBack":
      return "back enemy";
    case "allAllies":
      return "all allies";
    case "allEnemies":
      return "all enemies";
    default:
      return target;
  }
}

// Helper function to get trigger descriptions
export function getTriggerDescription(trigger: string): string {
  switch (trigger) {
    case "onStart":
      return "Battle Start";
    case "onAttack":
      return "On Attack";
    case "onHurt":
      return "When Hurt";
    case "onFaint":
      return "On Death";
    case "onTurnStart":
      return "Turn Start";
    default:
      return trigger;
  }
}

// Get full ability description
export function getAbilityDescription(unit: UnitDef): string {
  if (!unit.ability) return "No special ability";

  const trigger = getTriggerDescription(unit.ability.trigger);
  const effects = unit.ability.effects.map(getEffectDescription).join(", ");

  return `${trigger}: ${effects}`;
}

// Get unit rarity/tier description
export function getTierDescription(tier: number): string {
  switch (tier) {
    case 1:
      return "Common";
    case 2:
      return "Uncommon";
    case 3:
      return "Rare";
    case 4:
      return "Epic";
    case 5:
      return "Legendary";
    default:
      return `Tier ${tier}`;
  }
}

// Get tribe color/styling
export function getTribeColor(tribe: string): string {
  switch (tribe.toLowerCase()) {
    case "beast":
      return "#8B4513"; // Brown
    case "mech":
      return "#708090"; // SlateGray
    case "guardian":
      return "#4169E1"; // RoyalBlue
    case "undead":
      return "#800080"; // Purple
    case "mage":
      return "#FF4500"; // OrangeRed
    default:
      return "#666666"; // Default gray
  }
}
