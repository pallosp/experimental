/** Largest float64 that is less than 1 */
const BEFORE_1 = 1 - 1e-16;

// Helper variables to enable reading float64s in binary format without memory
// allocation.
const f64 = new Float64Array([0]);
const halves = new Uint32Array(f64.buffer);

/**
 * Counts the number of trailing zeros in the binary representation of a
 * non-zero int32.
 */
function crz32(x: number): number {
  return 31 - Math.clz32(x & -x);
}

/**
 * Returns the magnitude of the most significant bit of a float64, as an
 * exponent of 2. Equals to floor(log2(abs(x))).
 */
export function msbExp(x: number): number {
  if (!isFinite(x)) return Math.abs(x);
  if (x === 0) return -Infinity;
  f64[0] = x;
  const rawExp = (halves[1] & 0x7FF00000) >>> 20;
  if (rawExp > 0) return rawExp - 1023;
  const fh = halves[1] & 0xFFFFF;
  return fh === 0 ? -1043 - Math.clz32(halves[0]) : -1011 - Math.clz32(fh);
}

/**
 * Returns the magnitude of the least significant (non-zero) bit of a float64,
 * as an exponent of 2.
 */
export function lsbExp(x: number): number {
  if (!isFinite(x)) return Math.abs(x);
  if (x === 0) return -Infinity;
  f64[0] = x;
  const rawExp = (halves[1] & 0x7FF00000) >>> 20;
  return rawExp + +(rawExp === 0) - 1075 +
      (halves[0] === 0 ? crz32(halves[1] | 0x100000) + 32 : crz32(halves[0]))
}

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
