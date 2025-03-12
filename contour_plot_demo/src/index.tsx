import {render} from 'preact';
import {useState} from 'preact/hooks';

import {mandelbrot, randomCircles, randomLines, sinCos} from './functions';
import {PlotConfig, Stats, SvgPlot} from './svg_plot';

import './style.css';

function linePlot(): PlotConfig<boolean> {
  return {
    func: randomLines(),
    sampleSpacing: 0.5,
    zoom: 64,
    addStyles: (el, value) => el.classList.add(value ? 'line' : 'line-background')
  };
}

function circlePlot(): PlotConfig<number> {
  const classes = ['outside', 'perimeter', 'inside'];
  return {
    func: randomCircles(),
    sampleSpacing: 0.5,
    zoom: 64,
    addStyles: (el, value) => el.classList.add(classes[value + 1])
  };
}

function sinCosPlot(): PlotConfig<number> {
  return {
    func: sinCos,
    sampleSpacing: 1,
    zoom: 64,
    addStyles: (el, value) => {
      el.style.stroke = '#' + ((value + 3) * 3).toString(16).repeat(3);
    }
  };
}

function mandelbrotPlot(): PlotConfig<number> {
  return {
    func: mandelbrot,
    sampleSpacing: 0.25,
    zoom: 256,
    addStyles: (el, value) => {
      el.style.stroke = '#' + ((value % 6) * 3).toString(16).repeat(3);
    }
  };
}

export function App() {
  const [plotConfig, setPlotConfig] = useState<PlotConfig<unknown>>(linePlot());
  const [showEdges, setShowEdges] = useState(false);
  const [pixelSizeExponent, setPixelSizeExponent] = useState(devicePixelRatio > 1 ? -1 : 0);
  const [stats, setStats] = useState<Stats | undefined>();

  return (
    <>
      <header>
        <FunctionButton text="Lines" onclick={() => setPlotConfig(linePlot)} />
        <FunctionButton text="Circles" onclick={() => setPlotConfig(circlePlot)} />
        <FunctionButton text="Mandelbrot set" onclick={() => setPlotConfig(mandelbrotPlot)} />
        <FunctionButton text="sin x + cos y" onclick={() => setPlotConfig(sinCosPlot)} />
        &emsp;
        <ShowEdgesCheckbox setShowEdges={setShowEdges} />
        &emsp;
        <PixelSizeInput
          pixelSizeExponent={pixelSizeExponent}
          setPixelSizeExponent={setPixelSizeExponent}
        />
      </header>
      <main>
        <SvgPlot
          config={plotConfig}
          showEdges={showEdges}
          viewportPixelSize={2 ** pixelSizeExponent}
          onUpdate={(s) => setStats(s)}
        />
      </main>
      <footer>
        <PlotStats stats={stats} />
      </footer>
    </>
  );
}

function FunctionButton(props: {text: string; onclick: () => void}) {
  return <button onClick={props.onclick}>{props.text}</button>;
}

function ShowEdgesCheckbox(props: {setShowEdges: (checked: boolean) => void}) {
  return (
    <label>
      <input
        id="show-edges"
        type="checkbox"
        onChange={(e) => props.setShowEdges(e.currentTarget.checked)}
      />
      &thinsp;Show edges
    </label>
  );
}

function PixelSizeInput(props: {
  pixelSizeExponent: number;
  setPixelSizeExponent: (size: number) => void;
}) {
  return (
    <label>
      Pixel size: 2^
      <input
        class="pixel-size-input"
        type="number"
        value={props.pixelSizeExponent}
        min="-2"
        max="9"
        onChange={(e) => {
          let size = +e.currentTarget.value;
          if (size < -2 || size > 9 || !Number.isInteger(size)) {
            size = props.pixelSizeExponent;
          }
          props.setPixelSizeExponent(size);
          this.forceUpdate();
        }}
      />
    </label>
  );
}

function PlotStats(props: {stats: Stats | undefined}) {
  const stats = props.stats;
  if (!stats) return '…';

  const pixelsPerEval = stats.newArea / stats.newCalls;
  const computeStats =
    stats.newCalls > 0 ? (
      <span class="stats-item">
        Computed f(x,y) {stats.newCalls.toLocaleString()} times, once for every{' '}
        {+pixelsPerEval.toFixed(1)} pixels in {Math.round(stats.elapsedMs)} ms.
      </span>
    ) : null;
  const renderStats = (
    <span class="stats-item">
      Built {(stats.squareCount + stats.runCount).toLocaleString()}
      {stats.squareCount > 0 ? ' squares' : ' runs'} in {stats.buildSvgMs} ms and drew them in{' '}
      {stats.drawMs} ms.
    </span>
  );
  const svgStats = <span class="stats-item">SVG size: {Math.round(stats.svgSize / 1024)} KiB</span>;
  return (
    <>
      {computeStats} {renderStats} {svgStats}
    </>
  );
}

render(<App />, document.body);
