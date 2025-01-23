import type { TMessageConstants } from '../message-constants.type'

const MESSAGE_CONSTANTS: TMessageConstants = {
  COMMAND_PREFIX: '/',
  COMMAND_PREFIX_LENGTH: '1',
  WRONG_COMMAND: 'wrong',
  CHAT: 'chat',
  MESSAGE: 'message',
  DATA: 'data',
  TEXT: 'text',
  MESSAGE_ID: 'message_id',
  ID: 'id',
  FROM: 'from',
  DEFAULT_USER_NAME: 'user',
} as const

export { MESSAGE_CONSTANTS }
