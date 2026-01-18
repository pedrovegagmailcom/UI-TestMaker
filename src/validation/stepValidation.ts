import { z } from 'zod'
import { controlModes, endCriteriaTypes } from '../types/sequence'

const endCriteriaSchema = z.object({
  id: z.string(),
  type: z.enum(endCriteriaTypes),
  enabled: z.boolean(),
  value: z.coerce.number({ invalid_type_error: 'Value is required.' }).optional(),
})

const endCriteriaListSchema = z
  .array(endCriteriaSchema)
  .min(1, 'Add at least one end criterion.')
  .superRefine((criteria, ctx) => {
    if (!criteria.some((criterion) => criterion.enabled)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enable at least one end criterion.',
      })
    }

    criteria.forEach((criterion, index) => {
      if (!criterion.enabled) {
        return
      }

      if (criterion.value === undefined || Number.isNaN(criterion.value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Value is required.',
          path: [index, 'value'],
        })
        return
      }

      if (criterion.value <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Value must be greater than 0.',
          path: [index, 'value'],
        })
      }
    })
  })

const baseStepFields = {
  id: z.string(),
  label: z.string().min(1, 'Name is required.'),
  enabled: z.boolean(),
  controlMode: z.enum(controlModes),
  endCriteria: endCriteriaListSchema,
}

const rateSchema = z.coerce.number({ invalid_type_error: 'Rate is required.' }).positive('Rate must be greater than 0.')
const targetSchema = z
  .coerce.number({ invalid_type_error: 'Target is required.' })
  .positive('Target must be greater than 0.')
const holdTimeSchema = z
  .coerce.number({ invalid_type_error: 'Hold time is required.' })
  .positive('Hold time must be greater than 0.')
const cyclesSchema = z
  .coerce.number({ invalid_type_error: 'Cycles are required.' })
  .int('Cycles must be a whole number.')
  .positive('Cycles must be greater than 0.')

const rampSchema = z.object({
  ...baseStepFields,
  type: z.literal('Ramp'),
  parameters: z.object({
    rate: rateSchema,
    target: targetSchema,
  }),
})

const holdSchema = z.object({
  ...baseStepFields,
  type: z.literal('Hold'),
  parameters: z.object({
    target: targetSchema,
    holdTime: holdTimeSchema,
  }),
})

const cyclicSchema = z.object({
  ...baseStepFields,
  type: z.literal('Cyclic'),
  parameters: z.object({
    rate: rateSchema,
    target: targetSchema,
    cycles: cyclesSchema,
  }),
})

const returnSchema = z.object({
  ...baseStepFields,
  type: z.literal('Return'),
  parameters: z.object({
    rate: rateSchema,
    target: targetSchema,
  }),
})

const stopSchema = z.object({
  ...baseStepFields,
  type: z.literal('Stop'),
  parameters: z.object({}),
})

export const stepSchema = z.discriminatedUnion('type', [
  rampSchema,
  holdSchema,
  cyclicSchema,
  returnSchema,
  stopSchema,
])

export type StepFormValues = z.infer<typeof stepSchema>
