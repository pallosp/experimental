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

test('addDD', () => {
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
  console.log(splitD(Number.MAX_SAFE_INTEGER));
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
