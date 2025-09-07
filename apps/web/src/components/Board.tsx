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

// Text styles - Simple and clean, no effects
const unitNameStyle = new PIXI.TextStyle({
  fill: "#000000",
  fontSize: 11,
  fontWeight: "600",
  fontFamily: "Arial, sans-serif",
});
const unitStatStyle = new PIXI.TextStyle({
  fill: "#000000",
  fontSize: 10,
  fontWeight: "600",
  fontFamily: "Arial, sans-serif",
});
const buffedStatStyle = new PIXI.TextStyle({
  fill: "#0d7f3c",
  fontSize: 10,
  fontWeight: "700",
  fontFamily: "Arial, sans-serif",
});
const shieldTextStyle = new PIXI.TextStyle({
  fill: "#b8860b",
  fontSize: 8,
  fontWeight: "600",
  fontFamily: "Arial, sans-serif",
});
const teamAStyle = new PIXI.TextStyle({
  fill: "#ffffff",
  fontSize: 14,
  fontWeight: "700",
  fontFamily: "Arial, sans-serif",
});
const teamBStyle = new PIXI.TextStyle({
  fill: "#ffffff",
  fontSize: 14,
  fontWeight: "700",
  fontFamily: "Arial, sans-serif",
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
  const col = u.pos.col;
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

  // Calculate stat changes for visual feedback
  const atkChanged = u.atk !== u.baseAtk;
  const atkDiff = u.atk - u.baseAtk;
  const hasShield = u.alive && u.shield && u.shield > 0;

  return (
    <Container x={x} y={y}>
      {/* Main unit background */}
      <Graphics
        draw={(g: any) => {
          g.clear();

          // Main unit rectangle
          g.beginFill(color, alpha);
          g.drawRoundedRect(0, 0, w, h, 8);
          g.endFill();

          // Base border
          g.lineStyle(2, 0xffffff, 0.1);
          g.drawRoundedRect(0, 0, w, h, 8);

          // Shield effect - glowing golden border (only if shield > 0)
          if (hasShield) {
            g.lineStyle(4, 0xffd700, 0.9);
            g.drawRoundedRect(-3, -3, w + 6, h + 6, 11);
            // Inner glow effect
            g.lineStyle(2, 0xffffff, 0.3);
            g.drawRoundedRect(-1, -1, w + 2, h + 2, 9);
          }

          // Buff indicator - green glow for buffed units
          if (atkChanged && atkDiff > 0) {
            g.lineStyle(2, 0x22c55e, 0.6);
            g.drawRoundedRect(-2, -2, w + 4, h + 4, 10);
          }
        }}
      />

      {/* Unit name */}
      <Text
        text={u.name || "Unit"}
        x={w / 2}
        y={8}
        anchor={{ x: 0.5, y: 0 }}
        style={unitNameStyle}
      />

      {/* HP Display - Always render, never conditional */}
      <Text
        text={`HP ${u.hp ?? "X"}`}
        x={8}
        y={h - 14}
        anchor={0}
        style={unitStatStyle}
      />

      {/* Attack Display - Always render, never conditional */}
      <Text
        text={
          atkChanged
            ? `ATK ${u.atk ?? "X"} (+${atkDiff ?? "X"})`
            : `ATK ${u.atk ?? "X"}`
        }
        x={w - 8}
        y={h - 14}
        anchor={{ x: 1, y: 0 }}
        style={atkChanged ? buffedStatStyle : unitStatStyle}
      />

      {/* Shield Display - Only render if alive and shield exists and > 0 */}
      {u.alive && u.shield && u.shield > 0 ? (
        <Text
          text={`🛡️ ${u.shield}`}
          x={w / 2}
          y={h / 2 + 5}
          anchor={{ x: 0.5, y: 0.5 }}
          style={shieldTextStyle}
        />
      ) : null}

      {/* Status effects indicator */}
      {u.statuses && Object.keys(u.statuses).length > 0 ? (
        <Graphics
          draw={(g: any) => {
            g.clear();
            // Small colored dot for status effects
            g.beginFill(0xff6b6b, 0.8);
            g.drawCircle(w - 8, 8, 4);
            g.endFill();
          }}
        />
      ) : null}

      {/* Attack buff indicator */}
      {atkChanged && atkDiff > 0 ? (
        <Text
          text={`+${atkDiff} ATK`}
          x={w / 2}
          y={-8}
          anchor={{ x: 0.5, y: 1 }}
          style={{
            fontSize: 8,
            fill: 0x22c55e,
            fontWeight: "bold",
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowBlur: 2,
            dropShadowDistance: 1,
          }}
        />
      ) : null}
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
        style={{
          fill: 0x4da3ff,
          fontSize: 14,
          fontWeight: "700",
          fontFamily: "Arial, sans-serif",
        }}
      />
      <Text
        text="Team B"
        x={PAD + (BOARD_COLS / 2) * TILE}
        y={PAD + TOP_OFFSET + (TEAM_ROWS + GAP_ROWS) * TILE - 8}
        anchor={{ x: 0.5, y: 1 }}
        style={{
          fill: 0xff7aa2,
          fontSize: 14,
          fontWeight: "700",
          fontFamily: "Arial, sans-serif",
        }}
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
