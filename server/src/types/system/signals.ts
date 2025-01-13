import type { IMessageConstants } from '../message-constants.interface'

export const SIGNALS: IMessageConstants = {
  ERROR: 'error',
  CLOSE: 'close',
  REQUEST: 'request',
  EXIT: 'exit',
  LISTENING: 'listening',
  EACCES: 'EACCES',
  EADDRINUSE: 'EADDRINUSE',
  MESSAGE: 'message',
  CONNECTION: 'connection',
} as const
