/** Largest float64 that is less than 1 */
const BEFORE_1 = 1 - 1e-16;

/** Returns the lowest possible float64 that is greater than x. */
export function nextDouble(x: number): number {
  if (isFinite(x)) {
    return x > 0 ? x / (Math.min(1 - Number.MIN_VALUE / x / 1.8, BEFORE_1)) :
        x < 0    ? x * (Math.min(1 - Number.MIN_VALUE / x / -1.8, BEFORE_1)) :
                   Number.MIN_VALUE;
  }
  return x < 0 ? -Number.MAX_VALUE : NaN;
};

/** Returns the greatest possible float64 that is less than x. */
export function prevDouble(x: number): number {
  if (isFinite(x)) {
    return x > 0 ? x * (Math.min(1 - Number.MIN_VALUE / x / 1.8, BEFORE_1)) :
        x < 0    ? x / (Math.min(1 - Number.MIN_VALUE / x / -1.8, BEFORE_1)) :
                   -Number.MIN_VALUE;
  }
  return x > 0 ? Number.MAX_VALUE : NaN;
}

/** Returns the greatest possible float64 that is at most x+y. */
export function sumLowerBound(x: number, y: number): number {
  const sum = x + y;
  if (!isFinite(x) || !isFinite(y)) return sum;
  const d = sum - y;
  return x - d + (d - sum + y) >= 0 ? sum : prevDouble(sum);
}

/** Returns the lowest possible float64 that is at least x+y. */
export function sumUpperBound(x: number, y: number): number {
  const sum = x + y;
  if (!isFinite(x) || !isFinite(y)) return sum;
  const d = sum - y;
  return x - d + (d - sum + y) <= 0 ? sum : nextDouble(sum);
}