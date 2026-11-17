import { navigation } from "@/data/site";

export type Point = { x: number; y: number };
export type Direction = "up" | "down" | "left" | "right";
export type Guide = Point & { label: string; href: string; color: string; dialogue: string; sign: Point };

export const guides: readonly Guide[] = [
  { ...navigation[2], x: 60, y: 58, sign: { x: 58, y: 10 }, color: "#284e6d", dialogue: "Browse research areas." },
  { ...navigation[3], x: 180, y: 58, sign: { x: 180, y: 10 }, color: "#426347", dialogue: "Browse projects and resources." },
  { ...navigation[4], x: 96, y: 114, sign: { x: 53, y: 82 }, color: "#87543b", dialogue: "Find lab member profiles." },
  { ...navigation[5], x: 138, y: 122, sign: { x: 226, y: 82 }, color: "#70547e", dialogue: "Browse publications and paper links." },
];
export const spawn: Point = { x: 120, y: 70 };
export const movementSpeed = 36;
export const vectors: Record<Direction, Point> = {
  up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
};
type Rect = readonly [x: number, y: number, width: number, height: number];
// Coordinates match lab-map.svg; the character collides at its feet.
export const walls: readonly Rect[] = [
  [104, 9, 4, 34], [132, 9, 4, 34],
  [104, 81, 4, 9], [104, 110, 4, 15], [132, 81, 4, 9], [132, 110, 4, 15],
  [12, 59, 96, 3], [132, 59, 96, 3], [12, 78, 96, 3], [132, 78, 96, 3],
];
export const obstacles: readonly Rect[] = [
  ...walls,
  ...([
  [29, 24, 35, 16], [68, 33, 35, 16], [43, 42, 8, 10], [16, 49, 11, 12],
  [139, 25, 35, 16], [176, 25, 35, 16], [153, 43, 8, 10], [190, 43, 8, 10],
  [139, 45, 8, 3], [203, 45, 8, 3], [211, 48, 11, 12],
  ] satisfies Rect[]).map(([x, y, width, height]) => [x, 10 + y * 0.8, width, height * 0.8] as const),
  ...([
  [39, 86, 48, 17], [49, 81, 8, 10], [68, 81, 8, 10],
  [49, 102, 8, 10], [68, 102, 8, 10], [17, 106, 11, 12],
  [143, 84, 38, 18], [184, 84, 38, 18], [153, 105, 21, 9], [191, 105, 18, 9], [213, 107, 11, 12],
  ] satisfies Rect[]).map(([x, y, width, height]) => [x, 43.35 + y * 0.65, width, height * 0.65] as const),
  ...guides.map(g => [g.x - 2, g.y - 2, 4, 3] as const),
];
export function canStand({ x, y }: Point): boolean {
  const radius = 1.5;
  return x >= 12 + radius && x <= 228 - radius && y >= 9 + radius && y <= 125 - radius &&
    !obstacles.some(([left, top, width, height]) =>
      x + radius > left && x - radius < left + width && y + radius > top && y - radius < top + height);
}
export function move(position: Point, input: Point, seconds: number): Point {
  const length = Math.hypot(input.x, input.y);
  if (!length) return position;
  const distance = movementSpeed * Math.min(Math.max(seconds, 0), 0.05);
  const steps = Math.max(1, Math.ceil(distance / 0.5));
  const dx = input.x / length * distance / steps, dy = input.y / length * distance / steps;
  let next = { ...position };
  for (let step = 0; step < steps; step++) {
    if (canStand({ x: next.x + dx, y: next.y })) next = { ...next, x: next.x + dx };
    if (canStand({ x: next.x, y: next.y + dy })) next = { ...next, y: next.y + dy };
  }
  return next;
}
export function roomAt({ x, y }: Point): string {
  if (x >= 108 && x <= 132 || y >= 62 && y <= 78) return "Central corridor";
  return guides[(y < 62 ? 0 : 2) + (x < 108 ? 0 : 1)].label;
}
export function guideNear(position: Point): Guide | undefined {
  return guides.find(g => Math.hypot(g.x - position.x, g.y - position.y) <= 12 && hasLineOfSight(position, g));
}

export function hasLineOfSight(from: Point, to: Point): boolean {
  return !walls.some(([x, y, width, height]) => {
    let enter = 0, exit = 1;
    // Intersect the player-to-guide segment with both slabs of the wall rectangle.
    for (const [start, delta, min, max] of [
      [from.x, to.x - from.x, x, x + width],
      [from.y, to.y - from.y, y, y + height],
    ]) {
      if (delta === 0) {
        if (start < min || start > max) return false;
      } else {
        const a = (min - start) / delta, b = (max - start) / delta;
        enter = Math.max(enter, Math.min(a, b));
        exit = Math.min(exit, Math.max(a, b));
        if (enter > exit) return false;
      }
    }
    return true;
  });
}

export const gameBook: Point = { x: 219, y: 43 };
export function canOpenBook(position: Point): boolean {
  return Math.hypot(position.x - gameBook.x, position.y - gameBook.y) <= 12 && hasLineOfSight(position, gameBook);
}
