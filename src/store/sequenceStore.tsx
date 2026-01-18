import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import type { EndCriterion, SequenceStep, StepParameters, StepType } from '../types/sequence'
import { controlModes } from '../types/sequence'
import { stepSchema, type StepFormValues } from '../validation/stepValidation'

type SequenceStore = {
  steps: SequenceStep[]
  selectedStepId: string | null
  addStep: (type: StepType) => void
  duplicateStep: (stepId: string) => void
  deleteStep: (stepId: string) => void
  selectStep: (stepId: string) => void
  toggleStepEnabled: (stepId: string) => void
  reorderSteps: (activeId: string, overId: string) => void
  updateStep: (step: StepFormValues) => void
}

const SequenceStoreContext = createContext<SequenceStore | null>(null)

const stepTypeLabels: Record<StepType, string> = {
  Ramp: 'Ramp voltage',
  Hold: 'Hold temperature',
  Cyclic: 'Cyclic load',
  Return: 'Return to baseline',
  Stop: 'Stop sequence',
}

const defaultCriteria = (): EndCriterion[] => [
  { id: `EC-${Math.random().toString(36).slice(2, 8)}`, type: 'Time', enabled: true, value: 30 },
]

const defaultParameters = (type: StepType): StepParameters => {
  switch (type) {
    case 'Ramp':
      return { rate: 1.2, target: 5 }
    case 'Hold':
      return { target: 40, holdTime: 60 }
    case 'Cyclic':
      return { rate: 2.5, target: 3, cycles: 10 }
    case 'Return':
      return { rate: 1, target: 1 }
    case 'Stop':
    default:
      return {}
  }
}

const applyValidation = (step: SequenceStep): SequenceStep => {
  const result = stepSchema.safeParse(step)
  return { ...step, hasError: !result.success }
}

const createStep = (id: string, type: StepType, overrides?: Partial<SequenceStep>): SequenceStep => {
  const label = stepTypeLabels[type]
  const baseStep: SequenceStep = {
    id,
    type,
    label,
    enabled: true,
    hasError: false,
    controlMode: controlModes[0],
    parameters: defaultParameters(type),
    endCriteria: defaultCriteria(),
  }
  return applyValidation({ ...baseStep, ...overrides })
}

const initialSteps: SequenceStep[] = [
  createStep('S01', 'Ramp'),
  createStep('S02', 'Hold'),
  createStep('S03', 'Cyclic'),
  createStep('S04', 'Return', { enabled: false }),
  createStep('S05', 'Stop'),
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
    const newStep = createStep(nextId, type)
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
      next.splice(index + 1, 0, applyValidation(duplicate))
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

  const updateStep = (updatedStep: StepFormValues) => {
    setSteps((current) =>
      current.map((step) =>
        step.id === updatedStep.id ? applyValidation({ ...step, ...updatedStep }) : step,
      ),
    )
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
      updateStep,
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
