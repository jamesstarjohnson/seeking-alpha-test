import React, { useEffect, useState } from "react";
import { range, pipe } from "ramda";
import { random } from "lodash";
import styled from "styled-components";
import { interval } from "rxjs";

type Item = "live" | "dead";
type Coord = { x: number; y: number };

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Board = styled.div<{ size: number; gridGap: number }>`
  display: grid;
  grid-template-columns: ${({ size }) => `repeat(${size}, ${100 / size}%)`};
  grid-auto-rows: ${({ size }) => `${100 / size}%`};
  grid-gap: ${({ gridGap }) => `${gridGap}px`};
  height: ${({ size, gridGap }) => `calc(100vmin - ${(size - 1) * gridGap}px)`};
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

const initBoard = range(0, size).map((_, y) =>
  range(0, size).map<Item>((_, x) =>
    randomCoords.has(getKey({ x, y })) ? "live" : "dead"
  )
);

const makeLifeOrDeathDecision = (currentItem: Item) => (
  liveNeighborsNumber: number
) => {
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
};

const calculateLiveNeighbors = (board: Item[][]) => (coord: Coord) => {
  const a = [
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
    .filter(x => x === "live").length;
  console.log(a);
  return a;
};

const tick = (board: Item[][]) =>
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
  const [cells, setCells] = useState<Item[][]>(initBoard);
  useEffect(() => {
    const subscription = source.subscribe(() => setCells(tick(cells)));
    return () => {
      subscription.unsubscribe();
    };
  }, [cells]);
  return (
    <Container>
      <Board size={size} gridGap={1}>
        {cells.map((row, y) =>
          row.map((column, x) => <Cell key={`${y},${x}`} kind={column} />)
        )}
      </Board>
    </Container>
  );
};

export default App;
