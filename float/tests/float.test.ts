import {expect, test} from '@jest/globals';

import {lsbExp, msbExp, mulLowerBound, mulUpperBound, nextDouble, prevDouble, sumLowerBound, sumUpperBound} from '../src/float';

import {randomInt, randomSign} from './random';

const ATTEMPTS = 100;

function areNeighbors(x: number, y: number): boolean {
  if (x === -Infinity) return y === -Number.MAX_VALUE;
  if (y === Infinity) return x === Number.MAX_VALUE;
  const avg = x + (y - x) / 2;
  return x < y && x === avg || y === avg;
}

test('exponent of most significant bit', () => {
  expect(msbExp(1)).toBe(0);
  expect(msbExp(1.1)).toBe(0);
  expect(msbExp(1.9)).toBe(0);
  expect(msbExp(2)).toBe(1);
  expect(msbExp(0.9)).toBe(-1);
  expect(msbExp(-0.9)).toBe(-1);
  expect(msbExp(-1)).toBe(0);
  expect(msbExp(-1.1)).toBe(0);
  expect(msbExp(Number.MIN_VALUE)).toBe(-1074);
  expect(msbExp(Number.MIN_VALUE * 2 ** 10)).toBe(-1064);
  expect(msbExp(Number.MIN_VALUE * 2 ** 51)).toBe(-1023);
  expect(msbExp(Number.MIN_VALUE * 2 ** 52)).toBe(-1022);
  expect(msbExp(Number.MAX_SAFE_INTEGER)).toBe(52);
  expect(msbExp(Number.MAX_SAFE_INTEGER + 1)).toBe(53);
  expect(msbExp(Number.MAX_VALUE)).toBe(1023);
  expect(msbExp(0)).toBe(-Infinity);
  expect(msbExp(Infinity)).toBe(Infinity);
  expect(msbExp(-Infinity)).toBe(Infinity);
  expect(msbExp(NaN)).toBe(NaN);
});

test('exponent of most significant bit, random', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = Math.exp(Math.random() * 709);
    expect(msbExp(x)).toBe(Math.floor(Math.log2(Math.abs(x))));
  }
});

test('exponent of least significant bit', () => {
  expect(lsbExp(1)).toBe(0);
  expect(lsbExp(1.5)).toBe(-1);
  expect(lsbExp(-1.5)).toBe(-1);
  expect(lsbExp(1 + 2 ** -30)).toBe(-30);
  expect(lsbExp(1 + 2 ** -52)).toBe(-52);
  expect(lsbExp(2 + 2 ** -30)).toBe(-30);
  expect(lsbExp(12)).toBe(2);
  expect(lsbExp(2 ** -1022)).toBe(-1022);
  expect(lsbExp(2 ** -1030)).toBe(-1030);
  expect(lsbExp(1.5 * 2 ** -1030)).toBe(-1031);
  expect(lsbExp(Number.MIN_VALUE)).toBe(-1074);
  expect(lsbExp(Number.MAX_VALUE)).toBe(1023 - 52);
  expect(lsbExp(prevDouble(2))).toBe(-52);
  expect(lsbExp(0)).toBe(-Infinity);
  expect(lsbExp(Infinity)).toBe(Infinity);
  expect(lsbExp(-Infinity)).toBe(Infinity);
  expect(lsbExp(NaN)).toBe(NaN);
});

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

test('additive error tracking is consistent', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const a = 1 / Math.random() * randomSign();
    const b = 1 / Math.random() * randomSign();
    const sum = a + b;
    expect((sum - a - b) * (sum - b - a)).toBeGreaterThanOrEqual(0);
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

test('sum, lower/upper bounds, near ∞', () => {
  expect(sumLowerBound(Number.MAX_VALUE, Number.MAX_VALUE))
      .toBe(Number.MAX_VALUE);
  expect(sumUpperBound(Number.MAX_VALUE, Number.MAX_VALUE)).toBe(Infinity);
  expect(sumLowerBound(Number.MAX_VALUE, -Number.MAX_VALUE)).toBe(0);
  expect(sumUpperBound(Number.MAX_VALUE, -Number.MAX_VALUE)).toBe(0);
  expect(sumLowerBound(-Number.MAX_VALUE, -Number.MAX_VALUE)).toBe(-Infinity);
  expect(sumUpperBound(-Number.MAX_VALUE, -Number.MAX_VALUE))
      .toBe(-Number.MAX_VALUE);
});

test('sum, lower/upper bounds, commutative', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const a = randomInt(0, 99) / 100;
    const b = randomInt(0, 99) / 100;
    expect(sumLowerBound(a, b)).toBe(sumLowerBound(b, a));
    expect(sumUpperBound(a, b)).toBe(sumUpperBound(b, a));
  }
});

