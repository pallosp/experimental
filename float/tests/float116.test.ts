import {expect, test} from '@jest/globals';

import {lsbExp} from '../src/float';

import {randomInt, randomSign} from './random';

interface Float116 {
  hi: number;
  lo: number;
}

function addDD(x: number, y: number): Float116 {
  const sum = x + y;
  const x1 = sum - y;
  return {hi: sum, lo: x - x1 + (x1 - sum + y)};
}

const ATTEMPTS = 100;

test('addDD', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = Math.random() * randomSign() * 2 ** randomInt(-40, 40);
    const y = Math.random() * randomSign() * 2 ** randomInt(-40, 40);
    const sum = addDD(x, y);
    expect(sum.hi).toBe(x + y);
    expect(sum.hi + sum.lo).toBe(x + y);
    const lsb1 = lsbExp(x);
    const lsb2 = lsbExp(y);
    const isSumExact = lsb1 === lsb2 || lsbExp(x + y) === Math.min(lsb1, lsb2);
    if (isSumExact) {
      expect(Math.abs(sum.lo)).toBe(0);
    } else if (lsb1 !== lsb2) {
      expect(Math.abs(sum.lo)).not.toBe(0);
      expect(lsbExp(sum.lo)).toBe(Math.min(lsb1, lsb2));
    }
  }
});
