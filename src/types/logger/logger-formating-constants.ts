import type { TLoggerFormatingConstants } from '../logger-formating-constants.type'

const loggerFormatingConstants: TLoggerFormatingConstants = {
  LAST_MEMBER_OFFSET: 1,
  FIRST_MEMBER_OFFSET: 0,
  DEFAULT_MESSAGE_TEXT: 'no message text provided',
  SPACING: ' ',
} as const

export { loggerFormatingConstants }
