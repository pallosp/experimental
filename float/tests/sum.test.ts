import {expect, test} from '@jest/globals';

import {lsbExp} from '../src/bits';
import {nextDouble, prevDouble} from '../src/enumerate';
import {isSumExact, sumLowerBound, sumUpperBound} from '../src/sum';

import {randomInt, randomSign} from './random';

const ATTEMPTS = 100;

test('isSumExact', () => {
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

test('sumLowerBound/sumUpperBound, non-finite terms', () => {
  expect(sumLowerBound(Infinity, 1)).toBe(Infinity);
  expect(sumUpperBound(Infinity, 1)).toBe(Infinity);
  expect(sumLowerBound(Infinity, -Infinity)).toBe(NaN);
  expect(sumUpperBound(Infinity, -Infinity)).toBe(NaN);
  expect(sumLowerBound(3, NaN)).toBe(NaN);
  expect(sumUpperBound(3, NaN)).toBe(NaN);
});

test('sumLowerBound/sumUpperBound, exact result', () => {
  expect(sumLowerBound(1, 2)).toBe(3);
  expect(sumUpperBound(1, 2)).toBe(3);
  expect(sumLowerBound(0.25, 0.0625)).toBe(0.3125);
  expect(sumUpperBound(0.25, 0.0625)).toBe(0.3125);
});

test('sumLowerBound/sumUpperBound, non-exact finite result', () => {
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

test('sumLowerBound/sumUpperBound, near ∞ terms', () => {
  expect(sumLowerBound(Number.MAX_VALUE, Number.MAX_VALUE))
      .toBe(Number.MAX_VALUE);
  expect(sumUpperBound(Number.MAX_VALUE, Number.MAX_VALUE)).toBe(Infinity);
  expect(sumLowerBound(Number.MAX_VALUE, -Number.MAX_VALUE)).toBe(0);
  expect(sumUpperBound(Number.MAX_VALUE, -Number.MAX_VALUE)).toBe(0);
  expect(sumLowerBound(-Number.MAX_VALUE, -Number.MAX_VALUE)).toBe(-Infinity);
  expect(sumUpperBound(-Number.MAX_VALUE, -Number.MAX_VALUE))
      .toBe(-Number.MAX_VALUE);
});

test('sumLowerBound/sumUpperBound, is commutative', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const a = randomInt(0, 99) / 100;
    const b = randomInt(0, 99) / 100;
    expect(sumLowerBound(a, b)).toBe(sumLowerBound(b, a));
    expect(sumUpperBound(a, b)).toBe(sumUpperBound(b, a));
  }
});

test('sumLowerBound/sumUpperBound, consistent with isSumExact', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const a = randomSign() / Math.random();
    const b = randomSign() / Math.random();
    expect(sumLowerBound(a, b) === sumUpperBound(a, b)).toBe(isSumExact(a, b));
  }
});
