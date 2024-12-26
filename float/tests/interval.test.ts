import {expect, test} from '@jest/globals';

import {nextDouble, prevDouble} from '../src/enumerate';
import {add} from '../src/interval';

const MAX_DOUBLE = Number.MAX_VALUE;
const MIN_DOUBLE = Number.MIN_VALUE;

test('add scalars', () => {
  expect(add(1, 2)).toEqual([3, 3]);
  expect(add(1, Number.MIN_VALUE)).toEqual([1, nextDouble(1)]);
  expect(add(1, -Number.MIN_VALUE)).toEqual([prevDouble(1), 1]);
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
