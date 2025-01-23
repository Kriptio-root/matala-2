import { injectable, inject } from 'inversify'

import type {
  IMessageRepository,
  IMessageService,
  IPinoLogger,
  IErrorWithoutAdditionalHandling,
} from '../interfaces'

import type { TMessage, TMessageConstants, TUserFromDb } from '../types'

import { SERVICE_IDENTIFIER } from '../types'

@injectable()
export class MessageService implements IMessageService {
public constructor(
    @inject(SERVICE_IDENTIFIER.IMessageRepository)
    private readonly messageRepository: IMessageRepository,
    @inject(SERVICE_IDENTIFIER.IPinoLogger)
    private readonly logger: IPinoLogger,
    @inject(SERVICE_IDENTIFIER.IErrorWithoutAdditionalHandling)
    private readonly errorWithoutAdditionalHandling: IErrorWithoutAdditionalHandling,
    @inject(SERVICE_IDENTIFIER.Errors)
    private readonly errors: TMessageConstants,
) {}

  public async saveMessage(message: TMessage): Promise<void> {
    try {
      this.logger.info(
        `${message.messageId}: `,
        `Saving message for user: ${message.from}`,
      )
      await this.messageRepository.saveMessage(message)
    } catch (error) {
      this.errorWithoutAdditionalHandling.throw(
        this.errors.FAILED_TO_SAVE_MESSAGE,
        error,
      )
    }
  }

  public async getOfflineMessages(toName: string, traceId: string): Promise<TMessage[]> {
  try {
    this.logger.info(
      { traceId: traceId },
      `Getting offline messages for user: ${toName}`,
    )
    const offlineMessages: TMessage[] = await this.messageRepository.getOfflineMessages(toName)
    return offlineMessages
  } catch (error) {
    this.logger.error(
      `${traceId}: `,
      `Error getting offline messages for user: ${toName}`,
      error,
    )
    this.errorWithoutAdditionalHandling.throw(
      this.errors.FAILED_TO_GET_OFFLINE_MESSAGES,
      error,
    )
  }
  }

  public async getMessagesHistory(fromName: string, toName: string, traceId: string): Promise<TMessage[]> {
    try {
      this.logger.info(
        { traceId: traceId },
        `Getting message history for user: ${toName}`,
      )
    const messagesHistory: TMessage[] = await this.messageRepository.getMessagesHistory(fromName, toName)
    return messagesHistory
  } catch (error) {
      this.logger.error(
        `${traceId}: `,
        `Error getting message history for user: ${toName}`,
        error,
      )
      this.errorWithoutAdditionalHandling.throw(
        'Failed to get messages history',
        error,
      )
  }
  }

  public async markMessagesDelivered(toName: string, traceId: string): Promise<void> {
    try {
      await this.messageRepository.markMessagesDelivered(toName)
    } catch (error) {
      this.logger.error(
        `${traceId}: `,
        `Error mark messages as delivered for user: ${toName}`,
        error,
      )
      this.errorWithoutAdditionalHandling.throw(
        'Failed to mark messages as delivered',
        error,
      )
    }
  }

  public composeMessageObject(
    messageId: string,
    from: string,
    to: string | null,
    text: string,
    command: string,
    createdAt: Date,
    isDelivered: boolean,
    isPublic: boolean,
  ): TMessage {
    const message: TMessage = {
      messageId: messageId,
      from: from,
      to: to,
      text: text,
      command: command,
      createdAt: createdAt,
      isDelivered: isDelivered,
      public: isPublic,
    }
   return message
  }

  public async getPublicOfflineMessages(user: TUserFromDb, traceId: string): Promise<TMessage[]> {
    try {
      let searchDate: Date = new Date(0)
      this.logger.info(
        { traceId: traceId },
        `Getting public offline messages for user: ${user.nickname}`,
      )
      if (user.lastRecivedPublicMessage) {
        searchDate = user.lastRecivedPublicMessage
      }
      const publicOfflineMessages: TMessage[] = await this.messageRepository.filterUnseenPublicMessages(user.nickname, searchDate)
      return publicOfflineMessages
    } catch (error) {
      this.logger.error(
        `${traceId}: `,
        `Error getting public offline messages for user: ${user.nickname}`,
        error,
      )
      this.errorWithoutAdditionalHandling.throw(
        'Failed to get public offline messages',
        error,
      )
    }
  }
}
