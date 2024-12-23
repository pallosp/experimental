import {nextDouble, prevDouble} from '../src/enumerate';

/** Returns the greatest possible float64 that is at most x+y. */
export function sumLowerBound(x: number, y: number): number {
  const sum = x + y;
  if (!isFinite(x) || !isFinite(y)) return sum;
  return (sum - x - y) + (sum - y - x) <= 0 ? sum : prevDouble(sum);
}

/** Returns the lowest possible float64 that is at least x+y. */
export function sumUpperBound(x: number, y: number): number {
  const sum = x + y;
  if (!isFinite(x) || !isFinite(y)) return sum;
  return (sum - x - y) + (sum - y - x) >= 0 ? sum : nextDouble(sum);
}

/** Returns the greatest possible float64 that is at most x*y. */
export function mulLowerBound(x: number, y: number): number {
  const p = x * y;
  if (x === 0 || y === 0 || !isFinite(x) || !isFinite(y)) return p;
  if (p === 0) return Math.sign(x) === Math.sign(y) ? 0 : -Number.MIN_VALUE;
  return p === -Infinity || p / x / y + p / y / x <= 2 ? p : prevDouble(p);
}

/** Returns the lowest possible float64 that is at least x*y. */
export function mulUpperBound(x: number, y: number): number {
  const p = x * y;
  if (x === 0 || y === 0 || !isFinite(x) || !isFinite(y)) return p;
  if (p === 0) return Math.sign(x) === Math.sign(y) ? Number.MIN_VALUE : -0;
  return p > -Infinity && p / x / y + p / y / x >= 2 ? p : nextDouble(p);
}
