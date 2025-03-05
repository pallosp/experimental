
import { Plot, Rect, runsToSvg, squaresToSvg } from 'contour-plot-svg';
import { Component, createRef } from 'preact';

import { Function2D } from './functions';

export interface PlotConfig<T> {
  func: Function2D<T>;
  sampleSpacing: number,
  zoom: number,
  addStyles: (el: SVGGraphicsElement, value: T) => void;
}

interface Props<T> {
  config: PlotConfig<T>;
  showEdges: boolean;
  viewportPixelSize: number;
}

export class SvgPlot<T> extends Component<Props<any>> {
  svgRef = createRef<SVGSVGElement>();
  contentRef = createRef<SVGGElement>();

  constructor(props: Props<unknown>) {
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

  private domainPixelSize(): number {
    return this.props.viewportPixelSize / this.zoom();
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
      .compute(domain, config.sampleSpacing, this.domainPixelSize());

    let svgElements: SVGGraphicsElement[];
    if (this.props.showEdges) {
      svgElements = squaresToSvg(plot.squares(), config.addStyles, { edges: true });
    } else {
      svgElements = runsToSvg(plot.runs(), config.addStyles);
    }

    const content = this.contentRef.current;
    content.setAttribute(
      'transform', `scale(${this.zoom()}) translate(${-domain.x}, ${-domain.y})`);
    content.textContent = '';
    content.append(...svgElements);
  }

  override componentDidMount() {
    this.updatePlot();
  }

  override componentDidUpdate(): void {
    this.updatePlot();
  }
}
