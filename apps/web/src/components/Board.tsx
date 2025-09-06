import { Graphics, Container, Text } from "@pixi/react";
import { useState, useRef, useEffect } from "react";
import type { VisualState, VisualUnit } from "../utils/playback";
import type { UnitDef } from "@nico/autobattler-battle-core";

const TILE = 96;
const PAD = 16;
const TOP_OFFSET = 20; // Space for team labels
const BOARD_COLS = 8; // 8 columns wide
const TEAM_ROWS = 2; // 2 rows per team
const GAP_ROWS = 1; // Gap between teams
const TOTAL_ROWS = TEAM_ROWS * 2 + GAP_ROWS; // 5 rows total

function drawGrid(g: PIXI.Graphics) {
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

function UnitSprite({
  u,
  unitsById,
  onHover,
  onHoverEnd,
}: {
  u: VisualUnit;
  unitsById: Record<string, UnitDef>;
  onHover: (unit: VisualUnit, x: number, y: number) => void;
  onHoverEnd: () => void;
}) {
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
        eventMode="static"
        cursor="pointer"
        hitArea={{ x: 0, y: 0, width: w, height: h }}
        onPointerOver={() => {
          console.log("Hovering unit:", u.name);
          onHover(u, x + w / 2, y);
        }}
        onPointerOut={() => {
          console.log("Leave hover");
          onHoverEnd();
        }}
        draw={(g) => {
          g.clear();
          g.beginFill(color, alpha);
          g.drawRoundedRect(0, 0, w, h, 10);
          g.endFill();
          g.lineStyle(2, 0xffffff, 0.07);
          g.drawRoundedRect(0, 0, w, h, 10);
        }}
      />
      <Text
        text={u.name}
        x={8}
        y={8}
        anchor={0}
        style={{ fill: "#0b0d12", fontSize: 11, fontWeight: "700" }}
      />
      <Text
        text={`HP ${u.hp}`}
        x={8}
        y={h - 14}
        anchor={0}
        style={{ fill: "#0b0d12", fontSize: 12, fontWeight: "700" }}
      />
      <Text
        text={`ATK ${u.atk}`}
        x={w - 8}
        y={h - 14}
        anchor={{ x: 1, y: 0 }}
        style={{ fill: "#0b0d12", fontSize: 12, fontWeight: "700" }}
      />
    </Container>
  );
}

// Helper to get unit ID from UID
function getUnitDefId(uid: string): string {
  const parts = uid.split("-");
  if (parts.length < 3) return "";
  return parts[1]; // The unit def ID is the second part
}

// Format ability description
function formatAbility(ability: any): string {
  if (!ability) return "No ability";

  const triggerText =
    {
      onStart: "Start of Battle",
      onAttack: "On Attack",
      onHurt: "When Hurt",
      onFaint: "On Death",
      onTurnStart: "Start of Turn",
    }[ability.trigger] || ability.trigger;

  const targetText = (target: string) => {
    const targetMap: Record<string, string> = {
      self: "self",
      allyFront: "frontmost ally",
      allyRandom: "random ally",
      allyLowestHP: "ally with lowest HP",
      enemyFront: "frontmost enemy",
      enemyRandom: "random enemy",
      enemyBack: "backmost enemy",
      allAllies: "all allies",
      allEnemies: "all enemies",
    };
    return targetMap[target] || target;
  };

  const effectDescriptions = ability.effects
    .map((effect: any) => {
      switch (effect.kind) {
        case "buff":
          const buffs = [];
          if (effect.atk) buffs.push(`+${effect.atk} ATK`);
          if (effect.hp) buffs.push(`+${effect.hp} HP`);
          return `Give ${targetText(effect.target)} ${buffs.join(" and ")}`;
        case "damage":
          return `Deal ${effect.amount} damage to ${targetText(effect.target)}`;
        case "heal":
          return `Heal ${targetText(effect.target)} for ${effect.amount}`;
        case "shield":
          return `Give ${targetText(effect.target)} ${effect.amount} shield`;
        case "summon":
          return `Summon ${effect.count} ${effect.unitId}${
            effect.count > 1 ? "s" : ""
          }`;
        case "status":
          return `Apply ${effect.amount} ${effect.status} to ${targetText(
            effect.target
          )}`;
        default:
          return JSON.stringify(effect);
      }
    })
    .join(", ");

  const chanceText = ability.chance
    ? `${Math.round(ability.chance * 100)}% chance: `
    : "";

  return `${triggerText}: ${chanceText}${effectDescriptions}`;
}

