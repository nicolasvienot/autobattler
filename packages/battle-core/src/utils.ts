import type { RuntimeUnit } from "./types";

export function uid() {
  return Math.random().toString(36).slice(2);
}

export function byPos(a: RuntimeUnit, b: RuntimeUnit): number {
  if (a.pos.row !== b.pos.row) return a.pos.row - b.pos.row;
  if (a.pos.col !== b.pos.col) return a.pos.col - b.pos.col;
  return a.uid.localeCompare(b.uid);
}
