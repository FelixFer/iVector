import { test, expect } from "@playwright/test";
import { dailyBoard, power, rotate, replay } from "../game/model";
test("daily cable boards start unlit and accept a verified solution", () => {
  for (let day = 1; day <= 28; day++) {
    const board = dailyBoard(`2026-11-${String(day).padStart(2, "0")}`);
    expect(power(board, board.tiles).won).toBe(false);
    const paths: number[][] = [];
    function walk(path: number[]) {
      const last = path.at(-1)!;
      if (last === board.sink) {
        paths.push(path);
        return;
      }
      for (const next of [last - 4, last + 1, last + 4, last - 1])
        if (
          next >= 0 &&
          next < 16 &&
          !path.includes(next) &&
          Math.abs((next % 4) - (last % 4)) +
            Math.abs(Math.floor(next / 4) - Math.floor(last / 4)) ===
            1
        )
          walk([...path, next]);
    }
    walk([board.source]);
    let solution: number[] | undefined;
    for (const path of paths) {
      const moves: number[] = [];
      let valid = true;
      for (let i = 0; i < path.length; i++) {
        const cell = path[i],
          before = i ? path[i - 1] : -1,
          after = i < path.length - 1 ? path[i + 1] : 16;
        const bit = (n: number) =>
          n === -1
            ? board.sourceBit
            : n === 16
              ? board.sinkBit
              : n === cell - 4
                ? 1
                : n === cell + 1
                  ? 2
                  : n === cell + 4
                    ? 4
                    : 8;
        const required = bit(before) | bit(after);
        let mask = board.tiles[cell],
          turn = 0;
        while ((mask & required) !== required && turn < 4) {
          mask = rotate(mask);
          turn++;
        }
        if (turn === 4) {
          valid = false;
          break;
        }
        moves.push(...Array(turn).fill(cell));
      }
      if (valid && (!solution || moves.length < solution.length))
        solution = moves;
    }
    expect(solution).toBeDefined();
    expect(solution!.length).toBeGreaterThanOrEqual(6);
    expect(solution!.length).toBeLessThanOrEqual(14);
    const tiles = [...board.tiles],
      moves: number[] = [];
    for (const cell of solution!) {
      tiles[cell] = rotate(tiles[cell]);
      moves.push(cell);
      if (power(board, tiles).won) break;
    }
    expect(() => replay(board, moves)).not.toThrow();
  }
});

test("lamp requires its outward contact in all orientations", () => {
  const sides = new Set<number>();
  for (let day = 1; day <= 28; day++) {
    const board = dailyBoard(`2026-11-${String(day).padStart(2, "0")}`);
    sides.add(board.sinkBit);
    const tiles = Array(16).fill(15);
    tiles[board.sink] &= ~board.sinkBit;
    expect(power(board, tiles).powered.has(board.sink)).toBe(true);
    expect(power(board, tiles).won).toBe(false);
    tiles[board.sink] |= board.sinkBit;
    expect(power(board, tiles).won).toBe(true);
  }
  expect(sides.size).toBe(4);
});
