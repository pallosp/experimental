import {lsbExp} from './bits';

/** Whether x*y can be exactly represented as a float64. */
export function isProductExact(x: number, y: number): boolean {
  return lsbExp(x) + lsbExp(y) === lsbExp(x * y);
}
