import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { EndCriterion, SequenceStep } from '../types/sequence'
import { useRunStore } from './runStore'
import { useSequenceStore } from './sequenceStore'

const TICK_RATE_HZ = 25
const TICK_SECONDS = 1 / TICK_RATE_HZ
const MAX_SAMPLES = 600

export type RuntimeSample = {
  time: number
  force: number
  displacement: number
}

type SimulationState = {
  time: number
  force: number
  displacement: number
  activeStepId: string | null
  activeStepIndex: number
  stepElapsed: number
  totalSteps: number
  samples: RuntimeSample[]
}

type SimulationStore = SimulationState

const SimulationStoreContext = createContext<SimulationStore | null>(null)

const initialState: SimulationState = {
  time: 0,
  force: 0,
  displacement: 0,
  activeStepId: null,
  activeStepIndex: 0,
  stepElapsed: 0,
  totalSteps: 0,
  samples: [],
}

type InternalState = {
  time: number
  force: number
  displacement: number
  stepElapsed: number
  stepIndex: number
  cyclesCompleted: number
  samples: RuntimeSample[]
  activeStepId: string | null
}

const getEnabledSteps = (steps: SequenceStep[]) => steps.filter((step) => step.enabled)

const computeStepEnd = (
  step: SequenceStep,
  state: InternalState,
  totalCycles: number | null,
): boolean => {
  if (step.type === 'Stop') {
    return true
  }

  const enabledCriteria = step.endCriteria.filter((criterion) => criterion.enabled)
  const hasCriteria = enabledCriteria.length > 0

  const meetsCriterion = (criterion: EndCriterion) => {
    const value = criterion.value ?? null
    if (value === null) {
      return false
    }
    switch (criterion.type) {
      case 'Time':
        return state.stepElapsed >= value
      case 'Voltage':
      case 'Current':
        return state.force >= value
      case 'Temperature':
        return state.displacement >= value
      case 'Cycles':
        return state.cyclesCompleted >= value
      default:
        return false
    }
  }

  if (hasCriteria && enabledCriteria.some((criterion) => meetsCriterion(criterion))) {
    return true
  }

  if (!hasCriteria) {
    if (step.type === 'Hold') {
      const holdTime = step.parameters.holdTime ?? null
      return holdTime !== null ? state.stepElapsed >= holdTime : false
    }
    if (step.type === 'Cyclic') {
      return totalCycles !== null ? state.cyclesCompleted >= totalCycles : false
    }
    if (step.type === 'Ramp' || step.type === 'Return') {
      const target = step.parameters.target ?? state.force
      return Math.abs(state.force - target) < 0.001
    }
  }

  return false
}

