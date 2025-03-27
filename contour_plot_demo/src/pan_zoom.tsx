import {Component, ComponentChildren, createRef} from 'preact';
import {createPortal, ReactNode} from 'preact/compat';

interface Props {
  initialZoom: number;
  className?: string;
  children: (state: {offsetX: number; offsetY: number; volatile: boolean}) => ReactNode;
}

interface State {
  lastX: number;
  lastY: number;
  offsetX: number;
  offsetY: number;
  zoom: number;
  panning: boolean;
}

export class PanZoom extends Component<Props, State> {
  private readonly rootElement = createRef();
  private resizeObserver = new ResizeObserver(() => this.onResize());

  private readonly mouseMoveListener = (e: Event) => this.onMouseMove(e as MouseEvent);
  private readonly mouseUpListener = () => this.onMouseUp();

  constructor(props: Props) {
    super(props);
    this.state = {
      lastX: 0,
      lastY: 0,
      offsetX: 0,
      offsetY: 0,
      zoom: props.initialZoom,
      panning: false
    };
  }

  override render(
    {className, children}: Props,
    {offsetX, offsetY, panning}: State
  ): ComponentChildren {
    return (
      <div ref={this.rootElement} class={className} onMouseDown={(e) => this.onMouseDown(e)}>
        {children({offsetX, offsetY, volatile: panning})}
        {panning &&
          createPortal(
            <div style={{position: 'absolute', width: '100vw', height: '100vh', cursor: 'grab'}} />,
            document.body
          )}
      </div>
    );
  }

  override componentDidMount(): void {
    this.resizeObserver.observe(this.rootElement.current);
  }

  private onMouseDown(e: MouseEvent) {
    this.setState({lastX: e.x, lastY: e.y, panning: true});
    window.addEventListener('mousemove', this.mouseMoveListener);
    window.addEventListener('mouseup', this.mouseUpListener);
  }

  private onMouseMove(e: MouseEvent) {
    const {lastX, lastY, offsetX, offsetY} = this.state;
    this.setState({
      lastX: e.x,
      lastY: e.y,
      offsetX: offsetX + e.x - lastX,
      offsetY: offsetY + e.y - lastY
    });
  }

  private onMouseUp() {
    this.cleanup();
    this.setState({panning: false});
  }

  private onResize() {
    console.log('onResize');
    this.forceUpdate();
  }

  override componentWillUnmount(): void {
    this.cleanup();
    this.resizeObserver.disconnect();
  }

  private cleanup() {
    window.removeEventListener('mousemove', this.mouseMoveListener);
    window.removeEventListener('mouseup', this.mouseUpListener);
  }
}
