import pino from 'pino'
import { injectable } from 'inversify'
import 'reflect-metadata'
import { IPinoLogger } from '../interfaces'
import {
  pinoPrettyConfiguration,
  loggerFormatingConstants,
  MESSAGE_CONSTANTS as messageConstants,
  TMessage,
} from '../types'

@injectable()
export class PinoLoggerUtil implements IPinoLogger {
  private readonly logger: pino.Logger

  public constructor() {
    this.logger = pino({
      ...pinoPrettyConfiguration,
    })
  }

  public error(message: string, ...args: unknown[]): void {
    this.logger.error({ ...args }, message)
  }

  public warn(message: string, ...args: unknown[]): void {
    this.logger.info({ ...args }, message)
  }

  public info(...args: unknown[]): void {
    this.logger.info(
      [...args]
        .slice(loggerFormatingConstants.FIRST_MEMBER_OFFSET, args.length)
        .join(' '),
    )
  }

  public tracedInfo(
    message: TMessage,
    ...args: unknown[]
  ): void {
    if (messageConstants.MESSAGE_ID in message) {
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      this.logger.info(
        this.createTracedMessage(message.messageId, args, message.text),
      )
    } else {
      this.logger.info(
        [...args]
          .slice(loggerFormatingConstants.FIRST_MEMBER_OFFSET, args.length)
          .join(' '),
      )
    }
  }

  public tracedError(
    message: TMessage,
    ...args: unknown[]
  ): void {
    if (messageConstants.MESSAGE_ID in message) {
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      this.logger.error(
        this.createTracedMessage(message.messageId, args, message.text),
      )
    } else {
      this.logger.error(
        [...args]
          .slice(loggerFormatingConstants.FIRST_MEMBER_OFFSET, args.length)
          .join(' '),
      )
    }
  }

  public debug(message: string, ...args: unknown[]): void {
    this.logger.info(message, ...args)
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  protected createTracedMessage(
    id: number | string,
    additionalText: unknown[],
    messageText: string = loggerFormatingConstants.DEFAULT_MESSAGE_TEXT,
  ): string {
    return (
      (id as unknown as string) +
      loggerFormatingConstants.SPACING +
      messageText +
      loggerFormatingConstants.SPACING +
      [...additionalText]
        .slice(
          loggerFormatingConstants.FIRST_MEMBER_OFFSET,
          additionalText.length,
        )
        .join(loggerFormatingConstants.SPACING)
    )
  }
}
