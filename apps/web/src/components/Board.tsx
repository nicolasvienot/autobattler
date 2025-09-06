import { Graphics, Container, Text } from "@pixi/react";
import * as PIXI from "pixi.js";
import type { VisualState, VisualUnit } from "../utils/playback";

const TILE = 96;
const PAD = 16;
const TOP_OFFSET = 20; // Space for team labels
const BOARD_COLS = 8; // 8 columns wide
const TEAM_ROWS = 2; // 2 rows per team
const GAP_ROWS = 1; // Gap between teams
const TOTAL_ROWS = TEAM_ROWS * 2 + GAP_ROWS; // 5 rows total

// Text styles
const unitNameStyle = new PIXI.TextStyle({
  fill: "#0b0d12",
  fontSize: 11,
  fontWeight: "700",
});
const unitStatStyle = new PIXI.TextStyle({
  fill: "#0b0d12",
  fontSize: 12,
  fontWeight: "700",
});
const teamAStyle = new PIXI.TextStyle({
  fill: "#4da3ff",
  fontSize: 14,
  fontWeight: "700",
});
const teamBStyle = new PIXI.TextStyle({
  fill: "#ff7aa2",
  fontSize: 14,
  fontWeight: "700",
});

function drawGrid(g: any) {
  g.clear();
  g.lineStyle(1, 0x2a2f3a, 1);

  // Draw horizontal lines for Team A (top)
  for (let r = 0; r <= TEAM_ROWS; r++) {
    g.moveTo(PAD, PAD + TOP_OFFSET + r * TILE);
    g.lineTo(PAD + BOARD_COLS * TILE, PAD + TOP_OFFSET + r * TILE);
  }

  // Draw horizontal lines for Team B (bottom)
  const teamBOffset = (TEAM_ROWS + GAP_ROWS) * TILE;
  for (let r = 0; r <= TEAM_ROWS; r++) {
    g.moveTo(PAD, PAD + TOP_OFFSET + teamBOffset + r * TILE);
    g.lineTo(
      PAD + BOARD_COLS * TILE,
      PAD + TOP_OFFSET + teamBOffset + r * TILE
    );
  }

  // Draw vertical lines for both teams
  for (let c = 0; c <= BOARD_COLS; c++) {
    // Team A verticals
    g.moveTo(PAD + c * TILE, PAD + TOP_OFFSET);
    g.lineTo(PAD + c * TILE, PAD + TOP_OFFSET + TEAM_ROWS * TILE);

    // Team B verticals
    g.moveTo(PAD + c * TILE, PAD + TOP_OFFSET + teamBOffset);
    g.lineTo(PAD + c * TILE, PAD + TOP_OFFSET + teamBOffset + TEAM_ROWS * TILE);
  }
}

function UnitSprite({ u }: { u: VisualUnit }) {
  // Position units: Team A on top, Team B below with gap
  const col = u.pos.col; // Both teams use same column positioning
  const rowOffset =
    u.team === "B"
      ? (TEAM_ROWS + GAP_ROWS) * TILE // Team B starts after gap
      : 0; // Team A starts at top
  const x = PAD + col * TILE + 4;
  const y = PAD + TOP_OFFSET + rowOffset + u.pos.row * TILE + 4;
  const w = TILE - 8;
  const h = TILE - 8;
  const color = u.team === "A" ? 0x4da3ff : 0xff7aa2;
  const alpha = u.alive ? 1 : 0.3;

  return (
    <Container x={x} y={y}>
      <Graphics
        draw={(g: any) => {
          g.clear();
          g.beginFill(color, alpha);
          g.drawRoundedRect(0, 0, w, h, 10);
          g.endFill();
          g.lineStyle(2, 0xffffff, 0.07);
          g.drawRoundedRect(0, 0, w, h, 10);
        }}
      />
      <Text text={u.name} x={8} y={8} anchor={0} style={unitNameStyle} />
      <Text
        text={`HP ${u.hp}`}
        x={8}
        y={h - 14}
        anchor={0}
        style={unitStatStyle}
      />
      <Text
        text={`ATK ${u.atk}`}
        x={w - 8}
        y={h - 14}
        anchor={{ x: 1, y: 0 }}
        style={unitStatStyle}
      />
    </Container>
  );
}

export default function Board({ vis }: { vis: VisualState }) {
  return (
    <Container>
      <Graphics draw={drawGrid} />
      {/* Team labels */}
      <Text
        text="Team A"
        x={PAD + (BOARD_COLS / 2) * TILE}
        y={8}
        anchor={{ x: 0.5, y: 0 }}
        style={teamAStyle}
      />
      <Text
        text="Team B"
        x={PAD + (BOARD_COLS / 2) * TILE}
        y={PAD + TOP_OFFSET + (TEAM_ROWS + GAP_ROWS) * TILE - 8}
        anchor={{ x: 0.5, y: 1 }}
        style={teamBStyle}
      />
      {/* Gap visualization */}
      <Graphics
        draw={(g: any) => {
          g.clear();
          // Shade the gap area between teams
          g.beginFill(0x1a1d23, 0.3);
          g.drawRect(
            PAD,
            PAD + TOP_OFFSET + TEAM_ROWS * TILE,
            BOARD_COLS * TILE,
            GAP_ROWS * TILE
          );
          g.endFill();
        }}
      />
      {Array.from(vis.units.values()).map((u) => (
        <UnitSprite key={u.uid} u={u} />
      ))}
    </Container>
  );
}
