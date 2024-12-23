import {nextDouble, prevDouble} from './enumerate';

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
