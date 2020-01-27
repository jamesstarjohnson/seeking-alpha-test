import React, { useEffect, useState } from "react";
import { range, pipe, curry } from "ramda";
import { random } from "lodash";
import styled from "styled-components";
import { interval } from "rxjs";

export type Item = "live" | "dead";
type Coord = { x: number; y: number };

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Board = styled.div<{ size: number }>`
  display: grid;
  grid-template-columns: ${({ size }) => `repeat(${size}, auto)`};
  grid-auto-rows: auto;
  grid-gap: 1px;
  height: 100vmin;
  width: 100vmin;
`;

const Cell = styled.div<{ kind: Item }>`
  background-color: ${props => (props.kind === "dead" ? "white" : "black")};
  text-align: center;
  border: 1px solid silver;
`;

const getItem = (board: Item[][]) => (coord: Coord): Item | undefined => {
  try {
    return board[coord.y][coord.x];
  } catch (error) {
    return undefined;
  }
};

const size = 50;
const startUpRandomNumber = 500;

const getKey = ({ x, y }: Coord) => `${y}, ${x}`;

const randomCoords = new Set(
  range(0, startUpRandomNumber)
    .map<[number, number]>(() => [random(size - 1), random(size - 1)])
    .map(([y, x]) => getKey({ x, y }))
);

export const initBoard = curry((size: number, filler: Item | "random") =>
  range(0, size).map((_, y) =>
    range(0, size).map<Item>((_, x) => {
      switch (filler) {
        case "random":
          return randomCoords.has(getKey({ x, y })) ? "live" : "dead";
        default:
          return filler;
      }
    })
  )
);

export const makeLifeOrDeathDecision = curry(
  (currentItem: Item, liveNeighborsNumber: number) => {
    switch (currentItem) {
      case "live":
        if (liveNeighborsNumber < 2) {
          return "dead";
        }
        if (liveNeighborsNumber === 2 || liveNeighborsNumber === 3) {
          return "live";
        }
        if (liveNeighborsNumber > 3) {
          return "dead";
        }
        return currentItem;
      case "dead":
        if (liveNeighborsNumber === 3) {
          return "live";
        }
        return currentItem;
    }
  }
);

export const calculateLiveNeighbors = curry(
  (board: Item[][], coord: Coord) =>
    [
      { y: coord.y - 1, x: coord.x - 1 },
      { y: coord.y - 1, x: coord.x },
      { y: coord.y - 1, x: coord.x + 1 },

      { y: coord.y, x: coord.x - 1 },
      { y: coord.y, x: coord.x + 1 },

      { y: coord.y + 1, x: coord.x - 1 },
      { y: coord.y + 1, x: coord.x },
      { y: coord.y + 1, x: coord.x + 1 }
    ]
      .map(getItem(board))
      .filter(x => x === "live").length
);

export const tick = (board: Item[][]) =>
  board.map((row, y) =>
    row.map((column, x) =>
      pipe(
        calculateLiveNeighbors(board),
        makeLifeOrDeathDecision(column)
      )({ x, y })
    )
  );

const source = interval(1000);

const App: React.FC = () => {
  const [cells, setCells] = useState<Item[][]>(initBoard(size, "random"));
  useEffect(() => {
    const subscription = source.subscribe(() => setCells(tick(cells)));
    return () => {
      subscription.unsubscribe();
    };
  }, [cells]);
  return (
    <Container>
      <Board size={size}>
        {cells.map((row, y) =>
          row.map((column, x) => <Cell key={`${y},${x}`} kind={column} />)
        )}
      </Board>
    </Container>
  );
};

export default App;
