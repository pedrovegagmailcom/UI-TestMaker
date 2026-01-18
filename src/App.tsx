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
