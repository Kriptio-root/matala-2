/* eslint-disable */
import { injectable, inject } from 'inversify'
import { Socket } from 'net'
import type {
  IChatService,
  IMessageService,
  IPinoLogger,
  IUserService,
  IErrorWithoutAdditionalHandling, IPipeline
} from '../interfaces'

import type {
  TMessage,
  TMessageConstants,
  TUserFromDb
} from '../types'

import { SERVICE_IDENTIFIER } from '../types'

/**
 * ChatService
 * - onlineClients contains: Map<nickname, Socket> (for direct access to
 * sockets).
 * - activeChats contains:   Map<nickname, Set<nickname>> (for directs
 * access to active user chats).
 * - class implements: $chat, $exit, $chats, $all, $help commands
 * - every non-command message will be sent to partners in activeChats.
 */
@injectable()
export class ChatService implements IChatService {
  // who online now + socket (nickname -> Socket)
  private onlineClients = new Map<string, Socket>()

  // active chat relations between users (nickname -> Set<partnerName>)
  private activeChats = new Map<string, Set<string>>()

  constructor(
    @inject(SERVICE_IDENTIFIER.IUserService)
    private userService: IUserService,
    @inject(SERVICE_IDENTIFIER.IMessageService)
    private messageService: IMessageService,
    @inject(SERVICE_IDENTIFIER.IPinoLogger)
    private readonly logger: IPinoLogger,
    @inject(SERVICE_IDENTIFIER.IErrorWithoutAdditionalHandling)
    private errorWithoutAdditionalHandling: IErrorWithoutAdditionalHandling,
    @inject(SERVICE_IDENTIFIER.Errors)
    private readonly errors: TMessageConstants,
    @inject(SERVICE_IDENTIFIER.IPipeline)
    private readonly pipeline: IPipeline,
  ) {}

   // handle incoming message or command.
  public async handleIncomingMessage(
    clientName: string,
    message: string,
    socket: Socket,
    traceId: string
  ): Promise<void> {
    try{
    // if message starts with $, it is command
    if (message.startsWith('$')) {
      // example: $chat Bob
      if (message.startsWith('$chat ')) {
        const parts = message.split(' ')
        const targetName = parts[1]
       await this.addChatPartner(clientName, targetName, socket, traceId)
        return
      }

      // example: $exit Bob
      if (message.startsWith('$exit ')) {
        const parts = message.split(' ')
        const targetName = parts[1]
        this.removeChatPartner(clientName, targetName, socket, traceId)
        return
      }

      // example: $chats — get list of active chats
      if (message === '$chats') {
        this.listActiveChats(clientName, socket, traceId)
        return
      }

      // example: $chats — get list of online users
      if (message === '$list') {
       await this.listOnlineUsers(socket, traceId)
        return
      }

      // example: $all message - send message to all online users
      if (message.startsWith('$all ')) {
        const text = message.replace('$all ', '')
        await this.sendMessageToAll(clientName, text, socket, traceId)
        return
      }

      // example: $help - show help message
      if (message === '$help') {
        this.getHelp(socket, traceId)
        return
      }

      // else - unknown command
      socket.write('Unknown command. Enter $help to get help message\n')
      return
    }
    /*
    if message is not a command, handle it as a regular message
    send message in broadcast to all users in activeChats[clientName].
     */
    const setOfChats = this.activeChats.get(clientName)
    if (!setOfChats || setOfChats.size === 0) {
      socket.write('you dont have active chats. Send $chat <nick> or $help\n')
      return
    }

    // send message to all active chats
    for await (const targetName of setOfChats) {
      await this.sendPrivateMessage(clientName, targetName, message, traceId)
    }
    } catch (error: unknown) {
        this.logger.error(
            `${traceId}: `,
            `Error handling incoming message for user ${clientName}: `,
            error
        )
        this.errorWithoutAdditionalHandling.throw(
            this.errors.FAILED_TO_HANDLE_INCOMING_MESSAGE,
            error,
        )
    }
  }

   // handle user disconnect (socket.end)
  public async handleClientDisconnect(clientName: string): Promise<void> {
    // set offline status in db
    await this.userService.setUserOffline(clientName)

    // remove from onlineClients
    this.onlineClients.delete(clientName)

    // remove all relations from activeChats
    this.activeChats.delete(clientName)
    for (const [_user, setOfPartners] of this.activeChats.entries()) {
      if (setOfPartners.has(clientName)) {
        setOfPartners.delete(clientName)
      }
    }

    this.logger.info(`User ${clientName} disconnected, set offline, removed from activeChats`)
  }

