export const stepTypes = ['Ramp', 'Hold', 'Cyclic', 'Return', 'Stop'] as const
export type StepType = (typeof stepTypes)[number]

export const controlModes = ['Voltage', 'Current', 'Temperature'] as const
export type ControlMode = (typeof controlModes)[number]

export const endCriteriaTypes = ['Time', 'Voltage', 'Current', 'Temperature', 'Cycles'] as const
export type EndCriteriaType = (typeof endCriteriaTypes)[number]

export type StepParameters = {
  rate?: number | null
  target?: number | null
  holdTime?: number | null
  cycles?: number | null
}

export type EndCriterion = {
  id: string
  type: EndCriteriaType
  enabled: boolean
  value?: number | null
}

export type SequenceStep = {
  id: string
  type: StepType
  label: string
  enabled: boolean
  hasError: boolean
  controlMode: ControlMode
  parameters: StepParameters
  endCriteria: EndCriterion[]
}
