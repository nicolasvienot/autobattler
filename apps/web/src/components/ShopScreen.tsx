import type { UnitDef } from "@nico/autobattler-battle-core";
import type { PlayerUnit } from "../types/game";
import { MONEY_CONSTANTS as MONEY } from "../types/game";
import {
  getAbilityDescription,
  getTierDescription,
  getTribeColor,
} from "../utils/unitDescriptions";

interface ShopScreenProps {
  shopUnits: UnitDef[];
  playerTeam: PlayerUnit[];
  playerWins: number;
  opponentWins: number;
  money: number;
  onSelectUnit: (unit: UnitDef) => void;
  onSellUnit: (unitId: string) => void;
  onReady: () => void;
}

export default function ShopScreen({
  shopUnits,
  playerTeam,
  playerWins,
  opponentWins,
  money,
  onSelectUnit,
  onSellUnit,
  onReady,
}: ShopScreenProps) {
  const round = playerWins + opponentWins + 1;

  return (
    <div className="screen shop-screen">
      <div className="shop-header">
        <h2>Round {round} - Shop Phase</h2>
        <div className="game-info">
          <div className="score">
            <span className="player-score">You: {playerWins}</span>
            <span className="vs">vs</span>
            <span className="opponent-score">Opponent: {opponentWins}</span>
          </div>
          <div className="money-display">
            <span className="money-icon">💰</span>
            <span className="money-amount">{money}</span>
          </div>
        </div>
      </div>

      <div className="shop-content">
        <div className="shop-section">
          <h3>
            Choose a Unit ({MONEY.UNIT_COST} 💰 each)
            {money < MONEY.UNIT_COST && (
              <span className="purchase-status"> - Not enough money</span>
            )}
          </h3>
          <div className="shop-units">
            {shopUnits.length === 0 ? (
              <div className="empty-shop">
                All units sold out! Click "Ready for Battle" to continue.
              </div>
            ) : (
              shopUnits.map((unit) => {
                const canAfford = money >= MONEY.UNIT_COST;

                return (
                  <div
                    key={unit.id}
                    className={`shop-unit ${!canAfford ? "disabled" : ""}`}
                    onClick={() => canAfford && onSelectUnit(unit)}
                  >
                    <div className="unit-card">
                      <div className="unit-header-info">
                        <h4>{unit.name}</h4>
                        <div className="unit-tier-badge" data-tier={unit.tier}>
                          {getTierDescription(unit.tier)}
                        </div>
                      </div>

                      <div className="unit-stats">
                        <div className="stat">
                          <span className="stat-icon">❤️</span>
                          <span className="stat-value">{unit.base.hp}</span>
                          <span className="stat-label">HP</span>
                        </div>
                        <div className="stat">
                          <span className="stat-icon">⚔️</span>
                          <span className="stat-value">{unit.base.atk}</span>
                          <span className="stat-label">ATK</span>
                        </div>
                        {unit.base.speed && (
                          <div className="stat">
                            <span className="stat-icon">⚡</span>
                            <span className="stat-value">
                              {unit.base.speed}
                            </span>
                            <span className="stat-label">SPD</span>
                          </div>
                        )}
                      </div>

                      {unit.tribe && unit.tribe.length > 0 && (
                        <div className="unit-tribes">
                          {unit.tribe.map((tribe) => (
                            <span
                              key={tribe}
                              className="tribe"
                              style={{ backgroundColor: getTribeColor(tribe) }}
                            >
                              {tribe}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="unit-ability">
                        <div className="ability-title">Ability:</div>
                        <div className="ability-description">
                          {getAbilityDescription(unit)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="team-section">
          <h3>Your Team ({playerTeam.length}/7)</h3>
          <div className="player-team">
            {playerTeam.length === 0 ? (
              <div className="empty-team">
                No units yet - choose your first unit!
              </div>
            ) : (
              <div className="team-units">
                {playerTeam.map((unit, index) => (
                  <div key={unit.id} className="team-unit">
                    <div className="unit-card small">
                      <div className="unit-header">
                        <div className="unit-name-tier">
                          <h5>{unit.def.name}</h5>
                          <span
                            className="small-tier-badge"
                            data-tier={unit.def.tier}
                          >
                            {getTierDescription(unit.def.tier)}
                          </span>
                        </div>
                        <button
                          className="sell-button"
                          onClick={() => onSellUnit(unit.id)}
                          title={`Sell for ${MONEY.SELL_VALUE} gold`}
                        >
                          💰 Sell ({MONEY.SELL_VALUE})
                        </button>
                      </div>
                      <div className="unit-stats small-stats">
                        <div className="stat">
                          <span className="stat-icon">❤️</span>
                          <span className="stat-value">{unit.def.base.hp}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-icon">⚔️</span>
                          <span className="stat-value">
                            {unit.def.base.atk}
                          </span>
                        </div>
                      </div>
                      {unit.def.tribe && unit.def.tribe.length > 0 && (
                        <div className="unit-tribes small-tribes">
                          {unit.def.tribe.map((tribe) => (
                            <span
                              key={tribe}
                              className="tribe small"
                              style={{ backgroundColor: getTribeColor(tribe) }}
                            >
                              {tribe}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {playerTeam.length > 0 && (
            <button className="ready-button" onClick={onReady}>
              READY FOR BATTLE!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
