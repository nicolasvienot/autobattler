export const BOARD_WIDTH = 8; // 8 columns per team (0-7)
export const BOARD_HEIGHT = 2;

export type TeamId = "A" | "B";

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
