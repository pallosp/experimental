import {lsbExp} from './bits';
import {Float116} from './float116';
import {errorOfSum} from './sum';

/** Whether x*y can be exactly represented as a float64. */
export function isProductExact(x: number, y: number): boolean {
  return lsbExp(x) + lsbExp(y) === lsbExp(x * y);
}

const MAX_FACTOR = 2 ** 511;
const MIN_FACTOR = 1 / MAX_FACTOR;

export function errorOfProduct(x: number, y: number): number {
  let p = x * y;
  // Handle when the product is ±Infinity, NaN or when it overflows.
  if (p - p !== 0) return x - x === 0 && y - y === 0 ? p : 0;
  // Bring the factors between ±2^-511 and ±2^511 to avoid overflow or underflow
  // in the intermediate results.
  let f = 1;
  if (x > MAX_FACTOR || x < -MAX_FACTOR) {
    x *= MIN_FACTOR;
    f = MAX_FACTOR;
  } else if (x < MIN_FACTOR && x > -MIN_FACTOR) {
    x *= MAX_FACTOR;
    f = MIN_FACTOR;
  }
  if (y > MAX_FACTOR || y < -MAX_FACTOR) {
    y *= MIN_FACTOR;
    f *= MAX_FACTOR;
  } else if (y < MIN_FACTOR && y > -MIN_FACTOR) {
    y *= MAX_FACTOR;
    f *= MIN_FACTOR;
  }
  // Split the factors to two parts with 26-bit significands.
  p = x * 0x7ffffff;
  const xh = x - p + p;
  const xl = x - xh;
  p = y * 0x7ffffff;
  const yh = y - p + p;
  const yl = y - yh;
  // Perform the multiplication piecewise.
  p = xh * yh;
  const q = xh * yl + xl * yh;
  const s = p + q;
  // Normalize the result.
  return errorOfSum(s, p - s + q + xl * yl) * f;
}

/**
 * Calculates x*y with high precision. The result will be exact unless it
 * overflows to Infinity, or underflows to 0 or to the subnormal range.
 */
export function mulDD(x: number, y: number): Float116 {
  return {hi: x * y, lo: 0 - errorOfProduct(x, y)};
}
