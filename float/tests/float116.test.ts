import {expect, test} from '@jest/globals';

import {lsbExp, msbExp} from '../src/float';

import {randomInt, randomSign} from './random';

const ATTEMPTS = 100;

interface Float116 {
  hi: number;
  lo: number;
}

function addDD(x: number, y: number): Float116 {
  const sum = x + y;
  const x1 = sum - y;
  return {hi: sum, lo: x - x1 + (x1 - sum + y)};
}

test('addDD, float64s', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = Math.random() * randomSign() * 2 ** randomInt(-40, 40);
    const y = Math.random() * randomSign() * 2 ** randomInt(-40, 40);
    const sum = addDD(x, y);
    expect(sum.hi).toBe(x + y);
    expect(sum.hi + sum.lo).toBe(x + y);
    const lsb1 = lsbExp(x);
    const lsb2 = lsbExp(y);
    const isSumExact = lsb1 === lsb2 || lsbExp(x + y) === Math.min(lsb1, lsb2);
    if (isSumExact) {
      expect(Math.abs(sum.lo)).toBe(0);
    } else if (lsb1 !== lsb2) {
      expect(Math.abs(sum.lo)).not.toBe(0);
      expect(lsbExp(sum.lo)).toBe(Math.min(lsb1, lsb2));
    }
    if (sum.hi !== 0) expect(msbExp(sum.lo)).toBeLessThan(lsbExp(sum.hi));
  }
});

test('addDD, integers', () => {
  expect(addDD(1, 2)).toEqual({hi: 3, lo: 0});

  const MAXINT = Number.MAX_SAFE_INTEGER;
  const maxQ = addDD(MAXINT * 2 ** 53, MAXINT);
  expect(BigInt(maxQ.hi) + BigInt(maxQ.lo))
      .toEqual(BigInt(MAXINT * 2 ** 53) + BigInt(MAXINT));

  for (let i = 0; i < ATTEMPTS; i++) {
    const x = randomSign() * randomInt(0, MAXINT) * 2 ** randomInt(0, 80);
    const y = randomSign() * randomInt(0, MAXINT) * 2 ** randomInt(0, 80);
    const sum = addDD(x, y);
    expect(BigInt(sum.hi) + BigInt(sum.lo)).toEqual(BigInt(x) + BigInt(y));
    if (sum.hi !== 0) expect(msbExp(sum.lo)).toBeLessThan(lsbExp(sum.hi));
  }
});

function addQD(x: Float116, y: number): Float116 {
  const s = addDD(x.hi, y);
  s.lo += x.lo;
  const hi = s.hi + s.lo;
  return {hi, lo: s.hi - hi + s.lo};
}

test('addQD', () => {
  expect(addQD({hi: 3, lo: 2}, 1)).toEqual({hi: 6, lo: 0});
  // Only 105 bits precision is guaranteed.
  expect(addQD({hi: 2 ** 105, lo: 2 ** 52 + 1}, 2 ** 52))
      .toEqual({hi: 2 ** 105 + 2 ** 53, lo: 0});
  for (let i = 0; i < ATTEMPTS; i++) {
    const lo = randomInt(0, 2 ** 52 - 1);
    const hi = randomInt(0, 2 ** 53 - 1) * 2 ** 52;
    const x = randomInt(0, 2 ** 53 - 1) * 2 ** randomInt(0, 52);
    const sum = addQD({hi, lo}, x);
    expect(BigInt(sum.hi) + BigInt(sum.lo))
        .toEqual(BigInt(hi) + BigInt(lo) + BigInt(x));
  }
});

// Splits a float64 to the sum of two float64s with non-overlapping
// significands. Both parts have at most 26 significant bits.
function splitD(x: number): Float116 {
  const splitter = 0x7ffffff;
  const hi = x + x * splitter - x * splitter;
  return {hi, lo: x - hi};
}

