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
