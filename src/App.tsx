import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

const featureList = [
  {
    title: 'Tailwind base',
    description: 'Utility-first styling ready for rapid UI iteration.',
  },
  {
    title: 'Linting',
    description: 'ESLint configured for React, TypeScript, and hooks.',
  },
  {
    title: 'CI pipeline',
    description: 'Automated checks to keep builds and linting green.',
  },
]

const readinessMetrics = [
  {
    label: 'UI flows automated',
    value: '38',
    detail: 'Critical paths for onboarding, billing, and reporting.',
  },
  {
    label: 'Regression time',
    value: '18 min',
    detail: 'Average runtime across the full nightly suite.',
  },
  {
    label: 'Flake rate',
    value: '0.7%',
    detail: 'Stabilized via network mocks and retry heuristics.',
  },
]

const readinessChecklist = [
  'Validate dark mode, light mode, and high-contrast themes.',
  'Confirm mobile breakpoints on iOS and Android viewports.',
  'Review visual diffs for the top 10 conversion flows.',
]

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-12 px-6 py-16 text-center">
        <header className="space-y-4">
          <div className="flex items-center justify-center gap-6">
            <a
              href="https://vite.dev"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-800 bg-slate-900/60 p-3 shadow-lg shadow-indigo-500/20 transition hover:border-indigo-400"
            >
              <img src={viteLogo} className="h-12 w-12" alt="Vite logo" />
            </a>
            <a
              href="https://react.dev"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-800 bg-slate-900/60 p-3 shadow-lg shadow-cyan-500/20 transition hover:border-cyan-400"
            >
              <img src={reactLogo} className="h-12 w-12" alt="React logo" />
            </a>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            UI TestMaker tooling baseline
          </h1>
          <p className="text-balance text-base text-slate-300 sm:text-lg">
            Tailwind utilities, consistent linting, and continuous integration are
            in place to keep the project fast, clean, and reliable.
          </p>
        </header>

        <section className="grid w-full gap-6 text-left md:grid-cols-3">
          {featureList.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-black/20"
            >
              <h2 className="text-lg font-semibold text-slate-100">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                {feature.description}
              </p>
            </article>
          ))}
        </section>

        <section className="grid w-full gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="space-y-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/80 via-slate-950/70 to-slate-950/40 p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300">
                Release readiness
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-100">
                Every merge ships with confidence.
              </h2>
              <p className="mt-3 text-sm text-slate-300">
                UI TestMaker keeps product teams aligned with actionable metrics and
                a consistent pre-launch checklist.
              </p>
            </div>
            <div className="space-y-3">
              {readinessChecklist.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-slate-200">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <button className="rounded-full bg-indigo-500 px-5 py-2 font-semibold text-slate-950 transition hover:bg-indigo-400">
                Start a test run
              </button>
              <button className="rounded-full border border-slate-700 px-5 py-2 font-semibold text-slate-200 transition hover:border-slate-500">
                View the checklist
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {readinessMetrics.map((metric) => (
              <article
                key={metric.label}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  {metric.label}
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-100">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm text-slate-400">{metric.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400">
          <span className="rounded-full border border-slate-800 px-4 py-2">
            Vite + React + TypeScript
          </span>
          <span className="rounded-full border border-slate-800 px-4 py-2">
            Tailwind CSS utilities
          </span>
          <span className="rounded-full border border-slate-800 px-4 py-2">
            CI checks on push
          </span>
        </div>
      </main>
    </div>
  )
}

export default App