// Checks whether splitD does the right thing for the given number:
// - The sum must match.
// - The parts must be disjoint.
// - The parts must have few enough significant bits so that squaring them or
//   multiplying them with each other won't cause loss of precision.
function isWellSplit(x: number) {
  const {hi, lo} = splitD(x);
  return x === hi + lo &&  //
      lsbExp(hi * hi) === lsbExp(hi) * 2 &&
      lsbExp(lo * lo) === lsbExp(lo) * 2 &&
      lsbExp(lo * hi) === lsbExp(lo) + lsbExp(hi) &&
      (lo === 0 || lsbExp(hi) > msbExp(lo));
}

test('splitD', () => {
  expect(isWellSplit(0)).toBe(true);
  for (const exp of [26, 27, 28, 52, 53]) {
    expect(isWellSplit(2 ** exp - 1)).toBe(true);
    expect(isWellSplit(2 ** exp)).toBe(true);
    expect(isWellSplit(2 ** exp + 1)).toBe(true);
  }
  expect(isWellSplit(2 ** 53 + 2)).toBe(true);
  expect(isWellSplit(0x1ffffff7ffffff)).toBe(true);

  for (let i = 0; i < ATTEMPTS; i++) {
    const x = randomInt(0, Number.MAX_SAFE_INTEGER);
    expect(isWellSplit(x)).toBe(true);
  }
});

function mulDD(x: number, y: number): Float116 {
  let p = x * 0x7ffffff;
  const xh = x - p + p;
  const xl = x - xh;
  p = y * 0x7ffffff;
  const yh = y - p + p;
  const yl = y - yh;
  p = xh * yh;
  const q = xh * yl + xl * yh;
  const s = p + q;
  return {hi: s, lo: p - s + q + xl * yl};
}

test('mulDD', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    // 105 bits precision is guaranteed.
    const x = randomInt(0, 2 ** 53 - 1) * 2 ** randomInt(0, 80);
    const y = randomInt(0, 2 ** 52 - 1) * 2 ** randomInt(0, 80);
    const p = mulDD(x, y);
    expect(BigInt(x) * BigInt(y)).toEqual(BigInt(p.hi) + BigInt(p.lo));
  }
});

const f64 = new Float64Array([0]);
const halves = new Uint32Array(f64.buffer);
const MAXINT = BigInt(2 ** 53);

function mulDD2(x: number, y: number): Float116 {
  if (x === 0 || y === 0 || !isFinite(x) || !isFinite(y))
    return {hi: x * y, lo: 0};

  const lsbX = lsbExp(x);
  const msbX = msbExp(x);
  f64[0] = x;
  halves[1] = halves[1] & 0x800fffff | ((1023 + msbX - lsbX) << 20);
  x = f64[0];

  const lsbY = lsbExp(y);
  const msbY = msbExp(y);
  f64[0] = y;
  halves[1] = halves[1] & 0x800fffff | ((1023 + msbY - lsbY) << 20);
  y = f64[0];

  const p1 = BigInt(x) * BigInt(y);
  const m = 2 ** (lsbX + lsbY);
  const lo = p1 % MAXINT;
  return {hi: Number(p1 - lo) * m, lo: Number(lo) * m};
}

test('mulDD2', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = randomInt(0, 2 ** 53 - 1) * 2 ** randomInt(0, 80);
    const y = randomInt(0, 2 ** 53 - 1) * 2 ** randomInt(0, 80);
    const p = mulDD2(x, y);
    expect(p.hi + p.lo).toEqual(x * y);
    expect(BigInt(p.hi) + BigInt(p.lo)).toEqual(BigInt(x) * BigInt(y));
  }
});

test('mulDD vs mulDD2 benchmark', () => {
  let start = performance.now();
  for (let i = 0; i < 10000; i++) {
    mulDD(Number.MAX_SAFE_INTEGER - i, Number.MAX_SAFE_INTEGER - i);
  }
  console.debug(
      'high precision float64 multiplication, by splitting',
      (performance.now() - start).toFixed(1), 'ms');

  start = performance.now();
  for (let i = 0; i < 10000; i++) {
    mulDD2(Number.MAX_SAFE_INTEGER - i, Number.MAX_SAFE_INTEGER - i);
  }
  console.debug(
      'high precision float64 multiplication, bigint based',
      (performance.now() - start).toFixed(1), 'ms');
});
