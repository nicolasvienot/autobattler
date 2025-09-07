import { useEffect, useState } from "react";
import { Stage } from "@pixi/react";
import Board from "./components/Board";
import Menu from "./components/Menu";
import {
  teamPresets,
  unitsById,
  makeBattle,
  simulate,
} from "@nico/autobattler-battle-core";
import type { BattleLogEvent } from "@nico/autobattler-battle-core";
import { applyLogEvent, VisualState, emptyVisualState } from "./utils/playback";
import { audioManager, enableAudioOnUserInteraction } from "./utils/audio";

const WIDTH = 8 * 96 + 32; // 8 columns * tile size + padding
const HEIGHT = 5 * 96 + 32 + 20; // 5 rows (2 + 1 gap + 2) * tile size + padding + space for team labels

export default function App() {
  const [selA, setSelA] = useState(0);
  const [selB, setSelB] = useState(1);
  const [seed, setSeed] = useState("demo-seed");
  const [events, setEvents] = useState<BattleLogEvent[] | null>(null);
  const [vis, setVis] = useState<VisualState>(emptyVisualState());
  const [idx, setIdx] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Initialize audio on component mount
  useEffect(() => {
    // Enable audio on user interaction to comply with browser autoplay policies
    enableAudioOnUserInteraction();

    // Try to start music immediately (will only work if user has already interacted)
    audioManager.tryPlay().then(() => {
      setIsMusicPlaying(audioManager.getIsPlaying());
    });

    // Set initial volume
    audioManager.setVolume(musicVolume);
    setIsMusicMuted(audioManager.getIsMuted());

    return () => {
      // Cleanup: pause music when component unmounts
      audioManager.pause();
    };
  }, []);

  // ESC key handler for menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function run() {
    setWinner(null);
    const toInst = (preset: (typeof teamPresets)[number], team: "A" | "B") =>
      preset.members.map((m) => ({
        uid: "",
        team,
        defId: m.defId,
        level: m.level,
        pos: { row: m.row, col: m.col },
        itemIds: m.itemIds ?? [],
      })) as any;

    const A = toInst(teamPresets[selA], "A");
    const B = toInst(teamPresets[selB], "B");
    const state = makeBattle(seed, A, B);
    const result = simulate(state);
    setEvents(result.log);
    setVis(emptyVisualState());
    setIdx(0);
    setPlaying(true);
  }

  useEffect(() => {
    if (!playing || !events) return;
    if (idx >= events.length) {
      setPlaying(false);
      return;
    }
    const handle = setTimeout(() => {
      const e = events[idx];
      const nextVis = applyLogEvent(vis, e, unitsById);
      setVis(nextVis);
      setIdx(idx + 1);
      if (e.t === "end") setWinner((e as any).winner);
    }, Math.max(40, 220 / speed));
    return () => clearTimeout(handle);
  }, [playing, idx, events, vis, speed]);

  function resetPlayback() {
    setVis(emptyVisualState());
    setIdx(0);
    setPlaying(false);
  }

  return (
    <div className="layout">
      <div
        className="panel"
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <h3>Controls</h3>
        <div className="row">
          <label style={{ width: 80 }}>Team A</label>
          <select
            value={selA}
            onChange={(e) => setSelA(parseInt(e.target.value))}
          >
            {teamPresets.map((t, i) => (
              <option key={t.name} value={i}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="row">
          <label style={{ width: 80 }}>Team B</label>
          <select
            value={selB}
            onChange={(e) => setSelB(parseInt(e.target.value))}
          >
            {teamPresets.map((t, i) => (
              <option key={t.name} value={i}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="row">
          <label style={{ width: 80 }}>Seed</label>
          <input
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="seed"
          />
        </div>
        <div className="row">
          <button className="primary" onClick={run}>
            fight
          </button>
          <button
            className="secondary"
            onClick={() => setPlaying((p) => !p)}
            disabled={!events}
          >
            {playing ? "pause" : "play"}
          </button>
          <button className="secondary" onClick={resetPlayback}>
            reset
          </button>
        </div>
        <div className="row">
          <label>Speed</label>
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
        <div className="row">
          <span>Status:</span>
          {winner ? (
            <span className="winner">winner: {winner}</span>
          ) : (
            <span>{playing ? "playing..." : events ? "paused" : "idle"}</span>
          )}
        </div>
        <h3>Logs</h3>
        <div className="log">
          {events?.slice(Math.max(0, idx - 30), idx).map((e, i) => (
            <div key={i}>{JSON.stringify(e)}</div>
          ))}
        </div>
      </div>

      <div className="panel">
        <Stage width={WIDTH} height={HEIGHT} options={{ backgroundAlpha: 0 }}>
          <Board vis={vis} />
        </Stage>
      </div>

      <Menu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isMusicPlaying={isMusicPlaying}
        setIsMusicPlaying={setIsMusicPlaying}
        isMusicMuted={isMusicMuted}
        setIsMusicMuted={setIsMusicMuted}
        musicVolume={musicVolume}
        setMusicVolume={setMusicVolume}
      />
    </div>
  );
}
