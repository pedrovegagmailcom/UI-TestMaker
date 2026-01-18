const propertyTabs = ['General', 'Timing', 'Signals', 'Limits']

const placeholderRows = [
  { label: 'Step ID', value: 'S04' },
  { label: 'Mode', value: 'Voltage Sweep' },
  { label: 'Duration', value: '45 s' },
]

type PropertiesPanelProps = {
  readOnly: boolean
}

export function PropertiesPanel({ readOnly }: PropertiesPanelProps) {
  return (
    <section
      className={`flex h-full flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4 ${
        readOnly ? 'pointer-events-none opacity-70' : ''
      }`}
      aria-readonly={readOnly}
    >
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Step Properties</h2>
          <p className="text-xs text-slate-400">Placeholder tabs</p>
        </div>
        {readOnly && (
          <span className="rounded-full border border-slate-700 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">
            Read-only
          </span>
        )}
      </header>

      <nav className="flex flex-wrap gap-2">
        {propertyTabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              index === 0
                ? 'border-indigo-400/60 bg-indigo-500/20 text-indigo-100'
                : 'border-slate-700 text-slate-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="flex flex-1 flex-col gap-3 rounded-lg border border-dashed border-slate-700 bg-slate-950/40 p-4 text-sm text-slate-300">
        {placeholderRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
              {row.label}
            </span>
            <span className="font-semibold text-slate-200">{row.value}</span>
          </div>
        ))}
        <div className="mt-auto rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-slate-500">
          Form inputs disabled until editing mode is enabled.
        </div>
      </div>
    </section>
  )
}
