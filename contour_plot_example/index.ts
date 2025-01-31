import {Plot, squaresToSvg} from 'contour-plot-svg';

document.body.innerHTML = `
    <svg style="width: 100%; height: calc(100vh - 20px)">
      <g id="plot" />
    </svg>`;
const svg = document.querySelector('svg')!;
const plot = svg.querySelector('#plot') as SVGElement;

const hyperbola = (x: number, y: number) => x * y > 10000;

const width = svg.clientWidth;
const height = svg.clientHeight;
const domain = {
  x: -width / 2,
  y: -height / 2,
  width,
  height
};
plot.style.transform = `translate(${- domain.x}px, ${- domain.y}px)`;

plot.append(...squaresToSvg(
    new Plot<boolean>(hyperbola)
        .compute(domain, /* sampleSpacing= */ 128, /* pixelSize= */ 1)
        .squares(),
    /* addStyles= */ (isInside, el) => {
      el.style.stroke = isInside ? 'olive' : 'lightgreen';
    }));
