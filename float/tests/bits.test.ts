import {expect, test} from '@jest/globals';

import {lsbExp, msbExp, significantBits} from '../src/bits';
import {prevDouble} from '../src/enumerate';

const ATTEMPTS = 100;

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

test('significantBits', () => {
  expect(significantBits(0)).toBe(0);
  expect(significantBits(1)).toBe(1);
  expect(significantBits(-6)).toBe(2);
  expect(significantBits(2 ** 53)).toBe(1);
  expect(significantBits(2 ** 53 - 1)).toBe(53);
  expect(significantBits(Number.MAX_VALUE)).toBe(53);
  expect(significantBits(Number.MIN_VALUE)).toBe(1);
  expect(significantBits(Infinity)).toBe(NaN);
  expect(significantBits(-Infinity)).toBe(NaN);
  expect(significantBits(NaN)).toBe(NaN);
});
