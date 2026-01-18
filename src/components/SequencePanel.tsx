const sequenceItems = [
  { id: 'S01', name: 'Open device session', status: 'Ready' },
  { id: 'S02', name: 'Load fixture configuration', status: 'Ready' },
  { id: 'S03', name: 'Warm-up cycle', status: 'Ready' },
  { id: 'S04', name: 'Voltage sweep', status: 'Queued' },
  { id: 'S05', name: 'Thermal soak', status: 'Queued' },
]

type SequencePanelProps = {
  readOnly: boolean
}

export function SequencePanel({ readOnly }: SequencePanelProps) {
  return (
    <section
      className={`flex h-full flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4 ${
        readOnly ? 'pointer-events-none opacity-70' : ''
      }`}
      aria-readonly={readOnly}
    >
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Sequence</h2>
          <p className="text-xs text-slate-400">Ordered steps for execution</p>
        </div>
        {readOnly && (
          <span className="rounded-full border border-slate-700 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">
            Read-only
          </span>
        )}
      </header>

      <div className="flex flex-1 flex-col gap-3">
        {sequenceItems.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-3"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{item.id}</span>
              <span>{item.status}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-100">{item.name}</p>
          </div>
        ))}
      </div>

      <footer className="rounded-lg border border-dashed border-slate-700 px-3 py-2 text-xs text-slate-500">
        Drag & drop placeholder (disabled)
      </footer>
    </section>
  )
}
