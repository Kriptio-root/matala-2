import { PrismaClient } from '@prisma/client'
import { injectable, inject } from 'inversify'

import type {
  IMessageRepository,
  IPrismaService,
} from '../interfaces'

import type {
    TMessage,
} from '../types'

import {
  SERVICE_IDENTIFIER,
} from '../types'

@injectable()
export class MessageRepository implements IMessageRepository {
  private readonly prismaClient: PrismaClient

  public constructor(
    @inject(SERVICE_IDENTIFIER.IPrismaService)
    private readonly prisma: IPrismaService,
  ) {
    this.prismaClient = this.prisma.client
  }

  public async saveMessage(message: TMessage): Promise<void> {
try {
    await this.prismaClient.message.create({
        data: {
          fromUserNickname: message.from,
          toUserNickname: message.to ? message.to : null,
          text: message.text,
          command: message.command,
          createdAt: message.createdAt,
          isDelivered: message.isDelivered,
        },
    })
} catch (error) {
  console.log(error)
  throw new Error('Failed to save message')
    }
  }

  public async getMessagesHistory(fromName: string, toName: string): Promise<TMessage[]> {
    // get messages from db
    const messages = await this.prismaClient.message.findMany({
      where: {
        OR: [
          { fromUserNickname: fromName, toUserNickname: toName },
          { fromUserNickname: toName, toUserNickname: fromName },
        ],
      },
      orderBy: { createdAt: 'asc' },
    })

    // transform db messages to TMessage
    //    each db message is transformed to TMessage
    return messages.map((dbMessage): TMessage => {
      // assemble TMessage object
      const message: TMessage = {
        messageId: dbMessage.id,
        text: dbMessage.text,
        command: dbMessage.command,
        createdAt: dbMessage.createdAt,
        to: dbMessage.toUserNickname ? dbMessage.toUserNickname : null,
        from: dbMessage.fromUserNickname,
        isDelivered: dbMessage.isDelivered,
        public: dbMessage.public,
      }
      return message
    })
  }

  public async getOfflineMessages(toName: string): Promise<TMessage[]> {
    //  get messages from db
    const messages = await this.prismaClient.message.findMany({
      where: {
        toUserNickname: toName,
        isDelivered: false,
      },
      orderBy: { createdAt: 'asc' },
    })

    return messages.map((dbMessage): TMessage => {
      // assemble TMessage object
      const message: TMessage = {
        messageId: dbMessage.id,
        text: dbMessage.text,
        command: dbMessage.command,
        createdAt: dbMessage.createdAt,
        to: dbMessage.toUserNickname ? dbMessage.toUserNickname : null,
        from: dbMessage.fromUserNickname,
        isDelivered: dbMessage.isDelivered,
        public: dbMessage.public,
      }
      return message
    })
  }

  public async markMessagesDelivered(toName: string): Promise<void> {
    await this.prismaClient.message.updateMany({
      where: {
        toUserNickname: toName,
        isDelivered: false,
      },
      data: {
        isDelivered: true,
      },
    })
  }
}
