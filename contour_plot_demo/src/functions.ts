export type Function2D<T> = (x: number, y: number) => T;

function random(min: number, max: number): number {
  return Math.random() * (max - min + 1) + min;
}

function linePointDistance([a, b, c]: [number, number, number], x: number, y: number) {
  return Math.abs(a * x + b * y + c) / Math.sqrt(a * a + b * b);
}

export function randomLines(): Function2D<boolean> {
  const lines: Array<[number, number, number]> = [];
  for (let i = 0; i < 10; i++) {
    
    lines.push([random(-5, 5), random(-5, 5), random(-25, 25)]);
  }
  return (x, y) => lines.some((line, i) => linePointDistance(line, x, y) < 0.12 / (i + 3));
}

export function randomCircles(): Function2D<number> {
  const circles: Array<[number, number, number]> = [];
  for (let i = 0; i < 10; i++) {
    circles.push([random(-10, 10), random(-6, 6), random(0.5, 4)]);
  }

  return (x: number, y: number) =>
    circles.reduce((acc, [cx, cy, r]) => {
      const d = Math.sqrt((cx - x) ** 2 + (cy - y) ** 2);
      return acc * (d < r - 0.02 ? 1 : d > r + 0.02 ? -1 : 0);
    }, 1);
}

export function sinCos(x: number, y: number): number {
  return Math.floor((Math.sin(x) + Math.cos(y)) * 1.5);
}

export function mandelbrot(x: number, y: number): number {
  let re = x,
    im = y,
    i = 0;
  for (; re * re + im * im < 4 && i < 1000; i++) {
    const t = (re + im) * (re - im) + x;
    im = 2 * re * im + y;
    re = t;
  }
  return i % 6;
}
