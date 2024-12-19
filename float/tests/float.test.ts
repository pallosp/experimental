import {nextDouble} from '../src/float'

const ATTEMPTS = 100;

function areNeighbors(x: number, y: number): boolean {
  if (x === -Infinity) return y === -Number.MAX_VALUE;
  if (y === Infinity) return x === Number.MAX_VALUE;
  const avg = x + (y - x) / 2;
  return x < y && x === avg || y === avg;
}

test('nextDouble, special values', () => {
  expect(nextDouble(NaN)).toBe(NaN);
  expect(nextDouble(-Infinity)).toBe(-Number.MAX_VALUE);
  expect(nextDouble(-Number.MIN_VALUE)).toBe(-0);
  expect(nextDouble(-0)).toBe(Number.MIN_VALUE);
  expect(nextDouble(0)).toBe(Number.MIN_VALUE);
  expect(nextDouble(Number.MAX_SAFE_INTEGER)).toBe(Number.MAX_SAFE_INTEGER + 1);
  expect(nextDouble(Number.MAX_SAFE_INTEGER + 1))
      .toBe(Number.MAX_SAFE_INTEGER + 3);
  expect(nextDouble(Infinity)).toBe(NaN);
});

test('nextDouble, near -∞', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = -Number.MAX_VALUE * Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
  }
});

test('nextDouble, large negative', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = -Math.exp(Math.random() * 709);
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
  }
});

test('nextDouble, <-1', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = -1 / Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
  }
});

test('nextDouble, -1..0', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = -Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
  }
});

test('nextDouble, -ε', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = -Number.MIN_VALUE / Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
  }
});

test('nextDouble, ε', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = Number.MIN_VALUE / Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
  }
});

test('nextDouble, 0..1', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
  }
});

test('nextDouble, >1', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = 1 / Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
  }
});

test('nextDouble, large', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = Math.exp(Math.random() * 709);
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
  }
});

test('nextDouble, near ∞', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = Number.MAX_VALUE * Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
  }
});
