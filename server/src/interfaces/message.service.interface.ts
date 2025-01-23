import type { TMessage } from '../types'

export interface IMessageService {
  saveMessage(message: TMessage): Promise<void>
  getOfflineMessages(toName: string, traceId: string): Promise<TMessage[]>
  getMessagesHistory(fromName: string, toName: string, traceId: string): Promise<TMessage[]>
  markMessagesDelivered(toName: string, traceId: string): Promise<void>
  composeMessageObject(
    messageId: string,
    from: string,
    to: string | null,
    text: string,
    command: string,
    createdAt: Date,
    isDelivered: boolean,
    isPublic: boolean,
  ): TMessage
}
