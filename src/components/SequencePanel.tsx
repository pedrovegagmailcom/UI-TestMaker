import { useState } from 'react'
import { StepList } from './sequence/StepList'
import { useSequenceStore } from '../store/sequenceStore'
import type { StepType } from '../types/sequence'

type SequencePanelProps = {
  readOnly: boolean
}

export function SequencePanel({ readOnly }: SequencePanelProps) {
  const { steps, selectedStepId, addStep, duplicateStep, deleteStep, selectStep, toggleStepEnabled, reorderSteps } =
    useSequenceStore()
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)
  const selectedStep = steps.find((step) => step.id === selectedStepId) ?? null

  const stepTypes: StepType[] = ['Ramp', 'Hold', 'Cyclic', 'Return', 'Stop']
  const canEdit = !readOnly
  const hasSelection = Boolean(selectedStep)

  const handleAdd = (type: StepType) => {
    addStep(type)
    setIsAddMenuOpen(false)
  }

  return (
    <section
      className={`flex h-full flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4 ${
        readOnly ? 'opacity-70' : ''
      }`}
      aria-readonly={readOnly}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Sequence</h2>
          <p className="text-xs text-slate-400">Ordered steps for execution</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {readOnly && (
            <span className="rounded-full border border-slate-700 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Read-only
            </span>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAddMenuOpen((open) => !open)}
              disabled={!canEdit}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 ${
                canEdit
                  ? 'border-indigo-400/50 bg-indigo-500/10 text-indigo-100 hover:border-indigo-300'
                  : 'cursor-not-allowed border-slate-700 bg-slate-900 text-slate-500'
              }`}
              aria-label="Add step"
            >
              Add
            </button>
            {isAddMenuOpen && canEdit && (
              <div className="absolute right-0 top-10 z-10 w-40 rounded-lg border border-slate-800 bg-slate-950 p-2 shadow-lg">
                <p className="px-2 pb-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  Step types
                </p>
                <div className="flex flex-col gap-1">
                  {stepTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleAdd(type)}
                      className="rounded-md px-2 py-1.5 text-left text-xs text-slate-200 transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => selectedStepId && duplicateStep(selectedStepId)}
            disabled={!canEdit || !hasSelection}
            className={`rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 ${
              canEdit && hasSelection
                ? 'border-slate-700 text-slate-200 hover:border-slate-500'
                : 'cursor-not-allowed border-slate-800 text-slate-500'
            }`}
            aria-label="Duplicate step"
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => selectedStepId && deleteStep(selectedStepId)}
            disabled={!canEdit || !hasSelection}
            className={`rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 ${
              canEdit && hasSelection
                ? 'border-rose-500/50 text-rose-200 hover:border-rose-400'
                : 'cursor-not-allowed border-slate-800 text-slate-500'
            }`}
            aria-label="Delete step"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => selectedStepId && toggleStepEnabled(selectedStepId)}
            disabled={!canEdit || !hasSelection}
            className={`rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 ${
              canEdit && hasSelection
                ? 'border-slate-700 text-slate-200 hover:border-slate-500'
                : 'cursor-not-allowed border-slate-800 text-slate-500'
            }`}
            aria-label="Toggle step enabled"
          >
            {selectedStep?.enabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      </header>

      <StepList
        steps={steps}
        selectedStepId={selectedStepId}
        isDragDisabled={!canEdit}
        onSelect={selectStep}
        onReorder={reorderSteps}
      />

      <footer className="rounded-lg border border-dashed border-slate-700 px-3 py-2 text-xs text-slate-500">
        Drag & drop to reorder · hold handle to move
      </footer>
    </section>
  )
}