   //handle user connect,set him to memory (onlineClients).
  public async addOnlineClient(clientName: string, socket: Socket, traceId: string): Promise<void> {
    try {
      this.logger.info(
        { traceId: traceId },
        `Adding online user: ${clientName}`,
      )
    this.onlineClients.set(clientName, socket)
    await this.userService.setUserOnline(clientName)
    } catch (error: unknown) {
      this.logger.error(
        `${traceId}: `,
        `Error setting user ${clientName} online: `,
        error
      )
        this.errorWithoutAdditionalHandling.throw(
            this.errors.FAILED_TO_SET_USER_ONLINE,
            error,
        )
    }
    this.logger.info(`User ${clientName} is now online (socket saved)`)
  }

   // add active user to private chat.
  public async addChatPartner(clientName: string, targetName: string, socket: Socket, traceId: string): Promise<void> {
    try{
      this.logger.info(
        `${traceId}: `,
        `User ${clientName} started chat with ${targetName}`,
      )
      const messagesHistory: TMessage[] = await this.messageService.getMessagesHistory(targetName, clientName, traceId)
      if (messagesHistory.length > 0) {
        socket.write(`You have ${messagesHistory.length.toString()} history messages in this chat:\n`)
        await this.pipeline.pipelineHistoryMessages(messagesHistory, socket, traceId)
      }
    if (!this.activeChats.has(clientName) && targetName !== clientName) {
      this.activeChats.set(clientName, new Set())
    }
    this.activeChats.get(clientName)!.add(targetName)
      if (!this.activeChats.has(targetName) && targetName !== clientName && this.onlineClients.has(targetName)) {
        this.activeChats.set(targetName, new Set())
        this.activeChats.get(targetName)!.add(clientName)
        let targetSocket: Socket | undefined = this.onlineClients.get(targetName)
        if (targetSocket) {
          targetSocket.write(`"${clientName}" started chat with . Now he will get directly your messages.\n To leave private chat type $exit ${clientName}\n`)
          if (messagesHistory.length > 0) {
            targetSocket.write(`You have ${messagesHistory.length.toString()} history messages in this chat:\n`)
            await this.pipeline.pipelineHistoryMessages(messagesHistory, targetSocket, traceId)
          }
      }
    socket.write(`You started chat with "${targetName}". Now he will get directly your messages.\n`)
    }
    }catch (error: unknown) {
      this.logger.error(
        `${traceId}: `,
        `Error adding chat partner ${targetName} for user ${clientName}: `,
        error
      )
      this.errorWithoutAdditionalHandling.throw(
        this.errors.FAILED_TO_ADD_CHAT_PARTNER,
        error,
      )
    }
  }


   // remove active user from chat.
  public removeChatPartner(clientName: string, targetName: string, socket: Socket, traceId: string): void {
    try{
    const setOfPartners = this.activeChats.get(clientName)
      const partnerSetOfPartners = this.activeChats.get(targetName)
    if (!setOfPartners?.has(targetName)) {
      socket.write(`You dont have this user "${targetName}" in active chat.\n`)
      return
    }
    setOfPartners.delete(targetName)
    socket.write(`You leave chat with "${targetName}".\n`)
      if(!partnerSetOfPartners?.has(clientName)){
        return
      } else {
        partnerSetOfPartners.delete(clientName)
        let partnerSocket: Socket | undefined = this.onlineClients.get(targetName)
        if(partnerSocket){
          partnerSocket.write(`"${clientName}" leave chat with you.\nYou can add him again by typing $chat ${clientName}\nYou cant send messages to him until you add him to private chat.\n`)
        }
      }
    } catch (error: unknown) {
      this.logger.error(
        `${traceId}: `,
        `Error removing chat partner ${targetName} for user ${clientName}: `,
        error
      )
    }
  }


   // show all partners in  private chat for current user
  public listActiveChats(clientName: string, socket: Socket, traceId: string): void {
    try{
      this.logger.info(
        `${traceId}: `,
        `Getting active chats for user ${clientName}`,
      )
    const setOfPartners = this.activeChats.get(clientName)
    if (!setOfPartners || setOfPartners.size === 0) {
      socket.write('You dont have active chats.\n')
      return
    }
    socket.write('Your chat partners:\n')
    for (const partner of setOfPartners) {
      socket.write(` - ${partner}\n`)
    }
    } catch (error: unknown) {
        this.logger.error(
            `${traceId}: `,
            `Error getting active chats for user ${clientName}: `,
            error
        )
        this.errorWithoutAdditionalHandling.throw(
            this.errors.FAILED_TO_ADD_CHAT_PARTNER,
            error,
        )
    }
  }

