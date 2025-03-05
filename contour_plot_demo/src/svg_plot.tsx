import {ComputeStats, Plot, Rect, runsToSvg, squaresToSvg} from 'contour-plot-svg';
import {Component, ComponentChildren, createRef} from 'preact';

import {Function2D} from './functions';

export interface PlotConfig<T> {
  func: Function2D<T>;
  sampleSpacing: number;
  zoom: number;
  addStyles: (el: SVGGraphicsElement, value: T) => void;
}

export interface Stats extends ComputeStats {
  squareCount: number;
  runCount: number;
  svgSize: number;
  buildSvgMs: number;
  drawMs: number;
}

interface Props {
  config: PlotConfig<unknown>;
  showEdges: boolean;
  viewportPixelSize: number;
  onUpdate: (stats: Stats) => void;
}

export class SvgPlot extends Component<Props> {
  svgRef = createRef<SVGSVGElement>();
  contentRef = createRef<SVGGElement>();

  constructor(props: Props) {
    super(props);
  }

  private zoom(): number {
    return this.props.config.zoom;
  }

  private domain(): Rect {
    const el = this.svgRef.current;
    const width = el.clientWidth / this.zoom();
    const height = el.clientHeight / this.zoom();
    return {x: -width / 2, y: -height / 2, width, height};
  }

  private domainPixelSize(): number {
    return this.props.viewportPixelSize / this.zoom();
  }

  private updatePlot() {
    const domain = this.domain();
    const config = this.props.config;
    const plot = new Plot(config.func).compute(
      domain,
      config.sampleSpacing,
      this.domainPixelSize()
    );

    const buildSvgStartMs = Date.now();
    let svgElements: SVGGraphicsElement[];
    let squareCount = 0;
    let runCount = 0;
    let drawStartMs: number;
    if (this.props.showEdges) {
      const squares = plot.squares();
      drawStartMs = Date.now();
      squareCount = squares.length;
      svgElements = squaresToSvg(squares, config.addStyles, {edges: true});
    } else {
      const runs = plot.runs();
      drawStartMs = Date.now();
      runCount = runs.length;
      svgElements = runsToSvg(runs, config.addStyles);
    }

    const content = this.contentRef.current;
    content.setAttribute(
      'transform',
      `scale(${this.zoom()}) translate(${-domain.x}, ${-domain.y})`
    );
    content.textContent = '';
    content.append(...svgElements);

    this.props.onUpdate({
      ...plot.computeStats(),
      squareCount,
      runCount,
      svgSize: this.svgRef.current.outerHTML.length,
      buildSvgMs: drawStartMs - buildSvgStartMs,
      drawMs: Date.now() - drawStartMs
    });
  }

  override shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
    const props = this.props;
    return (
      props.config.func !== nextProps.config.func ||
      props.showEdges !== nextProps.showEdges ||
      props.viewportPixelSize !== nextProps.viewportPixelSize
    );
  }

  override render(): ComponentChildren {
    return (
      <svg ref={this.svgRef}>
        <g ref={this.contentRef} />
      </svg>
    );
  }

  override componentDidMount(): void {
    this.updatePlot();
  }

  override componentDidUpdate(): void {
    this.updatePlot();
  }
}
