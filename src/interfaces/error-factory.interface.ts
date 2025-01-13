import type { ErrorInstanceTypescriptAdapter } from '../utils'

export interface IErrorFactory {
  create: (message: string, error: unknown) => ErrorInstanceTypescriptAdapter;
}
