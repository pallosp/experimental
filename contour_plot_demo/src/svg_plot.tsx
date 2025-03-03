
import { Plot, Rect, runsToSvg } from 'contour-plot-svg';
import { Component, createRef } from 'preact';

import { randomLines } from './functions';

export class SvgPlot extends Component {
  svgRef = createRef<SVGSVGElement>();
  contentRef = createRef<SVGGElement>();

  zoom(): number {
    return 64;
  }

  domain(): Rect {
    const el = this.svgRef.current;
    const width = el.clientWidth / this.zoom();
    const height = el.clientHeight / this.zoom();
    return { x: -width / 2, y: -height / 2, width, height };
  }

  pixelSize(): number {
    return (devicePixelRatio > 1 ? 0.5 : 1) / this.zoom();
  }

  render() {
    return (
      <svg ref={this.svgRef}>
        <g ref={this.contentRef} />
      </svg>
    )
  }

  componentDidMount(): void {
    const domain = this.domain();
    const plot = new Plot(randomLines())
      .compute(domain, 0.5, this.pixelSize());
    const addStyles = (el: SVGGraphicsElement, value: boolean) => {
      el.classList.add(value ? 'line' : 'background');
    }

    const content = this.contentRef.current;
    content.setAttribute(
      'transform', `scale(${this.zoom()}) translate(${-domain.x}, ${-domain.y})`);
    content.append(...runsToSvg(plot.runs(), addStyles));
  }
}
