import {expect, test} from '@jest/globals';

import {lsbExp} from '../src/bits';
import {Float116} from '../src/float116';
import {isProductExact} from '../src/product';
import {addDD} from '../src/sum';

/** Simple but slow implementation of exact float64 multiplication. */
function mulDDSlow(x: number, y: number): Float116 {
  const lsbX = lsbExp(x);
  const lsbY = lsbExp(y);
  if (!isFinite(lsbX) || !isFinite(lsbY)) return {hi: x * y, lo: 0};
  const p = BigInt(x / 2 ** lsbX) * BigInt(y / 2 ** lsbY);
  const lo = p % BigInt(2 ** 53);
  const m = 2 ** (lsbX + lsbY);
  return addDD(Number(p - lo) * m, Number(lo) * m);
}

test('mulDDSlow', () => {
  // zero factor
  expect(mulDDSlow(0, 12)).toEqual({hi: 0, lo: 0});
  // fractional numbers
  expect(mulDDSlow(1.25, 6.0625)).toEqual({hi: 1.25 * 6.0625, lo: 0});
  // small * large integer
  expect(mulDDSlow(Number.MAX_SAFE_INTEGER, 3))
      .toEqual({hi: 3 * 2 ** 53 - 4, lo: 1});
  // large * large integer
  expect(mulDDSlow(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER))
      .toEqual({hi: 2 ** 106 - 2 ** 54, lo: 1});
  // subnormal product
  expect(mulDDSlow(6 * Number.MIN_VALUE, 7))
      .toEqual({hi: 42 * Number.MIN_VALUE, lo: 0});
  // near MAX_VALUE
  expect(mulDDSlow(Number.MAX_VALUE, 0.75))
      .toEqual({hi: 3 * 2 ** 1022 - 4 * 2 ** 969, lo: 2 ** 969});
  // non-finite factors
  expect(mulDDSlow(Infinity, 0)).toEqual({hi: NaN, lo: 0});
  expect(mulDDSlow(Infinity, 0.5)).toEqual({hi: Infinity, lo: 0});
  expect(mulDDSlow(Infinity, -Infinity)).toEqual({hi: -Infinity, lo: 0});
  expect(mulDDSlow(1, NaN)).toEqual({hi: NaN, lo: 0});
});

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
