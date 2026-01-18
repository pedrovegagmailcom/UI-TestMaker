import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

export type StepType = 'Ramp' | 'Hold' | 'Cyclic' | 'Return' | 'Stop'

export type SequenceStep = {
  id: string
  type: StepType
  label: string
  enabled: boolean
  hasError: boolean
}

type SequenceStore = {
  steps: SequenceStep[]
  selectedStepId: string | null
  addStep: (type: StepType) => void
  duplicateStep: (stepId: string) => void
  deleteStep: (stepId: string) => void
  selectStep: (stepId: string) => void
  toggleStepEnabled: (stepId: string) => void
  reorderSteps: (activeId: string, overId: string) => void
}

const SequenceStoreContext = createContext<SequenceStore | null>(null)

const stepTypeLabels: Record<StepType, string> = {
  Ramp: 'Ramp voltage',
  Hold: 'Hold temperature',
  Cyclic: 'Cyclic load',
  Return: 'Return to baseline',
  Stop: 'Stop sequence',
}

const initialSteps: SequenceStep[] = [
  { id: 'S01', type: 'Ramp', label: 'Ramp voltage', enabled: true, hasError: false },
  { id: 'S02', type: 'Hold', label: 'Hold temperature', enabled: true, hasError: false },
  { id: 'S03', type: 'Cyclic', label: 'Cyclic load', enabled: true, hasError: true },
  { id: 'S04', type: 'Return', label: 'Return to baseline', enabled: false, hasError: false },
  { id: 'S05', type: 'Stop', label: 'Stop sequence', enabled: true, hasError: false },
]

const createStepId = (index: number) => `S${String(index).padStart(2, '0')}`

const moveItem = <T,>(items: T[], fromIndex: number, toIndex: number) => {
  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

export function SequenceStoreProvider({ children }: { children: ReactNode }) {
  const [steps, setSteps] = useState<SequenceStep[]>(initialSteps)
  const [selectedStepId, setSelectedStepId] = useState<string | null>(initialSteps[0]?.id ?? null)
  const nextIdRef = useRef<number>(initialSteps.length + 1)

  const addStep = (type: StepType) => {
    const nextId = createStepId(nextIdRef.current)
    nextIdRef.current += 1
    const label = stepTypeLabels[type]
    const newStep: SequenceStep = {
      id: nextId,
      type,
      label,
      enabled: true,
      hasError: false,
    }
    setSteps((current) => [...current, newStep])
    setSelectedStepId(newStep.id)
  }

  const duplicateStep = (stepId: string) => {
    setSteps((current) => {
      const index = current.findIndex((step) => step.id === stepId)
      if (index === -1) {
        return current
      }
      const nextId = createStepId(nextIdRef.current)
      nextIdRef.current += 1
      const source = current[index]
      const duplicate: SequenceStep = {
        ...source,
        id: nextId,
        label: `${source.label} copy`,
      }
      const next = [...current]
      next.splice(index + 1, 0, duplicate)
      setSelectedStepId(duplicate.id)
      return next
    })
  }

  const deleteStep = (stepId: string) => {
    setSteps((current) => {
      const next = current.filter((step) => step.id !== stepId)
      if (selectedStepId === stepId) {
        setSelectedStepId(next[0]?.id ?? null)
      }
      return next
    })
  }

  const selectStep = (stepId: string) => {
    setSelectedStepId(stepId)
  }

  const toggleStepEnabled = (stepId: string) => {
    setSteps((current) =>
      current.map((step) =>
        step.id === stepId ? { ...step, enabled: !step.enabled } : step,
      ),
    )
  }

  const reorderSteps = (activeId: string, overId: string) => {
    if (activeId === overId) {
      return
    }
    setSteps((current) => {
      const fromIndex = current.findIndex((step) => step.id === activeId)
      const toIndex = current.findIndex((step) => step.id === overId)
      if (fromIndex === -1 || toIndex === -1) {
        return current
      }
      return moveItem(current, fromIndex, toIndex)
    })
  }

  const value = useMemo<SequenceStore>(
    () => ({
      steps,
      selectedStepId,
      addStep,
      duplicateStep,
      deleteStep,
      selectStep,
      toggleStepEnabled,
      reorderSteps,
    }),
    [steps, selectedStepId],
  )

  return <SequenceStoreContext.Provider value={value}>{children}</SequenceStoreContext.Provider>
}

export function useSequenceStore() {
  const store = useContext(SequenceStoreContext)
  if (!store) {
    throw new Error('useSequenceStore must be used within SequenceStoreProvider')
  }
  return store
}
