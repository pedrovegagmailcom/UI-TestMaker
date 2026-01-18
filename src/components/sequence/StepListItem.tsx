import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { SequenceStep } from '../../store/sequenceStore'

type StepListItemProps = {
  step: SequenceStep
  isSelected: boolean
  isDragDisabled: boolean
  onSelect: (stepId: string) => void
}

export function StepListItem({ step, isSelected, isDragDisabled, onSelect }: StepListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
    disabled: isDragDisabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition ${
        isSelected
          ? 'border-indigo-400/70 bg-indigo-500/10'
          : 'border-slate-800 bg-slate-950/60'
      } ${isDragging ? 'opacity-70' : ''}`}
      role="listitem"
    >
      <button
        type="button"
        onClick={() => onSelect(step.id)}
        className="flex flex-1 flex-col items-start gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
      >
        <div className="flex w-full items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">{step.id}</span>
            <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-500">
              {step.type}
            </span>
            {!step.enabled && (
              <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Disabled
              </span>
            )}
          </div>
          {step.hasError && (
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-300">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              Error
            </span>
          )}
        </div>
        <div className="flex w-full items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-100">{step.label}</p>
          <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
            {step.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </button>
      <button
        type="button"
        className={`rounded-md border border-slate-800 bg-slate-900/80 px-2 py-2 text-xs text-slate-300 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 ${
          isDragDisabled
            ? 'cursor-not-allowed opacity-40'
            : 'hover:border-indigo-400/60 hover:text-slate-100'
        }`}
        aria-label="Drag step"
        {...attributes}
        {...listeners}
        disabled={isDragDisabled}
      >
        ⋮⋮
      </button>
    </div>
  )
}
