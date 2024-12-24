import {expect, test} from '@jest/globals';

import {isProductExact} from '../src/product';

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
