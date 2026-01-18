import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form'
import type { ZodSchema } from 'zod'

type ErrorTarget = Record<string | number, ErrorTarget> & {
  message?: string
  type?: string
}

const setPath = (target: ErrorTarget, path: Array<string | number>, error: { message: string; type: string }) => {
  let current: ErrorTarget = target

  path.forEach((segment, index) => {
    if (index === path.length - 1) {
      current[segment] = error
      return
    }

    const nextIsIndex = typeof path[index + 1] === 'number'
    if (!current[segment]) {
      current[segment] = nextIsIndex ? [] : {}
    }
    current = current[segment] as ErrorTarget
  })
}

export const zodResolver =
  <TFieldValues extends FieldValues>(schema: ZodSchema<TFieldValues>): Resolver<TFieldValues> =>
  async (values) => {
    const result = schema.safeParse(values)
    if (result.success) {
      return {
        values: result.data,
        errors: {},
      }
    }

    const errors: FieldErrors<TFieldValues> = {}
    result.error.errors.forEach((issue) => {
      if (issue.path.length === 0) {
        errors.root = { type: issue.code, message: issue.message }
        return
      }
      setPath(errors as ErrorTarget, issue.path, { type: issue.code, message: issue.message })
    })

    return {
      values: {},
      errors,
    }
  }
