import { pipe } from "ramda";
import {
  makeLifeOrDeathDecision,
  calculateLiveNeighbors,
  initBoard,
  Item,
  tick
} from "./App";

describe("test makeLifeOrDeathDecision", () => {
  test("Any live cell with fewer than two live neighbours dies", () => {
    expect(makeLifeOrDeathDecision("live", 1)).toBe("dead");
  });

  test("Any live cell with two or three live neighbours lives on to the next generation", () => {
    expect(makeLifeOrDeathDecision("live", 2)).toBe("live");
    expect(makeLifeOrDeathDecision("live", 3)).toBe("live");
  });

  test("Any live cell with more than three live neighbours dies (overcrowding)", () => {
    expect(makeLifeOrDeathDecision("live", 4)).toBe("dead");
  });

  test("Any dead cell with exactly three live neighbours becomes a live cell (reproduction)", () => {
    expect(makeLifeOrDeathDecision("dead", 3)).toBe("live");
  });

  test("for less or larger than 3 for dead cell", () => {
    expect(makeLifeOrDeathDecision("dead", 2)).toBe("dead");
    expect(makeLifeOrDeathDecision("dead", 4)).toBe("dead");
  });
});

describe("test calculateLiveNeighbors", () => {
  test("should be [[3, 5, 3], [5, 8, 5], [3, 5, 3]] for size 3 and all cells live", () => {
    expect(
      pipe(
        initBoard(3),
        (board: Item[][]) =>
          board.map((row, y) =>
            row.map((_, x) => calculateLiveNeighbors(board, { x, y }))
          )
      )("live")
    ).toEqual([[3, 5, 3], [5, 8, 5], [3, 5, 3]]);
  });
});

describe("test tick", () => {
  test("should make live cells vertically aligned", () => {
    expect(
      tick([
        ["dead", "dead", "dead", "dead", "dead"],
        ["dead", "dead", "dead", "dead", "dead"],
        ["dead", "live", "live", "live", "dead"],
        ["dead", "dead", "dead", "dead", "dead"],
        ["dead", "dead", "dead", "dead", "dead"]
      ])
    ).toEqual([
      ["dead", "dead", "dead", "dead", "dead"],
      ["dead", "dead", "live", "dead", "dead"],
      ["dead", "dead", "live", "dead", "dead"],
      ["dead", "dead", "live", "dead", "dead"],
      ["dead", "dead", "dead", "dead", "dead"]
    ]);
  });
});
