/**
 * Small dependency-free charts. Every chart has selectable marks (native
 * buttons), hover/focus tooltips and a textual table equivalent elsewhere on
 * the page. Colours are validated categorical slots; text never uses them.
 */
import { useState, type CSSProperties } from 'react';

export interface BarDatum {
  id: string;
  label: string;
  /** 0–1 */
  value: number;
  valueLabel: string;
  detail: string;
}

const percentTicks = [0, 0.25, 0.5, 0.75, 1];

export function BarChart({ data, selectedId, onSelect, label }: {
  data: BarDatum[]; selectedId?: string; onSelect: (id: string) => void; label: string;
}) {
  return (
    <div className="bar-chart" role="group" aria-label={label}>
      <div className="bar-rows">
        {data.map((item) => (
          <button
            type="button" key={item.id} className="bar-row" aria-pressed={item.id === selectedId}
            aria-label={`${item.label}: ${item.valueLabel}, ${item.detail}`} onClick={() => onSelect(item.id)}
          >
            <span className="bar-label">{item.label}</span>
            <span className="bar-track">
              <span className="bar-fill" style={{ width: `${Math.max(item.value * 100, 0.5)}%` }} />
              <span className="tooltip" role="presentation">{item.valueLabel} · {item.detail}</span>
            </span>
            <span className="bar-value">{item.valueLabel}</span>
          </button>
        ))}
      </div>
      <div className="bar-axis" aria-hidden="true">
        {percentTicks.map((tick) => <span key={tick} style={{ left: `${tick * 100}%` }}>{tick * 100}%</span>)}
      </div>
    </div>
  );
}

export interface TrendPoint {
  x: number;
  /** 0–1 */
  y: number;
  label: string;
  detail: string;
}

/** Single-series line chart; points are positioned HTML buttons so they stay round at any width. */
export function TrendChart({ points, selectedX, onSelect, label }: {
  points: TrendPoint[]; selectedX?: number; onSelect: (x: number) => void; label: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  if (!points.length) return <p className="helper">No observations in this scope.</p>;
  const maxY = Math.min(1, Math.ceil((Math.max(...points.map((point) => point.y)) + 0.05) * 10) / 10);
  const ticks = Array.from({ length: 5 }, (_, index) => (maxY / 4) * index);
  const xs = points.map((point) => point.x);
  const position = (point: TrendPoint) => ({
    left: points.length === 1 ? 50 : ((point.x - Math.min(...xs)) / (Math.max(...xs) - Math.min(...xs))) * 100,
    top: 100 - (point.y / maxY) * 100,
  });
  const line = points.map((point) => { const at = position(point); return `${at.left},${at.top}`; }).join(' ');
  const shown = points.find((point) => point.x === (hovered ?? selectedX));

  return (
    <div className="trend-chart" role="group" aria-label={label}>
      <div className="trend-y" aria-hidden="true">
        {ticks.map((tick) => <span key={tick} style={{ top: `${100 - (tick / maxY) * 100}%` }}>{Math.round(tick * 100)}%</span>)}
      </div>
      <div className="trend-plot">
        {ticks.map((tick) => <span key={tick} className="gridline" style={{ top: `${100 - (tick / maxY) * 100}%` }} aria-hidden="true" />)}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <polyline points={line} fill="none" stroke="var(--series-single)" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        {points.map((point) => {
          const at = position(point);
          return (
            <button
              type="button" key={point.x} className="trend-point" aria-pressed={point.x === selectedX}
              aria-label={`${point.x}: ${point.label}, ${point.detail}`}
              style={{ left: `${at.left}%`, top: `${at.top}%` } as CSSProperties}
              onClick={() => onSelect(point.x)}
              onMouseEnter={() => setHovered(point.x)} onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(point.x)} onBlur={() => setHovered(null)}
            />
          );
        })}
        {shown && (
          <div className="trend-tooltip" role="presentation" style={{ left: `${position(shown).left}%`, top: `${position(shown).top}%` }}>
            <strong>{shown.x}</strong> {shown.label}<br /><span>{shown.detail}</span>
          </div>
        )}
      </div>
      <div className="trend-x" aria-hidden="true">
        {points.map((point) => <span key={point.x} style={{ left: `${position(point).left}%` }}>{point.x}</span>)}
      </div>
    </div>
  );
}

export interface PairedDatum {
  id: string;
  label: string;
  left: number;
  right: number;
}

/** Two series (one per jurisdiction) on one shared axis, with legend and direct labels. */
export function PairedBarChart({ data, leftName, rightName, unit, selectedId, onSelect, label }: {
  data: PairedDatum[]; leftName: string; rightName: string; unit: string; selectedId?: string;
  onSelect: (id: string) => void; label: string;
}) {
  const max = Math.max(1, ...data.flatMap((item) => [item.left, item.right]));
  return (
    <div className="paired-chart" role="group" aria-label={label}>
      <div className="legend" aria-hidden="true">
        <span><i className="swatch swatch-left" />{leftName}</span>
        <span><i className="swatch swatch-right" />{rightName}</span>
      </div>
      {data.map((item) => (
        <button
          type="button" key={item.id} className="paired-row" aria-pressed={item.id === selectedId}
          aria-label={`${item.label}: ${leftName} ${item.left} ${unit}, ${rightName} ${item.right} ${unit}`}
          onClick={() => onSelect(item.id)}
        >
          <span className="paired-label">{item.label}</span>
          {(['left', 'right'] as const).map((side) => (
            <span className="paired-bar" key={side}>
              <span className="bar-track">
                <span className={`bar-fill fill-${side}`} style={{ width: `${(item[side] / max) * 100}%` }} />
              </span>
              <span className="bar-value">{item[side]}</span>
            </span>
          ))}
        </button>
      ))}
    </div>
  );
}
