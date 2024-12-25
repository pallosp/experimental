import {nextDouble, prevDouble} from './enumerate';
import {Float116} from './float116';

/** Whether x+y can be exactly represented as a float64. */
export function isSumExact(x: number, y: number): boolean {
  const sum = x + y;
  return sum - x === y && sum - y === x;
}

/** Returns the greatest possible float64 that is at most x+y. */
export function sumLowerBound(x: number, y: number): number {
  const sum = x + y;
  if (!isFinite(x) || !isFinite(y)) return sum;
  return sum - x <= y && sum - y <= x ? sum : prevDouble(sum);
}

/** Returns the lowest possible float64 that is at least x+y. */
export function sumUpperBound(x: number, y: number): number {
  const sum = x + y;
  if (!isFinite(x) || !isFinite(y)) return sum;
  return sum - x >= y && sum - y >= x ? sum : nextDouble(sum);
}

/** Floating point rounding error of x+y. */
export function errorOfSum(x: number, y: number): number {
  const sum = x + y;
  if (!isFinite(sum)) return isFinite(x - y) ? sum : 0;
  const x1 = sum - y;
  return x1 - x - (x1 - sum + y);
}

/** Calculates x+y with full of precision. */
export function addDD(x: number, y: number): Float116 {
  return {hi: x + y, lo: 0 - errorOfSum(x, y)};
}
