import type { TMessageConstants } from '../message-constants.type'

export const SIGNALS: TMessageConstants = {
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
