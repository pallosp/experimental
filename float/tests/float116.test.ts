import {expect, test} from '@jest/globals';

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
