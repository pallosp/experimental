import {expect, test} from '@jest/globals';

import {lsbExp, msbExp} from '../src/bits';
import {Float116} from '../src/float116';
import {addDD} from '../src/sum';

import {randomInt} from './random';

const ATTEMPTS = 100;

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
