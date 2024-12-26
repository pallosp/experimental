import {nextDouble, prevDouble} from './enumerate';
import {errorOfSum} from './sum';

export type Interval = [number, number];

export function add(x: number|Interval, y: number|Interval): Interval {
  const x0 = typeof x === 'number' ? x : x[0];
  const x1 = typeof x === 'number' ? x : x[1];
  const y0 = typeof y === 'number' ? y : y[0];
  const y1 = typeof y === 'number' ? y : y[1];
  const l = x0 + y0;
  const r = x1 + y1;
  return [
    errorOfSum(x0, y0) > 0 ? prevDouble(l) : l,
    errorOfSum(x1, y1) < 0 ? nextDouble(r) : r
  ];
}
