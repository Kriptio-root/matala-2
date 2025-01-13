import type { TMessage } from '../types'

export interface IValidationUtil {
  validatePassword: (password: string, message: TMessage) => boolean | undefined
}
