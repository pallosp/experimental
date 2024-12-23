import {expect, test} from '@jest/globals';

import {mulLowerBound, mulUpperBound} from '../src/float';

import {randomSign} from './random';

const ATTEMPTS = 100;

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
