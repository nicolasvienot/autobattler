import {
  units,
  unitsById,
  makeBattle,
  simulate,
} from "@nico/autobattler-battle-core";
import type { UnitDef, UnitInstance } from "@nico/autobattler-battle-core";
import type { PlayerUnit, BattleResult } from "../types/game";

// Generate 3 random units for the shop based on current round
export function generateShopUnits(round: number = 1): UnitDef[] {
  // Tier restrictions based on round
  let maxTier: number;
  if (round === 1) {
    maxTier = 1; // Round 1: Only tier 1
  } else if (round === 2) {
    maxTier = 2; // Round 2: Tiers 1-2
  } else {
    maxTier = 5; // Round 3+: All tiers 1-5
  }

  const availableUnits = units.filter((unit) => unit.tier <= maxTier);
  const shuffled = [...availableUnits].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

// Generate initial opponent team for round 1
export function generateInitialOpponentTeam(): PlayerUnit[] {
  // Round 1: Only tier 1 units, start with 1 unit
  const availableUnits = units.filter((unit) => unit.tier <= 1);
  const randomUnit =
    availableUnits[Math.floor(Math.random() * availableUnits.length)];

  return [
    {
      id: `opponent_0`,
      def: randomUnit,
      level: 1,
      preferredRow: 0, // Start in front row
    },
  ];
}

// Add a new unit to existing opponent team based on current round
export function addOpponentUnit(
  existingTeam: PlayerUnit[],
  round: number
): PlayerUnit[] {
  // Don't add more units after round 7 (max team size)
  if (existingTeam.length >= 7) {
    return existingTeam;
  }

  // Determine max tier based on round (same logic as shop)
  let maxTier: number;
  if (round === 1) {
    maxTier = 1; // Round 1: Only tier 1
  } else if (round === 2) {
    maxTier = 2; // Round 2: Tiers 1-2
  } else {
    maxTier = 5; // Round 3+: All tiers 1-5
  }

  const availableUnits = units.filter((unit) => unit.tier <= maxTier);
  const randomUnit =
    availableUnits[Math.floor(Math.random() * availableUnits.length)];

  const newUnit: PlayerUnit = {
    id: `opponent_${existingTeam.length}`,
    def: randomUnit,
    level: 1,
    // Alternate between front and back rows
    preferredRow: existingTeam.length < 4 ? 0 : 1,
  };

  return [...existingTeam, newUnit];
}

// Convert PlayerUnit to UnitInstance for battle simulation
export function playerUnitToInstance(
  unit: PlayerUnit,
  team: "A" | "B",
  position: { row: 0 | 1; col: number }
): UnitInstance {
  return {
    uid: unit.id,
    team,
    defId: unit.def.id,
    level: unit.level,
    pos: position,
    itemIds: [],
  };
}

// Calculate battle positions respecting row preferences
export function calculateBattlePositions(
  playerTeam: PlayerUnit[]
): Array<{ row: 0 | 1; col: number }> {
  const frontRowUnits: number[] = [];
  const backRowUnits: number[] = [];

  // Group units by preferred row
  playerTeam.forEach((unit, index) => {
    if (unit.preferredRow === 0) {
      frontRowUnits.push(index);
    } else {
      backRowUnits.push(index);
    }
  });

  const positions: Array<{ row: 0 | 1; col: number }> = new Array(
    playerTeam.length
  );
  const MAX_COLS = 8; // Maximum columns per row

  // Assign front row positions
  let frontCol = 0;
  for (const unitIndex of frontRowUnits) {
    if (frontCol < MAX_COLS) {
      positions[unitIndex] = { row: 0, col: frontCol };
      frontCol++;
    } else {
      // Front row is full, put in back row
      positions[unitIndex] = { row: 1, col: backRowUnits.length };
      backRowUnits.push(unitIndex);
    }
  }

  // Assign back row positions
  let backCol = 0;
  for (const unitIndex of backRowUnits) {
    if (positions[unitIndex]) continue; // Already positioned (overflow from front)

    if (backCol < MAX_COLS) {
      positions[unitIndex] = { row: 1, col: backCol };
      backCol++;
    } else {
      // Both rows full, put in front row at end
      positions[unitIndex] = { row: 0, col: frontCol };
      frontCol++;
    }
  }

  return positions;
}

// Run a battle between player and opponent teams
export function runBattle(
  playerTeam: PlayerUnit[],
  opponentTeam: PlayerUnit[],
  seed: string
): BattleResult {
  console.log("🔍 runBattle called with:", playerTeam.length, "player units");
  // Calculate positions respecting row preferences
  const playerPositions = calculateBattlePositions(playerTeam);
  console.log(
    "🔍 Player positions from calculateBattlePositions:",
    playerPositions
  );

  const playerInstances = playerTeam.map((unit, index) =>
    playerUnitToInstance(unit, "A", playerPositions[index])
  );

  console.log(
    "🔍 Player instances:",
    playerInstances.map(
      (inst) => `${inst.defId}: row=${inst.pos.row}, col=${inst.pos.col}`
    )
  );

  // Opponent team also uses row preferences
  const opponentPositions = calculateBattlePositions(opponentTeam);
  const opponentInstances = opponentTeam.map((unit, index) =>
    playerUnitToInstance(unit, "B", opponentPositions[index])
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
