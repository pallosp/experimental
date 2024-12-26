import {expect, test} from '@jest/globals';

import {lsbExp, msbExp} from '../src/bits';
import {Float116} from '../src/float116';
import {isProductExact, mulDD} from '../src/product';
import {addDD} from '../src/sum';

import {randomInt, randomSign} from './random';

const ATTEMPTS = 100;

const MIN_DOUBLE = Number.MIN_VALUE;
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
const MAX_DOUBLE = Number.MAX_VALUE;

// Splits a float64 to the sum of two float64s with non-overlapping
// significands. Both parts have at most 26 mantissa bits.
// The logic was copied out from mulDD to test it separately.
function split(x: number): Float116 {
  const splitter = 0x7ffffff;
  const hi = x + x * splitter - x * splitter;
  return {hi, lo: x - hi};
}

// Checks whether split() does the right thing for the given number:
// - The sum must match.
// - The parts must be disjoint.
// - The parts must have few enough significant bits so that squaring them or
//   multiplying them with each other won't cause loss of precision.
function isWellSplit(x: number) {
  const {hi, lo} = split(x);
  return x === hi + lo &&  //
      lsbExp(hi * hi) === lsbExp(hi) * 2 &&
      lsbExp(lo * lo) === lsbExp(lo) * 2 &&
      lsbExp(lo * hi) === lsbExp(lo) + lsbExp(hi) &&
      (lo === 0 || lsbExp(hi) > msbExp(lo));
}

