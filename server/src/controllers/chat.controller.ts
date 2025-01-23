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

import {
  SERVICE_IDENTIFIER,
} from '../types'

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

  // handle incoming connection
  public handleConnection(socket: Socket): void {
    try {
      if (!this.chatService.checkSocketBinding(socket)) {
        socket.write('Enter your nickname:\n')
      }

      socket.on('data', (data: Buffer) => {
        this.onSocketData(data, socket)
          .catch((error: unknown) => {
            this.logger.error('Error in onSocketData:', error)
          })
      })

      // handle socket end
      socket.on('end', () => {
        this.onSocketEnd(this.getClientName())
          .catch((error: unknown) => {
            this.logger.error('Error in onSocketEnd:', error)
          })
      })

      // if socket is closed, we should also handle it
      socket.on('close', () => {
        this.onSocketEnd(this.getClientName())
          .catch((error: unknown) => {
            this.logger.error('Error in onSocketClose:', error)
          })
      })

      // handle socket errors
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

  // handle incoming data
  private async onSocketData(
    data: Buffer,
    socket: Socket,
  ): Promise<void> {
    try {
      const input = data.toString().trim()
      const traceId = uuidv4()

      // if input is empty, return
      if (!input) {
        return
      }
      /*
       if clientName is not set, it means we are waiting for the nickname
       and is the first message from the client
       */
      if (!this.clientName) {
        // search for user by nickname in the database
        let user = await this.userService.getUserByName(input)
        if (!user) {
          user = await this.userService.createUser(input)
        }
        // set isOnline
        await this.chatService.addOnlineClient(user.nickname, socket)

        // set clientName in the controller
        this.clientName = user.nickname

        // flush offline messages
        const offlineMessages = await this.messageService.getOfflineMessages(user.nickname)
        if (offlineMessages.length > 0) {
          socket.write(`You have ${offlineMessages.length.toString()} new messages:\n`)
          await this.pipeline.pipelineOfflineMessages(offlineMessages, socket, traceId)
          await this.messageService.markMessagesDelivered(user.nickname)
        }
        return
      }
      /*
      if clientName is set, it means we are waiting for the message or
      command from the client
      */
      this.logger.info({ traceId: traceId, clientName: this.clientName, input: input }, 'Incoming message')
      await this.chatService.handleIncomingMessage(this.clientName, input, socket)
    } catch (error: unknown) {
      this.logger.error('Error in onSocketData:', error)
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
