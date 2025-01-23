/* eslint-disable */
import { injectable, inject } from 'inversify'
import { Socket } from 'net'
import type {
  IChatService,
  IPinoLogger,
  IUserService,
} from '../interfaces'
import {SERVICE_IDENTIFIER, TUserFromDb} from '../types'

/**
 * ChatService
 * - onlineClients contains: Map<nickname, Socket> (for direct access to
 * sockets).
 * - activeChats contains:   Map<nickname, Set<nickname>> (for directs
 * access to active user chats).
 * - class implements: $chat, $exit, $chats, $all, $help commands
 * - every non command message will be send to partners in activeChats.
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
    @inject(SERVICE_IDENTIFIER.IPinoLogger)
    private readonly logger: IPinoLogger,
  ) {}

   // handle incoming message or command.
  public async handleIncomingMessage(
    clientName: string,
    message: string,
    socket: Socket,
  ): Promise<void> {
    // if message starts with $, it is command
    if (message.startsWith('$')) {
      // example: $chat Bob
      if (message.startsWith('$chat ')) {
        const parts = message.split(' ')
        const targetName = parts[1]
        this.addChatPartner(clientName, targetName, socket)
        return
      }

      // example: $exit Bob
      if (message.startsWith('$exit ')) {
        const parts = message.split(' ')
        const targetName = parts[1]
        this.removeChatPartner(clientName, targetName, socket)
        return
      }

      // example: $chats — get list of active chats
      if (message === '$chats') {
        this.listActiveChats(clientName, socket)
        return
      }

      // example: $chats — get list of online users
      if (message === '$list') {
       await this.listOnlineUsers(socket)
        return
      }

      // example: $all message - send message to all online users
      if (message.startsWith('$all ')) {
        const text = message.replace('$all ', '')
        await this.sendMessageToAll(clientName, text, socket)
        return
      }

      // example: $help - show help message
      if (message === '$help') {
        this.getHelp(socket)
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
      await this.sendPrivateMessage(clientName, targetName, message)
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
  public async addOnlineClient(clientName: string, socket: Socket): Promise<void> {
    try {
    this.onlineClients.set(clientName, socket)
    await this.userService.setUserOnline(clientName)
    } catch (error: unknown) {
      this.logger.error(`Error setting user ${clientName} online: `, error)
    }
    this.logger.info(`User ${clientName} is now online (socket saved)`)
  }

   // add active user to private chat.
  public addChatPartner(clientName: string, targetName: string, socket: Socket): void {
    if (!this.activeChats.has(clientName)) {
      this.activeChats.set(clientName, new Set())
    }
    this.activeChats.get(clientName)!.add(targetName)
    socket.write(`You started chat with "${targetName}". Now he will get directly your messages.\n`)
  }


   // remove active user from chat.
  public removeChatPartner(clientName: string, targetName: string, socket: Socket): void {
    const setOfPartners = this.activeChats.get(clientName)
    if (!setOfPartners?.has(targetName)) {
      socket.write(`You dont have this user "${targetName}" in active chat.\n`)
      return
    }
    setOfPartners.delete(targetName)
    socket.write(`You leave chat with "${targetName}".\n`)
  }


   // show all partners in  private chat for current user
  public listActiveChats(clientName: string, socket: Socket): void {
    const setOfPartners = this.activeChats.get(clientName)
    if (!setOfPartners || setOfPartners.size === 0) {
      socket.write('You dont have active chats.\n')
      return
    }
    socket.write('Your chat partners:\n')
    for (const partner of setOfPartners) {
      socket.write(` - ${partner}\n`)
    }
  }

   // send message to all online clients (broadcast).
  public async sendMessageToAll(clientName: string, message: string, socket: Socket): Promise<void> {
    // Высылаем всем, кто онлайн, кроме самого отправителя
    for await (const [otherName, otherSocket] of this.onlineClients.entries()) {
      if (otherName !== clientName) {
        otherSocket.write(`[${clientName} -> ALL]: ${message}\n`)
      }
    }
    socket.write('(Message send to all online users)\n')
  }

  /**
   * send private message (clientName -> targetName).
   * if targetName is online, send direct to socket.
   * else user is offline: save to db to send later.
   */
  public async sendPrivateMessage(clientName: string, targetName: string, text: string): Promise<void> {
    const targetSocket = this.onlineClients.get(targetName)
    if (targetSocket) {
      targetSocket.write(`[${clientName} -> ${targetName}]: ${text}\n`)
    } else {
      // user is offline save message to db
      this.logger.info(`User ${targetName} is offline; message stored offline (not shown here).`)
      // Тут можно вызвать messageService.saveMessage({ from: clientName, to: targetName, text, ... })
    }
  }

  public async listOnlineUsers(socket: Socket): Promise<void> {
    let onlineUsers: TUserFromDb[] | null = await this.userService.getOnlineUsers()
    if (onlineUsers) {
      socket.write('Online users:\n')
  onlineUsers.forEach((user) => {
    socket.write(` - ${user.nickname}\n`)
  })
    }
  }


  // check if socket is binded to user
  public checkSocketBinding(socket: Socket): boolean {
    return Array.from(this.onlineClients.values()).some(
      (sock) => sock === socket
    )
  }

   // send help message to user
  public getHelp(socket: Socket): void {
    socket.write(`
*** AVAILABLE COMMANDS ***
$chat <nickname>  - add partner <nickname>
$exit <nickname>  - remove partner <nickname>
$chats           - show list of active chats
$list            - show list of online users
$all <text>      - send message to all online users
$help           - show this help message

all commands starts with '$' symbol, messages without '$' will sen to active chat or to all users in broadcast.
-----------------------------
`)
  }
}
