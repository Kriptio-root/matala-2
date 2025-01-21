import type { TMessage } from '../types'

export interface IMessageService {
  saveMessage(message: TMessage): Promise<void>
  getOfflineMessages(toName: string): Promise<TMessage[]>
  getMessagesHistory(fromName: string, toName: string): Promise<TMessage[]>
  markMessagesDelivered(toName: string): Promise<void>
}
