export type Board = {
  tiles: number[];
  source: number;
  sourceBit: number;
  sinkBit: number;
  sink: number;
  version: number;
  day: string;
};
export type Score = {
  id: string;
  nickname: string;
  moves: number;
  seconds: number;
  rank: number;
};
export const rotate = (mask: number) => ((mask << 1) & 15) | (mask >> 3);
const directions = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];
export function power(board: Board, tiles: number[]) {
  const powered = new Set<number>();
  const queue = tiles[board.source] & board.sourceBit ? [board.source] : [];
  while (queue.length) {
    const index = queue.pop()!;
    if (powered.has(index)) continue;
    powered.add(index);
    directions.forEach(([dx, dy], direction) => {
      const x = (index % 4) + dx,
        y = Math.floor(index / 4) + dy;
      const next = y * 4 + x;
      if (
        x >= 0 &&
        x < 4 &&
        y >= 0 &&
        y < 4 &&
        tiles[index] & (1 << direction) &&
        tiles[next] & (1 << ((direction + 2) % 4)) &&
        !powered.has(next)
      )
        queue.push(next);
    });
  }
  return {
    powered,
    won: powered.has(board.sink) && Boolean(tiles[board.sink] & board.sinkBit),
  };
}
export function today(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
export function dailyBoard(day = today()): Board {
  const seed = Math.floor(Date.parse(day + "T00:00:00Z") / 86400000);
  // Seven cable paths share fixed left/right terminals. Every path is scrambled by eight turns.
  const paths = [
    [0, 1, 5, 6, 10, 11, 15],
    [0, 4, 5, 9, 10, 14, 15],
    [0, 1, 2, 6, 10, 14, 15],
    [0, 4, 8, 9, 13, 14, 15],
    [0, 1, 5, 9, 10, 11, 15],
    [0, 4, 5, 6, 7, 11, 15],
    [0, 1, 2, 3, 7, 11, 15],
  ];
  const path = paths[((seed % 7) + 7) % 7];
  const tiles: number[] = Array.from({ length: 16 }, (_, i) =>
    (i + seed) % 2 ? 5 : 3,
  );
  path.forEach((cell, i) => {
    const before = i ? path[i - 1] : -1,
      after = i < path.length - 1 ? path[i + 1] : 16;
    const bit = (neighbor: number) =>
      neighbor === -1
        ? 8
        : neighbor === 16
          ? 2
          : neighbor === cell - 4
            ? 1
            : neighbor === cell + 1
              ? 2
              : neighbor === cell + 4
                ? 4
                : 8;
    tiles[cell] = bit(before) | bit(after);
  });
  path.forEach((cell, i) => {
    for (let turn = 0; turn < (i === 0 ? 2 : 3); turn++)
      tiles[cell] = rotate(tiles[cell]);
  });
  let source = 0,
    sink = 15,
    sourceBit = 8,
    sinkBit = 2;
  const turns = ((Math.floor(seed / 7) % 4) + 4) % 4;
  const rotateIndex = (index: number) =>
    (index % 4) * 4 + 3 - Math.floor(index / 4);
  for (let turn = 0; turn < turns; turn++) {
    const previous = [...tiles];
    previous.forEach((mask, index) => {
      tiles[rotateIndex(index)] = rotate(mask);
    });
    source = rotateIndex(source);
    sink = rotateIndex(sink);
    sourceBit = rotate(sourceBit);
    sinkBit = rotate(sinkBit);
  }
  return { tiles, source, sink, sourceBit, sinkBit, version: 1, day };
}
export function replay(board: Board, moves: number[]) {
  if (!Array.isArray(moves) || !moves.length || moves.length > 512)
    throw new Error("Use between 1 and 512 rotations.");
  const tiles = [...board.tiles];
  for (let i = 0; i < moves.length; i++) {
    const index = moves[i];
    if (!Number.isInteger(index) || index < 0 || index > 15)
      throw new Error("Invalid tile.");
    tiles[index] = rotate(tiles[index]);
    if (power(board, tiles).won) {
      if (i !== moves.length - 1) throw new Error("Round already finished.");
      return;
    }
  }
  throw new Error("The lamp is not connected.");
}
