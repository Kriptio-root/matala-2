import {TMessageConstants} from '../message-constants.type'

const MESSAGE_CONSTANTS: TMessageConstants= {
  COMMAND_PREFIX: '/',
  COMMAND_PREFIX_LENGTH: '1',
  WRONG_COMMAND: 'wrong',
  ALREADY_SUBSCRIBED: 'alreadysubscribed',
  SUBSCRIBE: 'subscribe',
  CHAT: 'chat',
  MESSAGE: 'message',
  DATA: 'data',
  TEXT: 'text',
  LOCATION: 'location',
  MESSAGE_ID: 'message_id',
  ID: 'id',
  FROM: 'from',
  DEFAULT_USER_NAME: 'user',
} as const

export { MESSAGE_CONSTANTS }
