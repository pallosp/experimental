export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function randomSign(): number {
  return Math.random() < 0.5 ? -1 : 1;
}
