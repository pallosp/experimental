type Function2D<T> = (x: number, y: number) => T;

function random(min: number, max: number): number {
  return Math.random() * (max - min + 1) + min;
}

function linePointDistance(
    [a, b, c]: [number, number, number], x: number, y: number) {
  return Math.abs(a * x + b * y + c) / Math.sqrt(a * a + b * b);
}

export function randomLines(): Function2D<boolean> {
  const lines: Array<[number, number, number]> = [];
  for (let i = 0; i < 10; i++) {
    lines.push([random(-5, 5), random(-5, 5), random(-25, 25)]);
  }
  return (x, y) => lines.some(
             (line, i) => linePointDistance(line, x, y) < 0.12 / (i + 3));
}
