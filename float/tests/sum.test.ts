import {expect, test} from '@jest/globals';

import {lsbExp} from '../src/bits';
import {isSumExact} from '../src/sum';

import {randomSign} from './random';

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
