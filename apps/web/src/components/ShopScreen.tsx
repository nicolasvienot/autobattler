import { useState } from "react";
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
  rerollCount: number;
  onSelectUnit: (unit: UnitDef) => void;
  onSellUnit: (unitId: string) => void;
  onReorderTeam: (fromIndex: number, toIndex: number) => void;
  onToggleUnitRow: (unitId: string) => void;
  onRerollShop: () => void;
  onReady: () => void;
}

export default function ShopScreen({
  shopUnits,
  playerTeam,
  playerWins,
  opponentWins,
  money,
  rerollCount,
  onSelectUnit,
  onSellUnit,
  onReorderTeam,
  onToggleUnitRow,
  onRerollShop,
  onReady,
}: ShopScreenProps) {
  const round = playerWins + opponentWins + 1;
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML);
    e.dataTransfer.setDragImage(e.currentTarget as Element, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorderTeam(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="screen shop-screen">
      <div className="shop-header">
        <h2>Round {round} - Shop</h2>
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
          <div className="shop-header-controls">
            <h3>Choose a unit (prices vary by tier)</h3>
            <div className="reroll-controls">
              <button
                className={`reroll-button ${
                  money < rerollCount + 1 ? "disabled" : ""
                }`}
                onClick={onRerollShop}
                disabled={money < rerollCount + 1}
                title={`Reroll shop units for ${rerollCount + 1} gold`}
              >
                🎲 Reroll ({rerollCount + 1} 💰)
              </button>
              {rerollCount > 0 && (
                <span className="reroll-info">
                  Rerolled {rerollCount} time{rerollCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
          <div className="shop-units">
            {shopUnits.length === 0 ? (
              <div className="empty-shop">
                All units sold out! Click "Ready for Battle" to continue.
              </div>
            ) : (
              shopUnits.map((unit) => {
                const unitCost =
                  MONEY.UNIT_COST_BY_TIER[
                    unit.tier as keyof typeof MONEY.UNIT_COST_BY_TIER
                  ];
                const canAfford = money >= unitCost;

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
                        <div className="unit-price">{unitCost}💰</div>
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
          <h3>Your team ({playerTeam.length}/7)</h3>
          <p className="team-hint">
            Drag units to reorder them! Click row buttons to choose front/back
            row. Position affects targeting abilities.
          </p>
          <div className="player-team">
            {playerTeam.length === 0 ? (
              <div className="empty-team">
                No units yet - choose your first unit!
              </div>
            ) : (
              <div className="team-units">
                {playerTeam.map((unit, index) => {
                  const isDragging = draggedIndex === index;
                  const isDragOver = dragOverIndex === index;
                  const rowName =
                    unit.preferredRow === 0 ? "Front row" : "Back row";

                  // Calculate actual battle position
                  // This is a simplified preview - actual battle position may differ due to overflow handling
                  const unitsInSameRowBefore = playerTeam.filter(
                    (u, i) => i < index && u.preferredRow === unit.preferredRow
                  ).length;
                  const position = `${rowName}, Position ${
                    unitsInSameRowBefore + 1
                  }`;

                  return (
                    <div
                      key={unit.id}
                      className={`team-unit ${isDragging ? "dragging" : ""} ${
                        isDragOver ? "drag-over" : ""
                      }`}
                    >
                      <div
                        className="drag-handle"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        title={`${position} - Drag to reorder`}
                      >
                        ⋮⋮
                      </div>
                      <div className="unit-content">
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
                              title={`Sell for ${
                                MONEY.SELL_VALUE_BY_TIER[
                                  unit.def
                                    .tier as keyof typeof MONEY.SELL_VALUE_BY_TIER
                                ]
                              } gold`}
                            >
                              💰 Sell (
                              {
                                MONEY.SELL_VALUE_BY_TIER[
                                  unit.def
                                    .tier as keyof typeof MONEY.SELL_VALUE_BY_TIER
                                ]
                              }
                              )
                            </button>
                          </div>
                          <div className="unit-stats small-stats">
                            <div className="stat">
                              <span className="stat-icon">❤️</span>
                              <span className="stat-value">
                                {unit.def.base.hp}
                              </span>
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
                                  style={{
                                    backgroundColor: getTribeColor(tribe),
                                  }}
                                >
                                  {tribe}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="unit-controls">
                          <div className="position-info">
                            <span className="position-indicator">
                              {position}
                            </span>
                          </div>
                          <button
                            className={`row-button ${
                              unit.preferredRow === 0 ? "active" : ""
                            }`}
                            onClick={() => onToggleUnitRow(unit.id)}
                            title="Toggle between front and back row"
                          >
                            {unit.preferredRow === 0 ? "🛡️ Front" : "🏹 Back"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