test('sum, lower/upper bounds, exactness', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const a = 1 / Math.random() * randomSign();
    const b = 1 / Math.random() * randomSign();
    const lsb1 = lsbExp(a);
    const lsb2 = lsbExp(b);
    const isSumExact = lsb1 === lsb2 || lsbExp(a + b) === Math.min(lsb1, lsb2);
    expect(sumLowerBound(a, b) === sumUpperBound(a, b)).toBe(isSumExact);
  }
});

test('sum, lower/upper bounds, exactness v2', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const a = 1 / Math.random() * randomSign();
    const b = 1 / Math.random() * randomSign();
    const isSumExact = (a + b) - a === b && (a + b) - b === a;
    expect(sumLowerBound(a, b) === sumUpperBound(a, b)).toBe(isSumExact);
  }
});

test('multiplicative error tracking is consistent', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const a = 1 / Math.random() * randomSign();
    const b = 1 / Math.random() * randomSign();
    const p = a * b;
    expect((p / a / b - 1) * (p / b / a - 1)).toBeGreaterThanOrEqual(0);
  }
});

test('product, lower/upper bounds, non-finite factors', () => {
  expect(mulLowerBound(0.5, Infinity)).toBe(Infinity);
  expect(mulUpperBound(0.5, Infinity)).toBe(Infinity);
  expect(mulLowerBound(-0.5, Infinity)).toBe(-Infinity);
  expect(mulUpperBound(-0.5, Infinity)).toBe(-Infinity);
  expect(mulLowerBound(-Infinity, Infinity)).toBe(-Infinity);
  expect(mulUpperBound(-Infinity, Infinity)).toBe(-Infinity);
  expect(mulLowerBound(0, Infinity)).toBe(NaN);
  expect(mulUpperBound(0, Infinity)).toBe(NaN);
  expect(mulLowerBound(NaN, 0)).toBe(NaN);
  expect(mulUpperBound(NaN, 0)).toBe(NaN);
});

test('product, lower/upper bounds, zero factor', () => {
  expect(mulLowerBound(0, 3)).toBe(0);
  expect(mulUpperBound(0, 3)).toBe(0);
  expect(mulLowerBound(-5, 0)).toBe(-0);
  expect(mulUpperBound(-5, 0)).toBe(-0);
});

test('product, lower/upper bounds, no rounding', () => {
  expect(mulLowerBound(6, 7)).toBe(42);
  expect(mulUpperBound(6, 7)).toBe(42);
  expect(mulLowerBound(-0.5, 10)).toBe(-5);
  expect(mulUpperBound(-0.5, 10)).toBe(-5);
  expect(mulLowerBound(0.5, 2 ** 1023)).toBe(2 ** 1022);
  expect(mulUpperBound(0.5, 2 ** 1023)).toBe(2 ** 1022);
  expect(mulLowerBound(Number.MIN_VALUE, 4)).toBe(2 ** -1072);
  expect(mulUpperBound(Number.MIN_VALUE, 4)).toBe(2 ** -1072);
  expect(mulLowerBound(Number.MAX_VALUE, Number.MIN_VALUE))
      .toBe(2 ** -50 - 2 ** -103);
  expect(mulUpperBound(Number.MAX_VALUE, Number.MIN_VALUE))
      .toBe(2 ** -50 - 2 ** -103);
});

test('product, lower/upper bounds, rounding', () => {
  expect(mulLowerBound(1e8 + 1, 1e8 + 1)).toBe(10000000200000000);
  expect(mulUpperBound(1e8 + 1, 1e8 + 1)).toBe(10000000200000002);
  expect(mulLowerBound(1e8 + 1, 1e8 - 1)).toBe(1e16 - 2);
  expect(mulUpperBound(1e8 + 1, 1e8 - 1)).toBe(1e16);
});

test('product, lower/upper bounds, overflow', () => {
  expect(mulLowerBound(1e200, 1e200)).toBe(Number.MAX_VALUE);
  expect(mulUpperBound(1e200, 1e200)).toBe(Infinity);
  expect(mulLowerBound(1e200, -1e200)).toBe(-Infinity);
  expect(mulUpperBound(1e200, -1e200)).toBe(-Number.MAX_VALUE);
});

test('product, lower/upper bounds, underflow', () => {
  expect(mulLowerBound(1e-200, 1e-200)).toBe(0);
  expect(mulUpperBound(1e-200, 1e-200)).toBe(Number.MIN_VALUE);
  expect(mulLowerBound(1e-200, -1e-200)).toBe(-Number.MIN_VALUE);
  expect(mulUpperBound(1e-200, -1e-200)).toBe(-0);
});
