/**
 * Composite floating point type with up to 106 bits of precision.
 *
 * The struct has 116 useful bits:
 * - 1 bit sign
 * - 11 bits exponent
 * - 2*52 bits significand
 */
export interface Float116 {
  hi: number;
  lo: number;
}
