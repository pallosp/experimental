/** Whether x+y can be exactly represented as a float64. */
export function isSumExact(x: number, y: number): boolean {
  const sum = x + y;
  return sum - x === y && sum - y === x;
}
