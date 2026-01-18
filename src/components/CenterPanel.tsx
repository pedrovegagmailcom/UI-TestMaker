const validationMessages = [
  { level: 'Warning', message: 'Calibration offset exceeds target tolerance.' },
  { level: 'Info', message: 'Runtime preview synced with live sensor feed.' },
  { level: 'Warning', message: 'Sequence step 12 missing temperature guard.' },
]

type CenterPanelProps = {
  readOnly: boolean
}

export function CenterPanel({ readOnly }: CenterPanelProps) {
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

      <div className="flex flex-1 flex-col gap-4">
        <div className="flex h-56 flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-950/40 text-sm text-slate-400">
          <p>Runtime preview placeholder</p>
          <p className="text-xs text-slate-500">No camera stream connected</p>
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
