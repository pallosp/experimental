import {
  Button,
  ButtonGroup,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography
} from '@mui/material';
import {render} from 'preact';
import {useEffect, useRef, useState} from 'preact/hooks';

import {mandelbrot, randomCircles, randomLines, sinCos} from './functions';
import {PlotConfig, Stats, SvgPlot} from './svg_plot';

import '@fontsource/roboto/400.css';
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
  const [plotIndex, setPlotIndex] = useState(0);
  const [showEdges, setShowEdges] = useState(false);
  const [pixelSizeExponent, setPixelSizeExponent] = useState(devicePixelRatio > 1 ? -1 : 0);
  const [stats, setStats] = useState<Stats | undefined>();

  function setPlot(index: number, plotConfig: PlotConfig<unknown>) {
    setPlotIndex(index);
    setPlotConfig(plotConfig);
  }

  return (
    <>
      <header>
        <ButtonGroup variant="outlined" sx={{height: '36px'}}>
          <FunctionButton
            text="Lines"
            selected={plotIndex === 0}
            onclick={() => setPlot(0, linePlot())}
          />
          <FunctionButton
            text="Circles"
            selected={plotIndex === 1}
            onclick={() => setPlot(1, circlePlot())}
          />
          <FunctionButton
            text="Mandelbrot set"
            selected={plotIndex === 2}
            onclick={() => setPlot(2, mandelbrotPlot())}
          />
          <FunctionButton
            text="sin x + cos y"
            selected={plotIndex === 3}
            onclick={() => setPlot(3, sinCosPlot())}
          />
        </ButtonGroup>
        <ShowEdgesCheckbox setShowEdges={setShowEdges} />
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
          className="svg-plot"
          onUpdate={(s) => setStats(s)}
        />
      </main>
      <footer>
        <PlotStats stats={stats} />
      </footer>
    </>
  );
}

function FunctionButton(props: {text: string; selected: boolean; onclick: () => void}) {
  return (
    <Button variant={props.selected ? 'contained' : 'outlined'} onClick={props.onclick}>
      <Typography sx={{textTransform: 'none', whiteSpace: 'nowrap'}}>{props.text}</Typography>
    </Button>
  );
}

function ShowEdgesCheckbox(props: {setShowEdges: (checked: boolean) => void}) {
  return (
    <FormControlLabel
      control={
        <Checkbox
          sx={{height: '36px'}}
          onChange={(e) => props.setShowEdges((e.currentTarget as HTMLInputElement).checked)}
        />
      }
      label="Show edges"
      sx={{margin: 0}}
    />
  );
}

function PixelSizeInput(props: {
  pixelSizeExponent: number;
  setPixelSizeExponent: (size: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>();
  useEffect(() => {
    const input = inputRef.current;
    input.onchange = () => {
      let size = +input.value;
      if (size < -2 || size > 9 || !Number.isInteger(size)) {
        size = props.pixelSizeExponent;
      }
      props.setPixelSizeExponent(size);
      this.forceUpdate();
    };
  });

  return (
    <FormControlLabel
      label="Pixel size: 2^"
      labelPlacement="start"
      control={
        <TextField
          inputRef={inputRef}
          type="number"
          value={props.pixelSizeExponent}
          variant="outlined"
          slotProps={{htmlInput: {min: -2, max: 9, step: 1}}}
          sx={{'& .MuiInputBase-input': {height: '36px', boxSizing: 'border-box'}}}
        />
      }
      sx={{margin: 0}}
    ></FormControlLabel>
  );
}

function PlotStats(props: {stats: Stats | undefined}) {
  const stats = props.stats;
  if (!stats) return <Typography variant="caption">…</Typography>;

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
    <Typography variant="caption">
      {computeStats} {renderStats} {svgStats}
    </Typography>
  );
}

render(<App />, document.body);
