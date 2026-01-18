import { useMemo } from 'react'
import { useSimulationStore } from '../store/simulationStore'
import { formatDuration } from '../utils/format'

const validationMessages = [
  { level: 'Warning', message: 'Calibration offset exceeds target tolerance.' },
  { level: 'Info', message: 'Runtime preview synced with live sensor feed.' },
  { level: 'Warning', message: 'Sequence step 12 missing temperature guard.' },
]

const TICK_RATE_LABEL = '25 Hz'

type CenterPanelProps = {
  readOnly: boolean
}

export function CenterPanel({ readOnly }: CenterPanelProps) {
  const { samples, time, force, displacement, activeStepId, stepElapsed, totalSteps } = useSimulationStore()

  const chart = useMemo(() => {
    if (samples.length === 0) {
      return null
    }

    const width = 640
    const height = 180
    const padding = 18
    const times = samples.map((sample) => sample.time)
    const forces = samples.map((sample) => sample.force)
    const minTime = Math.min(...times)
    const maxTime = Math.max(...times)
    const minForce = Math.min(...forces, 0)
    const maxForce = Math.max(...forces, 1)

    const rangeTime = maxTime - minTime || 1
    const rangeForce = maxForce - minForce || 1

    const toX = (value: number) =>
      padding + ((value - minTime) / rangeTime) * (width - padding * 2)
    const toY = (value: number) =>
      height - padding - ((value - minForce) / rangeForce) * (height - padding * 2)

    const points = samples.map((sample) => `${toX(sample.time)},${toY(sample.force)}`).join(' ')

    return { width, height, padding, points, minForce, maxForce }
  }, [samples])

  return (
    <section
      className={`flex h-full flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/30 p-4 ${
        readOnly ? 'pointer-events-none opacity-70' : ''
      }`}
      aria-readonly={readOnly}
    >
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Preview / Runtime</h2>
          <p className="text-xs text-slate-400">Live viewport and capture</p>
        </div>
        <span className="rounded-full border border-slate-700 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">
          Mock feed
        </span>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Elapsed time</p>
          <p className="mt-2 text-lg font-semibold text-slate-100">{formatDuration(time)}</p>
          <p className="text-xs text-slate-500">Step timer {formatDuration(stepElapsed)}</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Force</p>
          <p className="mt-2 text-lg font-semibold text-slate-100">{force.toFixed(2)} kN</p>
          <p className="text-xs text-slate-500">Target feedback</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Displacement</p>
          <p className="mt-2 text-lg font-semibold text-slate-100">{displacement.toFixed(2)} mm</p>
          <p className="text-xs text-slate-500">
            {activeStepId ? `Active step ${activeStepId}` : totalSteps === 0 ? 'No steps loaded' : 'Idle'}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Force vs time
              </h3>
              <p className="text-xs text-slate-500">Streaming at {TICK_RATE_LABEL}</p>
            </div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
              {samples.length} points
            </span>
          </div>
          <div className="mt-4 flex h-48 items-center justify-center rounded-lg border border-dashed border-slate-800 bg-slate-950/40">
            {chart ? (
              <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="h-full w-full">
                <defs>
                  <linearGradient id="forceLine" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                <rect
                  x={chart.padding}
                  y={chart.padding}
                  width={chart.width - chart.padding * 2}
                  height={chart.height - chart.padding * 2}
                  fill="none"
                  stroke="rgba(148,163,184,0.2)"
                  strokeDasharray="4 6"
                />
                <polyline
                  fill="none"
                  stroke="url(#forceLine)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  points={chart.points}
                />
              </svg>
            ) : (
              <div className="text-center text-xs text-slate-500">
                <p>No runtime data yet.</p>
                <p>Press Start to begin streaming.</p>
              </div>
            )}
          </div>
          {chart && (
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Min {chart.minForce.toFixed(2)} kN</span>
              <span>Max {chart.maxForce.toFixed(2)} kN</span>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Validation messages
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            {validationMessages.map((item, index) => (
              <li
                key={`${item.level}-${index}`}
                className="flex items-start justify-between gap-3 rounded-md border border-slate-800 bg-slate-900/40 px-3 py-2"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                    {item.level}
                  </p>
                  <p className="text-sm text-slate-200">{item.message}</p>
                </div>
                <span className="text-xs text-slate-500">12:05</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
