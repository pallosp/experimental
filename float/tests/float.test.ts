import {nextDouble, prevDouble, sumLowerBound, sumUpperBound} from '../src/float'

const ATTEMPTS = 100;

function areNeighbors(x: number, y: number): boolean {
  if (x === -Infinity) return y === -Number.MAX_VALUE;
  if (y === Infinity) return x === Number.MAX_VALUE;
  const avg = x + (y - x) / 2;
  return x < y && x === avg || y === avg;
}

test('next double, special values', () => {
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

test('previous double, special values', () => {
  expect(prevDouble(NaN)).toBe(NaN);
  expect(prevDouble(-Infinity)).toBe(NaN);
  expect(prevDouble(0)).toBe(-Number.MIN_VALUE);
  expect(prevDouble(Number.MIN_VALUE)).toBe(0);
  expect(prevDouble(Number.MAX_SAFE_INTEGER + 1)).toBe(Number.MAX_SAFE_INTEGER);
  expect(prevDouble(Number.MAX_SAFE_INTEGER + 3))
      .toBe(Number.MAX_SAFE_INTEGER + 1);
  expect(prevDouble(Infinity)).toBe(Number.MAX_VALUE);
});

test('previous/next double, near -∞', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = -Number.MAX_VALUE * Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
    expect(areNeighbors(prevDouble(x), x)).toBe(true);
  }
});

test('previous/next double, large negative', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = -Math.exp(Math.random() * 709);
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
    expect(areNeighbors(prevDouble(x), x)).toBe(true);
  }
});

test('previous/next double, <-1', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = -1 / Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
    expect(areNeighbors(prevDouble(x), x)).toBe(true);
  }
});

test('previous/next double, -1..0', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = -Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
    expect(areNeighbors(prevDouble(x), x)).toBe(true);
  }
});

test('previous/next double, -ε', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = -Number.MIN_VALUE / Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
    expect(areNeighbors(prevDouble(x), x)).toBe(true);
  }
});

test('previous/next double, ε', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = Number.MIN_VALUE / Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
    expect(areNeighbors(prevDouble(x), x)).toBe(true);
  }
});

test('previous/next double, 0..1', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
    expect(areNeighbors(prevDouble(x), x)).toBe(true);
  }
});

test('previous/next double, >1', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = 1 / Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
    expect(areNeighbors(prevDouble(x), x)).toBe(true);
  }
});

test('previous/next double, large', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = Math.exp(Math.random() * 709);
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
    expect(areNeighbors(prevDouble(x), x)).toBe(true);
  }
});

test('previous/next double, near ∞', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = Number.MAX_VALUE * Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
    expect(areNeighbors(prevDouble(x), x)).toBe(true);
  }
});

test('sum, lower/upper bounds, non-finite', () => {
  expect(sumLowerBound(Infinity, 1)).toBe(Infinity);
  expect(sumUpperBound(Infinity, 1)).toBe(Infinity);
  expect(sumLowerBound(Infinity, -Infinity)).toBe(NaN);
  expect(sumUpperBound(Infinity, -Infinity)).toBe(NaN);
  expect(sumLowerBound(3, NaN)).toBe(NaN);
  expect(sumUpperBound(3, NaN)).toBe(NaN);
});

test('sum, lower/upper bounds, exact result', () => {
  expect(sumLowerBound(1, 2)).toBe(3);
  expect(sumUpperBound(1, 2)).toBe(3);
  expect(sumLowerBound(0.25, 0.0625)).toBe(0.3125);
  expect(sumUpperBound(0.25, 0.0625)).toBe(0.3125);
});

test('sum, lower/upper bounds, non-exact finite result', () => {
  expect(sumLowerBound(0.1, 0.2)).toBe(0.3);
  expect(sumUpperBound(0.1, 0.2)).toBe(nextDouble(0.3));
  expect(sumLowerBound(4.2, 1e-20)).toBe(4.2);
  expect(sumUpperBound(4.2, 1e-20)).toBe(nextDouble(4.2));
  expect(sumLowerBound(4.2, -1e-20)).toBe(prevDouble(4.2));
  expect(sumUpperBound(4.2, -1e-20)).toBe(4.2);
  expect(sumLowerBound(1e-20, 4.2)).toBe(4.2);
  expect(sumUpperBound(1e-20, 4.2)).toBe(nextDouble(4.2));
  expect(sumLowerBound(-1e-20, 4.2)).toBe(prevDouble(4.2));
  expect(sumUpperBound(-1e-20, 4.2)).toBe(4.2);
  expect(sumLowerBound(Number.MAX_SAFE_INTEGER, 2))
      .toBe(Number.MAX_SAFE_INTEGER + 1);
  expect(sumUpperBound(Number.MAX_SAFE_INTEGER, 2))
      .toBe(Number.MAX_SAFE_INTEGER + 3);
});
