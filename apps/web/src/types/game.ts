import type { UnitDef } from "@nico/autobattler-battle-core";

export type GamePhase = "start" | "shop" | "battle" | "result";

// Money system constants
export const MONEY_CONSTANTS = {
  STARTING_MONEY: 3,
  DAILY_INCOME: 4,
  UNIT_COST_BY_TIER: {
    1: 2,
    2: 3,
    3: 4,
    4: 5,
    5: 6,
  },
  SELL_VALUE_BY_TIER: {
    1: 1,
    2: 2,
    3: 2,
    4: 3,
    5: 3,
  },
  // Legacy constants for backwards compatibility
  UNIT_COST: 3,
  SELL_VALUE: 2,
} as const;

export type PlayerUnit = {
  id: string;
  def: UnitDef;
  level: 1 | 2 | 3;
  preferredRow: 0 | 1; // 0 = front row, 1 = back row
};

export type GameState = {
  phase: GamePhase;
  playerTeam: PlayerUnit[];
  opponentTeam: PlayerUnit[]; // Persistent opponent team
  playerWins: number;
  opponentWins: number;
  currentShopUnits: UnitDef[];
  lastBattleWinner: "player" | "opponent" | null;
  gameWinner: "player" | "opponent" | null;
  money: number;
  rerollCount: number; // Track rerolls for escalating cost
};

export type BattleResult = {
  winner: "player" | "opponent";
  playerTeamAfterBattle: PlayerUnit[];
  opponentTeam: PlayerUnit[];
};
