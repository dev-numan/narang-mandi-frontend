/**
 * Charts for the taxi dashboard, drawn as plain SVG.
 *
 * Deliberately not a charting library: the client carries twelve production
 * dependencies and the whole build is tuned around a small mobile bundle, which
 * a chart package would undo for the sake of three graphs only an admin sees.
 * Everything here is laid out in a fixed viewBox and scaled by CSS, so it stays
 * responsive without measuring the container.
 */

const PAD = { top: 12, right: 12, bottom: 24, left: 34 };
const W = 720;
const H = 240;

/// Evenly spaced ticks that always include zero and end on a round number, so
/// the gridlines stay readable when the counts are small.
function niceScale(max) {
  if (max <= 0) return { top: 4, ticks: [0, 1, 2, 3, 4] };
  const rough = max / 4;
  const mag = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].find((m) => m * mag >= rough) * mag;
  const top = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(Math.round(v));
  return { top, ticks };
}

const shortDate = (iso) => {
  const [, m, d] = iso.split('-');
  return `${Number(d)}/${Number(m)}`;
};

/**
 * Grouped daily bars: rides, bids and completions side by side.
 *
 * Bars rather than lines because the series is mostly small integers with real
 * zero days — a line would imply activity between two points that had none.
 */
export function DailyBars({ series = [] }) {
  if (!series.length) return <Empty />;

  const max = Math.max(1, ...series.flatMap((d) => [d.rides, d.bids, d.completed]));
  const { top, ticks } = niceScale(max);
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const slot = plotW / series.length;
  const barW = Math.max(2, Math.min(10, (slot - 4) / 3));
  const y = (v) => PAD.top + plotH - (v / top) * plotH;

  const bars = [
    { key: 'rides', fill: '#b91c1c', label: 'Rides' },
    { key: 'bids', fill: '#0284c7', label: 'Bids' },
    { key: 'completed', fill: '#16a34a', label: 'Completed' },
  ];

  // With a long window every label would collide, so only every Nth is drawn.
  const labelEvery = Math.ceil(series.length / 12);

  return (
    <div>
      <Legend items={bars} />
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Daily rides, bids and completions">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="#e5e7eb" strokeWidth="1" />
            <text x={PAD.left - 6} y={y(t) + 3} textAnchor="end" fontSize="9" fill="#9ca3af">
              {t}
            </text>
          </g>
        ))}

        {series.map((d, i) => (
          <g key={d.date}>
            {bars.map((b, bi) => {
              const v = d[b.key] || 0;
              if (!v) return null;
              const x = PAD.left + i * slot + slot / 2 - (barW * 3) / 2 + bi * barW;
              return (
                <rect key={b.key} x={x} y={y(v)} width={barW} height={PAD.top + plotH - y(v)} fill={b.fill} rx="1">
                  <title>{`${d.date} — ${b.label}: ${v}`}</title>
                </rect>
              );
            })}
            {i % labelEvery === 0 && (
              <text x={PAD.left + i * slot + slot / 2} y={H - 8} textAnchor="middle" fontSize="9" fill="#9ca3af">
                {shortDate(d.date)}
              </text>
            )}
          </g>
        ))}

        <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + plotH} y2={PAD.top + plotH} stroke="#d1d5db" />
      </svg>
    </div>
  );
}

/**
 * Horizontal funnel from request to completed ride.
 *
 * Each stage is measured against the first, so the widths show absolute
 * drop-off rather than the share of whatever survived the previous stage.
 */
export function Funnel({ stages = [] }) {
  const first = stages[0]?.value || 0;
  if (!first) return <Empty />;

  return (
    <div className="space-y-2.5">
      {stages.map((s) => {
        const pct = Math.round((s.value / first) * 100);
        return (
          <div key={s.label}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="font-medium text-ink">{s.label}</span>
              <span className="text-gray-500">
                <span className="font-semibold text-ink">{s.value}</span> · {pct}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.fill }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/// Stacked proportion bar — a donut's information in a fraction of the space.
export function StatusBar({ segments = [] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (!total) return <Empty />;

  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">
        {segments.map((s) =>
          s.value ? (
            <div
              key={s.label}
              style={{ width: `${(s.value / total) * 100}%`, background: s.fill }}
              title={`${s.label}: ${s.value}`}
            />
          ) : null
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {segments.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5 text-xs text-gray-600">
            <i className="h-2.5 w-2.5 rounded-sm" style={{ background: s.fill }} />
            {s.label}
            <b className="text-ink">{s.value}</b>
            <span className="text-gray-400">({Math.round((s.value / total) * 100)}%)</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Legend({ items }) {
  return (
    <div className="mb-2 flex flex-wrap gap-4">
      {items.map((b) => (
        <span key={b.key} className="flex items-center gap-1.5 text-xs text-gray-600">
          <i className="h-2.5 w-2.5 rounded-sm" style={{ background: b.fill }} />
          {b.label}
        </span>
      ))}
    </div>
  );
}

function Empty() {
  return <p className="py-8 text-center text-sm text-gray-400">No data for this period</p>;
}
