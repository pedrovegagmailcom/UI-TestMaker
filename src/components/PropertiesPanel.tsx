import { useEffect, useMemo, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useSequenceStore } from '../store/sequenceStore'
import { controlModes, endCriteriaTypes } from '../types/sequence'
import { stepSchema, type StepFormValues } from '../validation/stepValidation'
import { zodResolver } from '../validation/zodResolver'

const propertyTabs = ['Control', 'End Criteria'] as const

type PropertiesTab = (typeof propertyTabs)[number]

type PropertiesPanelProps = {
  readOnly: boolean
}

const createFallbackStep = (): StepFormValues => ({
  id: '',
  type: 'Ramp',
  label: '',
  enabled: false,
  controlMode: controlModes[0],
  parameters: {
    rate: 1,
    target: 1,
  },
  endCriteria: [{ id: 'EC-placeholder', type: 'Time', enabled: true, value: 1 }],
})

const createCriterion = (): StepFormValues['endCriteria'][number] => ({
  id: `EC-${Math.random().toString(36).slice(2, 8)}`,
  type: 'Time',
  enabled: true,
  value: 30,
})

export function PropertiesPanel({ readOnly }: PropertiesPanelProps) {
  const { steps, selectedStepId, updateStep } = useSequenceStore()
  const selectedStep = steps.find((step) => step.id === selectedStepId) ?? null
  const [activeTab, setActiveTab] = useState<PropertiesTab>('Control')
  const defaultValues = useMemo(() => selectedStep ?? createFallbackStep(), [selectedStep])

  const {
    register,
    control,
    reset,
    formState: { errors, isValid },
  } = useForm<StepFormValues>({
    resolver: zodResolver(stepSchema),
    mode: 'onChange',
    defaultValues,
  })

  const criteriaErrors = errors.endCriteria
  const stepType = useWatch({ control, name: 'type' })
  const watchedValues = useWatch({ control })
  const { fields, append, remove } = useFieldArray({ control, name: 'endCriteria' })

  useEffect(() => {
    if (selectedStep) {
      reset(selectedStep)
    }
  }, [reset, selectedStep])

  useEffect(() => {
    if (!selectedStep || !watchedValues) {
      return
    }
    if (watchedValues.id !== selectedStep.id) {
      return
    }
    updateStep(watchedValues)
  }, [selectedStep, updateStep, watchedValues])

  const isPanelDisabled = readOnly || !selectedStep

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
          <p className="text-xs text-slate-400">
            {selectedStep ? `Editing ${selectedStep.id} · ${selectedStep.type}` : 'Select a step to edit'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isValid && selectedStep && (
            <span className="rounded-full border border-rose-500/60 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-rose-200">
              Needs attention
            </span>
          )}
          {readOnly && (
            <span className="rounded-full border border-slate-700 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Read-only
            </span>
          )}
        </div>
      </header>

      <nav className="flex flex-wrap gap-2">
        {propertyTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 ${
              tab === activeTab
                ? 'border-indigo-400/60 bg-indigo-500/20 text-indigo-100'
                : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {!selectedStep ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-700 bg-slate-950/40 p-4 text-sm text-slate-400">
          <p>No step selected.</p>
          <p className="text-xs text-slate-500">Choose a step from the sequence list to start editing.</p>
        </div>
      ) : (
        <form className="flex flex-1 flex-col gap-4">
          {activeTab === 'Control' && (
            <div className="flex flex-1 flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-xs text-slate-400">
                  Step name
                  <input
                    type="text"
                    disabled={isPanelDisabled}
                    className={`rounded-md border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 ${
                      errors.label
                        ? 'border-rose-500/70 focus-visible:outline-rose-400'
                        : 'border-slate-700'
                    }`}
                    {...register('label')}
                  />
                  {errors.label && <span className="text-[11px] text-rose-300">{errors.label.message}</span>}
                </label>

                <label className="flex flex-col gap-2 text-xs text-slate-400">
                  Control mode
                  <select
                    disabled={isPanelDisabled}
                    className={`rounded-md border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 ${
                      errors.controlMode
                        ? 'border-rose-500/70 focus-visible:outline-rose-400'
                        : 'border-slate-700'
                    }`}
                    {...register('controlMode')}
                  >
                    {controlModes.map((mode) => (
                      <option key={mode} value={mode} className="bg-slate-950">
                        {mode}
                      </option>
                    ))}
                  </select>
                  {errors.controlMode && (
                    <span className="text-[11px] text-rose-300">{errors.controlMode.message}</span>
                  )}
                </label>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Parameters</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {(stepType === 'Ramp' || stepType === 'Cyclic' || stepType === 'Return') && (
                    <label className="flex flex-col gap-2 text-xs text-slate-400">
                      Rate
                      <input
                        type="number"
                        step="0.1"
                        disabled={isPanelDisabled}
                        className={`rounded-md border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 ${
                          errors.parameters?.rate
                            ? 'border-rose-500/70 focus-visible:outline-rose-400'
                            : 'border-slate-700'
                        }`}
                        {...register('parameters.rate')}
                      />
                      {errors.parameters?.rate && (
                        <span className="text-[11px] text-rose-300">{errors.parameters.rate.message}</span>
                      )}
                    </label>
                  )}

                  {(stepType === 'Ramp' || stepType === 'Hold' || stepType === 'Cyclic' || stepType === 'Return') && (
                    <label className="flex flex-col gap-2 text-xs text-slate-400">
                      Target
                      <input
                        type="number"
                        step="0.1"
                        disabled={isPanelDisabled}
                        className={`rounded-md border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 ${
                          errors.parameters?.target
                            ? 'border-rose-500/70 focus-visible:outline-rose-400'
                            : 'border-slate-700'
                        }`}
                        {...register('parameters.target')}
                      />
                      {errors.parameters?.target && (
                        <span className="text-[11px] text-rose-300">{errors.parameters.target.message}</span>
                      )}
                    </label>
                  )}

                  {stepType === 'Hold' && (
                    <label className="flex flex-col gap-2 text-xs text-slate-400">
                      Hold time (s)
                      <input
                        type="number"
                        step="1"
                        disabled={isPanelDisabled}
                        className={`rounded-md border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 ${
                          errors.parameters?.holdTime
                            ? 'border-rose-500/70 focus-visible:outline-rose-400'
                            : 'border-slate-700'
                        }`}
                        {...register('parameters.holdTime')}
                      />
                      {errors.parameters?.holdTime && (
                        <span className="text-[11px] text-rose-300">{errors.parameters.holdTime.message}</span>
                      )}
                    </label>
                  )}

                  {stepType === 'Cyclic' && (
                    <label className="flex flex-col gap-2 text-xs text-slate-400">
                      Cycles
                      <input
                        type="number"
                        step="1"
                        disabled={isPanelDisabled}
                        className={`rounded-md border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 ${
                          errors.parameters?.cycles
                            ? 'border-rose-500/70 focus-visible:outline-rose-400'
                            : 'border-slate-700'
                        }`}
                        {...register('parameters.cycles')}
                      />
                      {errors.parameters?.cycles && (
                        <span className="text-[11px] text-rose-300">{errors.parameters.cycles.message}</span>
                      )}
                    </label>
                  )}

                  {stepType === 'Stop' && (
                    <div className="rounded-md border border-dashed border-slate-700 bg-slate-950/60 px-3 py-3 text-xs text-slate-400">
                      No parameters required for stop steps.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'End Criteria' && (
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    End criteria
                  </h3>
                  <p className="text-xs text-slate-500">Define when this step completes.</p>
                </div>
                <button
                  type="button"
                  onClick={() => append(createCriterion())}
                  disabled={isPanelDisabled}
                  className={`rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 ${
                    isPanelDisabled
                      ? 'cursor-not-allowed border-slate-700 text-slate-500'
                      : 'border-indigo-400/50 text-indigo-100 hover:border-indigo-300'
                  }`}
                >
                  Add criterion
                </button>
              </div>

              {typeof criteriaErrors?.message === 'string' && (
                <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                  {criteriaErrors.message}
                </div>
              )}

              <div className="flex flex-col gap-3">
                {fields.map((field, index) => {
                  const fieldError = Array.isArray(criteriaErrors) ? criteriaErrors[index] : undefined
                  const valueError = fieldError && 'value' in fieldError ? fieldError.value : undefined

                  return (
                    <div
                      key={field.id}
                      className="grid gap-3 rounded-lg border border-slate-800 bg-slate-950/40 p-3 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-end"
                    >
                      <label className="flex items-center gap-2 text-xs text-slate-400">
                        <input
                          type="checkbox"
                          disabled={isPanelDisabled}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-indigo-400"
                          {...register(`endCriteria.${index}.enabled`)}
                        />
                        Enabled
                      </label>

                      <label className="flex flex-col gap-2 text-xs text-slate-400">
                        Type
                        <select
                          disabled={isPanelDisabled}
                          className="rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
                          {...register(`endCriteria.${index}.type`)}
                        >
                          {endCriteriaTypes.map((type) => (
                            <option key={type} value={type} className="bg-slate-950">
                              {type}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="flex flex-col gap-2 text-xs text-slate-400">
                        Value
                        <input
                          type="number"
                          step="0.1"
                          disabled={isPanelDisabled}
                          className={`rounded-md border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 ${
                            valueError
                              ? 'border-rose-500/70 focus-visible:outline-rose-400'
                              : 'border-slate-700'
                          }`}
                          {...register(`endCriteria.${index}.value`)}
                        />
                        {valueError && (
                          <span className="text-[11px] text-rose-300">{String(valueError.message)}</span>
                        )}
                      </label>

                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={isPanelDisabled}
                        className={`rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 ${
                          isPanelDisabled
                            ? 'cursor-not-allowed border-slate-700 text-slate-500'
                            : 'border-rose-500/50 text-rose-200 hover:border-rose-400'
                        }`}
                      >
                        Remove
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </form>
      )}
    </section>
  )
}
