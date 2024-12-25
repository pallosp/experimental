import {expect, test} from '@jest/globals';

import {lsbExp} from '../src/bits';
import {Float116} from '../src/float116';
import {isProductExact, mulDD} from '../src/product';
import {addDD} from '../src/sum';

import {randomInt, randomSign} from './random';

const ATTEMPTS = 100;

/** Simple but slow implementation of exact float64 multiplication. */
function mulDDSlow(x: number, y: number): Float116 {
  const lsbX = lsbExp(x);
  const lsbY = lsbExp(y);
  if (!isFinite(lsbX) || !isFinite(lsbY)) return {hi: x * y, lo: 0};
  const p = BigInt(x / 2 ** lsbX) * BigInt(y / 2 ** lsbY);
  const lo = p % BigInt(2 ** 53);
  const hi = p - lo;
  if (lsbX + lsbY >= -1074) {
    const m = 2 ** (lsbX + lsbY);
    return addDD(Number(hi) * m, Number(lo) * m);
  } else {
    const m1 = 2 ** lsbX;
    const m2 = 2 ** lsbY;
    return addDD(Number(hi) * m1 * m2, Number(lo) * m1 * m2);
  }
}

test('isProductExact', () => {
  expect(isProductExact(2, 3)).toBe(true);
  expect(isProductExact(4, -5)).toBe(true);
  expect(isProductExact(4 * 2 ** 40, -5 * 2 ** -100)).toBe(true);
  expect(isProductExact(0, 0)).toBe(true);
  expect(isProductExact(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER))
      .toBe(false);
  expect(isProductExact(Number.MAX_SAFE_INTEGER + 1, Number.MAX_SAFE_INTEGER))
      .toBe(true);
  expect(isProductExact(0, Number.MAX_VALUE)).toBe(true);
  expect(isProductExact(Number.MIN_VALUE, Number.MAX_VALUE)).toBe(true);
  expect(isProductExact(Number.MIN_VALUE, Number.MAX_SAFE_INTEGER)).toBe(true);
  // underflow
  expect(isProductExact(Number.MIN_VALUE, 0.5)).toBe(false);
  // overflow
  expect(isProductExact(2e200, 3e200)).toBe(false);
  // infinity
  expect(isProductExact(10, Infinity)).toBe(true);
  expect(isProductExact(-Infinity, Infinity)).toBe(true);
  expect(isProductExact(10, Infinity)).toBe(true);
  expect(isProductExact(-Infinity, Infinity)).toBe(true);
  // nan
  expect(isProductExact(NaN, NaN)).toBe(false);
  expect(isProductExact(NaN, 1)).toBe(false);
  expect(isProductExact(Infinity, NaN)).toBe(false);
});

test('mulDD and mulDDSlow, hand-picked values', () => {
  const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
  const MAX_DOUBLE = Number.MAX_VALUE;

  const testCases = [
    // zero factor
    {x: 0, y: 12, hi: 0, lo: 0},
    // fractional numbers
    {x: 1.25, y: 6.0625, hi: 1.25 * 6.0625, lo: 0},
    // small * large integer
    {x: MAX_SAFE_INTEGER, y: 3, hi: 3 * 2 ** 53 - 4, lo: 1},
    // large * large integer
    {x: MAX_SAFE_INTEGER, y: MAX_SAFE_INTEGER, hi: 2 ** 106 - 2 ** 54, lo: 1},
    // subnormal product
    {x: 6 * Number.MIN_VALUE, y: 7, hi: 42 * Number.MIN_VALUE, lo: 0},
    {
      x: MAX_SAFE_INTEGER * 2 ** -573,
      y: MAX_SAFE_INTEGER * 2 ** -573,
      hi: 2 ** -1040,
      lo: 0
    },
    // near MAX_VALUE
    {x: MAX_DOUBLE, y: 0.75, hi: 3 * 2 ** 1022 - 4 * 2 ** 969, lo: 2 ** 969},
    {x: MAX_DOUBLE, y: 1, hi: MAX_DOUBLE, lo: 0},
    // overflow
    {x: MAX_DOUBLE / 3, y: 3, hi: Infinity, lo: -Infinity},
    // non-finite factors
    {x: Infinity, y: 0, hi: NaN, lo: 0},
    {x: Infinity, y: 0.5, hi: Infinity, lo: 0},
    {x: Infinity, y: -Infinity, hi: -Infinity, lo: 0},
    {x: 1, y: NaN, hi: NaN, lo: 0},
  ];
  for (const mulFunc of [mulDD, mulDDSlow])
    for (const {x, y, hi, lo} of testCases)
      expect(mulFunc(x, y)).toEqual({hi, lo});
});

test('mulDD, random integers', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = randomSign() * randomInt(0, 2 ** 53 - 1) * 2 ** randomInt(0, 80);
    const y = randomSign() * randomInt(0, 2 ** 53 - 1) * 2 ** randomInt(0, 80);
    const p = mulDD(x, y);
    expect(BigInt(p.hi) + BigInt(p.lo)).toEqual(BigInt(x) * BigInt(y));
    expect(p.hi).toBe(x * y);
  }
});

test('mulDD, higher part', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = 1 / Math.random();
    const y = 1 / Math.random();
    expect(mulDD(x, y).hi).toBe(x * y);
  }
});

test('mulDD, zeroness of the lower part', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = randomSign() * 2 ** randomInt(-5, 5) *
        Math.floor(2 ** Math.random() * 53);
    const y = randomSign() * 2 ** randomInt(-5, 5) *
        Math.floor(2 ** Math.random() * 53);
    expect(mulDD(x, y).lo === 0).toBe(isProductExact(x, y));
  }
});

test('mulDD vs mulDDSlow benchmark', () => {
  let start = performance.now();
  for (let i = 0; i < 10000; i++) {
    mulDD(Number.MAX_SAFE_INTEGER - i, Number.MAX_SAFE_INTEGER - i);
  }
  console.info(
      'high precision float64 multiplication, by splitting:',
      (performance.now() - start).toFixed(1), 'ms');

  start = performance.now();
  for (let i = 0; i < 10000; i++) {
    mulDDSlow(Number.MAX_SAFE_INTEGER - i, Number.MAX_SAFE_INTEGER - i);
  }
  console.info(
      'high precision float64 multiplication, bigint based algorithm:',
      (performance.now() - start).toFixed(1), 'ms');
});
