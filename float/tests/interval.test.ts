import {expect, test} from '@jest/globals';

import {nextDouble, prevDouble} from '../src/enumerate';
import {add} from '../src/interval';

const MIN_DOUBLE = Number.MIN_VALUE;
const MAX_SAFE_INT = Number.MAX_SAFE_INTEGER;
const MAX_DOUBLE = Number.MAX_VALUE;

test('add scalars', () => {
  expect(add(1, 2)).toEqual([3, 3]);
  expect(add(1, Number.MIN_VALUE)).toEqual([1, nextDouble(1)]);
  expect(add(1, -Number.MIN_VALUE)).toEqual([prevDouble(1), 1]);
  expect(add(0.25, 0.0625)).toEqual([0.3125, 0.3125]);
  expect(add(0.1, 0.2)).toEqual([0.3, nextDouble(0.3)]);
  expect(add(MAX_SAFE_INT, 2)).toEqual([MAX_SAFE_INT + 1, MAX_SAFE_INT + 3]);
  expect(add(MAX_DOUBLE, -MAX_DOUBLE)).toEqual([0, 0]);
});

test('add intervals', () => {
  expect(add([1, 2], [3, 4])).toEqual([4, 6]);
  expect(add([1, 2], [-MIN_DOUBLE, MIN_DOUBLE])).toEqual([
    prevDouble(1), nextDouble(2)
  ]);
  expect(add([0, MAX_DOUBLE], [0, MAX_DOUBLE])).toEqual([0, Infinity]);
  expect(add([1, 2], [3, Infinity])).toEqual([4, Infinity]);
  expect(add([-Infinity, -Infinity], [Infinity, Infinity])).toEqual([NaN, NaN]);
  expect(add([0, 0], [NaN, NaN])).toEqual([NaN, NaN]);
});
