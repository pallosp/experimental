import {MIN_NORMAL_NUMBER} from './bits';

/** Largest float64 that is less than 1 */
const BEFORE_1 = 1 - 1e-16;

/** Returns the lowest possible float64 that is greater than x. */
export function nextDouble(x: number): number {
  if (isFinite(x)) {
    return x > MIN_NORMAL_NUMBER ? x / BEFORE_1 :
        x < -MIN_NORMAL_NUMBER   ? x * BEFORE_1 :
                                   x + Number.MIN_VALUE;
  }
  return x < 0 ? -Number.MAX_VALUE : NaN;
};

/** Returns the greatest possible float64 that is less than x. */
export function prevDouble(x: number): number {
  if (isFinite(x)) {
    return x > MIN_NORMAL_NUMBER ? x * BEFORE_1 :
        x < -MIN_NORMAL_NUMBER   ? x / BEFORE_1 :
                                   x - Number.MIN_VALUE;
  }
  return x > 0 ? Number.MAX_VALUE : NaN;
}

/** Returns true iff x<y and there are no other float64s between them. */
export function areNeighbors(x: number, y: number): boolean {
  if (x === -Infinity) return y === -Number.MAX_VALUE;
  if (y === Infinity) return x === Number.MAX_VALUE;
  const avg = x + (y - x) / 2;
  return x < y && x === avg || y === avg;
}
