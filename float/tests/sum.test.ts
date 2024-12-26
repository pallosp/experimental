import {expect, test} from '@jest/globals';

import {lsbExp, msbExp} from '../src/bits';
import {addDD, errorOfSum, isSumExact} from '../src/sum';

import {randomInt, randomSign} from './random';

const ATTEMPTS = 100;

const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

function isErrorOfSumZero(x: number, y: number): boolean {
  return errorOfSum(x, y) === 0;
}

test('isSumExact, hand-picked terms', () => {
  for (const isSumExactFunc of [isSumExact, isErrorOfSumZero]) {
    expect(isSumExactFunc(34, -21)).toBe(true);

    expect(isSumExactFunc(MAX_SAFE_INTEGER, MAX_SAFE_INTEGER)).toBe(true);
    expect(isSumExactFunc(MAX_SAFE_INTEGER, MAX_SAFE_INTEGER + 1)).toBe(false);

    expect(isSumExactFunc(Number.MAX_VALUE, 0)).toBe(true);
    expect(isSumExactFunc(Number.MAX_VALUE, 1)).toBe(false);
    expect(isSumExactFunc(Number.MAX_VALUE, Number.MAX_VALUE)).toBe(false);

    expect(isSumExactFunc(Infinity, 1)).toBe(true);
    expect(isSumExactFunc(Infinity, Infinity)).toBe(true);
    expect(isSumExactFunc(Infinity, -Infinity)).toBe(false);
    expect(isSumExactFunc(NaN, 0)).toBe(false);
  }
});

test('isSumExact, random terms', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = randomSign() / Math.random();
    const y = randomSign() / Math.random();
    const lsbX = lsbExp(x);
    const lsbY = lsbExp(y);
    const exact = lsbX === lsbY || lsbExp(x + y) === Math.min(lsbX, lsbY);
    expect(isSumExact(x, y)).toEqual(exact);
  }
});

test('rounding of sum is consistent', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = randomSign() / Math.random();
    const y = randomSign() / Math.random();
    const sum = x + y;
    expect((sum - x - y) * (sum - y - x)).toBeGreaterThanOrEqual(0);
  }
});

test('addDD, float64s', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = randomSign() * 2 ** randomInt(-40, 40) * Math.random();
    const y = randomSign() * 2 ** randomInt(-40, 40) * Math.random();
    const sum = addDD(x, y);
    expect(sum.hi).toBe(x + y);
    expect(sum.hi + sum.lo).toBe(x + y);
    if (isSumExact(x, y)) {
      expect(Math.abs(sum.lo)).toBe(0);
    } else {
      expect(Math.abs(sum.lo)).not.toBe(0);
      expect(lsbExp(sum.lo)).toBe(Math.min(lsbExp(x), lsbExp(y)));
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
    const x = randomSign() * 2 ** randomInt(0, 80) * randomInt(0, MAXINT);
    const y = randomSign() * 2 ** randomInt(0, 80) * randomInt(0, MAXINT);
    const sum = addDD(x, y);
    expect(BigInt(sum.hi) + BigInt(sum.lo)).toEqual(BigInt(x) + BigInt(y));
    if (sum.hi !== 0) expect(msbExp(sum.lo)).toBeLessThan(lsbExp(sum.hi));
  }
});

test('addDD, non-finite sum', () => {
  expect(addDD(Number.MAX_VALUE, Number.MAX_VALUE))
      .toEqual({hi: Infinity, lo: -Infinity});
  expect(addDD(-Number.MAX_VALUE, -Number.MAX_VALUE))
      .toEqual({hi: -Infinity, lo: Infinity});
  expect(addDD(Infinity, 1)).toEqual({hi: Infinity, lo: 0});
  expect(addDD(NaN, 1)).toEqual({hi: NaN, lo: NaN});
});
