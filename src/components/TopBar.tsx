import { useRunStore } from '../store/runStore'
import { useSequenceStore } from '../store/sequenceStore'
import { useSimulationStore } from '../store/simulationStore'
import { formatDuration } from '../utils/format'

const statusStyles: Record<string, string> = {
  READY: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
  RUNNING: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/40',
  PAUSED: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
  STOPPED: 'bg-slate-500/20 text-slate-200 border-slate-400/40',
  ABORTED: 'bg-rose-500/20 text-rose-200 border-rose-400/40',
}

export function TopBar() {
  const { runState, start, pause, resume, stop, abort, reset } = useRunStore()
  const { steps } = useSequenceStore()
  const { time, activeStepIndex, totalSteps } = useSimulationStore()
  const isReady = runState === 'READY'
  const isRunning = runState === 'RUNNING'
  const isPaused = runState === 'PAUSED'
  const errorCount = steps.filter((step) => step.enabled && step.hasError).length

  const canStart = isReady && errorCount === 0
  const canPause = isRunning
  const canResume = isPaused
  const canStop = isRunning || isPaused
  const canAbort = isRunning || isPaused
  const canReset = !isReady

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/80 px-6 py-4">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-200">TestProfiler</p>
          <p className="text-xs text-slate-400">Main console</p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
            statusStyles[runState]
          }`}
        >
          {runState}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Runtime</p>
          <p className="font-semibold">{formatDuration(time)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Sequence</p>
          <p className="font-semibold">
            {totalSteps === 0 ? 'No steps' : `Step ${activeStepIndex + 1} / ${totalSteps}`}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Validation</p>
          <p className="font-semibold">
            {errorCount === 0 ? 'No errors' : `${errorCount} error${errorCount === 1 ? '' : 's'}`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={start}
          disabled={!canStart}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            canStart
              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
              : 'cursor-not-allowed bg-slate-800 text-slate-500'
          }`}
        >
          Start
        </button>
        <button
          type="button"
          onClick={pause}
          disabled={!canPause}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            canPause
              ? 'bg-amber-400/90 text-slate-950 hover:bg-amber-300'
              : 'cursor-not-allowed bg-slate-800 text-slate-500'
          }`}
        >
          Pause
        </button>
        <button
          type="button"
          onClick={resume}
          disabled={!canResume}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            canResume
              ? 'bg-indigo-400/90 text-slate-950 hover:bg-indigo-300'
              : 'cursor-not-allowed bg-slate-800 text-slate-500'
          }`}
        >
          Resume
        </button>
        <button
          type="button"
          onClick={stop}
          disabled={!canStop}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            canStop
              ? 'bg-slate-200 text-slate-950 hover:bg-white'
              : 'cursor-not-allowed bg-slate-800 text-slate-500'
          }`}
        >
          Stop
        </button>
        <button
          type="button"
          onClick={abort}
          disabled={!canAbort}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            canAbort
              ? 'bg-rose-500 text-white hover:bg-rose-400'
              : 'cursor-not-allowed bg-slate-800 text-slate-500'
          }`}
        >
          Abort
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={!canReset}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            canReset
              ? 'bg-slate-700 text-slate-100 hover:bg-slate-600'
              : 'cursor-not-allowed bg-slate-800 text-slate-500'
          }`}
        >
          Reset
        </button>
      </div>
    </header>
  )
}
