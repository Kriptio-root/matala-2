import type { TMessage } from '../types'

export interface IPinoLogger {
  info: (...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
  debug: (message: string, ...args: unknown[]) => void;
  tracedInfo: (
    message: TMessage,
    ...args: unknown[]
  ) => void;
  tracedError: (
    message: TMessage,
    ...args: unknown[]
  ) => void;
}
