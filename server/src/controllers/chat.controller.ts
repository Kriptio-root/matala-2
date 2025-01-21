/*
Присваиваем каждому пакету данных traceId (через uuid) для логирования.
При первом сообщении от socket трактуем строку как имя пользователя.
Проверяем по никнейму, есть ли пользователь в базе, если нет — создаём.
При входе в чат уведомляем пользователя о непрочитанных сообщениях.
Затем через pipelineOfflineMessages передаём offline-сообщения, обеспечивая backpressure.
После отправки сообщений помечаем их как доставленные.
При входе в общий чат отправляем через pipelineCommonHistory передаём
 историю общих сообщений обеспечивая backpressure.
 При входе в приватный чат отправляем через pipelinePrivateHistory передаём историю приватных сообщений обеспечивая backpressure.
 */
// src/controllers/chat.controller.ts
import { injectable, inject } from 'inversify'
import { Socket } from 'net'
import { v4 as uuidv4 } from 'uuid'
import type {
  IChatService,
  IPinoLogger,
  IUserService,
  IMessageService,
  IPipeline,
  IChatController,
} from '../interfaces'

import { SERVICE_IDENTIFIER, TMessage, TUserFromDb } from '../types'

@injectable()
export class ChatController implements IChatController {
  private clientName: string | null = null

  constructor(
    @inject(SERVICE_IDENTIFIER.IChatService)
    private readonly chatService: IChatService,
    @inject(SERVICE_IDENTIFIER.IUserService)
    private readonly userService: IUserService,
    @inject(SERVICE_IDENTIFIER.IMessageService)
    private readonly messageService: IMessageService,
    @inject(SERVICE_IDENTIFIER.IPinoLogger)
    private readonly logger: IPinoLogger,
    @inject(SERVICE_IDENTIFIER.IPipeline)
    private readonly pipeline: IPipeline,
  ) {
  }

  /**
   * Обработать новое подключение (socket)
   */
  public handleConnection(socket: Socket): void {
    try {
      socket.write('Введите ваш никнейм:\n')

      socket.on('data', (data: Buffer) => {
        this.onSocketData(data, socket)
          .catch((error: unknown) => {
            this.logger.error('Error in onSocketData:', error)
          })
      })

      socket.on('end', () => {
        this.onSocketEnd(this.getClientName())
          .catch((error: unknown) => {
            this.logger.error('Error in onSocketEnd:', error)
          })
      })

      socket.on('error', (error) => {
        this.logger.error(`Socket error: ${error.message}`)
      })
    } catch (error: unknown) {
      this.logger.error('Error: ', error)
    }
  }

  public setClientName(name: string): void {
    this.clientName = name
  }

  public getClientName(): string | null {
    return this.clientName
  }

// "приватный" метод
  private async onSocketData(
    data: Buffer,
    socket: Socket,
  ): Promise<void> {
    const input = data.toString().trim()
    const traceId = uuidv4()

    this.setClientName(input)
    if (this.clientName) {
      const user: TUserFromDb = await this.userService.getUserByName(this.clientName)
      await this.chatService.addOnlineClient(this.clientName, socket)
      socket.write(`Добро пожаловать, ${user.nickname}!\n`)

      const offlineMessages: TMessage[] = await this.messageService.getOfflineMessages(this.clientName)
      if (offlineMessages.length > 0) {
        socket.write(`У вас ${offlineMessages.length.toString()} непрочитанных сообщений:\n`)
        await this.pipeline.pipelineOfflineMessages(offlineMessages, socket, traceId)
        await this.messageService.markMessagesDelivered(this.clientName)
      }
      this.logger.info({
        traceId: traceId,
        clientName: this.clientName,
        input: input,
      }, 'Incoming message')
      await this.chatService.handleIncomingMessage(this.clientName, input, socket)
    }
  else {
  this.handleConnection(socket)
  return
}
}

  private async onSocketEnd(clientName: string | null): Promise<void> {
    if (clientName) {
      this.logger.info(`Client ${clientName} disconnected`)
      await this.chatService.handleClientDisconnect(clientName)
    }
  }
}
