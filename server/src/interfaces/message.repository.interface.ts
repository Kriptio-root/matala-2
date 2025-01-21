import type { TMessage } from '../types'

export interface IMessageRepository {
  saveMessage(message: TMessage): Promise<void>
  getMessagesHistory(fromName: string, toName: string): Promise<TMessage[]>
  getOfflineMessages(toName: string): Promise<TMessage[]>
  markMessagesDelivered(toName: string): Promise<void>
}
