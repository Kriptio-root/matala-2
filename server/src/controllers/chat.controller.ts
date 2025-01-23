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
  SERVICE_IDENTIFIER, TMessage,
} from '../types'

@injectable()
export class ChatController implements IChatController {
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
  ) {}

  // handle incoming connection
  public handleConnection(socket: Socket): void {
    try {
      const traceId = uuidv4()
        this.logger.info({ traceId: traceId }, 'New connection')
      /*
 if socket not bound to username it means we are waiting
  for the nickname and is the first message from the client
  in current session
 */
      if (!this.chatService.checkSocketBinding(socket, traceId)) {
        socket.write('Enter your nickname:\n')
      }

      socket.on('data', (data: Buffer) => {
        this.onSocketData(data, socket, traceId)
          .catch((error: unknown) => {
            this.logger.error('Error in onSocketData:', error)
          })
      })

      // handle socket end
      socket.on('end', () => {
        this.onSocketEnd(this.chatService.getNameBoundToSocket(socket))
          .catch((error: unknown) => {
            this.logger.error('Error in onSocketEnd:', error)
          })
      })

      // if socket is closed, we should also handle it
      socket.on('close', () => {
        this.onSocketEnd(this.chatService.getNameBoundToSocket(socket))
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

  // handle incoming data
  private async onSocketData(
    data: Buffer,
    socket: Socket,
    traceId: string,
  ): Promise<void> {
    try {
      const input = data.toString().trim()

      // if input is empty, return
      if (!input) {
        this.logger.info({ traceId: traceId }, 'Empty input')
        socket.write('Empty input not accepted')
        return
      }
      /*
       if socket not bound to username it means we are waiting
        for the nickname and is the first message from the client
        in current session
       */
      if (!this.chatService.checkSocketBinding(socket, traceId)) {
        // search for user by nickname in the database
        let user = await this.userService.getUserByName(input)
        if (!user) {
          user = await this.userService.createUser(input)
        }
        // set isOnline
        await this.chatService.addOnlineClient(user.nickname, socket, traceId)
        this.chatService.getHelp(socket, traceId)
        // flush private offline messages
        const privateOfflineMessages: TMessage[] = await this.messageService.getOfflineMessages(user.nickname, traceId)
        if (privateOfflineMessages.length > 0) {
          socket.write(`You have ${privateOfflineMessages.length.toString()} new private messages:\n`)
          await this.pipeline.pipelineOfflineMessages(privateOfflineMessages, socket, traceId)
          await this.messageService.markMessagesDelivered(user.nickname, traceId)
        } else {
            socket.write('No new private offline messages\n')
        }

        // flush public offline messages
        const publicOfflineMessages: TMessage[] = await this.messageService.getPublicOfflineMessages(user, traceId)
        if (publicOfflineMessages.length > 0) {
          socket.write(`You have ${publicOfflineMessages.length.toString()} new public messages:\n`)
          await this.pipeline.pipelineOfflineMessages(publicOfflineMessages, socket, traceId)
          await this.userService.updateUserLastRecivedPublicMessageTime(user.nickname, new Date())
        } else {
          socket.write('No new public offline messages\n')
        }

        return
      }
      /*
      if socket is bound, it means we are waiting for the message or
      command from the client
      */
      const clientName = this.chatService.getNameBoundToSocket(socket)
      this.logger.info({ traceId: traceId, clientName: clientName, input: input }, 'Incoming message')
      await this.chatService.handleIncomingMessage(clientName!, input, socket, traceId)
    } catch (error: unknown) {
      this.logger.error('Error in onSocketData:', error)
      this.handleConnection(socket)
      return
}
  }

  private async onSocketEnd(clientName: string | undefined): Promise<void> {
    if (clientName) {
      this.logger.info(`Client ${clientName} disconnected`)
      await this.chatService.handleClientDisconnect(clientName)
    }
  }
}
