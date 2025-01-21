import { injectable, inject } from 'inversify'

import type {
  IMessageRepository,
  IMessageService,
} from '../interfaces'

import type { TMessage } from '../types'

import { SERVICE_IDENTIFIER } from '../types'

@injectable()
export class MessageService implements IMessageService {
public constructor(
    @inject(SERVICE_IDENTIFIER.IMessageRepository)
    private readonly messageRepository: IMessageRepository,
) {}

  public async saveMessage(message: TMessage): Promise<void> {
    await this.messageRepository.saveMessage(message)
  }

  public async getOfflineMessages(toName: string): Promise<TMessage[]> {
  try {
    const offlineMessages: TMessage[] = await this.messageRepository.getOfflineMessages(toName)
    return offlineMessages
  } catch (error) {
    console.log(error)
    throw new Error('Failed to get offline messages')
  }
  }

  public async getMessagesHistory(fromName: string, toName: string): Promise<TMessage[]> {
    try {
    const messagesHistory: TMessage[] = await this.messageRepository.getMessagesHistory(fromName, toName)
    return messagesHistory
  } catch (error) {
    console.log(error)
    throw new Error('Failed to get messages history')
  }
  }

  public async markMessagesDelivered(toName: string): Promise<void> {
    try {
      await this.messageRepository.markMessagesDelivered(toName)
    } catch (error) {
      console.log(error)
      throw new Error('Failed to mark messages as delivered')
    }
  }
}
