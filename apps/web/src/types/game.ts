import type { UnitDef } from "@nico/autobattler-battle-core";

export type GamePhase = "start" | "shop" | "battle" | "result";

// Money system constants
export const MONEY_CONSTANTS = {
  STARTING_MONEY: 3,
  DAILY_INCOME: 3,
  UNIT_COST: 3,
  SELL_VALUE: 2,
} as const;

export type PlayerUnit = {
  id: string;
  def: UnitDef;
  level: 1 | 2 | 3;
};

export type GameState = {
  phase: GamePhase;
  playerTeam: PlayerUnit[];
  playerWins: number;
  opponentWins: number;
  currentShopUnits: UnitDef[];
  lastBattleWinner: "player" | "opponent" | null;
  gameWinner: "player" | "opponent" | null;
  money: number;
};

export type BattleResult = {
  winner: "player" | "opponent";
  playerTeamAfterBattle: PlayerUnit[];
  opponentTeam: PlayerUnit[];
};
