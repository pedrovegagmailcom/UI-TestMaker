import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

type RunState = 'READY' | 'RUNNING' | 'PAUSED' | 'STOPPED' | 'ABORTED'

type RunStore = {
  runState: RunState
  start: () => void
  pause: () => void
  stop: () => void
  abort: () => void
  reset: () => void
}

const RunStoreContext = createContext<RunStore | null>(null)

export function RunStoreProvider({ children }: { children: ReactNode }) {
  const [runState, setRunState] = useState<RunState>('READY')

  const value = useMemo<RunStore>(
    () => ({
      runState,
      start: () => setRunState('RUNNING'),
      pause: () => setRunState('PAUSED'),
      stop: () => setRunState('STOPPED'),
      abort: () => setRunState('ABORTED'),
      reset: () => setRunState('READY'),
    }),
    [runState],
  )

  return <RunStoreContext.Provider value={value}>{children}</RunStoreContext.Provider>
}

export function useRunStore() {
  const store = useContext(RunStoreContext)
  if (!store) {
    throw new Error('useRunStore must be used within RunStoreProvider')
  }
  return store
}

export type { RunState }
