import {expect, test} from '@jest/globals';

import {MIN_NORMAL_NUMBER} from '../src/bits';
import {areNeighbors, nextDouble, prevDouble} from '../src/enumerate';

const ATTEMPTS = 100;
const MIN_VALUE = Number.MIN_VALUE;
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

test('next double, special values', () => {
  expect(nextDouble(NaN)).toBe(NaN);
  expect(nextDouble(-Infinity)).toBe(-Number.MAX_VALUE);
  expect(nextDouble(-MIN_VALUE)).toBe(0);
  expect(nextDouble(-0)).toBe(MIN_VALUE);
  expect(nextDouble(0)).toBe(MIN_VALUE);
  expect(nextDouble(MIN_VALUE)).toBe(MIN_VALUE * 2);
  expect(nextDouble(-MIN_NORMAL_NUMBER - MIN_VALUE)).toBe(-MIN_NORMAL_NUMBER);
  expect(nextDouble(-MIN_NORMAL_NUMBER)).toBe(-MIN_NORMAL_NUMBER + MIN_VALUE);
  expect(nextDouble(MIN_NORMAL_NUMBER - MIN_VALUE)).toBe(MIN_NORMAL_NUMBER);
  expect(nextDouble(MIN_NORMAL_NUMBER)).toBe(MIN_NORMAL_NUMBER + MIN_VALUE);
  expect(nextDouble(MAX_SAFE_INTEGER)).toBe(MAX_SAFE_INTEGER + 1);
  expect(nextDouble(MAX_SAFE_INTEGER + 1)).toBe(MAX_SAFE_INTEGER + 3);
  expect(nextDouble(Infinity)).toBe(NaN);
});

test('previous double, special values', () => {
  expect(prevDouble(NaN)).toBe(NaN);
  expect(prevDouble(-Infinity)).toBe(NaN);
  expect(prevDouble(-MIN_VALUE)).toBe(-MIN_VALUE * 2);
  expect(prevDouble(0)).toBe(-MIN_VALUE);
  expect(prevDouble(MIN_VALUE)).toBe(0);
  expect(prevDouble(-MIN_NORMAL_NUMBER)).toBe(-MIN_NORMAL_NUMBER - MIN_VALUE);
  expect(prevDouble(-MIN_NORMAL_NUMBER + MIN_VALUE)).toBe(-MIN_NORMAL_NUMBER);
  expect(prevDouble(MIN_NORMAL_NUMBER)).toBe(MIN_NORMAL_NUMBER - MIN_VALUE);
  expect(prevDouble(MIN_NORMAL_NUMBER + MIN_VALUE)).toBe(MIN_NORMAL_NUMBER);
  expect(prevDouble(MAX_SAFE_INTEGER + 1)).toBe(MAX_SAFE_INTEGER);
  expect(prevDouble(MAX_SAFE_INTEGER + 3)).toBe(MAX_SAFE_INTEGER + 1);
  expect(prevDouble(Infinity)).toBe(Number.MAX_VALUE);
});

test('previous/next double, near -∞', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = -Number.MAX_VALUE * Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
    expect(areNeighbors(prevDouble(x), x)).toBe(true);
  }
});

test('previous/next double, large negative', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = -Math.exp(Math.random() * 709);
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
    expect(areNeighbors(prevDouble(x), x)).toBe(true);
  }
});

test('previous/next double, <-1', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = -1 / Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
    expect(areNeighbors(prevDouble(x), x)).toBe(true);
  }
});

test('previous/next double, -1..0', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = -Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
    expect(areNeighbors(prevDouble(x), x)).toBe(true);
  }
});

test('previous/next double, -ε', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = -MIN_VALUE / Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
    expect(areNeighbors(prevDouble(x), x)).toBe(true);
  }
});

test('previous/next double, ε', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = MIN_VALUE / Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
    expect(areNeighbors(prevDouble(x), x)).toBe(true);
  }
});

test('previous/next double, 0..1', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
    expect(areNeighbors(prevDouble(x), x)).toBe(true);
  }
});

test('previous/next double, >1', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = 1 / Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
    expect(areNeighbors(prevDouble(x), x)).toBe(true);
  }
});

test('previous/next double, large', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = Math.exp(Math.random() * 709);
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
    expect(areNeighbors(prevDouble(x), x)).toBe(true);
  }
});

test('previous/next double, near ∞', () => {
  for (let i = 0; i < ATTEMPTS; i++) {
    const x = Number.MAX_VALUE * Math.random();
    expect(areNeighbors(x, nextDouble(x))).toBe(true);
    expect(areNeighbors(prevDouble(x), x)).toBe(true);
  }
});
