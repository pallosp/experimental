import { render } from 'preact';

import './style.css';

export function App() {
  return (
    <>
      <p>
        <FunctionButton text="Lines" />
        <FunctionButton text="Circles" />
        <FunctionButton text="Mandelbrot set" />
        <FunctionButton text="sin x + cos y" />
        <ShowEdgesCheckbox />
        <PixelSizeInput />
      </p>
      <p>
        <PlotStats />
      </p>
      <Chart />
    </>
  );
}

function FunctionButton(props: { text: string }) {
  return (
    <button>
      {props.text}
    </button>
  )
}

function ShowEdgesCheckbox() {
  return (
    <label>
      <input id="show-edges" type="checkbox" /> Show edges
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

function Chart() {
  return (
    <svg>
      <g id="chart" />
    </svg>
  )
}

render(<App />, document.body);