// Tooltip component
function Tooltip({
  unit,
  unitDef,
  x,
  y,
}: {
  unit: VisualUnit;
  unitDef?: UnitDef;
  x: number;
  y: number;
}) {
  const ability = unitDef?.ability;
  const abilityText = ability ? formatAbility(ability) : "No ability";

  // Calculate tooltip dimensions based on text length
  const tooltipWidth = Math.min(250, Math.max(180, abilityText.length * 2));
  const tooltipHeight = ability ? 80 : 60;

  // Position tooltip above unit, ensure it stays on screen
  const tooltipY = y - tooltipHeight - 10;
  const tooltipX = Math.max(
    tooltipWidth / 2 + 10,
    Math.min(x, BOARD_COLS * TILE + PAD - tooltipWidth / 2 - 10)
  );

  return (
    <Container x={tooltipX} y={tooltipY}>
      <Graphics
        draw={(g) => {
          g.clear();
          g.beginFill(0x1a1d23, 0.95);
          g.lineStyle(1, 0x4a5568, 0.8);
          g.drawRoundedRect(
            -tooltipWidth / 2,
            -tooltipHeight / 2,
            tooltipWidth,
            tooltipHeight,
            8
          );
          g.endFill();
        }}
      />
      <Text
        text={unit.name}
        x={0}
        y={-tooltipHeight / 2 + 12}
        anchor={{ x: 0.5, y: 0 }}
        style={{ fill: "#ffffff", fontSize: 13, fontWeight: "700" }}
      />
      <Text
        text={abilityText}
        x={0}
        y={-tooltipHeight / 2 + 32}
        anchor={{ x: 0.5, y: 0 }}
        style={{
          fill: "#b0b0b0",
          fontSize: 11,
          fontWeight: "400",
          wordWrap: true,
          wordWrapWidth: tooltipWidth - 20,
          align: "center",
          lineHeight: 14,
        }}
      />
    </Container>
  );
}

export default function Board({
  vis,
  unitsById,
}: {
  vis: VisualState;
  unitsById: Record<string, UnitDef>;
}) {
  const [hoveredUnit, setHoveredUnit] = useState<{
    unit: VisualUnit;
    x: number;
    y: number;
  } | null>(null);

  console.log("Board render, hoveredUnit:", hoveredUnit);

  return (
    <Container>
      <Graphics draw={drawGrid} />
      {/* Team labels */}
      <Text
        text="Team A"
        x={PAD + (BOARD_COLS / 2) * TILE}
        y={8}
        anchor={{ x: 0.5, y: 0 }}
        style={{ fill: "#4da3ff", fontSize: 14, fontWeight: "700" }}
      />
      <Text
        text="Team B"
        x={PAD + (BOARD_COLS / 2) * TILE}
        y={PAD + TOP_OFFSET + (TEAM_ROWS + GAP_ROWS) * TILE - 8}
        anchor={{ x: 0.5, y: 1 }}
        style={{ fill: "#ff7aa2", fontSize: 14, fontWeight: "700" }}
      />
      {/* Gap visualization */}
      <Graphics
        draw={(g) => {
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
        <UnitSprite
          key={u.uid}
          u={u}
          unitsById={unitsById}
          onHover={(unit, x, y) => setHoveredUnit({ unit, x, y })}
          onHoverEnd={() => setHoveredUnit(null)}
        />
      ))}
      {hoveredUnit && (
        <Tooltip
          unit={hoveredUnit.unit}
          unitDef={unitsById[getUnitDefId(hoveredUnit.unit.uid)]}
          x={hoveredUnit.x}
          y={hoveredUnit.y}
        />
      )}
    </Container>
  );
}
