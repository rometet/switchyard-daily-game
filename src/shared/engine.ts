/** Pure, deterministic shared rules used for server-side replay and score validation. */
export const SIZE = 5;
export const SOURCE = 10;
export const TARGET = 14;
const DIRS: [number, number][] = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const BACK = [2, 3, 0, 1];

export function hashDate(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) hash = Math.imul(hash ^ input.charCodeAt(i), 16777619);
  return hash >>> 0;
}
export function neighbor(index: number, dir: number): number {
  const row = Math.floor(index / SIZE) + DIRS[dir]![0];
  const col = index % SIZE + DIRS[dir]![1];
  return row < 0 || col < 0 || row >= SIZE || col >= SIZE ? -1 : row * SIZE + col;
}
export function generateBoard(date: string): { base: number[][]; turns: number[]; path: number[] } {
  let seed = hashDate('switchyard:' + date);
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const shuffle = (arr: number[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [arr[i], arr[j]] = [arr[j]!, arr[i]!];
    }
    return arr;
  };
  function buildPath(): number[] {
    for (let attempt = 0; attempt < 350; attempt++) {
      const seen = new Set<number>([SOURCE]);
      const path = [SOURCE];
      function visit(cur: number): boolean {
        if (cur === TARGET) return path.length >= 10 && path.length <= 19;
        if (path.length >= 19) return false;
        const dirs = shuffle([0, 1, 2, 3]);
        for (let k = 0; k < dirs.length; k++) {
          const next = neighbor(cur, dirs[k]!);
          if (next < 0 || seen.has(next)) continue;
          seen.add(next);
          path.push(next);
          if (visit(next)) return true;
          path.pop();
          seen.delete(next);
        }
        return false;
      }
      if (visit(SOURCE)) return path.slice();
    }
    return [10, 11, 6, 7, 8, 13, 12, 17, 18, 19, 14];
  }
  const path = buildPath();
  const base: number[][] = [];
  for (let i = 0; i < SIZE * SIZE; i++) {
    const idx = path.indexOf(i);
    const conn: number[] = [];
    if (idx >= 0) {
      if (idx > 0) for (let d = 0; d < 4; d++) if (neighbor(i, d) === path[idx - 1]) conn.push(d);
      if (idx < path.length - 1) for (let d = 0; d < 4; d++) if (neighbor(i, d) === path[idx + 1]) conn.push(d);
    } else {
      const a = Math.floor(random() * 4);
      conn.push(a, (a + 1 + Math.floor(random() * 3)) % 4);
    }
    base.push(conn);
  }
  const turns = base.map(() => Math.floor(random() * 4));
  return { base, turns, path };
}
export function powerNetwork(board: { base: number[][]; turns: number[] }): Set<number> {
  const connections = (i: number): number[] => board.base[i]!.map((d) => (d + board.turns[i]!) % 4);
  const reached = new Set<number>([SOURCE]);
  const queue = [SOURCE];
  while (queue.length) {
    const pos = queue.shift()!;
    for (const d of connections(pos)) {
      const next = neighbor(pos, d);
      if (next < 0 || reached.has(next)) continue;
      if (connections(next).includes(BACK[d]!)) {
        reached.add(next);
        queue.push(next);
      }
    }
  }
  return reached;
}
/** Reject impossible, post-victory, reset/hint, and out-of-range score claims. */
export function verifyReplay(date: string, rotations: unknown): { ok: boolean; moves: number; reason?: string } {
  if (!Array.isArray(rotations) || rotations.length > 250 || rotations.some((x) => !Number.isInteger(x) || x < 0 || x >= 25)) {
    return { ok: false, moves: 0, reason: 'invalid move transcript' };
  }
  const board = generateBoard(date);
  if (powerNetwork(board).has(TARGET)) return { ok: rotations.length === 0, moves: 0 };
  for (let i = 0; i < rotations.length; i++) {
    const pos = rotations[i] as number;
    board.turns[pos] = (board.turns[pos]! + 1) % 4;
    if (powerNetwork(board).has(TARGET)) {
      return i === rotations.length - 1 ? { ok: true, moves: i + 1 } : { ok: false, moves: i + 1, reason: 'post-victory moves' };
    }
  }
  return { ok: false, moves: rotations.length, reason: 'exit not connected' };
}
