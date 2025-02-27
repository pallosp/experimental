import {Plot, runsToSvg} from 'contour-plot-svg';

const svg = document.querySelector('svg')!;
const plot = svg.querySelector('#plot') as SVGElement;

const domain = {
  x: -svg.clientWidth / 2,
  y: -svg.clientHeight / 2,
  width: svg.clientWidth,
  height: svg.clientHeight
};
plot.style.transform = `translate(${- domain.x}px, ${- domain.y}px)`;

const hyperbola = (x: number, y: number) => x * y > 10000;
const runs = new Plot(hyperbola).compute(domain, 128, 1).runs();

plot.append(...runsToSvg(runs, (el, isInside) => {
  el.style.stroke = isInside ? 'olive' : 'lightgreen';
}));
