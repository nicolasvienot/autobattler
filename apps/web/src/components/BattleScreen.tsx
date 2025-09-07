import { useEffect, useState } from "react";
import { Stage } from "@pixi/react";
import Board from "./Board";
import {
  makeBattle,
  simulate,
  unitsById,
  type BattleLogEvent,
} from "@nico/autobattler-battle-core";
import {
  applyLogEvent,
  VisualState,
  emptyVisualState,
} from "../utils/playback";
import type { PlayerUnit } from "../types/game";

const WIDTH = 8 * 96 + 32;
const HEIGHT = 5 * 96 + 32 + 20;

interface BattleScreenProps {
  playerTeam: PlayerUnit[];
  opponentTeam: PlayerUnit[];
  playerWins: number;
  opponentWins: number;
  onBattleComplete: (winner: "player" | "opponent") => void;
}

export default function BattleScreen({
  playerTeam,
  opponentTeam,
  playerWins,
  opponentWins,
  onBattleComplete,
}: BattleScreenProps) {
  const [events, setEvents] = useState<BattleLogEvent[] | null>(null);
  const [vis, setVis] = useState<VisualState>(emptyVisualState());
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [battleStarted, setBattleStarted] = useState(false);
  const [speed, setSpeed] = useState(1);

  const round = playerWins + opponentWins + 1;

  // Convert PlayerUnit to battle format
  const playerUnitToInstance = (
    unit: PlayerUnit,
    team: "A" | "B",
    index: number
  ) => {
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
  };

  // Start the battle
  const startBattle = () => {
    if (battleStarted) return;

    setBattleStarted(true);

    const playerInstances = playerTeam.map((unit, index) =>
      playerUnitToInstance(unit, "A", index)
    );
    const opponentInstances = opponentTeam.map((unit, index) =>
      playerUnitToInstance(unit, "B", index)
    );

    const seed = `battle_${Date.now()}`;
    const state = makeBattle(seed, playerInstances, opponentInstances);
    const result = simulate(state);

    setEvents(result.log);
    setVis(emptyVisualState());
    setIdx(0);
    setPlaying(true);
  };

  // Prepare battle data but don't auto-start
  useEffect(() => {
    if (battleStarted) return;

    setBattleStarted(true);

    const playerInstances = playerTeam.map((unit, index) =>
      playerUnitToInstance(unit, "A", index)
    );
    const opponentInstances = opponentTeam.map((unit, index) =>
      playerUnitToInstance(unit, "B", index)
    );

    const seed = `battle_${Date.now()}`;
    const state = makeBattle(seed, playerInstances, opponentInstances);
    const result = simulate(state);

    setEvents(result.log);
    setVis(emptyVisualState());
    setIdx(0);
    setPlaying(false); // Don't auto-start
  }, []);

  // Battle playback logic
  useEffect(() => {
    if (!playing || !events) return;

    if (idx >= events.length) {
      setPlaying(false);
      // Battle complete - user can manually continue via button
      return;
    }

    const handle = setTimeout(() => {
      const e = events[idx];
      const nextVis = applyLogEvent(vis, e, unitsById);
      setVis(nextVis);
      setIdx(idx + 1);
    }, Math.max(40, 220 / speed)); // Variable speed based on speed setting

    return () => clearTimeout(handle);
  }, [playing, idx, events, vis, onBattleComplete, speed]);

  // Control functions
  const togglePlayback = () => {
    setPlaying(!playing);
  };

  const resetPlayback = () => {
    setVis(emptyVisualState());
    setIdx(0);
    setPlaying(false);
  };

  const stepForward = () => {
    if (events && idx < events.length) {
      const e = events[idx];
      const nextVis = applyLogEvent(vis, e, unitsById);
      setVis(nextVis);
      setIdx(idx + 1);
    }
  };

  return (
    <div className="screen battle-screen">
      {/* Battle Controls Panel - Top Right */}
      <div className="battle-controls">
        <h4>Battle Controls</h4>
        <div className="control-row">
          <button
            className={playing ? "secondary" : "primary"}
            onClick={togglePlayback}
            disabled={!events}
          >
            {playing ? "⏸️ Pause" : "▶️ Play"}
          </button>
          <button
            className="secondary"
            onClick={resetPlayback}
            disabled={!events}
          >
            🔄 Reset
          </button>
          <button
            className="secondary"
            onClick={stepForward}
            disabled={!events || idx >= events.length}
            title="Step forward"
          >
            ⏭️ Next
          </button>
        </div>
        <div className="control-row">
          <label>Speed:</label>
          <input
            type="range"
            min={0.5}
            max={4}
            step={0.5}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
          />
          <span>{speed}x</span>
        </div>
        <div className="control-info">
          <div>
            Event: {idx}/{events?.length || 0}
          </div>
          <div>
            Status:{" "}
            {!events
              ? "Loading..."
              : idx >= events.length
              ? "Complete"
              : playing
              ? "Playing..."
              : "Paused"}
          </div>
          {events && idx < events.length && (
            <div className="current-event">Next: {events[idx]?.t}</div>
          )}
          {events && idx < events.length && (
            <div className="event-details">
              {JSON.stringify(events[idx], null, 2).slice(0, 100)}
              {JSON.stringify(events[idx], null, 2).length > 100 && "..."}
            </div>
          )}
        </div>
      </div>

      <div className="battle-header">
        <h2>Round {round} - Battle!</h2>
        <div className="score">
          <span className="player-score">You: {playerWins}</span>
          <span className="vs">vs</span>
          <span className="opponent-score">Opponent: {opponentWins}</span>
        </div>
      </div>

      <div className="battle-content">
        <div className="battle-layout">
          <div className="battle-info">
            <div className="team-info">
              <div className="player-team-info">
                <h3>Your Team</h3>
                <div className="team-preview">
                  {playerTeam.map((unit, index) => (
                    <span key={unit.id} className="unit-name">
                      {unit.def.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="opponent-team-info">
                <h3>Opponent Team</h3>
                <div className="team-preview">
                  {opponentTeam.map((unit, index) => (
                    <span key={unit.id} className="unit-name">
                      {unit.def.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="effects-legend">
            <h4>Visual Effects Guide</h4>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-indicator buff-indicator"></div>
                <span>🟢 Green Stats = Buffed</span>
              </div>
              <div className="legend-item">
                <div className="legend-indicator shield-indicator"></div>
                <span>🛡️ Gold Border = Shield</span>
              </div>
              <div className="legend-item">
                <div className="legend-indicator poison-dot"></div>
                <span>🟣 Purple Dot = Poison</span>
              </div>
              <div className="legend-item">
                <div className="legend-indicator chain-dot"></div>
                <span>🔵 Blue Dot = Chain</span>
              </div>
              <div className="legend-item">
                <div className="legend-indicator lifesteal-dot"></div>
                <span>🔴 Red Dot = Lifesteal</span>
              </div>
              <div className="legend-item">
                <div className="legend-indicator generic-dot"></div>
                <span>🟡 Yellow Dot = Other Effects</span>
              </div>
            </div>
          </div>
        </div>

        <div className="battle-stage">
          <Stage width={WIDTH} height={HEIGHT} options={{ backgroundAlpha: 0 }}>
            <Board vis={vis} />
          </Stage>
        </div>

        <div className="battle-status">
          {!events ? (
            <div className="status-message">Loading battle data...</div>
          ) : idx >= events.length ? (
            <div className="battle-complete">
              <div className="status-message">Battle complete!</div>
              <button
                className="primary continue-battle-button"
                onClick={() => {
                  const endEvent = events[events.length - 1];
                  if (endEvent.t === "end") {
                    const winner =
                      endEvent.winner === "A" ? "player" : "opponent";
                    onBattleComplete(winner);
                  }
                }}
              >
                Continue to Results
              </button>
            </div>
          ) : playing ? (
            <div className="status-message">Battle in progress...</div>
          ) : (
            <div className="status-message">
              Battle ready - Click ▶️ Play to start
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