export function SimulationStoreProvider({ children }: { children: ReactNode }) {
  const { runState, stop } = useRunStore()
  const { steps } = useSequenceStore()
  const [snapshot, setSnapshot] = useState<SimulationState>(initialState)
  const intervalRef = useRef<number | null>(null)
  const prevRunStateRef = useRef(runState)
  const stepsRef = useRef<SequenceStep[]>(steps)
  const enabledStepsRef = useRef<SequenceStep[]>(getEnabledSteps(steps))

  const internalStateRef = useRef<InternalState>({
    time: 0,
    force: 0,
    displacement: 0,
    stepElapsed: 0,
    stepIndex: 0,
    cyclesCompleted: 0,
    samples: [],
    activeStepId: null,
  })

  useEffect(() => {
    stepsRef.current = steps
    enabledStepsRef.current = getEnabledSteps(steps)
  }, [steps])

  const commitSnapshot = (state: InternalState) => {
    setSnapshot({
      time: state.time,
      force: state.force,
      displacement: state.displacement,
      activeStepId: state.activeStepId,
      activeStepIndex: state.stepIndex,
      stepElapsed: state.stepElapsed,
      totalSteps: enabledStepsRef.current.length,
      samples: state.samples,
    })
  }

  const resetSimulation = () => {
    const state = internalStateRef.current
    state.time = 0
    state.force = 0
    state.displacement = 0
    state.stepElapsed = 0
    state.stepIndex = 0
    state.cyclesCompleted = 0
    state.samples = []
    state.activeStepId = null
    commitSnapshot(state)
  }

  const initializeSimulation = () => {
    const state = internalStateRef.current
    const enabledSteps = enabledStepsRef.current
    const firstStep = enabledSteps[0] ?? null

    state.time = 0
    state.force = 0
    state.displacement = 0
    state.stepElapsed = 0
    state.stepIndex = 0
    state.cyclesCompleted = 0
    state.samples = []
    state.activeStepId = firstStep?.id ?? null

    commitSnapshot(state)

    if (!firstStep) {
      stop()
    }
  }

  const stopInterval = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const startInterval = () => {
    if (intervalRef.current !== null) {
      return
    }
    intervalRef.current = window.setInterval(() => {
      const state = internalStateRef.current
      const enabledSteps = enabledStepsRef.current
      const step = enabledSteps[state.stepIndex]

      if (!step) {
        stop()
        return
      }

      if (step.type === 'Stop') {
        stop()
        return
      }

      state.time += TICK_SECONDS
      state.stepElapsed += TICK_SECONDS

      if (step.type === 'Ramp' || step.type === 'Return') {
        const target = step.parameters.target ?? state.force
        const rate = step.parameters.rate ?? 1
        const direction = target >= state.force ? 1 : -1
        const delta = rate * TICK_SECONDS * direction
        if (Math.abs(target - state.force) <= Math.abs(delta)) {
          state.force = target
        } else {
          state.force += delta
        }
      }

      if (step.type === 'Hold') {
        const target = step.parameters.target ?? state.force
        state.force = target
      }

      if (step.type === 'Cyclic') {
        const amplitude = step.parameters.target ?? 1
        const frequency = step.parameters.rate ?? 1
        const angular = 2 * Math.PI * frequency
        state.force = amplitude * Math.sin(angular * state.stepElapsed)
        state.cyclesCompleted = Math.floor(state.stepElapsed * frequency)
      }

      state.displacement = state.force * 0.12

      const totalCycles = step.parameters.cycles ?? null
      const isComplete = computeStepEnd(step, state, totalCycles)

      if (isComplete) {
        const nextIndex = state.stepIndex + 1
        const nextStep = enabledSteps[nextIndex]
        if (!nextStep) {
          stop()
          return
        }

        state.stepIndex = nextIndex
        state.stepElapsed = 0
        state.cyclesCompleted = 0
        state.activeStepId = nextStep.id

        if (nextStep.type === 'Stop') {
          stop()
          return
        }
      }

      const nextSamples = [...state.samples, { time: state.time, force: state.force, displacement: state.displacement }]
      state.samples = nextSamples.length > MAX_SAMPLES ? nextSamples.slice(-MAX_SAMPLES) : nextSamples

      commitSnapshot(state)
    }, TICK_SECONDS * 1000)
  }

  useEffect(() => {
    const prev = prevRunStateRef.current

    if (runState === 'RUNNING') {
      if (prev !== 'PAUSED') {
        initializeSimulation()
      }
      startInterval()
    }

    if (runState === 'PAUSED' || runState === 'STOPPED' || runState === 'ABORTED') {
      stopInterval()
    }

    if (runState === 'READY') {
      stopInterval()
      resetSimulation()
    }

    prevRunStateRef.current = runState
  }, [runState])

  useEffect(() => {
    return () => {
      stopInterval()
    }
  }, [])

  const value = useMemo<SimulationStore>(() => snapshot, [snapshot])

  return <SimulationStoreContext.Provider value={value}>{children}</SimulationStoreContext.Provider>
}

export function useSimulationStore() {
  const store = useContext(SimulationStoreContext)
  if (!store) {
    throw new Error('useSimulationStore must be used within SimulationStoreProvider')
  }
  return store
}
