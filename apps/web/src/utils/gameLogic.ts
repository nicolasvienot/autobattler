import {
  units,
  unitsById,
  makeBattle,
  simulate,
} from "@nico/autobattler-battle-core";
import type { UnitDef, UnitInstance } from "@nico/autobattler-battle-core";
import type { PlayerUnit, BattleResult } from "../types/game";

// Generate 3 random units for the shop
export function generateShopUnits(): UnitDef[] {
  const availableUnits = units.filter((unit) => unit.tier <= 3); // Only tiers 1-3 for simplicity
  const shuffled = [...availableUnits].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

// Generate a random opponent team based on current round
export function generateOpponentTeam(round: number): PlayerUnit[] {
  const teamSize = Math.min(round, 7); // Max 7 units
  const availableUnits = units.filter(
    (unit) => unit.tier <= Math.min(3 + Math.floor(round / 3), 5)
  );
  const opponentTeam: PlayerUnit[] = [];

  for (let i = 0; i < teamSize; i++) {
    const randomUnit =
      availableUnits[Math.floor(Math.random() * availableUnits.length)];
    opponentTeam.push({
      id: `opponent_${i}`,
      def: randomUnit,
      level: 1,
    });
  }

  return opponentTeam;
}

// Convert PlayerUnit to UnitInstance for battle simulation
function playerUnitToInstance(
  unit: PlayerUnit,
  team: "A" | "B",
  index: number
): UnitInstance {
  const row = index < 4 ? 0 : 1;
  const col = index < 4 ? index : index - 4;

  return {
    uid: unit.id,
    team,
    defId: unit.def.id,
    level: unit.level,
    pos: { row: row as 0 | 1, col },
    itemIds: [],
  };
}

// Run a battle between player and opponent teams
export function runBattle(
  playerTeam: PlayerUnit[],
  opponentTeam: PlayerUnit[],
  seed: string
): BattleResult {
  // Convert teams to battle format
  const playerInstances = playerTeam.map((unit, index) =>
    playerUnitToInstance(unit, "A", index)
  );
  const opponentInstances = opponentTeam.map((unit, index) =>
    playerUnitToInstance(unit, "B", index)
  );

  // Run the battle
  const battleState = makeBattle(seed, playerInstances, opponentInstances);
  const result = simulate(battleState);

  // Determine winner
  const winner = result.log[result.log.length - 1];
  const battleWinner =
    winner.t === "end" && winner.winner === "A" ? "player" : "opponent";

  return {
    winner: battleWinner,
    playerTeamAfterBattle: playerTeam, // Units persist regardless of battle outcome
    opponentTeam,
  };
}

// Create a unique seed for each battle
export function generateBattleSeed(): string {
  return `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