   // send message to all online clients (broadcast) except the sender.
  public async sendMessageToAll(clientName: string, message: string, socket: Socket, traceId: string): Promise<void> {
    try{
      let delivered = true
      this.logger.info(
        `${traceId}: `,
        `Sending message to all users for user ${clientName}`
      )
    for await (const [otherName, otherSocket] of this.onlineClients.entries()) {
      const sendTime = new Date()
      if (otherName !== clientName) {
        otherSocket.write(`[${clientName} -> ALL]: ${message}\n`)
      await  this.userService.updateUserLastRecivedPublicMessageTime(otherName, sendTime)
      }
      const messageToSave: TMessage = this.messageService.composeMessageObject(
        traceId,
        clientName,
        null,
        message,
        '$chat',
        sendTime,
        delivered,
        true
      )

      await this.messageService.saveMessage(messageToSave)
    }
    socket.write('(Message send to all online users)\n')
    } catch (error: unknown) {
        this.logger.error(
            `${traceId}: `,
            `Error sending message to all users for user ${clientName}: `,
            error
        )
        this.errorWithoutAdditionalHandling.throw(
            this.errors.FAILED_TO_SEND_MESSAGE_TO_ALL,
            error,
        )
    }
  }

  /**
   * send private message (clientName -> targetName).
   * if targetName is online, send direct to socket.
   * else user is offline: save to db to send later.
   */
  public async sendPrivateMessage(clientName: string, targetName: string, text: string, traceId: string): Promise<void> {
    try{
      let delivered = false
      this.logger.info(
        `${traceId}: `,
        `Sending private message from user ${clientName} to ${targetName}`
      )
    if (clientName === targetName) {
      this.logger.warn(
        `${traceId}: `,
        `User ${clientName} tried to send message to himself.`,
      )
      this.onlineClients.get(clientName)?.write('You cannot send message to yourself.\n')
    }
    const targetSocket: Socket | undefined = this.onlineClients.get(targetName)
    if (targetSocket) {
      targetSocket.write(`[${clientName} -> ${targetName}]: ${text}\n`)
      delivered = true
    } else {
      // user is offline safe message to db
      this.logger.warn(
        `${traceId}: `,
        `User ${targetName} is offline; message stored offline.`
      )
      delivered = false
    }
      // compose TMessage object and save to db
      const message: TMessage = this.messageService.composeMessageObject(
        traceId,
        clientName,
        targetName,
        text,
        '$chat',
        new Date(),
        delivered,
        false
      )
      await this.messageService.saveMessage(message)
    } catch (error: unknown) {
      this.logger.error(
        `${traceId}: `,
        `Error sending private message from user ${clientName} to ${targetName}: `,
        error
      )
      this.errorWithoutAdditionalHandling.throw(
        this.errors.FAILED_TO_SEND_MESSAGE_TO_ALL,
        error,
      )
    }
  }

  public async listOnlineUsers(socket: Socket, traceId: string): Promise<void> {
    try {
        this.logger.info(
            `${traceId}: `,
            `Getting online users list`
        )
      let onlineUsers: TUserFromDb[] | null = await this.userService.getOnlineUsers()
      if (onlineUsers) {
        socket.write('Online users:\n')
        onlineUsers.forEach((user) => {
          socket.write(` - ${user.nickname}\n`)
        })
      }
    } catch (error: unknown) {
        this.logger.error(
            `${traceId}: `,
            `Error getting online users list: `,
            error
        )
        this.errorWithoutAdditionalHandling.throw(
            this.errors.FAILED_TO_GET_ONLINE_USERS,
            error,
        )
    }
  }


  // check if socket is bound to user
  public checkSocketBinding(socket: Socket, traceId: string): boolean {
    try {
        this.logger.info(
            `${traceId}: `,
            `Checking socket binding`
        )
      return Array.from(this.onlineClients.values()).some(
        (sock) => sock === socket
      )
    } catch (error: unknown) {
      this.logger.error(
        `${traceId}: `,
        this.errors.ERROR_CHECKING_SOCKET_BINDING,
        error
      )
      this.errorWithoutAdditionalHandling.throw(
        this.errors.FAILED,
        error,
      )
    }
  }

  public getNameBoundToSocket(socket: Socket): string | undefined {
    for (const [key, value] of this.onlineClients.entries()) {
      if (value === socket) {
        return key;
      }
    }
    return undefined;
  }


   // send help message to user
  public getHelp(socket: Socket, traceId: string): void {
    try {
        this.logger.info(
            `${traceId}: `,
            `Getting help message`
        )
      socket.write(`
*** AVAILABLE COMMANDS ***
$chat <nickname>  - add partner <nickname>
$exit <nickname>  - remove partner <nickname>
$chats           - show list of active chats
$list            - show list of online users
$all <text>      - send message to all online users
$help           - show this help message

all commands starts with '$' symbol, messages without '$' will send to active chat or to all users in broadcast.
-----------------------------
`)
    } catch (error: unknown) {
    this.logger.error(
      `${traceId}: `,
      `Error getting help message: `,
      error
    )
    this.errorWithoutAdditionalHandling.throw(
      this.errors.FAILED_TO_GET_HELP_MESSAGE,
      error,
    )
  }
}
}
