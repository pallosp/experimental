
import { Plot, Rect, runsToSvg } from 'contour-plot-svg';
import { Component, createRef } from 'preact';

import { Function2D } from './functions';

export interface PlotConfig<T> {
  func: Function2D<T>;
  sampleSpacing: number,
  zoom: number,
  addStyles: (el: SVGGraphicsElement, value: T) => void;
}

export class SvgPlot<T> extends Component<{ config: PlotConfig<T> }> {
  svgRef = createRef<SVGSVGElement>();
  contentRef = createRef<SVGGElement>();

  constructor(props: { config: PlotConfig<T> }) {
    super(props);
  }

  private zoom(): number {
    return this.props.config.zoom;
  }

  private domain(): Rect {
    const el = this.svgRef.current;
    const width = el.clientWidth / this.zoom();
    const height = el.clientHeight / this.zoom();
    return { x: -width / 2, y: -height / 2, width, height };
  }

  private pixelSize(): number {
    return (devicePixelRatio > 1 ? 0.5 : 1) / this.zoom();
  }

  override render() {
    return (
      <svg ref={this.svgRef}>
        <g ref={this.contentRef} />
      </svg>
    )
  }

  private updatePlot() {
    const domain = this.domain();
    const config = this.props.config;
    const plot = new Plot(config.func)
      .compute(domain, config.sampleSpacing, this.pixelSize());

    const content = this.contentRef.current;
    content.setAttribute(
      'transform', `scale(${this.zoom()}) translate(${-domain.x}, ${-domain.y})`);
    content.textContent = '';
    content.append(...runsToSvg(plot.runs(), this.props.config.addStyles));
  }

  override componentDidMount() {
    this.updatePlot();
  }

  override componentDidUpdate(): void {
    this.updatePlot();
  }
}
