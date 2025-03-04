import { render } from 'preact';
import { useState } from 'preact/hooks';

import { mandelbrot, randomCircles, randomLines, sinCos } from './functions';
import { PlotConfig, SvgPlot } from './svg_plot';

import './style.css';

function linePlot(): PlotConfig<boolean> {
  return {
    func: randomLines(),
    sampleSpacing: 0.5,
    zoom: 64,
    addStyles: (el, value) => el.classList.add(value ? 'line' : 'background')
  }
}

function circlePlot(): PlotConfig<number> {
  const classes = ['outside', 'perimeter', 'inside'];
  return {
    func: randomCircles(),
    sampleSpacing: 0.5,
    zoom: 64,
    addStyles: (el, value) => el.classList.add(classes[value + 1])
  }
}

function sinCosPlot(): PlotConfig<number> {
  return {
    func: sinCos,
    sampleSpacing: 1,
    zoom: 64,
    addStyles: (el, value) => {
      el.style.stroke = '#' + ((value + 3) * 3).toString(16).repeat(3);
    }
  }
}

function mandelbrotPlot(): PlotConfig<number> {
  return {
    func: mandelbrot,
    sampleSpacing: 0.25,
    zoom: 256,
    addStyles: (el, value) => {
      el.style.stroke = '#' + (value % 6 * 3).toString(16).repeat(3);
    }
  }
}

export function App() {
  const [plotConfig, setPlotConfig] = useState<PlotConfig<any>>(linePlot());
  const [showEdges, setShowEdges] = useState(false);

  return (
    <>
      <p>
        <FunctionButton text="Lines" onclick={() => setPlotConfig(linePlot)} />
        <FunctionButton text="Circles" onclick={() => setPlotConfig(circlePlot)} />
        <FunctionButton text="Mandelbrot set" onclick={() => setPlotConfig(mandelbrotPlot)} />
        <FunctionButton text="sin x + cos y" onclick={() => setPlotConfig(sinCosPlot)} />
        <ShowEdgesCheckbox setShowEdges={setShowEdges} />
        <PixelSizeInput />
      </p>
      <p>
        <PlotStats />
      </p>
      <SvgPlot config={plotConfig} showEdges={showEdges} />
    </>
  );
}

function FunctionButton(props: { text: string, onclick: () => void }) {
  return (
    <button onClick={props.onclick}>
      {props.text}
    </button>
  )
}

function ShowEdgesCheckbox(props: { setShowEdges: (checked: boolean) => void }) {
  return (
    <label>
      <input id="show-edges" type="checkbox"
        onChange={(e) => props.setShowEdges(e.currentTarget.checked)} /> Show edges
    </label>
  );
}

function PixelSizeInput() {
  return (
    <label>
      Pixel size: 2^<input id="pixel-size" type="number" value="-1" min="-2" max="9" />
    </label>
  )
}

function PlotStats(props: { text?: string }) {
  return (
    <span id="plot-stats">{props.text ?? '…'}</span>
  )
}

render(<App />, document.body);
