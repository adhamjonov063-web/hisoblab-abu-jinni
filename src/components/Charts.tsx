import React, { useState } from 'react';

export interface TrendPoint {
  label: string;
  primary: number;
  secondary?: number;
}

interface TrendChartProps {
  data: TrendPoint[];
  mode: 'line' | 'bar';
  showSecondary?: boolean;
  primaryLabel: string;
  secondaryLabel?: string;
  formatValue: (val: number) => string;
  height?: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  mode,
  showSecondary = false,
  primaryLabel,
  secondaryLabel = 'Xarajatlar',
  formatValue,
  height = 220,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        Ko‘rsatish uchun ma’lumot topilmadi
      </div>
    );
  }

  const width = 640;
  const padLeft = 12;
  const padRight = 12;
  const padTop = 16;
  const padBottom = 28;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const allVals = data.flatMap((d) =>
    showSecondary && d.secondary !== undefined ? [d.primary, d.secondary] : [d.primary]
  );
  const rawMax = Math.max(...allVals, 1);
  const maxVal = rawMax * 1.12;
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const getX = (idx: number) => {
    if (data.length === 1) return padLeft + chartW / 2;
    return padLeft + (idx / (data.length - 1)) * chartW;
  };

  const getY = (val: number) => {
    return padTop + chartH - ((val - minVal) / range) * chartH;
  };

  const primaryPoints = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.primary),
    val: d.primary,
    secVal: d.secondary,
    label: d.label,
  }));

  const linePath = primaryPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaPath =
    primaryPoints.length > 0
      ? `${linePath} L ${primaryPoints[primaryPoints.length - 1].x.toFixed(1)} ${(
          padTop + chartH
        ).toFixed(1)} L ${primaryPoints[0].x.toFixed(1)} ${(padTop + chartH).toFixed(1)} Z`
      : '';

  const secondaryPath =
    showSecondary && data.every((d) => d.secondary !== undefined)
      ? data
          .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.secondary ?? 0).toFixed(1)}`)
          .join(' ')
      : '';

  const selected = activeIndex !== null ? data[activeIndex] : data[data.length - 1];
  const selectedIndex = activeIndex !== null ? activeIndex : data.length - 1;

  const handlePointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * width;
    const clampedX = Math.max(padLeft, Math.min(width - padRight, relX));
    if (data.length <= 1) {
      setActiveIndex(0);
      return;
    }
    const idx = Math.round(((clampedX - padLeft) / chartW) * (data.length - 1));
    setActiveIndex(Math.max(0, Math.min(data.length - 1, idx)));
  };

  const labelStep = data.length > 8 ? Math.ceil(data.length / 6) : 1;

  return (
    <div className="w-full select-none">
      {/* Live Readout Strip (never clips on mobile) */}
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
        <div className="flex items-baseline gap-2.5">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {selected.label}
          </span>
          <span className="font-mono text-base font-semibold text-slate-900 tabular-nums dark:text-slate-100">
            {formatValue(selected.primary)}
          </span>
          <span className="text-xs text-blue-600 dark:text-blue-400">{primaryLabel}</span>
        </div>
        {showSecondary && selected.secondary !== undefined && (
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-sm font-medium text-slate-600 tabular-nums dark:text-slate-300">
              {formatValue(selected.secondary)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{secondaryLabel}</span>
          </div>
        )}
      </div>

      {/* Responsive SVG */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full touch-pan-y overflow-visible"
        onPointerMove={handlePointer}
        onPointerDown={handlePointer}
        onPointerLeave={() => setActiveIndex(null)}
        role="img"
        aria-label={`${primaryLabel} dinamikasi grafigi`}
      >
        <defs>
          <linearGradient id="hisobAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Horizontal Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac, idx) => {
          const y = padTop + chartH * frac;
          return (
            <line
              key={idx}
              x1={padLeft}
              y1={y}
              x2={width - padRight}
              y2={y}
              stroke="currentColor"
              className="text-slate-200/80 dark:text-slate-800"
              strokeWidth="1"
              strokeDasharray={frac === 1 ? undefined : '3 4'}
            />
          );
        })}

        {mode === 'line' ? (
          <>
            {areaPath && <path d={areaPath} fill="url(#hisobAreaGrad)" />}
            {secondaryPath && (
              <path
                d={secondaryPath}
                fill="none"
                stroke="#94A3B8"
                strokeWidth="2"
                strokeDasharray="5 4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            <path
              d={linePath}
              fill="none"
              stroke="#2563EB"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Active Hairline + Point */}
            {primaryPoints[selectedIndex] && (
              <g>
                <line
                  x1={primaryPoints[selectedIndex].x}
                  y1={padTop}
                  x2={primaryPoints[selectedIndex].x}
                  y2={padTop + chartH}
                  stroke="#2563EB"
                  strokeOpacity="0.35"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                {showSecondary && selected.secondary !== undefined && (
                  <circle
                    cx={primaryPoints[selectedIndex].x}
                    cy={getY(selected.secondary)}
                    r="4"
                    fill="#94A3B8"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                )}
                <circle
                  cx={primaryPoints[selectedIndex].x}
                  cy={primaryPoints[selectedIndex].y}
                  r="5.5"
                  fill="#2563EB"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              </g>
            )}
          </>
        ) : (
          /* Bar Chart Mode */
          <g>
            {data.map((d, i) => {
              const slotW = chartW / data.length;
              const barGroupW = Math.min(28, slotW * 0.68);
              const cx = padLeft + slotW * i + slotW / 2;
              const singleW = showSecondary ? barGroupW * 0.46 : barGroupW;
              const y1 = getY(d.primary);
              const h1 = padTop + chartH - y1;
              const isSelected = i === selectedIndex;

              return (
                <g key={i}>
                  <rect
                    x={showSecondary ? cx - singleW - 1 : cx - singleW / 2}
                    y={y1}
                    width={singleW}
                    height={Math.max(2, h1)}
                    rx="3"
                    fill={isSelected ? '#1D4ED8' : '#2563EB'}
                    fillOpacity={activeIndex === null || isSelected ? 0.92 : 0.45}
                  />
                  {showSecondary && d.secondary !== undefined && (
                    <rect
                      x={cx + 1}
                      y={getY(d.secondary)}
                      width={singleW}
                      height={Math.max(2, padTop + chartH - getY(d.secondary))}
                      rx="3"
                      fill="#94A3B8"
                      fillOpacity={activeIndex === null || isSelected ? 0.75 : 0.35}
                    />
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* X Axis Labels */}
        {data.map((d, i) => {
          if (i % labelStep !== 0 && i !== data.length - 1) return null;
          const x =
            mode === 'bar'
              ? padLeft + (chartW / data.length) * i + chartW / data.length / 2
              : getX(i);
          return (
            <text
              key={i}
              x={x}
              y={height - 6}
              textAnchor={i === 0 && mode === 'line' ? 'start' : i === data.length - 1 && mode === 'line' ? 'end' : 'middle'}
              className="fill-slate-400 text-[11px] font-medium dark:fill-slate-500"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export interface RingSlice {
  label: string;
  value: number;
  color: string;
}

interface DistributionRingProps {
  slices: RingSlice[];
  centerLabel: string;
  centerValue: string;
  formatValue: (val: number) => string;
}

export const DistributionRing: React.FC<DistributionRingProps> = ({
  slices,
  centerLabel,
  centerValue,
  formatValue,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = 54;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  let cumulativePct = 0;

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="relative mx-auto flex h-36 w-36 shrink-0 items-center justify-center sm:mx-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          {slices.map((slice, idx) => {
            const pct = slice.value / total;
            const dashLength = pct * circumference;
            const dashOffset = -cumulativePct * circumference;
            cumulativePct += pct;
            const isActive = selectedIdx === null || selectedIdx === idx;

            return (
              <circle
                key={slice.label}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={selectedIdx === idx ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={`${Math.max(0, dashLength - 2)} ${circumference}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
                opacity={isActive ? 1 : 0.35}
                className="cursor-pointer transition-opacity duration-150"
                onClick={() => setSelectedIdx(selectedIdx === idx ? null : idx)}
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-3">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[90px]">
            {selectedIdx !== null ? slices[selectedIdx].label : centerLabel}
          </span>
          <span className="font-mono text-sm font-bold text-slate-900 tabular-nums dark:text-slate-100">
            {selectedIdx !== null
              ? `${Math.round((slices[selectedIdx].value / total) * 100)}%`
              : centerValue}
          </span>
        </div>
      </div>

      <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800">
        {slices.map((slice, idx) => {
          const pct = Math.round((slice.value / total) * 100);
          const isSelected = selectedIdx === idx;
          return (
            <button
              key={slice.label}
              type="button"
              onClick={() => setSelectedIdx(isSelected ? null : idx)}
              className={`flex min-h-[44px] w-full items-center justify-between gap-3 py-2 text-left transition-colors ${
                isSelected ? 'bg-slate-50 dark:bg-slate-800/60 px-2 -mx-2 rounded-lg' : ''
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                  {slice.label}
                </span>
              </div>
              <div className="flex items-baseline gap-2.5 shrink-0">
                <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                  {formatValue(slice.value)}
                </span>
                <span className="font-mono text-xs text-slate-500 tabular-nums w-9 text-right dark:text-slate-400">
                  {pct}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface ComparisonBarItem {
  label: string;
  value: number;
  sublabel?: string;
}

interface ComparisonBarsProps {
  items: ComparisonBarItem[];
  formatValue: (val: number) => string;
}

export const ComparisonBars: React.FC<ComparisonBarsProps> = ({ items, formatValue }) => {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="space-y-3.5">
      {items.map((item) => {
        const widthPct = Math.max(4, Math.round((item.value / max) * 100));
        return (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <div className="min-w-0">
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                  {item.label}
                </span>
                {item.sublabel && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">{item.sublabel}</span>
                )}
              </div>
              <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums shrink-0 dark:text-slate-100">
                {formatValue(item.value)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-500"
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