/** Simple but slow implementation of exact float64 multiplication. */
function mulDDSlow(x: number, y: number): Float116 {
  const xy = x * y;
  if (!isFinite(x) || !isFinite(y) || x === 0 || y === 0)
    return {hi: xy, lo: isNaN(xy) ? NaN : 0};
  if (!isFinite(xy)) return {hi: xy, lo: -xy};
  const lsbX = lsbExp(x);
  const lsbY = lsbExp(y);
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

export function isProductExactSlow(x: number, y: number): boolean {
  return lsbExp(x) + lsbExp(y) === lsbExp(x * y);
}

test('isProductExact', () => {
  for (const isProductExactFunc of [isProductExact, isProductExactSlow]) {
    expect(isProductExactFunc(2, 3)).toBe(true);
    expect(isProductExactFunc(4, -5)).toBe(true);
    expect(isProductExactFunc(4 * 2 ** 40, -5 * 2 ** -100)).toBe(true);
    expect(isProductExactFunc(0, 0)).toBe(true);
    expect(isProductExactFunc(MAX_SAFE_INTEGER, MAX_SAFE_INTEGER)).toBe(false);
    expect(isProductExactFunc(MAX_SAFE_INTEGER + 1, MAX_SAFE_INTEGER))
        .toBe(true);
    expect(isProductExactFunc(0, Number.MAX_VALUE)).toBe(true);
    expect(isProductExactFunc(MIN_DOUBLE, MAX_DOUBLE)).toBe(true);
    expect(isProductExactFunc(MIN_DOUBLE, MAX_SAFE_INTEGER)).toBe(true);
    // underflow
    expect(isProductExactFunc(MIN_DOUBLE, 0.5)).toBe(false);
    // overflow
    expect(isProductExactFunc(2e200, 3e200)).toBe(false);
    // infinity
    expect(isProductExactFunc(10, Infinity)).toBe(true);
    expect(isProductExactFunc(-Infinity, Infinity)).toBe(true);
    expect(isProductExactFunc(10, Infinity)).toBe(true);
    expect(isProductExactFunc(-Infinity, Infinity)).toBe(true);
    // nan
    expect(isProductExactFunc(NaN, NaN)).toBe(false);
    expect(isProductExactFunc(NaN, 1)).toBe(false);
    expect(isProductExactFunc(Infinity, NaN)).toBe(false);
  }
});

test('isProductExact, simple division is insufficient', () => {
  const isProductExactWithFalsePositives = (x: number, y: number) =>
      x * y / x === y && x * y / y === x;

  expect(isProductExact(2 ** 27 + 1, 2 ** 27 - 1)).toBe(false);
  expect(isProductExactWithFalsePositives(2 ** 27 + 1, 2 ** 27 - 1)).toBe(true);
});

test('splitting float64s to disjoint parts', () => {
  expect(isWellSplit(0)).toBe(true);
  expect(isWellSplit(2 ** 53 + 2)).toBe(true);
  expect(isWellSplit(0x1ffffff7ffffff)).toBe(true);

  for (let i = 0; i < ATTEMPTS; i++) {
    const x = randomInt(0, MAX_SAFE_INTEGER);
    expect(isWellSplit(x)).toBe(true);
  }
});

test('mulDD and mulDDSlow, hand-picked values', () => {
  const testCases = [
    // zero factor
    {x: 0, y: 12, hi: 0, lo: 0},
    // fractional numbers
    {x: 1.25, y: 6.0625, hi: 1.25 * 6.0625, lo: 0},
    // medium * medium integer, large product
    {x: 1e8 + 1, y: 1e8 - 1, hi: 1e16, lo: -1},
    // small * large integer
    {x: MAX_SAFE_INTEGER, y: 3, hi: 3 * 2 ** 53 - 4, lo: 1},
    // large * large integer
    {x: MAX_SAFE_INTEGER, y: MAX_SAFE_INTEGER, hi: 2 ** 106 - 2 ** 54, lo: 1},
    // subnormal product
    {x: 6 * MIN_DOUBLE, y: 7, hi: 42 * MIN_DOUBLE, lo: 0},
    // subnormal product, error underflows
    {
      x: MAX_SAFE_INTEGER * 2 ** -573,
      y: MAX_SAFE_INTEGER * 2 ** -573,
      hi: 2 ** -1040,
      lo: 0
    },
    // product underflows
    {x: 1e-200, y: 1e-200, hi: 0, lo: 0},
    // near MAX_VALUE
    {x: MAX_DOUBLE, y: 0.75, hi: 3 * 2 ** 1022 - 4 * 2 ** 969, lo: 2 ** 969},
    {x: MAX_DOUBLE, y: 1, hi: MAX_DOUBLE, lo: 0},
    // product overflows
    {x: 1e200, y: 1e200, hi: Infinity, lo: -Infinity},
    {x: MAX_DOUBLE / 3, y: 3, hi: Infinity, lo: -Infinity},
    // non-finite factors
    {x: Infinity, y: 0, hi: NaN, lo: NaN},
    {x: Infinity, y: 0.5, hi: Infinity, lo: 0},
    {x: Infinity, y: -Infinity, hi: -Infinity, lo: 0},
    {x: 1, y: NaN, hi: NaN, lo: NaN},
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
  const start1 = performance.now();
  for (let i = 0; i < 10000; i++)
    mulDD(MAX_SAFE_INTEGER - i, MAX_SAFE_INTEGER - i);
  const elapsed1 = performance.now() - start1;

  const start2 = performance.now();
  for (let i = 0; i < 10000; i++)
    mulDDSlow(MAX_SAFE_INTEGER - i, MAX_SAFE_INTEGER - i);
  const elapsed2 = performance.now() - start2;

  console.info(
      `high precision float64 multiplication, by splitting: ${
          elapsed1.toFixed(1)} ms\n` +
      `high precision float64 multiplication, bigint based algorithm: ${
          elapsed2.toFixed(1)} ms`);
});

test('errorOfProduct vs isProductExact benchmark', () => {
  const base = 2 ** 27;

  const start1 = performance.now();
  let c1 = 0;
  for (let i = 0; i < 10000; i++) {
    c1 += +isProductExact(base - i, base - i);
  }
  const elapsed1 = performance.now() - start1;

  const start2 = performance.now();
  let c2 = 0;
  for (let i = 0; i < 10000; i++) {
    c2 += +isProductExactSlow(base - i, base - i);
  }
  const elapsed2 = performance.now() - start2;
  console.info(
      `isProductExact (error calculation): ${elapsed1.toFixed(1)} ms\n` +
      `isProductExact (lsb comparison): ${elapsed2.toFixed(1)} ms`);

  expect(c1).toBe(c2);
});
