import { CenterPanel } from './components/CenterPanel'
import { PropertiesPanel } from './components/PropertiesPanel'
import { SequencePanel } from './components/SequencePanel'
import { TopBar } from './components/TopBar'
import { RunStoreProvider, useRunStore } from './store/runStore'
import { SequenceStoreProvider } from './store/sequenceStore'

function MainLayout() {
  const { runState } = useRunStore()
  const isReadOnly = runState !== 'READY'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <TopBar />
      <main className="flex min-h-[calc(100vh-80px)] flex-col gap-4 px-6 py-6">
        {isReadOnly && (
          <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-indigo-200">
            Execution mode enabled · panels are read-only
          </div>
        )}
        <section className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]">
          <SequencePanel readOnly={isReadOnly} />
          <CenterPanel readOnly={isReadOnly} />
          <PropertiesPanel readOnly={isReadOnly} />
        </section>
      </main>
    </div>
  )
}

function App() {
  return (
    <RunStoreProvider>
      <SequenceStoreProvider>
        <MainLayout />
      </SequenceStoreProvider>
    </RunStoreProvider>
  )
}

export default App
