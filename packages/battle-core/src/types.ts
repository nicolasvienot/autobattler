import type { TeamId } from "./constants";

export type { TeamId } from "./constants";
export type Trigger =
  | "onStart"
  | "onAttack"
  | "onHurt"
  | "onFaint"
  | "onTurnStart";
export type Position = { row: 0 | 1; col: number };

export type Target =
  | "self"
  | "allyFront"
  | "allyRandom"
  | "allyLowestHP"
  | "enemyFront"
  | "enemyRandom"
  | "enemyBack"
  | "allAllies"
  | "allEnemies";

export type StatusName =
  | "shield"
  | "poison"
  | "thorns"
  | "attackBonus"
  | "chain"
  | "lifestealPct"
  | "poisonOnHit"
  | "onAttackHeal"
  | "revivePct";

export type Effect =
  | { kind: "buff"; target: Target; atk?: number; hp?: number }
  | { kind: "damage"; target: Target; amount: number }
  | { kind: "heal"; target: Target; amount: number }
  | { kind: "shield"; target: Target; amount: number }
  | {
      kind: "summon";
      unitId: string;
      count: number;
      position: "front" | "back";
    }
  | { kind: "status"; target: Target; status: StatusName; amount: number };

export type Ability = { trigger: Trigger; chance?: number; effects: Effect[] };

export type UnitDef = {
  id: string;
  name: string;
  tier: 1 | 2 | 3 | 4 | 5;
  tribe?: string[];
  base: { hp: number; atk: number; speed?: number };
  ability?: Ability;
};

export type ItemDef = {
  id: string;
  name: string;
  description: string;
  ability?: Ability;
};

export type UnitInstance = {
  uid: string;
  team: TeamId;
  defId: string;
  level: 1 | 2 | 3;
  pos: Position;
  itemIds?: string[];
};

export type RuntimeUnit = {
  uid: string;
  team: TeamId;
  def: UnitDef;
  level: 1 | 2 | 3;
  pos: Position;
  atk: number;
  hp: number;
  baseHp: number;
  baseAtk: number;
  speed: number;
  alive: boolean;
  revived?: boolean;
  statuses: Partial<Record<StatusName, number>>;
  items: ItemDef[];
};

export type TeamState = {
  id: TeamId;
  units: RuntimeUnit[];
};

export type BattleLogEvent =
  | { t: "spawn"; unit: string; team: TeamId; row: number; col: number }
  | { t: "attack"; attacker: string; defender: string; amount: number }
  | { t: "damage"; target: string; amount: number; source?: string }
  | { t: "heal"; target: string; amount: number; source?: string }
  | {
      t: "status";
      target: string;
      status: StatusName;
      amount: number;
      note?: string;
    }
  | { t: "faint"; unit: string; by?: string }
  | { t: "revive"; unit: string; hp: number }
  | {
      t: "summon";
      unit: string;
      spawnedUid: string;
      team: TeamId;
      unitId: string;
      row: number;
      col: number;
    }
  | { t: "start" }
  | { t: "end"; winner: TeamId | "Draw" };

export type BattleState = {
  seed: string;
  turn: number;
  teams: Record<TeamId, TeamState>;
  log: BattleLogEvent[];
};
