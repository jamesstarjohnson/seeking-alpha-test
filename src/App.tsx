import React, { useEffect, useState } from 'react';
import { range } from 'ramda';
import styled from 'styled-components';
import { interval } from 'rxjs';

type Item = 'black' | 'white';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const Board = styled.div<{ length: number }>`
  display: grid;
  grid-template-columns: ${props => range(0, props.length).map(() => '2%').join(' ')};
  grid-template-rows: ${props => range(0, props.length).map(() => '2%').join(' ')};
  height: 100vmin;
  width: 100vmin
`

const Cell = styled.div<{ kind: Item }>`
  background-color: ${props => props.kind};
  text-align: center;
  border: 1px solid silver;
`
const source = interval(100);

const size = 10
const board = range(0, size * size).map<Item>(() => 'white');
let startingIndex = 0;
const getBoardOnTick = (id: number) => {
  if (id % (size * size - 1) === 0) {
    startingIndex = id;
  }
  const nextIndex = id - startingIndex;
  return board.map((x, index) => {
    if (index === nextIndex) {
      return 'black'
    }
    return x
  })
}

const App: React.FC = () => {
  const [cells, setCells] = useState<Item[]>(board)
  useEffect(() => {
    const subscription = source.subscribe((x) => setCells(getBoardOnTick(x)))
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  return (
    <Container>
      <Board length={size}>{cells.map((x, index) => <Cell kind={x} key={index}></Cell>)}</Board>
    </Container>
  );
}

export default App;
